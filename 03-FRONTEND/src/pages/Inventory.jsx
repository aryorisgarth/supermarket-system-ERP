import React, { useState, useCallback, useEffect } from 'react';
import { Package, AlertTriangle, Tag } from 'lucide-react';
import ProductService from '../services/ProductService';
import MetadataService from '../services/MetadataService';
import BrandService from '../services/BrandService';
import DashboardService from '../services/DashboardService';
import { normalizeProductList } from '../utils/normalizeProduct';
import { getApiErrorMessage } from '../utils/apiError';
import { getStockBadge } from '../utils/getStockBadge';
import InventoryFilters from '../components/inventory/InventoryFilters';
import InventoryTable from '../components/inventory/InventoryTable';
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal';
import KardexModal from '../components/inventory/KardexModal';
import ProductFormModal from '../components/inventory/ProductFormModal';
import InventoryCatalogView from '../components/inventory/InventoryCatalogView';
import InventoryMetricsGrid from '../components/inventory/InventoryMetricsGrid';
import InventoryGuideModal from '../components/warehouse/InventoryGuideModal';
import InventoryHeaderActions from '../components/inventory/InventoryHeaderActions';
import PageHeader from '../components/ui/PageHeader';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [supFilter, setSupFilter] = useState('');
  const [inventoryStatus, setInventoryStatus] = useState(null);

  const buildParams = useCallback(() => {
    const params = {};
    if (catFilter) params.categoryId = catFilter;
    if (supFilter) params.supplierId = supFilter;
    if (activeTab === 'LOW_STOCK') params.lowStock = true;
    return params;
  }, [activeTab, catFilter, supFilter]);

  const loadPage = useCallback(async (params) => {
    const res = await ProductService.getInventoryPage(params);
    return { ...res, content: normalizeProductList(res.content || []) };
  }, []);

  const {
    items: products,
    setItems: setProducts,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    reload,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
    handleItemsPerPageChange,
  } = useBackendList({
    loadPage,
    buildParams,
    filterDeps: [activeTab, catFilter, supFilter],
    sort: 'name,asc',
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [taxCategories, setTaxCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [showKardexModal, setShowKardexModal] = useState(false);
  const [kardexProduct, setKardexProduct] = useState(null);

  const loadMetadata = async () => {
    const [categoriesResult, suppliersResult, taxResult, brandsResult, statusResult] = await Promise.allSettled([
      MetadataService.getCategories(),
      MetadataService.getSuppliers(),
      MetadataService.getTaxCategories(),
      BrandService.getAll(),
      DashboardService.getInventoryStatus(),
    ]);

    if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value || []);
    if (suppliersResult.status === 'fulfilled') setSuppliers(suppliersResult.value || []);
    if (taxResult.status === 'fulfilled') setTaxCategories(taxResult.value || []);
    if (brandsResult.status === 'fulfilled') setBrands(brandsResult.value || []);
    if (statusResult.status === 'fulfilled') setInventoryStatus(statusResult.value);
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  const fetchProducts = useCallback(async () => {
    await Promise.all([reload(), loadMetadata()]);
  }, [reload]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleOpenEdit = async (product) => {
    try {
      const full = await ProductService.getById(product.id);
      setEditingProduct(full);
      setShowModal(true);
    } catch (error) {
      alert(getApiErrorMessage(error, 'No se pudo cargar el producto para editar.'));
    }
  };

  const handleOpenAdjust = (product) => {
    setAdjustProduct(product);
    setShowAdjustModal(true);
  };

  const handleOpenKardex = (product) => {
    setKardexProduct(product);
    setShowKardexModal(true);
  };

  const handleToggleStatus = async (product) => {
    try {
      await ProductService.toggleStatus(product.id);
      setProducts((current) =>
        current.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch (error) {
      alert('No se pudo alternar el estado del producto.');
    }
  };

  const handleDeleteProduct = async (id, productName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${productName}" del catálogo?`)) {
      try {
        await ProductService.delete(id);
        fetchProducts();
      } catch (error) {
        alert(getApiErrorMessage(error, 'No se pudo eliminar el producto.'));
      }
    }
  };

  const clearFilters = () => {
    setCatFilter('');
    setSupFilter('');
    setSearchTerm('');
    setActiveTab('ALL');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Inventario"
        title="Control de inventario"
        description="Consola de almacen para productos, existencias minimas, precios, proveedores y disponibilidad para venta."
        actions={
          <InventoryHeaderActions
            onOpenCreate={handleOpenCreate}
            onOpenGuide={() => setShowGuideModal(true)}
          />
        }
      />

      <InventoryMetricsGrid
        inventoryStatus={inventoryStatus}
        totalProductsCount={totalItems}
        categoriesCount={categories.length}
      />

      <div className="flex bg-[var(--app-surface)] dark:bg-[var(--app-bg-subtle)] p-1.5 rounded-2xl border border-[var(--app-border)] shadow-sm w-fit max-w-full overflow-x-auto my-6 gap-1">
        <button
          onClick={() => {
            setActiveTab('ALL');
            setCatFilter('');
            setSupFilter('');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-6 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-[var(--app-text-soft)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]'
          }`}
        >
          <Package size={16} />
          Gestión de Productos
        </button>
        <button
          onClick={() => {
            setActiveTab('CATALOG');
            setCatFilter('');
            setSupFilter('');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-6 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap ${
            activeTab === 'CATALOG'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-[var(--app-text-soft)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]'
          }`}
        >
          <Tag size={16} />
          Catálogo Comercial
        </button>
        <button
          onClick={() => {
            setActiveTab('LOW_STOCK');
            setCatFilter('');
            setSupFilter('');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-6 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap ${
            activeTab === 'LOW_STOCK'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-[var(--app-text-soft)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]'
          }`}
        >
          <AlertTriangle size={16} />
          Alertas de Stock Bajo
        </button>
      </div>

      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        catFilter={catFilter}
        onCatFilterChange={(e) => {
          setCatFilter(e.target.value);
          setSupFilter('');
        }}
        supFilter={supFilter}
        onSupFilterChange={(e) => {
          setSupFilter(e.target.value);
          setCatFilter('');
        }}
        categories={categories}
        suppliers={suppliers}
        onClearFilters={clearFilters}
        hasActiveFilters={catFilter || supFilter || searchTerm || (activeTab !== 'ALL' && activeTab !== 'CATALOG')}
      />

      {activeTab === 'CATALOG' ? (
        <InventoryCatalogView products={products} loading={loading} />
      ) : (
        <InventoryTable
          products={products}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          onOpenAdjust={handleOpenAdjust}
          onOpenKardex={handleOpenKardex}
          onOpenEdit={handleOpenEdit}
          onDeleteProduct={handleDeleteProduct}
          getStockBadge={getStockBadge}
        />
      )}

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        label="productos"
      />

      <StockAdjustmentModal
        isOpen={showAdjustModal}
        product={adjustProduct}
        onClose={() => setShowAdjustModal(false)}
        onSuccess={fetchProducts}
      />

      <KardexModal
        isOpen={showKardexModal}
        product={kardexProduct}
        onClose={() => setShowKardexModal(false)}
      />

      <ProductFormModal
        isOpen={showModal}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers}
        taxCategories={taxCategories}
        brands={brands}
        onClose={() => setShowModal(false)}
        onSuccess={fetchProducts}
      />

      <InventoryGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
};

export default Inventory;
