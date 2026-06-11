import api from './api';
import { unwrapPageContent } from '../utils/pageResponse';

const ProductBatchService = {
  getPage: async (params = {}) => {
    const response = await api.get('/product-batches', { params });
    return response.data;
  },

  getAll: async () => {
    const data = await ProductBatchService.getPage({ page: 0, size: 500, sort: 'expirationDate,asc' });
    return unwrapPageContent(data);
  },

  getByProduct: async (productId) => {
    const response = await api.get(`/product-batches/product/${productId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/product-batches/${id}`);
    return response.data;
  },

  // Lotes con existencia que vencen dentro de N días (global)
  getExpiring: async (withinDays = 30) => {
    const response = await api.get('/product-batches/expiring', {
      params: { withinDays },
    });
    return response.data;
  },

  // Lotes con existencia ya vencidos (global)
  getExpired: async () => {
    const response = await api.get('/product-batches/expired');
    return response.data;
  },

  // Resumen tipo semáforo: vencidos, ≤7, ≤15, ≤30 días
  getSummary: async () => {
    const response = await api.get('/product-batches/summary');
    return response.data;
  },

  writeOffExpired: async () => {
    const response = await api.post('/product-batches/write-off-expired');
    return response.data;
  },

  create: async (batchData) => {
    const response = await api.post('/product-batches', batchData);
    return response.data;
  },

  update: async (id, batchData) => {
    const response = await api.put(`/product-batches/${id}`, batchData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/product-batches/${id}`);
    return response.data;
  },
};

export default ProductBatchService;
