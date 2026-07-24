import api from './api';

const LabelService = {
  getTodayPriceChanges: async () => {
    const response = await api.get('/labels/price-changes/today');
    return response.data;
  },

  getShelfLabelData: async (productIds) => {
    const response = await api.post('/labels/shelf-data', { productIds });
    return response.data;
  },
};

export default LabelService;
