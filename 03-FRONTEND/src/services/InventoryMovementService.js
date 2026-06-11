import api from './api';

const InventoryMovementService = {
  getAll: async (params = {}) => {
    const response = await api.get('/inventory-movements', { params });
    return response.data;
  },

  getByProduct: async (productId) => {
    const response = await api.get(`/inventory-movements/product/${productId}`);
    return response.data;
  },

  create: async (movementData) => {
    const response = await api.post('/inventory-movements', movementData);
    return response.data;
  }
};

export default InventoryMovementService;
