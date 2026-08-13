import api from './api';

const buildParams = (filters = {}) => ({
  search: filters.search || undefined,
  action: filters.action || undefined,
  actionCategory: filters.actionCategory || undefined,
  affectedTable: filters.affectedTable || undefined,
  userId: filters.userId || undefined,
  fromDate: filters.fromDate || undefined,
  toDate: filters.toDate || undefined,
});

const AuditLogService = {
  getAll: async (page = 0, size = 20, filters = {}) => {
    const response = await api.get('/audit-logs', {
      params: {
        page,
        size,
        ...buildParams(filters),
      },
    });
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/audit-logs/summary');
    return response.data;
  },

  exportCsv: async (filters = {}) => {
    const response = await api.get('/audit-logs/export', {
      params: buildParams(filters),
      responseType: 'blob',
    });
    return response.data;
  },
};

export default AuditLogService;
