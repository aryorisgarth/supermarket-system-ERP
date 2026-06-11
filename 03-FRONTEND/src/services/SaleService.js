import api from './api';

const SaleService = {
  // Registrar una nueva venta (Factura)
  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // Obtener historial de ventas (paginado + búsqueda backend)
  getPage: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getAll: async (params = {}) => {
    return SaleService.getPage({ page: 0, size: 20, sort: 'saleDate,desc', ...params });
  },

  // Obtener reporte de ventas por rango de fechas
  getReport: async (startDate, endDate) => {
    const response = await api.get('/sales/report', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  // Cancelar una venta (Anulación total / Nota de Crédito por el total)
  cancel: async (id) => {
    const response = await api.put(`/sales/${id}/cancel`);
    return response.data;
  },

  // Obtener líneas devolvibles de una venta (cantidad ya devuelta y disponible)
  getRefundable: async (id) => {
    const response = await api.get(`/sales/${id}/refundable`);
    return response.data;
  },

  // Registrar devolución parcial o total. lines = [{ saleDetailId, quantity }]
  refund: async (id, reason, lines) => {
    const response = await api.post(`/sales/${id}/refund`, { reason, lines });
    return response.data;
  },

  // Listar notas de crédito (paginado)
  getCreditNotes: async (params = {}) => {
    const response = await api.get('/credit-notes', { params });
    return response.data;
  },

  // Notas de crédito de una venta
  getCreditNotesBySale: async (saleId) => {
    const response = await api.get(`/credit-notes/sale/${saleId}`);
    return response.data;
  },

  // Obtener detalle de venta por ID
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Obtener detalle de venta por numero de factura
  getByInvoiceNumber: async (invoiceNumber) => {
    const response = await api.get(`/sales/invoice/${encodeURIComponent(invoiceNumber)}`);
    return response.data;
  }
};

export default SaleService;
