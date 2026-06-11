import api from './api';

const CustomerService = {
  
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },

  
  search: async (query) => {
    const response = await api.get('/customers/search', { params: { q: query } });
    return response.data;
  }
};

export default CustomerService;
