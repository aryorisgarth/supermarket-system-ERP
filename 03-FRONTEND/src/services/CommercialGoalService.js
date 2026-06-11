import api from './api';

const CommercialGoalService = {
  // Obtener el rendimiento y progreso de todas las metas comerciales
  getAllPerformance: async () => {
    const response = await api.get('/commercial-goals/performance');
    return response.data;
  },

  // Crear una nueva meta comercial
  create: async (goalPayload) => {
    const response = await api.post('/commercial-goals', goalPayload);
    return response.data;
  },

  // Obtener rendimiento y progreso de una meta específica
  getPerformance: async (id) => {
    const response = await api.get(`/commercial-goals/${id}/performance`);
    return response.data;
  }
};

export default CommercialGoalService;
