import api from './api';

const CouponService = {
  // Validar y obtener detalles de un cupón por su código
  getByCode: async (code) => {
    const response = await api.get(`/coupons/code/${encodeURIComponent(code.trim())}`);
    return response.data;
  }
};

export default CouponService;
