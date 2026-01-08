import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';

interface TransactionData {
  accountId?: string;
  account_id?: string; // Support both snake_case and camelCase
  transactionDate: string;
  transaction_date?: string; // Support both formats
  amount: number;
  description: string;
  reference?: string;
  type: 'debit' | 'credit';
  category?: string;
}

class TransactionService {
  /**
   * Create a new transaction
   */
  async createTransaction(organizationId: string, data: TransactionData, userId: string) {
    try {
      logger.info('Creating transaction', { organizationId });

      // Support both camelCase and snake_case field names
      const accountId = data.account_id || data.accountId;
      const transactionDate = data.transaction_date || data.transactionDate;

      const { data: transaction, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          organization_id: organizationId,
          account_id: accountId || null,
          transaction_date: transactionDate,
          amount: data.amount,
          description: data.description,
          reference: data.reference,
          type: data.type,
          category: data.category,
          status: 'pending',
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create transaction', { error });
        throw error;
      }

      // Log audit
      await this.logAudit(organizationId, userId, 'create_transaction', transaction.id, {
        amount: data.amount,
        type: data.type
      });

      return transaction;
    } catch (error: any) {
      logger.error('Transaction creation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get transactions with filters
   */
  async getTransactions(
    organizationId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      category?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      let query = supabaseAdmin
        .from('transactions')
        .select('*, accounts(name, code)', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('transaction_date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to fetch transactions', { error });
        throw error;
      }

      return {
        transactions: data,
        total: count,
        limit,
        offset
      };
    } catch (error: any) {
      logger.error('Failed to get transactions', { error: error.message });
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string, organizationId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*, accounts(name, code)')
        .eq('id', transactionId)
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        logger.error('Failed to fetch transaction', { error });
        throw error;
      }

      return data;
    } catch (error: any) {
      logger.error('Failed to get transaction', { error: error.message });
      throw error;
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    transactionId: string,
    organizationId: string,
    updates: Partial<TransactionData>,
    userId: string
  ) {
    try {
      // Extract only the fields that should be updated (exclude organizationId, id, etc.)
      const { organizationId: _orgId, ...updateFields } = updates as any;

      // Map camelCase to snake_case for database (support both formats)
      const dbFields: any = {};
      if (updateFields.accountId !== undefined || updateFields.account_id !== undefined) {
        dbFields.account_id = updateFields.account_id || updateFields.accountId;
      }
      if (updateFields.transactionDate !== undefined || updateFields.transaction_date !== undefined) {
        dbFields.transaction_date = updateFields.transaction_date || updateFields.transactionDate;
      }
      if (updateFields.amount !== undefined) dbFields.amount = updateFields.amount;
      if (updateFields.description !== undefined) dbFields.description = updateFields.description;
      if (updateFields.reference !== undefined) dbFields.reference = updateFields.reference;
      if (updateFields.type !== undefined) dbFields.type = updateFields.type;
      if (updateFields.category !== undefined) dbFields.category = updateFields.category;

      const { data, error } = await supabaseAdmin
        .from('transactions')
        .update({
          ...dbFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update transaction', { error });
        throw error;
      }

      // Log audit
      await this.logAudit(organizationId, userId, 'update_transaction', transactionId, updateFields);

      return data;
    } catch (error: any) {
      logger.error('Transaction update failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(transactionId: string, organizationId: string, userId: string) {
    try {
      const { error } = await supabaseAdmin
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('organization_id', organizationId);

      if (error) {
        logger.error('Failed to delete transaction', { error });
        throw error;
      }

      // Log audit
      await this.logAudit(organizationId, userId, 'delete_transaction', transactionId, {});

      return { success: true };
    } catch (error: any) {
      logger.error('Transaction deletion failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk import transactions
   */
  async bulkImport(organizationId: string, transactions: TransactionData[], userId: string) {
    try {
      logger.info('Bulk importing transactions', { organizationId, count: transactions.length });

      const records = transactions.map(txn => ({
        organization_id: organizationId,
        account_id: txn.account_id || txn.accountId || null,
        transaction_date: txn.transaction_date || txn.transactionDate,
        amount: txn.amount,
        description: txn.description,
        reference: txn.reference,
        type: txn.type,
        category: txn.category,
        status: 'pending',
        created_by: userId
      }));

      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert(records)
        .select();

      if (error) {
        logger.error('Bulk import failed', { error });
        throw error;
      }

      // Log audit
      await this.logAudit(organizationId, userId, 'bulk_import_transactions', null, {
        count: transactions.length
      });

      return {
        success: true,
        imported: data.length,
        transactions: data
      };
    } catch (error: any) {
      logger.error('Bulk import failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Reconcile transaction
   */
  async reconcileTransaction(transactionId: string, organizationId: string, userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .update({ status: 'reconciled' })
        .eq('id', transactionId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to reconcile transaction', { error });
        throw error;
      }

      // Log audit
      await this.logAudit(organizationId, userId, 'reconcile_transaction', transactionId, {});

      return data;
    } catch (error: any) {
      logger.error('Transaction reconciliation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Log audit entry
   */
  private async logAudit(
    organizationId: string,
    userId: string,
    action: string,
    entityId: string | null,
    changes: any
  ) {
    try {
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          action,
          entity_type: 'transaction',
          entity_id: entityId,
          changes
        });
    } catch (error) {
      logger.error('Failed to log audit', { error });
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }
}

export default new TransactionService();
