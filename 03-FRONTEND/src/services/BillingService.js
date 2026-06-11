import api from './api';

const BillingService = {
  getConfig: async () => {
    const response = await api.get('/billing/config');
    return response.data;
  },

  getElectronicInvoiceBySale: async (saleId) => {
    const response = await api.get(`/billing/electronic-invoices/sale/${saleId}`);
    return response.data;
  },

  getPaymentTransactionsBySale: async (saleId) => {
    const response = await api.get(`/billing/payment-transactions/sale/${saleId}`);
    return response.data;
  },

  getPaymentTransactions: async () => {
    const response = await api.get('/billing/payment-transactions');
    return response.data;
  },

  settlePaymentTransaction: async (id) => {
    const response = await api.put(`/billing/payment-transactions/${id}/settle`);
    return response.data;
  },

  getPaymentAccounts: async () => {
    const response = await api.get('/billing/payment-accounts');
    return response.data;
  },

  createPaymentAccount: async (payload) => {
    const response = await api.post('/billing/payment-accounts', payload);
    return response.data;
  },

  updatePaymentAccount: async (id, payload) => {
    const response = await api.put(`/billing/payment-accounts/${id}`, payload);
    return response.data;
  },

  deletePaymentAccount: async (id) => {
    const response = await api.delete(`/billing/payment-accounts/${id}`);
    return response.data;
  },
};

export default BillingService;
