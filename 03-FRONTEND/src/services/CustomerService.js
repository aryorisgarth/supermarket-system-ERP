import api from './api';

const CustomerService = {

  getAll: async (page = 0, size = 20, sort = 'fullName', search = '') => {
    const response = await api.get('/customers', { params: { page, size, sort, search } });
    return response.data;
  },

  search: async (query) => {
    const response = await api.get('/customers/search', { params: { q: query } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  adjustPoints: async (id, points) => {
    const response = await api.patch(`/customers/${id}/points`, { points });
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/customers/${id}`);
  },
};

export default CustomerService;
