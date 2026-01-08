import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

type TimePeriod = 'this_month' | 'last_month' | 'last_quarter' | 'last_6_months' | 'last_year' | 'custom';
type ChartResolution = 'daily' | 'weekly' | 'monthly';

export default function Dashboard() {
  const { organization } = useAuthStore();
  const organizationId = organization?.id || '';
  const [revenueViewMode, setRevenueViewMode] = useState<'category' | 'segment' | 'region'>('segment');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last_year');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [chartResolution, setChartResolution] = useState<ChartResolution>('monthly');

  // Fetch all transactions
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', organizationId],
    queryFn: () => transactionApi.getAll({ organizationId }),
    select: (response) => response.data,
    enabled: !!organizationId
  });

  const transactions: Transaction[] = data?.transactions || [];

  // Calculate date range based on time period
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (timePeriod) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last_quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = now;
        break;
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = now;
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        endDate = now;
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          // Default to last year if custom dates not set
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
          endDate = now;
        }
        break;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // Calculate metrics
  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netProfit = totalRevenue - totalExpenses;

  // Get recent transactions (last 5)
  const recentTransactions = filteredTransactions.slice(0, 5);

  // Prepare chart data - group by category (use filtered transactions)
  const categoryData: Record<string, { revenue: number; expenses: number }> = {};

  filteredTransactions.forEach(t => {
    const category = t.category || 'Uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = { revenue: 0, expenses: 0 };
    }

    if (t.type === 'credit') {
      categoryData[category].revenue += Number(t.amount);
    } else {
      categoryData[category].expenses += Number(t.amount);
    }
  });

  const chartData = Object.entries(categoryData).map(([category, data]) => ({
    category,
    revenue: data.revenue,
    expenses: data.expenses
  })).sort((a, b) => (b.revenue + b.expenses) - (a.revenue + a.expenses));

  // Prepare time-series data based on resolution (daily, weekly, or monthly)
  let timeSeriesData: Array<{ period: string; revenue: number }> = [];

  if (chartResolution === 'daily') {
    // Daily aggregation
    const dailyData: Record<string, { revenue: number; period: string }> = {};

    // Generate all days in the range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    allDays.forEach(date => {
      const dayKey = format(date, 'yyyy-MM-dd');
      const dayLabel = format(date, 'MMM dd');
      dailyData[dayKey] = { revenue: 0, period: dayLabel };
    });

    // Aggregate transactions by day
    filteredTransactions.forEach(t => {
      if (t.type === 'credit') {
        const transactionDate = new Date(t.transaction_date);
        const dayKey = format(transactionDate, 'yyyy-MM-dd');

        if (dailyData[dayKey]) {
          dailyData[dayKey].revenue += Number(t.amount);
        }
      }
    });

    timeSeriesData = Object.values(dailyData);

  } else if (chartResolution === 'weekly') {
    // Weekly aggregation
    const weeklyData: Record<string, { revenue: number; period: string }> = {};

    // Generate all weeks in the range
    const allWeeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 }); // Monday start

    allWeeks.forEach(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      const weekLabel = `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`;
      weeklyData[weekKey] = { revenue: 0, period: weekLabel };
    });

    // Aggregate transactions by week
    filteredTransactions.forEach(t => {
      if (t.type === 'credit') {
        const transactionDate = new Date(t.transaction_date);
        const weekStart = startOfWeek(transactionDate, { weekStartsOn: 1 });
        const weekKey = format(weekStart, 'yyyy-MM-dd');

        if (weeklyData[weekKey]) {
          weeklyData[weekKey].revenue += Number(t.amount);
        }
      }
    });

    timeSeriesData = Object.values(weeklyData);

  } else {
    // Monthly aggregation (default)
    const monthlyData: Record<string, { revenue: number; period: string }> = {};

    // Generate months within the selected date range
    const monthsBetween = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      monthsBetween.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    // Initialize monthly data
    monthsBetween.forEach(date => {
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy');
      monthlyData[monthKey] = { revenue: 0, period: monthLabel };
    });

    // Group filtered transactions by month
    filteredTransactions.forEach(t => {
      if (t.type === 'credit') {
        const transactionDate = new Date(t.transaction_date);
        const monthKey = format(transactionDate, 'yyyy-MM');

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += Number(t.amount);
        }
      }
    });

    timeSeriesData = Object.values(monthlyData);
  }

  // Extract customer segments from revenue transactions (use filtered)
  const segmentData: Record<string, number> = {
    'Enterprise': 0,
    'Mid-Market': 0,
    'Small Business': 0,
    'Retail': 0,
    'Other': 0
  };

  filteredTransactions.forEach(t => {
    if (t.type === 'credit') {
      const desc = t.description.toLowerCase();
      if (desc.includes('enterprise')) {
        segmentData['Enterprise'] += Number(t.amount);
      } else if (desc.includes('mid-market')) {
        segmentData['Mid-Market'] += Number(t.amount);
      } else if (desc.includes('small business')) {
        segmentData['Small Business'] += Number(t.amount);
      } else if (desc.includes('retail')) {
        segmentData['Retail'] += Number(t.amount);
      } else {
        segmentData['Other'] += Number(t.amount);
      }
    }
  });

  const segmentChartData = Object.entries(segmentData)
    .map(([segment, revenue]) => ({ segment, revenue }))
    .filter(item => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // Extract regions from revenue transactions (parse from description or reference, use filtered)
  const regionData: Record<string, number> = {
    'Australia': 0,
    'New Zealand': 0,
    'Asia Pacific': 0,
    'North America': 0,
    'Europe': 0,
    'Other': 0
  };

  filteredTransactions.forEach(t => {
    if (t.type === 'credit') {
      const desc = t.description.toLowerCase();
      const ref = (t.reference || '').toLowerCase();
      const combined = `${desc} ${ref}`;

      if (combined.includes('australia') || combined.includes('sydney') || combined.includes('melbourne')) {
        regionData['Australia'] += Number(t.amount);
      } else if (combined.includes('new zealand') || combined.includes('nz') || combined.includes('auckland')) {
        regionData['New Zealand'] += Number(t.amount);
      } else if (combined.includes('asia') || combined.includes('singapore') || combined.includes('hong kong')) {
        regionData['Asia Pacific'] += Number(t.amount);
      } else if (combined.includes('usa') || combined.includes('america') || combined.includes('canada')) {
        regionData['North America'] += Number(t.amount);
      } else if (combined.includes('europe') || combined.includes('uk') || combined.includes('germany')) {
        regionData['Europe'] += Number(t.amount);
      } else {
        regionData['Other'] += Number(t.amount);
      }
    }
  });

  const regionChartData = Object.entries(regionData)
    .map(([region, revenue]) => ({ region, revenue }))
    .filter(item => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // Category revenue data (extract from existing categoryData)
  const categoryRevenueData = Object.entries(categoryData)
    .map(([category, data]) => ({ category, revenue: data.revenue }))
    .filter(item => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // Determine which chart data to display based on view mode
  let revenueBreakdownData: Array<{ name: string; revenue: number }> = [];
  let revenueBreakdownLabel = '';

  if (revenueViewMode === 'category') {
    revenueBreakdownData = categoryRevenueData.map(item => ({ name: item.category, revenue: item.revenue }));
    revenueBreakdownLabel = 'Category';
  } else if (revenueViewMode === 'segment') {
    revenueBreakdownData = segmentChartData.map(item => ({ name: item.segment, revenue: item.revenue }));
    revenueBreakdownLabel = 'Customer Segment';
  } else if (revenueViewMode === 'region') {
    revenueBreakdownData = regionChartData.map(item => ({ name: item.region, revenue: item.revenue }));
    revenueBreakdownLabel = 'Region';
  }

  // Prepare expenses donut chart data
  const expensesByCategoryData = Object.entries(categoryData)
    .map(([category, data]) => ({
      name: category,
      value: data.expenses
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Colors for donut chart
  const DONUT_COLORS = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
  ];

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading dashboard data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Money In</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-600 mt-2">
                ${totalExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Money Out</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
              <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netProfit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {netProfit >= 0 ? 'Profit' : 'Loss'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{filteredTransactions.length}</p>
              <p className="text-xs text-gray-500 mt-1">In Selected Period</p>
            </div>
          </div>

          {timeSeriesData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_quarter">Last Quarter</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  <select
                    value={chartResolution}
                    onChange={(e) => setChartResolution(e.target.value as ChartResolution)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>

                  {timePeriod === 'custom' && (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Start"
                      />
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="End"
                      />
                    </div>
                  )}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Revenue"
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {revenueBreakdownData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Revenue Breakdown</h2>
                  <select
                    value={revenueViewMode}
                    onChange={(e) => setRevenueViewMode(e.target.value as 'category' | 'segment' | 'region')}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="segment">By Customer Segment</option>
                    <option value="category">By Product/Category</option>
                    <option value="region">By Region</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueBreakdownData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" name={revenueBreakdownLabel} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {expensesByCategoryData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Expenses by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => `${value}: $${entry.payload.value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue vs Expenses by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'credit'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.type === 'credit' ? 'IN' : 'OUT'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                            {transaction.category && ` • ${transaction.category}`}
                            {transaction.accounts && ` • ${transaction.accounts.code} - ${transaction.accounts.name}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}$
                        {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'reconciled'
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.status === 'cleared'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {transactions.length > 5 && (
              <div className="mt-4 text-center">
                <a
                  href="/transactions"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all {transactions.length} transactions →
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
