import api from './api';

const PromotionService = {
  getPage: async (params = {}) => {
    const response = await api.get('/promotions', { params });
    return response.data;
  },

  getAll: async (params = {}) => PromotionService.getPage(params),

  getActive: async () => {
    const response = await api.get('/promotions/active');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },

  /**
   * Calcula el mejor descuento vigente para un producto y cantidad dados.
   * Devuelve null si no hay ninguna promo aplicable.
   */
  apply: async (productId, quantity = 1, uomConversionId = null) => {
    const params = { productId, quantity };
    if (uomConversionId) {
      params.uomConversionId = uomConversionId;
    }
    const response = await api.get('/promotions/apply', { params });
    if (response.status === 204 || response.data == null || response.data === '') {
      return null;
    }
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/promotions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data;
  },

  toggle: async (id) => {
    const response = await api.put(`/promotions/${id}/toggle`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  },
};

export default PromotionService;
