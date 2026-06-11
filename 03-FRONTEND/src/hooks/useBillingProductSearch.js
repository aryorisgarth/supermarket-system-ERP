import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import { normalizeProductList } from '../utils/normalizeProduct';

export const useBillingProductSearch = (addToCartWithQuantity, startAddProduct) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
  const [showCategoryProductsModal, setShowCategoryProductsModal] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await CategoryService.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProductService.getAllActive();
      setProducts(normalizeProductList(data));
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoadingCategoryProducts(true);
    setShowCategoryProductsModal(true);
    try {
      const data = await ProductService.getByCategory(category.id);
      setCategoryProducts(normalizeProductList(data).filter((p) => p.isActive !== false));
    } catch (error) {
      console.error('Error al cargar productos de la categoría:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron obtener los productos de esta categoría.'
      });
      setShowCategoryProductsModal(false);
    } finally {
      setLoadingCategoryProducts(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      if (/[a-zA-Z]/.test(query)) {
        try {
          const results = await ProductService.search(query);
          setProducts(normalizeProductList(results).filter((p) => p.isActive !== false));
        } catch (error) {
          console.error('Error en búsqueda por nombre:', error);
        }
      }
    } else if (query.length === 0) {
      loadProducts();
    }
  };

  const handleCategoryQuickAdd = (product) => {
    addToCartWithQuantity(product, 1);
  };

  const handleCategoryQuantityEdit = (product) => {
    setShowCategoryProductsModal(false);
    startAddProduct(product);
  };

  return {
    searchQuery,
    setSearchQuery,
    products,
    setProducts,
    loading,
    setLoading,
    categories,
    selectedCategory,
    categoryProducts,
    loadingCategoryProducts,
    showCategoryProductsModal,
    setShowCategoryProductsModal,
    loadCategories,
    loadProducts,
    handleCategoryClick,
    handleSearch,
    handleCategoryQuickAdd,
    handleCategoryQuantityEdit,
  };
};
