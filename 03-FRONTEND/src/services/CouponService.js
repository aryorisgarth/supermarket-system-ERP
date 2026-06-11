import api from './api';

const CouponService = {
  
  getByCode: async (code) => {
    const response = await api.get(`/coupons/code/${encodeURIComponent(code.trim())}`);
    return response.data;
  }
};

export default CouponService;
