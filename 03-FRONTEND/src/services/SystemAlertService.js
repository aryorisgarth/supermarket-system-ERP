import api from './api';
import { unwrapPageContent } from '../utils/pageResponse';

const SystemAlertService = {
  getPage: async (params = {}) => {
    const response = await api.get('/system-alerts', { params });
    return response.data;
  },

  getAll: async (params = {}) => {
    try {
      const data = await SystemAlertService.getPage({ page: 0, size: params.size || 50, ...params });
      return unwrapPageContent(data);
    } catch {
      return [];
    }
  },

  generate: async () => {
    try {
      const response = await api.post('/system-alerts/generate');
      return unwrapPageContent(response.data);
    } catch {
      return [];
    }
  },

  resolve: async (id) => {
    const response = await api.post(`/system-alerts/${id}/resolve`);
    return response.data;
  },
};

export default SystemAlertService;
