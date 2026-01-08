import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  tax_type?: string;
  is_active: boolean;
}

export default function Accounts() {
  const { organization } = useAuthStore();
  const organizationId = organization?.id || '';
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch accounts
  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts', organizationId],
    queryFn: () => accountApi.getAll(organizationId),
    select: (response) => response.data.accounts,
    enabled: !!organizationId
  });

  // Seed chart of accounts mutation
  const seedMutation = useMutation({
    mutationFn: () => accountApi.seedChartOfAccounts(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', organizationId] });
    }
  });

  const accounts: Account[] = data || [];

  // Filter accounts by type
  const filteredAccounts = activeTab === 'all'
    ? accounts
    : accounts.filter(acc => acc.type === activeTab);

  // Group accounts by type
  const accountsByType = {
    asset: accounts.filter(a => a.type === 'asset'),
    liability: accounts.filter(a => a.type === 'liability'),
    equity: accounts.filter(a => a.type === 'equity'),
    revenue: accounts.filter(a => a.type === 'revenue'),
    expense: accounts.filter(a => a.type === 'expense')
  };

  const getTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      revenue: 'bg-emerald-100 text-emerald-800',
      expense: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!organizationId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Loading organization data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
        <p className="text-gray-600 mt-1">Manage your accounting structure</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          Error loading accounts: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading chart of accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Chart of Accounts</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your chart of accounts.</p>
          <div className="mt-6">
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {seedMutation.isPending ? 'Creating...' : 'Create Standard Chart of Accounts'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Accounts</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{accounts.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Assets</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">{accountsByType.asset.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Liabilities</h3>
              <p className="text-2xl font-bold text-red-600 mt-1">{accountsByType.liability.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{accountsByType.revenue.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Expenses</h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">{accountsByType.expense.length}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {['all', 'asset', 'liability', 'equity', 'revenue', 'expense'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab === 'all' ? 'All Accounts' : `${tab}s`}
                </button>
              ))}
            </nav>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getTypeColor(account.type)}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.tax_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No accounts found in this category
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
