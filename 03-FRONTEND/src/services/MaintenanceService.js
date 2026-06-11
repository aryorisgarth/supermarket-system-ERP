import api from './api';

const MaintenanceService = {
  // Generar y descargar respaldo SQL de la base de datos
  downloadBackup: async () => {
    const response = await api.get('/maintenance/backup', { responseType: 'blob' });
    return response.data;
  },

  // Restaurar base de datos a partir de un archivo SQL (MultipartFile)
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
