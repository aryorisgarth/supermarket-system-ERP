import { useEffect, useMemo, useState } from 'react';
import { Search, Barcode, AlertTriangle, Loader2, Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatMoney } from '../../utils/formatMoney';

const PAGE_SIZE = 9;

const ProductCatalog = ({ 
  products = [], 
  loading = false, 
  searchQuery = '', 
  onSearchChange, 
  onKeyDown, 
  onAddToCart 
}) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(
    () => products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [products, safePage]
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, products.length]);

  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <div className="pos-panel flex min-h-0 flex-col gap-3 overflow-hidden p-4">
      
      
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] p-3"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] transition-colors group-focus-within:text-[var(--app-primary)]" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o escanear código [Enter]..." 
            className="ui-input pl-11"
            value={searchQuery}
            onChange={onSearchChange}
            onKeyDown={onKeyDown}
            autoFocus
          />
        </div>
        
        
        <div className="hidden items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--app-primary)] sm:flex">
          <Barcode size={14} />
          <span>Lector Listo</span>
        </div>
      </motion.div>

      
      <div className="min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-32 text-[var(--app-text-muted)]">
            <Loader2 className="animate-spin text-primary" size={36} />
            <span className="font-medium text-xs tracking-wider uppercase">Sincronizando Inventario...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--app-border)] py-32 text-[var(--app-text-muted)]">
            <ShoppingBag size={32} className="opacity-60" />
            <span className="font-medium text-sm">No se encontraron productos coincidentes</span>
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product) => {
              const outOfStock = product.currentStock <= 0;
              const isInactive = product.isActive === false;
              const isCritical = !outOfStock && !isInactive && product.currentStock < (product.minimumStock || 5);
              const isDisabled = outOfStock || isInactive;
              
              return (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => !isDisabled && onAddToCart(product)}
                  disabled={isDisabled}
                  className={`group relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-xl border bg-[var(--app-surface-raised)] text-left transition-all duration-150 ${
                    isDisabled
                      ? 'border-[var(--app-border)] opacity-60' 
                      : 'border-[var(--app-border)] hover:-translate-y-0.5 hover:border-[var(--app-primary)] hover:shadow-[var(--app-shadow)]'
                  }`}
                >
                  
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      {product.category?.name ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark bg-surface dark:bg-surface-dark border border-border-light dark:border-border-light-dark px-2 py-0.5 rounded">
                          {product.category.name}
                        </span>
                      ) : <div />}
                      
                      <span className={`font-mono text-base font-bold tracking-tight ${isDisabled ? 'text-[var(--app-text-muted)]' : 'text-[var(--app-text)]'}`}>
                        {formatMoney(product.salePrice)}
                      </span>
                    </div>

                    <h4 className={`mb-1 line-clamp-2 text-[13px] font-bold tracking-tight transition-colors ${isDisabled ? 'text-[var(--app-text-muted)]' : 'text-[var(--app-text)] group-hover:text-[var(--app-primary)]'}`}>
                      {product.name || 'Producto sin descripción'}
                    </h4>

                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--app-text-muted)]">
                      <Barcode size={12} className="opacity-60" />
                      {product.barcode || '— N/A —'}
                    </span>
                  </div>

                  
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-2.5">
                    
                    
                    <div className="flex items-center">
                      {isInactive ? (
                        <span className="text-[10px] font-bold uppercase text-danger dark:text-danger bg-danger/10 dark:bg-danger/10 px-2 py-0.5 rounded">Inactivo</span>
                      ) : outOfStock ? (
                        <span className="text-[10px] font-bold uppercase text-danger dark:text-danger bg-danger/10 dark:bg-danger/10 px-2 py-0.5 rounded">Agotado</span>
                      ) : isCritical ? (
                        <span className="text-[10px] font-bold text-warning dark:text-warning bg-warning/10 dark:bg-warning/10 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={12} /> Stock: {product.currentStock}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-text-secondary dark:text-text-secondary-dark">
                          Stock: <b className="font-bold text-text-primary dark:text-text-primary-dark">{product.currentStock}</b> {product.unit || 'ud'}
                        </span>
                      )}
                    </div>

                    
                    {!isDisabled && (
                      <span
                        className="flex items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 text-[var(--app-text-soft)] shadow-sm transition group-hover:border-[var(--app-primary)] group-hover:bg-[var(--app-primary)] group-hover:text-white"
                        title="Agregar al carrito"
                      >
                        <Plus size={16} />
                      </span>
                    )}

                  </div>

                  
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!loading && products.length > 0 && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--app-border)] pt-3">
          <p className="text-xs font-semibold text-[var(--app-text-muted)]">
            Mostrando {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, products.length)} de {products.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="ui-button ui-button-sm ui-button-secondary disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--app-text)]">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="ui-button ui-button-sm ui-button-secondary disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductCatalog;
