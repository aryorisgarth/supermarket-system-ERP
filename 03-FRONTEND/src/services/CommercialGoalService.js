import api from './api';

const CommercialGoalService = {
  
  getAllPerformance: async () => {
    const response = await api.get('/commercial-goals/performance');
    return response.data;
  },

  
  create: async (goalPayload) => {
    const response = await api.post('/commercial-goals', goalPayload);
    return response.data;
  },

  
  getPerformance: async (id) => {
    const response = await api.get(`/commercial-goals/${id}/performance`);
    return response.data;
  }
};

export default CommercialGoalService;
