import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Package, Search } from 'lucide-react';
import ProductService from '../../services/ProductService';
import { sanitizeScanCode } from '../../utils/pluProductUtils';
import { resolveProductByScanCode } from '../../utils/resolveProductScan';
import { PRODUCT_FIELD } from '../ui/formFieldStyles';

const EXPIRY_PRESETS = [
  { days: 7, label: '7 d (1 semana)' },
  { days: 15, label: '15 d (quincena)' },
  { days: 30, label: '30 d (~1 mes)' },
  { days: 60, label: '60 d (~2 meses)' },
];

export { EXPIRY_PRESETS };

const supplierLabel = (s) => s.companyName || s.name || `Proveedor #${s.id}`;

async function fetchProductCandidates({ q, categoryId, supplierId }) {
  const trimmed = sanitizeScanCode(q) || q.trim();
  const cat = categoryId ? Number(categoryId) : null;
  const sup = supplierId ? Number(supplierId) : null;

  const applyFilters = (list) => {
    let out = Array.isArray(list) ? [...list] : [];
    if (cat) out = out.filter((p) => Number(p.category?.id) === cat);
    if (sup) out = out.filter((p) => Number(p.supplier?.id) === sup);
    return out;
  };

  if (trimmed.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    try {
      const { product } = await resolveProductByScanCode(trimmed);
      if (product) {
        const filtered = applyFilters([product]);
        if (filtered.length) return filtered;
      }
    } catch {
      /* continuar con inventario */
    }
  }

  const page = await ProductService.getInventoryPage({
    q: trimmed || undefined,
    categoryId: cat || undefined,
    supplierId: sup || undefined,
    size: 40,
    page: 0,
    sort: 'name,asc',
  });
  let list = page.content || [];

  if (list.length === 0 && trimmed.length >= 2) {
    try {
      const searched = await ProductService.search(trimmed);
      list = applyFilters(Array.isArray(searched) ? searched : searched?.content || []);
    } catch {
      /* ignore */
    }
  }

  return list;
}

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
  const [panelOpen, setPanelOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (selectedProduct?.name) {
      setQuery(selectedProduct.name);
    } else if (!productId) {
      setQuery('');
    }
  }, [selectedProduct, productId]);

  const runSearch = useCallback(async () => {
    const trimmed = query.trim();
    const hasFilter = trimmed.length > 0 || categoryId || supplierId;
    if (!hasFilter) {
      setResults([]);
      setSearched(false);
      setPanelOpen(false);
      return;
    }

    setLoading(true);
    setPanelOpen(true);
    setSearched(true);
    try {
      const list = await fetchProductCandidates({ q: query, categoryId, supplierId });
      setResults(list);
    } catch (err) {
      console.warn('Búsqueda de productos:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, categoryId, supplierId]);

  useEffect(() => {
    if (disabled) return undefined;
    const trimmed = query.trim();
    if (!trimmed && !categoryId && !supplierId) {
      setResults([]);
      setPanelOpen(false);
      setSearched(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      runSearch();
    }, 320);

    return () => clearTimeout(timer);
  }, [query, categoryId, supplierId, disabled, runSearch]);

  const pick = (product) => {
    onSelect(product);
    setQuery(product.name || '');
    setPanelOpen(false);
  };

  const clear = () => {
    onSelect(null);
    setQuery('');
    setResults([]);
    setPanelOpen(false);
    setSearched(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
        <Package size={14} className="text-[var(--app-primary)]" />
        Buscar producto
        {required && !productId ? <span className="text-[var(--app-danger)]">*</span> : null}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={disabled}
          className={`${PRODUCT_FIELD} cursor-pointer text-xs disabled:opacity-50`}
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
          className={`${PRODUCT_FIELD} cursor-pointer text-xs disabled:opacity-50`}
        >
          <option value="">Todos los proveedores</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{supplierLabel(s)}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (productId) onSelect(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Código de barras, PLU o nombre…"
            className={`${PRODUCT_FIELD} pl-9 disabled:opacity-50`}
          />
        </div>
        <button
          type="button"
          onClick={runSearch}
          disabled={disabled || loading}
          className="shrink-0 cursor-pointer rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary-soft)] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-primary)] transition hover:bg-[var(--app-primary)] hover:text-white disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Buscar'}
        </button>
      </div>

      {selectedProduct && (
        <div className="flex items-start justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Producto seleccionado</p>
            <p className="truncate text-sm font-bold text-[var(--app-text)]">{selectedProduct.name}</p>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Código: {selectedProduct.barcode || '—'}
              {selectedProduct.category?.name ? ` · ${selectedProduct.category.name}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 text-[10px] font-bold uppercase text-[var(--app-danger)] hover:underline"
          >
            Quitar
          </button>
        </div>
      )}

      {panelOpen && (
        <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              {loading ? 'Buscando…' : `${results.length} resultado${results.length === 1 ? '' : 's'}`}
            </span>
            {!loading && results.length > 0 && (
              <span className="text-[10px] text-[var(--app-text-muted)]">Clic para seleccionar</span>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto pos-scroll">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs font-semibold text-[var(--app-text-muted)]">
                <Loader2 size={16} className="animate-spin text-[var(--app-primary)]" />
                Cargando productos…
              </div>
            ) : results.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[var(--app-text-muted)]">
                {searched
                  ? 'Sin resultados. Prueba otro código, nombre o filtro.'
                  : 'Escribe un término o elige categoría/proveedor y pulsa Buscar.'}
              </p>
            ) : (
              results.map((p) => {
                const selected = Number(productId) === Number(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pick(p)}
                    className={`flex w-full items-center gap-2 border-b border-[var(--app-border)] px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-[var(--app-surface)] ${
                      selected ? 'bg-[var(--app-primary-soft)]' : ''
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-[var(--app-text)]">{p.name}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-[var(--app-text-muted)]">
                        {p.barcode || '—'}
                        {p.category?.name ? ` · ${p.category.name}` : ''}
                        {p.supplier?.companyName ? ` · ${p.supplier.companyName}` : ''}
                      </span>
                    </span>
                    {selected ? <Check size={16} className="shrink-0 text-[var(--app-primary)]" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchPicker;
