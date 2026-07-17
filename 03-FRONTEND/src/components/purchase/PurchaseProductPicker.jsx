import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import ProductService from '../../services/ProductService';
import { normalizeProductList } from '../../utils/normalizeProduct';

const filterProducts = (products, query) => {
  const term = query.trim().toLowerCase();
  if (!term) return products;
  return products.filter((product) => {
    const name = product.name?.toLowerCase() || '';
    const barcode = product.barcode?.toLowerCase() || '';
    const category = product.category?.name?.toLowerCase() || '';
    return name.includes(term) || barcode.includes(term) || category.includes(term);
  });
};

const PurchaseProductPicker = ({
  supplierId,
  supplierProducts = [],
  productId,
  productSearch,
  disabled = false,
  onSelect,
  onSearchChange,
  onClear,
}) => {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [remoteResults, setRemoteResults] = useState([]);

  const localResults = useMemo(
    () => filterProducts(supplierProducts, productSearch),
    [supplierProducts, productSearch]
  );

  useEffect(() => {
    if (disabled || !supplierId) {
      setRemoteResults([]);
      return undefined;
    }

    const query = productSearch.trim();
    if (query.length < 2) {
      setRemoteResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoadingRemote(true);
      try {
        const page = await ProductService.getInventoryPage({
          q: query,
          supplierId: Number(supplierId),
          size: 50,
          page: 0,
          sort: 'name,asc',
        });
        setRemoteResults(normalizeProductList(page.content || []));
      } catch (error) {
        console.warn('Búsqueda de productos de compra:', error);
        setRemoteResults([]);
      } finally {
        setLoadingRemote(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [disabled, productSearch, supplierId]);

  const results = useMemo(() => {
    const merged = new Map();
    const source = productSearch.trim().length >= 2 ? remoteResults : localResults;
    source.forEach((product) => merged.set(String(product.id), product));
    return Array.from(merged.values());
  }, [localResults, productSearch, remoteResults]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleFocus = () => {
    if (!disabled && supplierId) setOpen(true);
  };

  const handlePick = (product) => {
    onSelect(product);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
        />
        <input
          type="text"
          value={productSearch}
          onChange={(event) => {
            onSearchChange(event.target.value);
            if (productId) onClear?.();
            setOpen(true);
          }}
          onFocus={handleFocus}
          placeholder={supplierId ? 'Buscar por nombre, código o categoría…' : 'Selecciona proveedor…'}
          disabled={disabled}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] py-2 pl-8 pr-8 text-xs font-bold text-[var(--app-text)] outline-none transition-all focus:border-[var(--app-primary)] disabled:opacity-50"
        />
        {(loadingRemote || productId) && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {loadingRemote ? (
              <Loader2 size={13} className="animate-spin text-[var(--app-text-muted)]" />
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClear?.();
                  setOpen(true);
                }}
                className="text-[var(--app-text-muted)] hover:text-[var(--app-danger)]"
                title="Quitar producto"
              >
                <X size={13} />
              </button>
            )}
          </span>
        )}
      </div>

      {open && supplierId && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl">
          {results.length > 0 ? (
            <>
              <div className="sticky top-0 border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                {results.length} producto{results.length === 1 ? '' : 's'} encontrado{results.length === 1 ? '' : 's'}
              </div>
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handlePick(product);
                  }}
                  className="w-full border-b border-[var(--app-border)]/40 px-3 py-2.5 text-left last:border-0 hover:bg-[var(--app-bg-subtle)]"
                >
                  <span className="block text-xs font-bold text-[var(--app-text)]">{product.name}</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--app-text-muted)]">
                    Cod: {product.barcode || '—'}
                    {product.category?.name ? ` · ${product.category.name}` : ''}
                    {product.salePrice ? ` · Venta C$ ${Number(product.salePrice).toFixed(2)}` : ''}
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-4 text-[11px] text-[var(--app-text-muted)]">
              {loadingRemote
                ? 'Buscando productos…'
                : productSearch.trim()
                  ? 'Sin coincidencias. Prueba otro término o usa el catálogo del proveedor.'
                  : supplierProducts.length === 0
                    ? 'Este proveedor no tiene productos asignados en inventario.'
                    : 'Escribe para filtrar o elige desde el catálogo del proveedor.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseProductPicker;
