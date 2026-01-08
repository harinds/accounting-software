import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token } = response.data.session;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (email: string, password: string, fullName: string) =>
    api.post('/api/auth/register', { email, password, fullName }),
  logout: () => api.post('/api/auth/logout')
};

export const accountApi = {
  getAll: (organizationId: string) =>
    api.get('/api/accounts', { params: { organizationId } }),
  getById: (id: string) => api.get(`/api/accounts/${id}`),
  create: (data: any) => api.post('/api/accounts', data),
  update: (id: string, data: any) => api.put(`/api/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/api/accounts/${id}`),
  seedChartOfAccounts: (organizationId: string) =>
    api.post('/api/accounts/seed', { organizationId })
};

export const transactionApi = {
  getAll: (params: any) => api.get('/api/transactions', { params }),
  getById: (id: string, organizationId: string) =>
    api.get(`/api/transactions/${id}`, { params: { organizationId } }),
  create: (data: any) => api.post('/api/transactions', data),
  update: (id: string, data: any) => api.put(`/api/transactions/${id}`, data),
  delete: (id: string, organizationId: string) =>
    api.delete(`/api/transactions/${id}`, { data: { organizationId } }),
  bulkImport: (transactions: any[], organizationId: string) =>
    api.post('/api/transactions/bulk-import', { transactions, organizationId }),
  reconcile: (id: string, organizationId: string) =>
    api.post(`/api/transactions/${id}/reconcile`, { organizationId })
};

export const reportApi = {
  profitLoss: (params: any) => api.get('/api/reports/profit-loss', { params }),
  cashflow: (params: any) => api.get('/api/reports/cashflow', { params }),
  balanceSheet: (params: any) => api.get('/api/reports/balance-sheet', { params }),
  taxSummary: (params: any) => api.get('/api/reports/tax-summary', { params }),
  export: (type: string, params: any) =>
    api.get(`/api/reports/export/${type}`, { params, responseType: 'blob' })
};

export const paymentApi = {
  receive: (data: any) => api.post('/api/payments/receive', data),
  payout: (data: any) => api.post('/api/payments/payout', data),
  getStatus: (id: string) => api.get(`/api/payments/${id}/status`),
  getBalance: (organizationId: string) =>
    api.get('/api/payments/balance', { params: { organizationId } })
};

export const bankFeedApi = {
  connect: (organizationId: string) =>
    api.post('/api/bank-feeds/connect', { organizationId }),
  getAccounts: (organizationId: string) =>
    api.get('/api/bank-feeds/accounts', { params: { organizationId } }),
  getTransactions: (params: any) =>
    api.get('/api/bank-feeds/transactions', { params }),
  sync: (organizationId: string, accountId?: string) =>
    api.post('/api/bank-feeds/sync', { organizationId, accountId }),
  disconnect: (id: string) => api.delete(`/api/bank-feeds/${id}`)
};

export const taxApi = {
  calculateBAS: (data: any) => api.post('/api/tax/bas/calculate', data),
  prepareBAS: (id: string) => api.post(`/api/tax/bas/${id}/prepare`),
  lodgeBAS: (id: string) => api.post(`/api/tax/bas/${id}/lodge`),
  getBASStatus: (id: string) => api.get(`/api/tax/bas/${id}/status`),
  prepareTaxReturn: (data: any) => api.post('/api/tax/returns/prepare', data),
  lodgeTaxReturn: (id: string) => api.post(`/api/tax/returns/${id}/lodge`)
};

export default api;
