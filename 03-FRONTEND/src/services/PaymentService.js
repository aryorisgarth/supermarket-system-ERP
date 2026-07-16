import api from './api';
import { getCurrencyCode } from '../utils/formatMoney';

const PaymentService = {
  createPaymentIntent: async (amount, currency = getCurrencyCode()) => {
    const response = await api.post('/payments/create-intent', {
      amount,
      currency: (currency || 'USD').toLowerCase(),
    });
    return response.data;
  },
};

export default PaymentService;
