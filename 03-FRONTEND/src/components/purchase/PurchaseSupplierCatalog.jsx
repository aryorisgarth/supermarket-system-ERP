import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';

const PAGE_SIZE = 25;

const PurchaseSupplierCatalog = ({
  supplierName,
  products = [],
  loading = false,
  onPickProduct,
  selectedProductIds = [],
}) => {
  const [expanded, setExpanded] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filteredProducts.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filteredProducts.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filteredProducts.length, safePage * PAGE_SIZE + PAGE_SIZE);

  const handleQueryChange = (value) => {
    setQuery(value);
    setPage(0);
  };

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
            Catálogo completo del proveedor
          </p>
          <p className="mt-0.5 text-xs font-bold text-[var(--app-text)]">
            {supplierName || 'Proveedor'} · {products.length} producto{products.length === 1 ? '' : 's'} · clic para agregar
          </p>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-[var(--app-border)] px-4 pb-4 pt-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Filtrar por nombre, código o categoría…"
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-2 pl-9 pr-3 text-xs font-medium text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
            />
          </div>

          {loading ? (
            <p className="text-xs text-[var(--app-text-muted)]">Cargando catálogo completo…</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-xs text-[var(--app-text-muted)]">No hay productos que coincidan con el filtro.</p>
          ) : (
            <>
              <div className="max-h-[min(52vh,520px)] overflow-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="sticky top-0 z-10 border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)] text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                    <tr>
                      <th className="px-3 py-2.5">Producto</th>
                      <th className="px-3 py-2.5">Código</th>
                      <th className="px-3 py-2.5">Categoría</th>
                      <th className="px-3 py-2.5 text-right">Precio venta</th>
                      <th className="px-3 py-2.5 text-center">Agregar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]/50">
                    {pageItems.map((product) => {
                      const isSelected = selectedProductIds.includes(String(product.id));
                      return (
                        <tr
                          key={product.id}
                          className={`transition-colors hover:bg-[var(--app-bg-subtle)]/50 ${
                            isSelected ? 'bg-[var(--app-primary-soft)]/15' : ''
                          }`}
                        >
                          <td className="px-3 py-2.5 font-bold text-[var(--app-text)]">{product.name}</td>
                          <td className="px-3 py-2.5 font-mono text-[10px] text-[var(--app-text-muted)]">
                            {product.barcode || '—'}
                          </td>
                          <td className="px-3 py-2.5 text-[var(--app-text-soft)]">
                            {product.category?.name || '—'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                            {product.salePrice ? `C$ ${Number(product.salePrice).toFixed(2)}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => onPickProduct(product)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[var(--app-primary)] text-white'
                                  : 'border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] hover:border-[var(--app-primary)]'
                              }`}
                            >
                              <Plus size={12} />
                              {isSelected ? 'En orden' : 'Agregar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                  Mostrando {rangeStart}-{rangeEnd} de {filteredProducts.length}
                  {query.trim() ? ` (filtrados de ${products.length})` : ''}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safePage === 0}
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--app-border)] px-2.5 py-1.5 text-[10px] font-bold uppercase disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span className="text-[10px] font-bold text-[var(--app-text-muted)]">
                      Página {safePage + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages - 1}
                      onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--app-border)] px-2.5 py-1.5 text-[10px] font-bold uppercase disabled:opacity-40 cursor-pointer"
                    >
                      Siguiente <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseSupplierCatalog;
