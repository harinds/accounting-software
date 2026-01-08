import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';

interface DateRange {
  startDate: string;
  endDate: string;
}

class ReportService {
  /**
   * Generate Profit & Loss report
   */
  async generateProfitLoss(organizationId: string, dateRange: DateRange) {
    try {
      logger.info('Generating P&L report', { organizationId, dateRange });

      const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select('*, accounts(id, code, name, type)')
        .eq('organization_id', organizationId)
        .gte('transaction_date', dateRange.startDate)
        .lte('transaction_date', dateRange.endDate);

      if (error) {
        logger.error('Failed to fetch transactions for P&L', { error });
        throw error;
      }

      // Group by account
      const accountTotals: Record<string, { name: string; code: string; type: string; total: number }> = {};

      for (const txn of transactions || []) {
        const account = (txn as any).accounts;
        if (!account) continue;

        const accountKey = account.id;
        if (!accountTotals[accountKey]) {
          accountTotals[accountKey] = {
            name: account.name,
            code: account.code,
            type: account.type,
            total: 0
          };
        }

        // Revenue accounts increase with credits, Expense accounts increase with debits
        if (account.type === 'revenue') {
          if (txn.type === 'credit') {
            accountTotals[accountKey].total += txn.amount;
          } else {
            accountTotals[accountKey].total -= txn.amount;
          }
        } else if (account.type === 'expense') {
          if (txn.type === 'debit') {
            accountTotals[accountKey].total += txn.amount;
          } else {
            accountTotals[accountKey].total -= txn.amount;
          }
        }
      }

      // Calculate totals and build response
      let totalRevenue = 0;
      let totalExpenses = 0;
      const revenueItems: Array<{ account: string; accountCode: string; amount: number }> = [];
      const expenseItems: Array<{ account: string; accountCode: string; amount: number }> = [];

      Object.values(accountTotals).forEach(account => {
        if (account.type === 'revenue' && account.total !== 0) {
          revenueItems.push({
            account: account.name,
            accountCode: account.code,
            amount: account.total
          });
          totalRevenue += account.total;
        } else if (account.type === 'expense' && account.total !== 0) {
          expenseItems.push({
            account: account.name,
            accountCode: account.code,
            amount: account.total
          });
          totalExpenses += account.total;
        }
      });

      // Sort by account code
      revenueItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
      expenseItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

      const netProfit = totalRevenue - totalExpenses;

      return {
        organizationId,
        period: dateRange,
        revenue: {
          total: totalRevenue,
          items: revenueItems
        },
        expenses: {
          total: totalExpenses,
          items: expenseItems
        },
        netProfit,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
      };
    } catch (error: any) {
      logger.error('P&L generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate Cashflow report
   */
  async generateCashflow(organizationId: string, dateRange: DateRange) {
    try {
      logger.info('Generating cashflow report', { organizationId, dateRange });

      const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('transaction_date', dateRange.startDate)
        .lte('transaction_date', dateRange.endDate)
        .order('transaction_date', { ascending: true });

      if (error) {
        logger.error('Failed to fetch transactions for cashflow', { error });
        throw error;
      }

      // Calculate opening balance (all transactions before start date)
      const { data: previousTransactions } = await supabaseAdmin
        .from('transactions')
        .select('amount, type')
        .eq('organization_id', organizationId)
        .lt('transaction_date', dateRange.startDate);

      let openingBalance = 0;
      for (const txn of previousTransactions || []) {
        if (txn.type === 'credit') {
          openingBalance += txn.amount;
        } else {
          openingBalance -= txn.amount;
        }
      }

      // Calculate daily cashflow
      const dailyCashflow: { [date: string]: { inflow: number; outflow: number; balance: number } } = {};
      let runningBalance = openingBalance;

      for (const txn of transactions || []) {
        const date = txn.transaction_date;
        if (!dailyCashflow[date]) {
          dailyCashflow[date] = { inflow: 0, outflow: 0, balance: runningBalance };
        }

        if (txn.type === 'credit') {
          dailyCashflow[date].inflow += txn.amount;
          runningBalance += txn.amount;
        } else {
          dailyCashflow[date].outflow += txn.amount;
          runningBalance -= txn.amount;
        }

        dailyCashflow[date].balance = runningBalance;
      }

      // Calculate totals
      let totalInflow = 0;
      let totalOutflow = 0;
      for (const day of Object.values(dailyCashflow)) {
        totalInflow += day.inflow;
        totalOutflow += day.outflow;
      }

      return {
        organizationId,
        period: dateRange,
        openingBalance,
        closingBalance: runningBalance,
        totalInflow,
        totalOutflow,
        netCashflow: totalInflow - totalOutflow,
        dailyCashflow
      };
    } catch (error: any) {
      logger.error('Cashflow generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate Balance Sheet
   */
  async generateBalanceSheet(organizationId: string, asOfDate: string) {
    try {
      logger.info('Generating balance sheet', { organizationId, asOfDate });

      const { data: accounts, error: accountsError } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (accountsError) {
        logger.error('Failed to fetch accounts', { error: accountsError });
        throw accountsError;
      }

      const { data: transactions, error: txnError } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .lte('transaction_date', asOfDate);

      if (txnError) {
        logger.error('Failed to fetch transactions', { error: txnError });
        throw txnError;
      }

      // Calculate account balances with proper debit/credit rules
      const accountBalances: { [accountId: string]: { name: string; code: string; type: string; balance: number } } = {};

      for (const txn of transactions || []) {
        if (txn.account_id) {
          const account = accounts?.find(a => a.id === txn.account_id);
          if (!account) continue;

          if (!accountBalances[txn.account_id]) {
            accountBalances[txn.account_id] = {
              name: account.name,
              code: account.code,
              type: account.type,
              balance: 0
            };
          }

          // Apply proper accounting rules:
          // Assets increase with debits, decrease with credits
          // Liabilities and Equity increase with credits, decrease with debits
          if (account.type === 'asset') {
            if (txn.type === 'debit') {
              accountBalances[txn.account_id].balance += txn.amount;
            } else {
              accountBalances[txn.account_id].balance -= txn.amount;
            }
          } else if (account.type === 'liability' || account.type === 'equity') {
            if (txn.type === 'credit') {
              accountBalances[txn.account_id].balance += txn.amount;
            } else {
              accountBalances[txn.account_id].balance -= txn.amount;
            }
          }
        }
      }

      // Group by account type
      const assetItems: Array<{ account: string; accountCode: string; amount: number }> = [];
      const liabilityItems: Array<{ account: string; accountCode: string; amount: number }> = [];
      const equityItems: Array<{ account: string; accountCode: string; amount: number }> = [];

      let totalAssets = 0;
      let totalLiabilities = 0;
      let totalEquity = 0;

      Object.values(accountBalances).forEach(account => {
        if (account.balance === 0) return;

        const item = {
          account: account.name,
          accountCode: account.code,
          amount: account.balance
        };

        switch (account.type) {
          case 'asset':
            assetItems.push(item);
            totalAssets += account.balance;
            break;
          case 'liability':
            liabilityItems.push(item);
            totalLiabilities += account.balance;
            break;
          case 'equity':
            equityItems.push(item);
            totalEquity += account.balance;
            break;
        }
      });

      // Sort by account code
      assetItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
      liabilityItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
      equityItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

      return {
        organizationId,
        asOfDate,
        assets: {
          items: assetItems,
          total: totalAssets
        },
        liabilities: {
          items: liabilityItems,
          total: totalLiabilities
        },
        equity: {
          items: equityItems,
          total: totalEquity
        },
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
      };
    } catch (error: any) {
      logger.error('Balance sheet generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate Tax Summary
   */
  async generateTaxSummary(organizationId: string, period: string) {
    try {
      logger.info('Generating tax summary', { organizationId, period });

      // Parse period (e.g., "Q1-2024", "2023-2024")
      let startDate: string;
      let endDate: string;

      if (period.includes('Q')) {
        // Quarterly (BAS period)
        const [quarter, year] = period.split('-');
        const quarterNum = parseInt(quarter.replace('Q', ''));
        const monthStart = (quarterNum - 1) * 3;
        startDate = `${year}-${String(monthStart + 1).padStart(2, '0')}-01`;
        const endMonth = monthStart + 3;
        const endDay = new Date(parseInt(year), endMonth, 0).getDate();
        endDate = `${year}-${String(endMonth).padStart(2, '0')}-${endDay}`;
      } else {
        // Financial year
        const [startYear, endYear] = period.split('-');
        startDate = `${startYear}-07-01`;
        endDate = `${endYear}-06-30`;
      }

      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      // Calculate tax components
      let totalSales = 0;
      let totalPurchases = 0;
      let gstCollected = 0;
      let gstPaid = 0;

      for (const txn of transactions || []) {
        const gstAmount = txn.amount * 0.1; // 10% GST

        if (txn.type === 'credit') {
          totalSales += txn.amount;
          gstCollected += gstAmount;
        } else {
          totalPurchases += txn.amount;
          gstPaid += gstAmount;
        }
      }

      const netGst = gstCollected - gstPaid;

      return {
        organizationId,
        period,
        dateRange: { startDate, endDate },
        sales: {
          total: totalSales,
          gstCollected
        },
        purchases: {
          total: totalPurchases,
          gstPaid
        },
        netGst,
        gstDueDate: this.calculateGSTDueDate(endDate)
      };
    } catch (error: any) {
      logger.error('Tax summary generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate GST due date (28th day of month following quarter end)
   */
  private calculateGSTDueDate(periodEndDate: string): string {
    const endDate = new Date(periodEndDate);
    const dueDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 28);
    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Export report to CSV
   */
  async exportToCSV(reportType: string, organizationId: string, params: any) {
    try {
      let data: any;

      switch (reportType) {
        case 'profit-loss':
          data = await this.generateProfitLoss(organizationId, params);
          break;
        case 'cashflow':
          data = await this.generateCashflow(organizationId, params);
          break;
        case 'balance-sheet':
          data = await this.generateBalanceSheet(organizationId, params.asOfDate);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Convert to CSV format (simplified - use a proper CSV library in production)
      const csv = JSON.stringify(data);

      return {
        csv,
        filename: `${reportType}-${organizationId}-${Date.now()}.csv`
      };
    } catch (error: any) {
      logger.error('CSV export failed', { error: error.message });
      throw error;
    }
  }
}

export default new ReportService();
