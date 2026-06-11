import api from './api';
import { unwrapPageContent } from '../utils/pageResponse';

const UserService = {
  getPage: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getAll: async () => {
    const data = await UserService.getPage({ page: 0, size: 500, sort: 'fullName,asc' });
    return unwrapPageContent(data);
  },

  getActive: async () => {
    const response = await api.get('/users/active');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  getPermissions: async () => {
    const response = await api.get('/permissions');
    return response.data;
  },

  updateRolePermissions: async (role) => {
    const response = await api.put(`/roles/${role.id}`, {
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
    });
    return response.data;
  },
};

export default UserService;
