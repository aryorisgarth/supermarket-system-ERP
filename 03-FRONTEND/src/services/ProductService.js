import api from './api';

const ProductService = {
  
  getInventoryPage: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  
  getAll: async (params = {}) => {
    const response = await api.get('/products', {
      params: { size: 500, page: 0, ...params },
    });
    return response.data;
  },

  
  getAllActive: async () => {
    const response = await api.get('/products/active');
    return response.data;
  },

  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  
  search: async (query) => {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  },

  
  getByBarcode: async (barcode) => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },

  
  getLowStock: async () => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  
  getByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  
  getBySupplier: async (supplierId) => {
    const response = await api.get(`/products/supplier/${supplierId}`);
    return response.data;
  },

  
  toggleStatus: async (id) => {
    const response = await api.put(`/products/${id}/toggle-status`);
    return response.data;
  },

  
  adjustStock: async (id, quantity) => {
    const response = await api.put(`/products/${id}/stock`, null, {
      params: { quantity }
    });
    return response.data;
  }
};

export default ProductService;
