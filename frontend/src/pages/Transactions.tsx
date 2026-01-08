import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi, accountApi } from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';

interface Transaction {
  id: string;
  transaction_date: string;
  amount: number;
  description: string;
  reference?: string;
  type: 'debit' | 'credit';
  category?: string;
  status: 'pending' | 'cleared' | 'reconciled';
  account_id?: string;
  accounts?: { name: string; code: string };
}

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { organization } = useAuthStore();
  const organizationId = organization?.id || '';
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    transactionDate: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    description: '',
    reference: '',
    type: 'debit' as 'debit' | 'credit',
    category: '',
    accountId: '',
    organizationId: organizationId
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch transactions
  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', organizationId],
    queryFn: () => transactionApi.getAll({ organizationId }),
    select: (response) => response.data,
    enabled: !!organizationId
  });

  // Fetch accounts
  const { data: accountsData } = useQuery({
    queryKey: ['accounts', organizationId],
    queryFn: () => accountApi.getAll(organizationId),
    select: (response) => response.data.accounts,
    enabled: !!organizationId
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: transactionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction created successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create transaction');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transactionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update transaction');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id, organizationId }: { id: string; organizationId: string }) =>
      transactionApi.delete(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete transaction');
    }
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: (transactions: any[]) =>
      transactionApi.bulkImport(transactions, organizationId),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(`Successfully imported ${response.data.imported} transactions`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to import transactions');
    }
  });

  const resetForm = () => {
    setFormData({
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      description: '',
      reference: '',
      type: 'debit',
      category: '',
      accountId: '',
      organizationId: organizationId
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { organizationId: orgId, accountId, ...dataWithoutOrgId } = formData;

    const transactionData = {
      ...dataWithoutOrgId,
      amount: parseFloat(formData.amount),
      account_id: accountId || null, // Map accountId to account_id for backend
    };

    if (editingTransaction) {
      // For updates, we need organizationId in body for auth check, but not in the update fields
      updateMutation.mutate({
        id: editingTransaction.id,
        data: {
          ...transactionData,
          organizationId: orgId // Include for auth middleware check
        }
      });
    } else {
      // For creates, include organizationId
      createMutation.mutate({
        ...transactionData,
        organizationId: orgId
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      transactionDate: transaction.transaction_date,
      amount: transaction.amount.toString(),
      description: transaction.description,
      reference: transaction.reference || '',
      type: transaction.type,
      category: transaction.category || '',
      accountId: transaction.account_id || '',
      organizationId: organizationId
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate({ id, organizationId });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      // Skip header row
      const dataLines = lines.slice(1);

      const transactions = dataLines.map(line => {
        const [date, amount, type, description, category, reference] = line.split(',').map(v => v.trim());
        return {
          transactionDate: date,
          amount: parseFloat(amount),
          type: type as 'debit' | 'credit',
          description: description.replace(/^"|"$/g, ''), // Remove quotes if present
          category: category?.replace(/^"|"$/g, ''),
          reference: reference?.replace(/^"|"$/g, '')
        };
      });

      bulkImportMutation.mutate(transactions);
    };

    reader.readAsText(file);
    // Reset input so same file can be uploaded again
    event.target.value = '';
  };

  const transactions = data?.transactions || [];

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const description = transaction.description?.toLowerCase() || '';
    const category = transaction.category?.toLowerCase() || '';
    const type = transaction.type?.toLowerCase() || '';
    const status = transaction.status?.toLowerCase() || '';
    const accountName = transaction.accounts?.name?.toLowerCase() || '';
    const accountCode = transaction.accounts?.code?.toLowerCase() || '';

    return (
      description.includes(query) ||
      category.includes(query) ||
      type.includes(query) ||
      status.includes(query) ||
      accountName.includes(query) ||
      accountCode.includes(query)
    );
  });

  // Show message if organization is not loaded
  if (!organizationId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Loading organization data... Please wait or try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex gap-3">
          <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={bulkImportMutation.isPending}
            />
            {bulkImportMutation.isPending ? 'Importing...' : 'Import CSV'}
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'New Transaction'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search transactions by description, category, type, status, or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredTransactions.length} of {transactions.length} transactions
          </p>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (AUD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Transaction description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an account (optional)</option>
                {accountsData && accountsData.length > 0 ? (
                  <>
                    <optgroup label="Assets">
                      {accountsData.filter((a: any) => a.type === 'asset').map((account: any) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Liabilities">
                      {accountsData.filter((a: any) => a.type === 'liability').map((account: any) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Equity">
                      {accountsData.filter((a: any) => a.type === 'equity').map((account: any) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Revenue">
                      {accountsData.filter((a: any) => a.type === 'revenue').map((account: any) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Expenses">
                      {accountsData.filter((a: any) => a.type === 'expense').map((account: any) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  <option value="" disabled>Loading accounts...</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'debit' | 'credit' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="debit">Debit (Money Out)</option>
                  <option value="credit">Credit (Money In)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Office Supplies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Invoice #, etc."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingTransaction
                  ? 'Update Transaction'
                  : 'Create Transaction'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading transactions...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            Failed to load transactions. Please try again.
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No transactions yet. Create your first transaction to get started.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No transactions match your search. Try a different search term.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{transaction.description}</div>
                      {transaction.reference && (
                        <div className="text-xs text-gray-500">Ref: {transaction.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.accounts ? (
                        <div>
                          <div className="font-medium text-gray-900">{transaction.accounts.code}</div>
                          <div className="text-xs">{transaction.accounts.name}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'credit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type === 'credit' ? 'Money In' : 'Money Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'reconciled'
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.status === 'cleared'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
