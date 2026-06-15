import React, { useState } from 'react';
import { Info, AlertCircle, LayoutGrid, List } from 'lucide-react';
import LocationService from '../../services/LocationService';
import InventoryCatalogListView from './InventoryCatalogListView';
import InventoryCatalogGridView from './InventoryCatalogGridView';

const InventoryCatalogView = ({ products, loading }) => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [viewMode, setViewMode] = useState('LIST');
  const [locationsMap, setLocationsMap] = useState({});
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 1500);
  };

  const toggleLocations = async (productId) => {
    const next = new Set(expandedProductIds);
    if (next.has(productId)) {
      next.delete(productId);
      setExpandedProductIds(next);
      return;
    }
    
    next.add(productId);
    setExpandedProductIds(next);
    
    if (!locationsMap[productId]) {
      setLoadingProductId(productId);
      try {
        const data = await LocationService.getProductLocations(productId);
        setLocationsMap(prev => ({ ...prev, [productId]: data || [] }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProductId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="ui-card overflow-hidden">
        <div className="flex flex-col items-center gap-2 py-20 text-[var(--app-text-muted)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-primary)]"></div>
          <p className="text-xs font-bold mt-2">Cargando catálogo comercial...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="ui-card overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-[var(--app-text-muted)]">
          <AlertCircle size={36} className="opacity-60" />
          <p className="text-xs font-bold">No se encontraron productos en el catálogo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--app-surface)] p-4 rounded-2xl border border-[var(--app-border)] shadow-sm">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[var(--app-primary)]" />
          <p className="text-xs text-[var(--app-text-soft)] font-medium">
            Visualizando <span className="font-bold text-[var(--app-text)]">{products.length}</span> productos comerciales en inventario.
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-[var(--app-bg-subtle)] p-1 rounded-xl border border-[var(--app-border)] self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('LIST')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'LIST'
                ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
            title="Vista de Lista"
          >
            <List size={12} />
            Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'GRID'
                ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
            title="Vista de Tarjetas"
          >
            <LayoutGrid size={12} />
            Tarjetas
          </button>
        </div>
      </div>

      {viewMode === 'LIST' ? (
        <InventoryCatalogListView
          products={products}
          expandedProductIds={expandedProductIds}
          toggleLocations={toggleLocations}
          loadingProductId={loadingProductId}
          locationsMap={locationsMap}
          copiedCode={copiedCode}
          handleCopy={handleCopy}
        />
      ) : (
        <InventoryCatalogGridView
          products={products}
          expandedProductIds={expandedProductIds}
          toggleLocations={toggleLocations}
          loadingProductId={loadingProductId}
          locationsMap={locationsMap}
          copiedCode={copiedCode}
          handleCopy={handleCopy}
        />
      )}
    </div>
  );
};

export default InventoryCatalogView;
