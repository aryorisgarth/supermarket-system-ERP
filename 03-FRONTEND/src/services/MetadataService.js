import api from './api';
import { fetchAllOptions } from '../utils/pageResponse';

const MetadataService = {
  getCategories: async () => fetchAllOptions((params) => api.get('/categories', { params }).then((r) => r.data)),

  getSuppliers: async () => fetchAllOptions(
    (params) => api.get('/suppliers', { params }).then((r) => r.data),
    500,
    'companyName,asc',
  ),

  
  getTaxCategories: async () => {
    const response = await api.get('/tax-categories/active');
    return response.data;
  }
};

export default MetadataService;
