import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Package, Search } from 'lucide-react';

const PurchaseSupplierCatalog = ({
  supplierName,
  products = [],
  loading = false,
  onPickProduct,
  selectedProductIds = [],
}) => {
  const [expanded, setExpanded] = useState(true);
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const barcode = product.barcode?.toLowerCase() || '';
      const category = product.category?.name?.toLowerCase() || '';
      return name.includes(term) || barcode.includes(term) || category.includes(term);
    });
  }, [products, query]);

  if (!loading && products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg-subtle)]/20 px-4 py-4">
        <p className="text-xs font-bold text-[var(--app-text)]">Este proveedor no tiene productos asignados.</p>
        <p className="mt-1 text-[11px] text-[var(--app-text-muted)]">
          Asigna proveedor a cada producto desde <strong>Inventario → Editar producto</strong> para que aparezcan aquí.
        </p>
      </div>
    );
  }

  if (!products.length && loading) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--app-bg-subtle)]/60"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
            Catálogo del proveedor
          </p>
          <p className="mt-0.5 text-xs font-bold text-[var(--app-text)]">
            {supplierName || 'Proveedor'} · {products.length} producto{products.length === 1 ? '' : 's'}
          </p>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="border-t border-[var(--app-border)] px-4 pb-4 pt-3 space-y-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrar catálogo…"
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-2 pl-9 pr-3 text-xs font-medium text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
            />
          </div>

          {loading ? (
            <p className="text-xs text-[var(--app-text-muted)]">Cargando catálogo…</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-xs text-[var(--app-text-muted)]">No hay productos que coincidan con el filtro.</p>
          ) : (
            <div className="max-h-44 overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(String(product.id));
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => onPickProduct(product)}
                      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-all hover:border-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]/10 ${
                        isSelected
                          ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)]/15'
                          : 'border-[var(--app-border)] bg-[var(--app-surface)]'
                      }`}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-bg-subtle)] text-[var(--app-primary)]">
                        <Package size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-[var(--app-text)]">{product.name}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-[var(--app-text-muted)]">
                          {product.barcode || 'Sin código'}
                          {product.category?.name ? ` · ${product.category.name}` : ''}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseSupplierCatalog;
