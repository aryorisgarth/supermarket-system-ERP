import api from './api';

const ScaleConfigService = {
  getConfig: async () => {
    const response = await api.get('/api/v1/scale-config');
    return response.data;
  },

  updateConfig: async (data) => {
    const response = await api.put('/api/v1/scale-config', data);
    return response.data;
  },
};

export default ScaleConfigService;
