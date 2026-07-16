import api from './api';

const PaymentService = {
  createPaymentIntent: async (amount, currency = 'GTQ') => {
    const response = await api.post('/payments/create-intent', { amount, currency });
    return response.data;
  },
};

export default PaymentService;
