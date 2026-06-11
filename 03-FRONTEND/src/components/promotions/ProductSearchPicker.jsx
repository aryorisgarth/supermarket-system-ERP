import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import ProductService from '../../services/ProductService';

const EXPIRY_PRESETS = [
  { days: 7, label: '7 d (1 semana)' },
  { days: 15, label: '15 d (quincena)' },
  { days: 30, label: '30 d (~1 mes)' },
  { days: 60, label: '60 d (~2 meses)' },
];

export { EXPIRY_PRESETS };


const ProductSearchPicker = ({
  productId,
  selectedProduct,
  onSelect,
  categories = [],
  suppliers = [],
  disabled = false,
  required = false,
}) => {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (selectedProduct?.name) {
      setQuery(selectedProduct.name);
    } else if (!productId) {
      setQuery('');
    }
  }, [selectedProduct, productId]);

  useEffect(() => {
    if (disabled) {
      setResults([]);
      setOpen(false);
      return undefined;
    }

    const q = query.trim();
    const hasFilter = q.length > 0 || categoryId || supplierId;
    if (!hasFilter) {
      setResults([]);
      setOpen(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const page = await ProductService.getInventoryPage({
          q: q || undefined,
          categoryId: categoryId || undefined,
          supplierId: supplierId || undefined,
          size: 15,
          page: 0,
          sort: 'name,asc',
        });
        setResults(page.content || []);
        setOpen(true);
      } catch (err) {
        console.warn('Búsqueda de productos:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, categoryId, supplierId, disabled]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const pick = (product) => {
    onSelect(product);
    setQuery(product.name || '');
    setOpen(false);
  };

  const clear = () => {
    onSelect(null);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const supplierLabel = (s) => s.companyName || s.name || `Proveedor #${s.id}`;

  return (
    <div ref={rootRef} className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs font-medium text-[var(--app-text)] disabled:opacity-50"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs font-medium text-[var(--app-text)] disabled:opacity-50"
        >
          <option value="">Todos los proveedores</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{supplierLabel(s)}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (productId) onSelect(null);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          disabled={disabled}
          required={required && !productId}
          placeholder="Buscar por código, nombre, categoría o proveedor..."
          className="w-full pl-9 pr-9 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-[var(--app-text)] disabled:opacity-50"
        />
        {(loading || productId) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 size={14} className="animate-spin text-[var(--app-text-muted)]" />
            ) : (
              <button type="button" onClick={clear} className="text-[var(--app-text-muted)] hover:text-[var(--app-danger)]" aria-label="Quitar producto">
                <X size={14} />
              </button>
            )}
          </span>
        )}
        {open && results.length > 0 && (
          <div className="absolute z-30 left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p)}
                className={`w-full text-left px-3 py-2.5 border-b border-[var(--app-border)] last:border-0 hover:bg-[var(--app-bg-subtle)] transition-colors ${Number(productId) === Number(p.id) ? 'bg-[var(--app-primary-soft)]' : ''}`}
              >
                <span className="block text-xs font-bold text-[var(--app-text)]">{p.name}</span>
                <span className="block text-[10px] text-[var(--app-text-muted)] mt-0.5">
                  {p.barcode || '—'}
                  {p.category?.name ? ` · ${p.category.name}` : ''}
                  {p.supplier?.companyName ? ` · ${p.supplier.companyName}` : ''}
                </span>
              </button>
            ))}
          </div>
        )}
        {open && !loading && results.length === 0 && query.trim().length > 1 && (
          <div className="absolute z-30 left-0 right-0 top-full mt-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[11px] text-[var(--app-text-muted)] shadow-lg">
            Sin resultados. Pruebe otro término o filtro.
          </div>
        )}
      </div>

      {selectedProduct && (
        <p className="text-[10px] font-medium text-emerald-700">
          Seleccionado: <span className="font-bold">{selectedProduct.name}</span>
          {selectedProduct.barcode ? ` (${selectedProduct.barcode})` : ''}
        </p>
      )}
    </div>
  );
};

export default ProductSearchPicker;
