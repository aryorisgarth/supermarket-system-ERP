import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Package, AlertTriangle, Tag } from 'lucide-react';
import Swal from 'sweetalert2';

import ProductService from '../services/ProductService';
import MetadataService from '../services/MetadataService';
import BrandService from '../services/BrandService';
import DashboardService from '../services/DashboardService';

import { normalizeProductList } from '../utils/normalizeProduct';
import { getApiErrorMessage } from '../utils/apiError';

import InventoryFilters from '../components/inventory/InventoryFilters';
import InventoryTable from '../components/inventory/InventoryTable';
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal';
import KardexModal from '../components/inventory/KardexModal';
import ProductFormModal from '../components/inventory/ProductFormModal';
import InventoryCatalogView from '../components/inventory/InventoryCatalogView';
import InventoryMetricsGrid from '../components/inventory/InventoryMetricsGrid';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('ALL');
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

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value || []);
    }
    if (suppliersResult.status === 'fulfilled') {
      setSuppliers(suppliersResult.value || []);
    }
    if (taxResult.status === 'fulfilled') {
      setTaxCategories(taxResult.value || []);
    }
    if (brandsResult.status === 'fulfilled') {
      setBrands(brandsResult.value || []);
    }
    if (statusResult.status === 'fulfilled') {
      setInventoryStatus(statusResult.value);
    }
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
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo cargar el producto para editar.'), 'error');
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

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      Toast.fire({
        icon: 'success',
        title: `Estado de "${product.name}" actualizado.`,
      });
    } catch (error) {
      console.error('Toggle status error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo alternar el estado del producto.',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleDeleteProduct = async (id, productName) => {
    const result = await Swal.fire({
      title: '¿Eliminar Producto?',
      text: `¿Estás seguro de que deseas eliminar "${productName}" del catálogo? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await ProductService.delete(id);
        Swal.fire({
          icon: 'success',
          title: 'Producto Eliminado',
          text: 'El producto ha sido removido del catálogo.',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchProducts();
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo eliminar',
          text: getApiErrorMessage(
            error,
            'No se pudo eliminar el producto. Puede estar vinculado a lotes, ventas u otros registros.'
          ),
          confirmButtonColor: '#ef4444',
        });
      }
    }
  };

  const clearFilters = () => {
    setCatFilter('');
    setSupFilter('');
    setSearchTerm('');
    setActiveTab('ALL');
  };

  const getStockBadge = (stock, minStock = 5) => {
    if (stock <= 0)
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-650 text-[11px] font-bold border border-red-150 shadow-sm">
          Agotado (0)
        </span>
      );
    if (stock < minStock)
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-650 text-[11px] font-bold border border-amber-150 shadow-sm">
          Crítico ({stock})
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-650 text-[11px] font-bold border border-emerald-150 shadow-sm">
        Disponible ({stock})
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Inventario"
        title="Control de inventario"
        description="Consola de almacen para productos, existencias minimas, precios, proveedores y disponibilidad para venta."
        actions={
          <Button type="button" icon={Plus} onClick={handleOpenCreate}>
            Nuevo producto
          </Button>
        }
      />

      <InventoryMetricsGrid
        inventoryStatus={inventoryStatus}
        totalProductsCount={totalItems}
        categoriesCount={categories.length}
      />

      <div className="ui-tabs-scroll flex gap-1 border-b border-[var(--app-border)]">
        <button
          onClick={() => {
            setActiveTab('ALL');
            setCatFilter('');
            setSupFilter('');
          }}
          className={`flex items-center gap-2 pb-3 px-6 font-black text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]/30'
              : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          <Package size={14} />
          Gestión de Productos
        </button>
        <button
          onClick={() => {
            setActiveTab('CATALOG');
            setCatFilter('');
            setSupFilter('');
          }}
          className={`flex items-center gap-2 pb-3 px-6 font-black text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'CATALOG'
              ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]/30'
              : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          <Tag size={14} />
          Catálogo Comercial
        </button>
        <button
          onClick={() => {
            setActiveTab('LOW_STOCK');
            setCatFilter('');
            setSupFilter('');
          }}
          className={`flex items-center gap-2 pb-3 px-6 font-black text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'LOW_STOCK'
              ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]/30'
              : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          <AlertTriangle
            size={14}
            className={activeTab === 'LOW_STOCK' ? 'text-[var(--app-danger)]' : 'text-amber-500'}
          />
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
    </div>
  );
};

export default Inventory;
