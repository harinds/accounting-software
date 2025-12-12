import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';
import { supabaseAdmin } from '../config/supabase';

interface BASData {
  abn: string;
  periodStart: string;
  periodEnd: string;
  gst: {
    salesG1: number;
    purchasesG11: number;
    netGst: number;
  };
}

interface TaxReturnData {
  tfn: string;
  financialYear: string;
  income: {
    businessIncome: number;
    otherIncome: number;
  };
  deductions: {
    workRelated: number;
    charitable: number;
    other: number;
  };
}

class TaxService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.LODGEIT_BASE_URL || 'https://api.lodgeit.net.au',
      headers: {
        'Authorization': `Bearer ${process.env.LODGEIT_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Client-Id': process.env.LODGEIT_CLIENT_ID
      },
      timeout: 60000 // Tax operations can take longer
    });
  }

  /**
   * Calculate BAS from transactions
   */
  async calculateBAS(organizationId: string, periodStart: string, periodEnd: string) {
    try {
      logger.info('Calculating BAS', { organizationId, periodStart, periodEnd });

      // Get organization details
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('abn, tfn')
        .eq('id', organizationId)
        .single();

      if (!org?.abn) {
        throw new Error('Organization ABN not found');
      }

      // Fetch transactions for the period
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('transaction_date', periodStart)
        .lte('transaction_date', periodEnd);

      // Calculate GST components
      let totalSales = 0;
      let totalPurchases = 0;
      let gstCollected = 0;
      let gstPaid = 0;

      for (const txn of transactions || []) {
        if (txn.type === 'credit') {
          // Sales
          const gstAmount = txn.amount * 0.1; // 10% GST
          totalSales += txn.amount;
          gstCollected += gstAmount;
        } else {
          // Purchases
          const gstAmount = txn.amount * 0.1;
          totalPurchases += txn.amount;
          gstPaid += gstAmount;
        }
      }

      const netGst = gstCollected - gstPaid;

      // Store BAS calculation
      const { data: basRecord, error } = await supabaseAdmin
        .from('tax_returns')
        .insert({
          organization_id: organizationId,
          return_type: 'BAS',
          period_start: periodStart,
          period_end: periodEnd,
          total_sales: totalSales,
          total_purchases: totalPurchases,
          gst_collected: gstCollected,
          gst_paid: gstPaid,
          net_gst: netGst,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to store BAS calculation', { error });
        throw error;
      }

      logger.info('BAS calculated', { organizationId, netGst });

      return {
        basId: basRecord.id,
        abn: org.abn,
        period: { start: periodStart, end: periodEnd },
        calculations: {
          totalSales,
          totalPurchases,
          gstCollected,
          gstPaid,
          netGst
        }
      };
    } catch (error: any) {
      logger.error('BAS calculation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Prepare BAS for lodgement
   */
  async prepareBAS(basId: string) {
    try {
      logger.info('Preparing BAS for lodgement', { basId });

      // Get BAS record
      const { data: bas, error } = await supabaseAdmin
        .from('tax_returns')
        .select('*, organizations!inner(abn)')
        .eq('id', basId)
        .single();

      if (error || !bas) {
        throw new Error('BAS record not found');
      }

      // Prepare BAS data for LodgeIT
      const basData = {
        abn: (bas.organizations as any).abn,
        periodStart: bas.period_start,
        periodEnd: bas.period_end,
        g1: Math.round(bas.total_sales * 100) / 100, // G1: Total sales
        g2: Math.round(bas.gst_collected * 100) / 100, // G2: GST on sales
        g3: 0, // G3: GST on purchases for making input taxed sales
        g4: 0, // G4: Input taxed sales
        g10: Math.round(bas.total_purchases * 100) / 100, // G10: Capital purchases
        g11: Math.round(bas.gst_paid * 100) / 100, // G11: GST on purchases
        g13: 0, // G13: Purchases for making input taxed sales
        g14: 0, // G14: Purchases without GST in the price
        g15: 0, // G15: Estimated purchases for private use
        g18: 0, // G18: Adjustment
        g19: 0, // G19: Adjustment
        g20: 0, // G20: Adjustment
        g21: Math.round(bas.net_gst * 100) / 100, // G21: Net GST amount
        w1: 0, // W1: Total salary and wages
        w2: 0, // W2: Amounts withheld
        w3: 0, // W3: Amounts withheld from investment distributions
        w4: 0, // W4: Total amounts withheld
        t1: 0, // T1: Wine equalisation tax
        t2: 0, // T2: Luxury car tax
        t3: 0, // T3: Fuel tax credits
        t4: 0  // T4: Total
      };

      // Send to LodgeIT for validation
      const response = await this.client.post('/v1/bas/validate', basData);

      if (response.data.valid) {
        // Update BAS status
        await supabaseAdmin
          .from('tax_returns')
          .update({
            status: 'ready',
            metadata: { lodgeit_validation: response.data }
          })
          .eq('id', basId);

        logger.info('BAS prepared successfully', { basId });

        return {
          success: true,
          basId,
          validation: response.data
        };
      } else {
        throw new Error(`BAS validation failed: ${response.data.errors.join(', ')}`);
      }
    } catch (error: any) {
      logger.error('BAS preparation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Lodge BAS with ATO via LodgeIT
   */
  async lodgeBAS(basId: string) {
    try {
      logger.info('Lodging BAS', { basId });

      // Get BAS record
      const { data: bas } = await supabaseAdmin
        .from('tax_returns')
        .select('*, organizations!inner(abn)')
        .eq('id', basId)
        .single();

      if (!bas) {
        throw new Error('BAS record not found');
      }

      if (bas.status !== 'ready') {
        throw new Error('BAS must be validated before lodging');
      }

      // Lodge with LodgeIT
      const response = await this.client.post('/v1/bas/lodge', {
        abn: (bas.organizations as any).abn,
        basId: basId,
        periodStart: bas.period_start,
        periodEnd: bas.period_end,
        g21: bas.net_gst,
        // ... other BAS fields
      });

      // Update BAS record
      await supabaseAdmin
        .from('tax_returns')
        .update({
          status: 'lodged',
          lodgeit_reference: response.data.lodgementId,
          lodged_at: new Date().toISOString(),
          metadata: { lodgeit_response: response.data }
        })
        .eq('id', basId);

      logger.info('BAS lodged successfully', { basId, lodgementId: response.data.lodgementId });

      return {
        success: true,
        basId,
        lodgementId: response.data.lodgementId,
        status: response.data.status
      };
    } catch (error: any) {
      logger.error('BAS lodgement failed', { error: error.message });

      // Update status to indicate failure
      await supabaseAdmin
        .from('tax_returns')
        .update({
          status: 'rejected',
          metadata: { error: error.message }
        })
        .eq('id', basId);

      throw error;
    }
  }

  /**
   * Get lodgement status
   */
  async getLodgementStatus(basId: string) {
    try {
      const { data: bas } = await supabaseAdmin
        .from('tax_returns')
        .select('*')
        .eq('id', basId)
        .single();

      if (!bas) {
        throw new Error('BAS record not found');
      }

      if (!bas.lodgeit_reference) {
        return {
          status: bas.status,
          message: 'Not yet lodged'
        };
      }

      // Get status from LodgeIT
      const response = await this.client.get(
        `/v1/lodgements/${bas.lodgeit_reference}`
      );

      // Update local status if changed
      if (response.data.status !== bas.status) {
        await supabaseAdmin
          .from('tax_returns')
          .update({ status: response.data.status })
          .eq('id', basId);
      }

      return {
        status: response.data.status,
        lodgementId: bas.lodgeit_reference,
        lodgedAt: bas.lodged_at,
        details: response.data
      };
    } catch (error: any) {
      logger.error('Failed to get lodgement status', { error: error.message });
      throw error;
    }
  }

  /**
   * Prepare tax return
   */
  async prepareTaxReturn(organizationId: string, financialYear: string) {
    try {
      logger.info('Preparing tax return', { organizationId, financialYear });

      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('tfn, abn')
        .eq('id', organizationId)
        .single();

      if (!org?.tfn) {
        throw new Error('Organization TFN not found');
      }

      // Calculate financial year dates
      const [startYear, endYear] = financialYear.split('-');
      const periodStart = `${startYear}-07-01`;
      const periodEnd = `${endYear}-06-30`;

      // Fetch transactions for financial year
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('transaction_date', periodStart)
        .lte('transaction_date', periodEnd);

      // Calculate income and deductions
      let totalIncome = 0;
      let totalDeductions = 0;

      for (const txn of transactions || []) {
        if (txn.type === 'credit') {
          totalIncome += txn.amount;
        } else {
          totalDeductions += txn.amount;
        }
      }

      const taxableIncome = totalIncome - totalDeductions;

      // Store tax return
      const { data: taxReturn, error } = await supabaseAdmin
        .from('tax_returns')
        .insert({
          organization_id: organizationId,
          return_type: 'annual',
          period_start: periodStart,
          period_end: periodEnd,
          total_sales: totalIncome,
          total_purchases: totalDeductions,
          status: 'draft',
          metadata: {
            taxableIncome,
            financialYear
          }
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create tax return', { error });
        throw error;
      }

      logger.info('Tax return prepared', { organizationId, taxableIncome });

      return {
        returnId: taxReturn.id,
        financialYear,
        totalIncome,
        totalDeductions,
        taxableIncome
      };
    } catch (error: any) {
      logger.error('Tax return preparation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Lodge tax return
   */
  async lodgeTaxReturn(returnId: string) {
    try {
      logger.info('Lodging tax return', { returnId });

      const { data: taxReturn } = await supabaseAdmin
        .from('tax_returns')
        .select('*, organizations!inner(tfn, abn)')
        .eq('id', returnId)
        .single();

      if (!taxReturn) {
        throw new Error('Tax return not found');
      }

      // Lodge with LodgeIT
      const response = await this.client.post('/v1/tax-returns/lodge', {
        tfn: (taxReturn.organizations as any).tfn,
        abn: (taxReturn.organizations as any).abn,
        financialYear: taxReturn.metadata.financialYear,
        totalIncome: taxReturn.total_sales,
        totalDeductions: taxReturn.total_purchases,
        taxableIncome: taxReturn.metadata.taxableIncome
      });

      // Update tax return
      await supabaseAdmin
        .from('tax_returns')
        .update({
          status: 'lodged',
          lodgeit_reference: response.data.lodgementId,
          lodged_at: new Date().toISOString()
        })
        .eq('id', returnId);

      logger.info('Tax return lodged successfully', { returnId, lodgementId: response.data.lodgementId });

      return {
        success: true,
        returnId,
        lodgementId: response.data.lodgementId
      };
    } catch (error: any) {
      logger.error('Tax return lodgement failed', { error: error.message });
      throw error;
    }
  }
}

export default new TaxService();
