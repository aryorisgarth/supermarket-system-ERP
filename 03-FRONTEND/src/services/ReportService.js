import api from './api';

const ReportService = {
  getKpis: async (from, to) => {
    const response = await api.get('/reports/kpis', { params: { from, to } });
    return response.data;
  },

  getComparativeKpis: async (from, to, compareFrom, compareTo) => {
    const response = await api.get('/reports/kpis/comparative', {
      params: { from, to, compareFrom, compareTo },
    });
    return response.data;
  },

  getProductPerformance: async (from, to) => {
    const response = await api.get('/reports/products/performance', { params: { from, to } });
    return response.data;
  },

  getSalesByPaymentMethod: async (from, to) => {
    const response = await api.get('/reports/sales/payment-methods', { params: { from, to } });
    return response.data;
  },

  getInventoryMovements: async (from, to) => {
    const response = await api.get('/reports/inventory-movements', { params: { from, to } });
    return response.data;
  },

  getInventoryTurnover: async (from, to) => {
    const response = await api.get('/reports/inventory/turnover', { params: { from, to } });
    return response.data;
  },

  getPurchasesVsSales: async (from, to) => {
    const response = await api.get('/reports/purchases-vs-sales', { params: { from, to } });
    return response.data;
  },

  getSalesByUser: async (from, to) => {
    const response = await api.get('/reports/sales/by-user', { params: { from, to } });
    return response.data;
  },

  getCustomerRanking: async (from, to) => {
    try {
      const response = await api.get('/reports/customers/ranking', { params: { from, to } });
      return response.data;
    } catch {
      return [];
    }
  },

  getStockAlerts: async () => {
    const response = await api.get('/reports/stock-alerts');
    return response.data;
  },
};

export default ReportService;
