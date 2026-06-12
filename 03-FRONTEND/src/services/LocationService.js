import api from './api';

const LocationService = {
  getPage: async (params = {}) => {
    const response = await api.get('/locations', { params });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/locations/all');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/locations', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/locations/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },

  getProductLocations: async (productId) => {
    const response = await api.get(`/locations/product/${productId}`);
    return response.data;
  },

  updateProductLocationStock: async (productId, locationId, stock) => {
    const response = await api.post(`/locations/product/${productId}/stock`, null, {
      params: { locationId, stock }
    });
    return response.data;
  },

  transferStock: async (productId, fromLocationId, toLocationId, quantity) => {
    const response = await api.post(`/locations/product/${productId}/transfer`, null, {
      params: { fromLocationId, toLocationId, quantity }
    });
    return response.data;
  },
};

export default LocationService;
