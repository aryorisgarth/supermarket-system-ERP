import api from './api';

const AuditLogService = {

  getAll: async (page = 0, size = 20, filters = {}) => {
    const response = await api.get('/audit-logs', {
      params: {
        page,
        size,
        search: filters.search || undefined,
        action: filters.action || undefined,
        affectedTable: filters.affectedTable || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      }
    });
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/audit-logs/summary');
    return response.data;
  }
};

export default AuditLogService;
