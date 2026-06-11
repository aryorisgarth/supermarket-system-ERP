import api from './api';

const DailyClosureService = {
  getAll: async () => {
    try {
      const response = await api.get('/daily-closures');
      return response.data;
    } catch {
      return [];
    }
  },

  getByDate: async (date) => {
    try {
      const response = await api.get(`/daily-closures/date/${date}`);
      return response.data;
    } catch {
      return null;
    }
  },

  create: async (payload) => {
    const response = await api.post('/daily-closures', payload);
    return response.data;
  },
};

export default DailyClosureService;
