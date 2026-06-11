import api from './api';

const InventoryCountService = {
  getPage: async (params = {}) => {
    const response = await api.get('/inventory-counts', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/inventory-counts/${id}`);
    return response.data;
  },

  create: async (data = {}) => {
    const response = await api.post('/inventory-counts', data);
    return response.data;
  },

  scan: async (id, barcode, quantityDelta = 1, batchId = null) => {
    const response = await api.post(`/inventory-counts/${id}/scan`, { barcode, quantityDelta, batchId });
    return response.data;
  },

  submit: async (id) => {
    const response = await api.post(`/inventory-counts/${id}/submit`);
    return response.data;
  },

  approve: async (id) => {
    const response = await api.post(`/inventory-counts/${id}/approve`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/inventory-counts/${id}/cancel`);
    return response.data;
  },
};

export default InventoryCountService;
