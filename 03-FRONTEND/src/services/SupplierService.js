import api from './api';
import { fetchAllOptions } from '../utils/pageResponse';

const SupplierService = {
  getPage: async (params = {}) => {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  getAll: async () => fetchAllOptions((params) => SupplierService.getPage(params), 500, 'companyName,asc'),

  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};

export default SupplierService;
