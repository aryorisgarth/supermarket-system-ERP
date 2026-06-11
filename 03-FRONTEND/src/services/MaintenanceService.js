import api from './api';

const MaintenanceService = {
  
  downloadBackup: async () => {
    const response = await api.get('/maintenance/backup', { responseType: 'blob' });
    return response.data;
  },

  
  restoreBackup: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/maintenance/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default MaintenanceService;
