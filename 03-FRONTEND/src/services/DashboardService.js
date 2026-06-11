import api from './api';

const DashboardService = {
  getWeeklySales: async () => {
    const response = await api.get('/dashboard/sales-weekly');
    return response.data;
  },

  getTopProducts: async () => {
    const response = await api.get('/dashboard/top-products');
    return response.data;
  },

  getInventoryStatus: async () => {
    const response = await api.get('/dashboard/inventory-status');
    return response.data;
  }
};

export default DashboardService;
