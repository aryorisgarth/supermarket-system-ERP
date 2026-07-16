import api from './api';

const HistoryService = {
  getCostHistory: async (params = {}) => {
    const response = await api.get('/history/costs', { params });
    return response.data;
  },

  getSalePriceHistory: async (params = {}) => {
    const response = await api.get('/history/sale-prices', { params });
    return response.data;
  },
};

export default HistoryService;
