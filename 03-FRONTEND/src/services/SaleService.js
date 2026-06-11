import api from './api';

const SaleService = {
  
  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  
  getPage: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getAll: async (params = {}) => {
    return SaleService.getPage({ page: 0, size: 20, sort: 'saleDate,desc', ...params });
  },

  
  getReport: async (startDate, endDate) => {
    const response = await api.get('/sales/report', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  
  cancel: async (id) => {
    const response = await api.put(`/sales/${id}/cancel`);
    return response.data;
  },

  
  getRefundable: async (id) => {
    const response = await api.get(`/sales/${id}/refundable`);
    return response.data;
  },

  
  refund: async (id, reason, lines) => {
    const response = await api.post(`/sales/${id}/refund`, { reason, lines });
    return response.data;
  },

  
  getCreditNotes: async (params = {}) => {
    const response = await api.get('/credit-notes', { params });
    return response.data;
  },

  
  getCreditNotesBySale: async (saleId) => {
    const response = await api.get(`/credit-notes/sale/${saleId}`);
    return response.data;
  },

  
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  
  getByInvoiceNumber: async (invoiceNumber) => {
    const response = await api.get(`/sales/invoice/${encodeURIComponent(invoiceNumber)}`);
    return response.data;
  }
};

export default SaleService;
