import api from './api';

const CustomerService = {
  // Obtener página de clientes
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },

  // Buscar clientes por coincidencia (nombre, identificación, etc.)
  search: async (query) => {
    const response = await api.get('/customers/search', { params: { q: query } });
    return response.data;
  }
};

export default CustomerService;
