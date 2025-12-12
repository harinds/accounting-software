import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';
import { supabaseAdmin } from '../config/supabase';

interface BasiqConnection {
  userId: string;
  institutionId: string;
  loginId: string;
  password: string;
}

interface TransactionFilter {
  accountId: string;
  fromDate?: string;
  toDate?: string;
}

class BankFeedService {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.BASIQ_BASE_URL || 'https://au-api.basiq.io',
      timeout: 30000
    });
  }

  /**
   * Get or refresh access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${process.env.BASIQ_BASE_URL}/token`,
        {
          scope: 'SERVER_ACCESS'
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(process.env.BASIQ_API_KEY!).toString('base64')}`,
            'Content-Type': 'application/json',
            'basiq-version': '3.0'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 1 hour from now
      this.tokenExpiry = new Date(Date.now() + 3600 * 1000);

      return this.accessToken;
    } catch (error: any) {
      logger.error('Failed to get Basiq access token', { error: error.message });
      throw error;
    }
  }

  /**
   * Create Basiq user for organization
   */
  async createUser(organizationId: string, email: string, mobile?: string) {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post(
        '/users',
        {
          email,
          mobile,
          externalId: organizationId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Store Basiq user ID
      await supabaseAdmin
        .from('organizations')
        .update({
          settings: {
            basiq_user_id: response.data.id
          }
        })
        .eq('id', organizationId);

      logger.info('Basiq user created', { organizationId, basiqUserId: response.data.id });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to create Basiq user', { error: error.message });
      throw error;
    }
  }

  /**
   * Connect bank account using consent UI
   */
  async connectBankAccount(organizationId: string) {
    try {
      // Get Basiq user ID
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single();

      let basiqUserId = org?.settings?.basiq_user_id;

      // Create user if doesn't exist
      if (!basiqUserId) {
        const { data: orgData } = await supabaseAdmin
          .from('organizations')
          .select('name')
          .eq('id', organizationId)
          .single();

        const user = await this.createUser(organizationId, `${organizationId}@temp.com`);
        basiqUserId = user.id;
      }

      const token = await this.getAccessToken();

      // Create consent session
      const response = await this.client.post(
        '/users/consent',
        {
          userId: basiqUserId,
          scope: ['transactions', 'accounts']
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Bank connection consent created', { organizationId, consentUrl: response.data.url });

      return {
        consentUrl: response.data.url,
        consentId: response.data.id
      };
    } catch (error: any) {
      logger.error('Failed to create bank connection', { error: error.message });
      throw error;
    }
  }

  /**
   * Fetch connected bank accounts
   */
  async fetchBankAccounts(organizationId: string) {
    try {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single();

      const basiqUserId = org?.settings?.basiq_user_id;
      if (!basiqUserId) {
        throw new Error('No Basiq user found for organization');
      }

      const token = await this.getAccessToken();

      const response = await this.client.get(
        `/users/${basiqUserId}/accounts`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Store accounts in database
      for (const account of response.data.data) {
        await supabaseAdmin
          .from('bank_feeds')
          .upsert({
            organization_id: organizationId,
            basiq_account_id: account.id,
            account_name: account.name,
            account_number: account.accountNo,
            bsb: account.bsb,
            balance: account.balance,
            last_synced_at: new Date().toISOString()
          }, {
            onConflict: 'basiq_account_id'
          });
      }

      logger.info('Bank accounts fetched', { organizationId, count: response.data.data.length });

      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to fetch bank accounts', { error: error.message });
      throw error;
    }
  }

  /**
   * Fetch transactions from Basiq
   */
  async fetchTransactions(filter: TransactionFilter) {
    try {
      const { data: bankFeed } = await supabaseAdmin
        .from('bank_feeds')
        .select('*, organizations!inner(settings)')
        .eq('basiq_account_id', filter.accountId)
        .single();

      if (!bankFeed) {
        throw new Error('Bank feed not found');
      }

      const basiqUserId = (bankFeed.organizations as any).settings?.basiq_user_id;
      const token = await this.getAccessToken();

      const params: any = {
        'filter.account.id': filter.accountId
      };

      if (filter.fromDate) {
        params['filter.transaction.postDate.from'] = filter.fromDate;
      }
      if (filter.toDate) {
        params['filter.transaction.postDate.to'] = filter.toDate;
      }

      const response = await this.client.get(
        `/users/${basiqUserId}/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params
        }
      );

      logger.info('Transactions fetched from Basiq', {
        accountId: filter.accountId,
        count: response.data.data.length
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to fetch transactions', { error: error.message });
      throw error;
    }
  }

  /**
   * Sync transactions to local database
   */
  async syncTransactions(organizationId: string, accountId?: string) {
    try {
      logger.info('Starting transaction sync', { organizationId, accountId });

      // Get bank feeds to sync
      let query = supabaseAdmin
        .from('bank_feeds')
        .select('*')
        .eq('organization_id', organizationId);

      if (accountId) {
        query = query.eq('basiq_account_id', accountId);
      }

      const { data: bankFeeds } = await query;

      if (!bankFeeds || bankFeeds.length === 0) {
        throw new Error('No bank feeds found');
      }

      let totalSynced = 0;

      for (const feed of bankFeeds) {
        // Fetch transactions from last 30 days
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);

        const transactions = await this.fetchTransactions({
          accountId: feed.basiq_account_id,
          fromDate: fromDate.toISOString().split('T')[0]
        });

        // Store transactions
        for (const txn of transactions) {
          const categorized = await this.categorizeTransaction(txn);

          await supabaseAdmin
            .from('transactions')
            .upsert({
              organization_id: organizationId,
              bank_feed_id: feed.id,
              transaction_date: txn.postDate,
              amount: Math.abs(txn.amount),
              description: txn.description,
              reference: txn.transactionId,
              type: txn.amount < 0 ? 'debit' : 'credit',
              category: categorized.category,
              status: 'cleared',
              metadata: {
                basiq_transaction_id: txn.id,
                institution: txn.institution
              }
            }, {
              onConflict: 'reference'
            });

          totalSynced++;
        }

        // Update last sync time
        await supabaseAdmin
          .from('bank_feeds')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', feed.id);
      }

      logger.info('Transaction sync completed', { organizationId, totalSynced });

      return { success: true, transactionsSynced: totalSynced };
    } catch (error: any) {
      logger.error('Transaction sync failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Categorize transaction using AI/rules
   */
  private async categorizeTransaction(transaction: any): Promise<{ category: string; confidence: number }> {
    const description = transaction.description.toLowerCase();

    // Simple rule-based categorization (can be enhanced with AI)
    const categories: { [key: string]: string[] } = {
      'Office Supplies': ['officeworks', 'staples', 'office'],
      'Utilities': ['electricity', 'gas', 'water', 'internet', 'telstra'],
      'Rent': ['rent', 'property'],
      'Wages': ['salary', 'wage', 'payroll'],
      'Software': ['adobe', 'microsoft', 'google workspace', 'slack'],
      'Marketing': ['facebook ads', 'google ads', 'advertising'],
      'Travel': ['qantas', 'virgin', 'hotel', 'uber'],
      'Meals & Entertainment': ['restaurant', 'cafe', 'uber eats']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          return { category, confidence: 0.8 };
        }
      }
    }

    return { category: 'Uncategorized', confidence: 0.0 };
  }

  /**
   * Disconnect bank account
   */
  async disconnectBankAccount(bankFeedId: string) {
    try {
      const { data: bankFeed } = await supabaseAdmin
        .from('bank_feeds')
        .select('*')
        .eq('id', bankFeedId)
        .single();

      if (!bankFeed) {
        throw new Error('Bank feed not found');
      }

      // Delete from Basiq (optional - depends on your requirements)
      // For now, just mark as inactive locally
      await supabaseAdmin
        .from('bank_feeds')
        .delete()
        .eq('id', bankFeedId);

      logger.info('Bank account disconnected', { bankFeedId });

      return { success: true };
    } catch (error: any) {
      logger.error('Failed to disconnect bank account', { error: error.message });
      throw error;
    }
  }
}

export default new BankFeedService();
