import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate?: number;
}

interface Invoice {
  id?: string;
  organization_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  line_items: InvoiceLineItem[];
  notes?: string;
}

export const invoiceService = {
  // Get all invoices for an organization
  async getAll(organizationId: string) {
    try {
      logger.info('Fetching invoices', { organizationId });

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching invoices', { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to fetch invoices', { error });
      throw error;
    }
  },

  // Get a single invoice by ID
  async getById(id: string, organizationId: string) {
    try {
      logger.info('Fetching invoice', { id, organizationId });

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        logger.error('Error fetching invoice', { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to fetch invoice', { error });
      throw error;
    }
  },

  // Generate next invoice number
  async generateInvoiceNumber(organizationId: string): Promise<string> {
    try {
      // Get the highest invoice number for this organization
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('organization_id', organizationId)
        .order('invoice_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        // First invoice
        return 'INV-0001';
      }

      // Extract number from last invoice and increment
      const lastInvoiceNumber = data[0].invoice_number;
      const match = lastInvoiceNumber.match(/INV-(\d+)/);

      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        return `INV-${nextNumber.toString().padStart(4, '0')}`;
      }

      // Fallback if format doesn't match
      return `INV-${Date.now()}`;
    } catch (error) {
      logger.error('Failed to generate invoice number', { error });
      // Fallback to timestamp-based number
      return `INV-${Date.now()}`;
    }
  },

  // Create a new invoice
  async create(invoiceData: Invoice) {
    try {
      logger.info('Creating invoice', { invoiceData });

      // Generate invoice number if not provided
      if (!invoiceData.invoice_number) {
        invoiceData.invoice_number = await this.generateInvoiceNumber(invoiceData.organization_id);
      }

      // Calculate totals if not provided
      if (!invoiceData.subtotal || !invoiceData.total) {
        const { subtotal, tax_amount, total } = this.calculateTotals(invoiceData.line_items);
        invoiceData.subtotal = subtotal;
        invoiceData.tax_amount = tax_amount;
        invoiceData.total = total;
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (error) {
        logger.error('Error creating invoice', { error });
        throw error;
      }

      logger.info('Invoice created successfully', { id: data.id });
      return data;
    } catch (error) {
      logger.error('Failed to create invoice', { error });
      throw error;
    }
  },

  // Update an invoice
  async update(id: string, invoiceData: Partial<Invoice>) {
    try {
      logger.info('Updating invoice', { id, invoiceData });

      // Recalculate totals if line items changed
      if (invoiceData.line_items) {
        const { subtotal, tax_amount, total } = this.calculateTotals(invoiceData.line_items);
        invoiceData.subtotal = subtotal;
        invoiceData.tax_amount = tax_amount;
        invoiceData.total = total;
      }

      const { data, error } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating invoice', { error });
        throw error;
      }

      logger.info('Invoice updated successfully', { id });
      return data;
    } catch (error) {
      logger.error('Failed to update invoice', { error });
      throw error;
    }
  },

  // Delete an invoice
  async delete(id: string) {
    try {
      logger.info('Deleting invoice', { id });

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting invoice', { error });
        throw error;
      }

      logger.info('Invoice deleted successfully', { id });
    } catch (error) {
      logger.error('Failed to delete invoice', { error });
      throw error;
    }
  },

  // Calculate invoice totals from line items
  calculateTotals(lineItems: InvoiceLineItem[]): { subtotal: number; tax_amount: number; total: number } {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Calculate GST (10% in Australia) - can be customized per line item
    const tax_amount = lineItems.reduce((sum, item) => {
      const taxRate = item.tax_rate !== undefined ? item.tax_rate : 0.10; // Default 10% GST
      return sum + (item.amount * taxRate);
    }, 0);

    const total = subtotal + tax_amount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: Number(tax_amount.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  },

  // Update invoice status
  async updateStatus(id: string, status: Invoice['status']) {
    try {
      logger.info('Updating invoice status', { id, status });

      const { data, error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating invoice status', { error });
        throw error;
      }

      logger.info('Invoice status updated successfully', { id, status });
      return data;
    } catch (error) {
      logger.error('Failed to update invoice status', { error });
      throw error;
    }
  },

  // Mark invoice as sent
  async markAsSent(id: string) {
    return this.updateStatus(id, 'sent');
  },

  // Mark invoice as paid
  async markAsPaid(id: string) {
    try {
      // First get the invoice details
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !invoice) {
        logger.error('Error fetching invoice for payment', { error: fetchError });
        throw fetchError || new Error('Invoice not found');
      }

      // Update invoice status to paid
      const updatedInvoice = await this.updateStatus(id, 'paid');

      // Create a transaction to record the payment
      // Find the Sales Revenue account (code 4000)
      const { data: salesAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('organization_id', invoice.organization_id)
        .eq('code', '4000')
        .single();

      if (salesAccount) {
        await supabase
          .from('transactions')
          .insert({
            organization_id: invoice.organization_id,
            account_id: salesAccount.id,
            transaction_date: new Date().toISOString().split('T')[0],
            amount: invoice.total,
            description: `Payment received for Invoice ${invoice.invoice_number} - ${invoice.customer_name}`,
            reference: invoice.invoice_number,
            type: 'credit', // Credit because it's revenue (increases revenue account)
            category: 'Sales',
            status: 'cleared'
          });

        logger.info('Transaction created for paid invoice', { invoiceId: id, amount: invoice.total });
      } else {
        logger.warn('Sales Revenue account not found, transaction not created', { organizationId: invoice.organization_id });
      }

      return updatedInvoice;
    } catch (error) {
      logger.error('Failed to mark invoice as paid', { error });
      throw error;
    }
  },

  // Get overdue invoices
  async getOverdueInvoices(organizationId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .lt('due_date', today)
        .in('status', ['sent', 'overdue'])
        .order('due_date', { ascending: true });

      if (error) {
        logger.error('Error fetching overdue invoices', { error });
        throw error;
      }

      // Update status to overdue if needed
      const overdueIds = data
        .filter(inv => inv.status === 'sent')
        .map(inv => inv.id);

      if (overdueIds.length > 0) {
        await supabase
          .from('invoices')
          .update({ status: 'overdue' })
          .in('id', overdueIds);
      }

      return data;
    } catch (error) {
      logger.error('Failed to fetch overdue invoices', { error });
      throw error;
    }
  }
};
