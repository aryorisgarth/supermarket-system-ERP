import api from './api';

const NotificationRuleService = {
  getAll: async () => {
    const response = await api.get('/notification-rules');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/notification-rules', data);
    return response.data;
  },

  toggle: async (id) => {
    const response = await api.put(`/notification-rules/${id}/toggle`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notification-rules/${id}`);
    return response.data;
  },
};

export default NotificationRuleService;
