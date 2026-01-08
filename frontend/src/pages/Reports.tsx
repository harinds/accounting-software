import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Download, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '../services/api';

export default function Reports() {
  const { organization } = useAuthStore();
  const organizationId = organization?.id || '';

  const [activeReport, setActiveReport] = useState<'profit-loss' | 'balance-sheet' | 'cashflow' | null>(null);
  const [startDate, setStartDate] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [asOfDate, setAsOfDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Debug logging
  console.log('Reports Debug:', {
    organization,
    organizationId,
    activeReport,
    startDate,
    endDate,
    queryEnabled: activeReport === 'profit-loss' && !!organizationId
  });

  // Fetch Profit & Loss
  const { data: profitLossData, isLoading: plLoading } = useQuery({
    queryKey: ['report-profit-loss', organizationId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/api/reports/profit-loss', {
        params: { organizationId, startDate, endDate }
      });
      return response.data;
    },
    enabled: activeReport === 'profit-loss' && !!organizationId
  });

  // Fetch Balance Sheet
  const { data: balanceSheetData, isLoading: bsLoading } = useQuery({
    queryKey: ['report-balance-sheet', organizationId, asOfDate],
    queryFn: async () => {
      const response = await api.get('/api/reports/balance-sheet', {
        params: { organizationId, date: asOfDate }
      });
      return response.data;
    },
    enabled: activeReport === 'balance-sheet' && !!organizationId
  });

  // Fetch Cash Flow
  const { data: cashFlowData, isLoading: cfLoading } = useQuery({
    queryKey: ['report-cashflow', organizationId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/api/reports/cashflow', {
        params: { organizationId, startDate, endDate }
      });
      return response.data;
    },
    enabled: activeReport === 'cashflow' && !!organizationId
  });

  const handleExport = async (reportType: string) => {
    try {
      const params: any = { organizationId };
      if (reportType === 'balance-sheet') {
        params.asOfDate = asOfDate;
      } else {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await api.get(`/api/reports/export/${reportType}`, {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
      </div>

      {!activeReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => setActiveReport('profit-loss')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Profit & Loss</h2>
            </div>
            <p className="text-gray-500 mb-4">View revenue, expenses, and net profit for a specific period</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generate Report
            </button>
          </div>

          <div
            onClick={() => setActiveReport('balance-sheet')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Balance Sheet</h2>
            </div>
            <p className="text-gray-500 mb-4">View assets, liabilities, and equity at a specific date</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generate Report
            </button>
          </div>

          <div
            onClick={() => setActiveReport('cashflow')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Cash Flow</h2>
            </div>
            <p className="text-gray-500 mb-4">Track cash inflows and outflows over a period</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generate Report
            </button>
          </div>
        </div>
      )}

      {activeReport === 'profit-loss' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('profit-loss')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {plLoading ? (
              <div className="text-center py-8 text-gray-500">Loading report...</div>
            ) : profitLossData ? (
              <div>
                <div className="mb-6 pb-4 border-b">
                  <p className="text-sm text-gray-500">
                    Period: {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Revenue</h3>
                    <div className="space-y-2">
                      {profitLossData.revenue.items.map((item: any) => (
                        <div key={item.accountCode} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.accountCode} - {item.account}</span>
                          <span className="font-medium text-green-600">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-base font-semibold pt-2 border-t">
                        <span>Total Revenue</span>
                        <span className="text-green-600">${profitLossData.revenue.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Expenses</h3>
                    <div className="space-y-2">
                      {profitLossData.expenses.items.map((item: any) => (
                        <div key={item.accountCode} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.accountCode} - {item.account}</span>
                          <span className="font-medium text-red-600">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-base font-semibold pt-2 border-t">
                        <span>Total Expenses</span>
                        <span className="text-red-600">${profitLossData.expenses.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-300">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Net Profit</span>
                      <span className={profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${profitLossData.netProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Profit Margin</span>
                      <span>{profitLossData.profitMargin.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No data available for this period</div>
            )}
          </div>
        </div>
      )}

      {activeReport === 'balance-sheet' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Balance Sheet</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('balance-sheet')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {bsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading report...</div>
            ) : balanceSheetData ? (
              <div>
                <div className="mb-6 pb-4 border-b">
                  <p className="text-sm text-gray-500">As of {format(new Date(asOfDate), 'MMM dd, yyyy')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Assets</h3>
                      <div className="space-y-2">
                        {balanceSheetData.assets.items.map((item: any) => (
                          <div key={item.accountCode} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.accountCode} - {item.account}</span>
                            <span className="font-medium">${item.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-base font-semibold pt-2 border-t">
                          <span>Total Assets</span>
                          <span>${balanceSheetData.assets.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Liabilities</h3>
                      <div className="space-y-2">
                        {balanceSheetData.liabilities.items.map((item: any) => (
                          <div key={item.accountCode} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.accountCode} - {item.account}</span>
                            <span className="font-medium">${item.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-base font-semibold pt-2 border-t">
                          <span>Total Liabilities</span>
                          <span>${balanceSheetData.liabilities.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Equity</h3>
                      <div className="space-y-2">
                        {balanceSheetData.equity.items.map((item: any) => (
                          <div key={item.accountCode} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.accountCode} - {item.account}</span>
                            <span className="font-medium">${item.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-base font-semibold pt-2 border-t">
                          <span>Total Equity</span>
                          <span>${balanceSheetData.equity.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t-2 border-gray-300">
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total Liabilities & Equity</span>
                        <span>${balanceSheetData.totalLiabilitiesAndEquity.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-center">
                    {balanceSheetData.balanced ? (
                      <div className="text-green-600 font-medium">✓ Balance Sheet is balanced</div>
                    ) : (
                      <div className="text-red-600 font-medium">⚠ Balance Sheet is out of balance</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No data available</div>
            )}
          </div>
        </div>
      )}

      {activeReport === 'cashflow' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Cash Flow Statement</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('cashflow')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {cfLoading ? (
              <div className="text-center py-8 text-gray-500">Loading report...</div>
            ) : cashFlowData ? (
              <div>
                <div className="mb-6 pb-4 border-b">
                  <p className="text-sm text-gray-500">
                    Period: {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Opening Balance</p>
                      <p className="text-2xl font-bold text-blue-600">${cashFlowData.openingBalance.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Inflow</p>
                      <p className="text-2xl font-bold text-green-600">${cashFlowData.totalInflow.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Outflow</p>
                      <p className="text-2xl font-bold text-red-600">${cashFlowData.totalOutflow.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-300">
                    <div className="flex justify-between text-lg font-semibold mb-2">
                      <span>Net Cash Flow</span>
                      <span className={cashFlowData.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${cashFlowData.netCashflow.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Closing Balance</span>
                      <span className="text-blue-600">${cashFlowData.closingBalance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No data available for this period</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
