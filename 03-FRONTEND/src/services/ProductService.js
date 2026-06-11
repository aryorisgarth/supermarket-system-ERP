import api from './api';

const ProductService = {
  // Obtener productos paginados (inventario: filtros + búsqueda en backend)
  getInventoryPage: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Obtener todos los productos (paginado; por defecto trae hasta 500 para POS/catálogo)
  getAll: async (params = {}) => {
    const response = await api.get('/products', {
      params: { size: 500, page: 0, ...params },
    });
    return response.data;
  },

  // Lista plana de productos activos (sin paginación)
  getAllActive: async () => {
    const response = await api.get('/products/active');
    return response.data;
  },

  // Obtener un producto por ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Crear nuevo producto
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Actualizar producto
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Eliminar producto
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Buscar productos por nombre o código
  search: async (query) => {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  },

  // Obtener por código de barras
  getByBarcode: async (barcode) => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },

  // Obtener productos con stock bajo (crítico)
  getLowStock: async () => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  // Obtener productos por categoría
  getByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  // Obtener productos por proveedor
  getBySupplier: async (supplierId) => {
    const response = await api.get(`/products/supplier/${supplierId}`);
    return response.data;
  },

  // Alternar estado activo/inactivo de forma rápida
  toggleStatus: async (id) => {
    const response = await api.put(`/products/${id}/toggle-status`);
    return response.data;
  },

  // Ajustar la cantidad de stock (incrementar/decrementar)
  adjustStock: async (id, quantity) => {
    const response = await api.put(`/products/${id}/stock`, null, {
      params: { quantity }
    });
    return response.data;
  }
};

export default ProductService;
