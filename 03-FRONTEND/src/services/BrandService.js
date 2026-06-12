import api from './api';
import { fetchAllOptions } from '../utils/pageResponse';

const BrandService = {
  getPage: async (params = {}) => {
    const response = await api.get('/brands', { params });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/brands/all');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/brands', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/brands/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },
};

export default BrandService;
