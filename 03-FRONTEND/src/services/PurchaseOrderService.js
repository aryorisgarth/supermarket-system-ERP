import api from './api';
import { unwrapPageContent } from '../utils/pageResponse';

const PurchaseOrderService = {
  getPage: async (params = {}) => {
    const response = await api.get('/purchase-orders', { params });
    return response.data;
  },

  getAll: async (params = {}) => {
    const data = await PurchaseOrderService.getPage({ page: 0, size: 500, sort: 'createdAt,desc', ...params });
    return unwrapPageContent(data);
  },

  getById: async (id) => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/purchase-orders', data);
    return response.data;
  },

  markOrdered: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/order`);
    return response.data;
  },

  receive: async (id, data = null) => {
    const response = await api.post(`/purchase-orders/${id}/receive`, data);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/cancel`);
    return response.data;
  },

  claim: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/claim`);
    return response.data;
  },

  assign: async (id, userId) => {
    const response = await api.post(`/purchase-orders/${id}/assign`, { userId });
    return response.data;
  }
};

export default PurchaseOrderService;
