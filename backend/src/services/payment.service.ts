import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger';
import { supabaseAdmin } from '../config/supabase';

interface MonoovaPaymentData {
  amount: number;
  currency: string;
  reference: string;
  description: string;
}

interface MonoovaPayoutData {
  amount: number;
  recipientBsb: string;
  recipientAccount: string;
  recipientName: string;
  reference: string;
  description?: string;
}

class PaymentService {
  private client: AxiosInstance;
  private webhookSecret: string;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.MONOOVA_BASE_URL,
      headers: {
        'Authorization': `Bearer ${process.env.MONOOVA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    this.webhookSecret = process.env.MONOOVA_WEBHOOK_SECRET || '';
  }

  /**
   * Receive payment from merchant
   */
  async receivePayment(data: MonoovaPaymentData, organizationId: string) {
    try {
      logger.info('Initiating payment receipt', { reference: data.reference, organizationId });

      const response = await this.client.post('/v1/payments/receive', {
        ...data,
        metadata: { organizationId }
      });

      // Store payment record in database
      const { data: payment, error } = await supabaseAdmin
        .from('payments')
        .insert({
          organization_id: organizationId,
          amount: data.amount,
          payment_method: 'monoova',
          monoova_transaction_id: response.data.transactionId,
          status: 'pending',
          metadata: {
            reference: data.reference,
            description: data.description
          }
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to store payment record', { error });
        throw new Error('Failed to store payment record');
      }

      return {
        success: true,
        payment,
        monoovaData: response.data
      };
    } catch (error: any) {
      logger.error('Payment receipt failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Pay invoice from user's bank account
   */
  async payInvoice(invoiceId: string, data: MonoovaPayoutData, organizationId: string) {
    try {
      logger.info('Initiating invoice payment', { invoiceId, organizationId });

      // Get invoice details
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('organization_id', organizationId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        throw new Error('Invoice already paid');
      }

      // Initiate payout via Monoova
      const response = await this.client.post('/v1/payments/payout', {
        ...data,
        metadata: { invoiceId, organizationId }
      });

      // Create payment record
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          organization_id: organizationId,
          invoice_id: invoiceId,
          amount: data.amount,
          payment_method: 'bank_transfer',
          monoova_transaction_id: response.data.transactionId,
          status: 'pending',
          metadata: {
            bsb: data.recipientBsb,
            account: data.recipientAccount,
            name: data.recipientName
          }
        })
        .select()
        .single();

      if (paymentError) {
        logger.error('Failed to create payment record', { error: paymentError });
        throw new Error('Failed to create payment record');
      }

      return {
        success: true,
        payment,
        monoovaData: response.data
      };
    } catch (error: any) {
      logger.error('Invoice payment failed', { error: error.message, invoiceId });
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(organizationId: string) {
    try {
      const response = await this.client.get(`/v1/accounts/${organizationId}/balance`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get account balance', { error: error.message, organizationId });
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string) {
    try {
      const { data: payment, error } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error || !payment) {
        throw new Error('Payment not found');
      }

      // Fetch latest status from Monoova
      if (payment.monoova_transaction_id) {
        const response = await this.client.get(
          `/v1/transactions/${payment.monoova_transaction_id}`
        );

        // Update local status if different
        if (response.data.status !== payment.status) {
          await supabaseAdmin
            .from('payments')
            .update({ status: response.data.status })
            .eq('id', paymentId);
        }

        return {
          ...payment,
          status: response.data.status,
          monoovaData: response.data
        };
      }

      return payment;
    } catch (error: any) {
      logger.error('Failed to get payment status', { error: error.message, paymentId });
      throw error;
    }
  }

  /**
   * Handle Monoova webhook
   */
  async handleWebhook(payload: any, signature: string) {
    try {
      // Verify webhook signature
      const isValid = this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      logger.info('Processing Monoova webhook', { event: payload.event });

      const { event, data } = payload;

      switch (event) {
        case 'payment.received':
          await this.handlePaymentReceived(data);
          break;
        case 'payment.completed':
          await this.handlePaymentCompleted(data);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(data);
          break;
        default:
          logger.warn('Unknown webhook event', { event });
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Webhook processing failed', { error: error.message });
      throw error;
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  private async handlePaymentReceived(data: any) {
    const { transactionId, status } = data;

    await supabaseAdmin
      .from('payments')
      .update({ status: 'received' })
      .eq('monoova_transaction_id', transactionId);

    logger.info('Payment received', { transactionId });
  }

  private async handlePaymentCompleted(data: any) {
    const { transactionId, status } = data;

    // Update payment status
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .update({ status: 'completed' })
      .eq('monoova_transaction_id', transactionId)
      .select()
      .single();

    // Update invoice status if applicable
    if (payment?.invoice_id) {
      await supabaseAdmin
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', payment.invoice_id);
    }

    logger.info('Payment completed', { transactionId });
  }

  private async handlePaymentFailed(data: any) {
    const { transactionId, reason } = data;

    await supabaseAdmin
      .from('payments')
      .update({
        status: 'failed',
        metadata: { failureReason: reason }
      })
      .eq('monoova_transaction_id', transactionId);

    logger.error('Payment failed', { transactionId, reason });
  }
}

export default new PaymentService();
