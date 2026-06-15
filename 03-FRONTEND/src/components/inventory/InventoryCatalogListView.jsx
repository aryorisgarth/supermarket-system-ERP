import React from 'react';
import { Building2, MapPin, Loader2, Check, Copy, Tag, Archive } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const InventoryCatalogListView = ({
  products,
  expandedProductIds,
  toggleLocations,
  loadingProductId,
  locationsMap,
  copiedCode,
  handleCopy,
}) => {
  return (
    <div className="ui-card overflow-hidden border border-[var(--app-border)] bg-[var(--app-surface)] rounded-3xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              <th className="py-5 px-6 font-semibold">Producto y Categoría</th>
              <th className="py-5 px-6 font-semibold">Descripción</th>
              <th className="py-5 px-6 font-semibold">Proveedor e Inventario</th>
              <th className="py-5 px-6 text-right font-semibold">Precios (Costo / Venta)</th>
              <th className="py-5 px-6 font-semibold">Presentaciones y Códigos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]/60">
            {products.map((product) => (
              <tr
                key={product.id}
                className={`hover:bg-[var(--app-primary-soft)]/5 transition-colors duration-150 ${
                  !product.isActive ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/10' : ''
                }`}
              >
                {}
                <td className="py-5 px-6">
                  <div className="font-bold text-[var(--app-text)] text-[15px] mb-2 leading-tight">
                    {product.name}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--app-primary-soft)]/20 text-[var(--app-primary)] text-[10px] font-extrabold uppercase tracking-wider border border-[var(--app-primary)]/10">
                      <Tag size={10} />
                      {product.category?.name || 'Sin Categoría'}
                    </span>
                    {product.brand && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50/80 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-100 dark:border-blue-900">
                        {product.brand.name}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-[var(--app-text-soft)] bg-[var(--app-bg-subtle)] px-2 py-0.5 rounded border border-[var(--app-border)]">
                      {product.barcode}
                    </span>
                  </div>
                </td>

                {}
                <td className="py-5 px-6 max-w-[280px]">
                  <p className="text-[12px] text-[var(--app-text-soft)] leading-relaxed font-medium line-clamp-3" title={product.description}>
                    {product.description || 'Sin descripción comercial.'}
                  </p>
                </td>

                {}
                <td className="py-5 px-6">
                  <div className="flex items-center gap-2 font-semibold text-[13px] text-[var(--app-text-soft)] mb-2">
                    <Building2 size={14} className="text-[var(--app-text-muted)]" />
                    {product.supplier?.companyName || 'Sin Proveedor'}
                  </div>
                  <div className="text-[11px] text-[var(--app-text-muted)] flex flex-col gap-1.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Archive size={12} className="text-[var(--app-text-muted)]" />
                      Disponible: <span className="font-bold text-[var(--app-text)] pl-1">{product.currentStock} {product.uomBase || 'UN'}</span>
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleLocations(product.id)}
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[var(--app-primary)] hover:underline hover:opacity-90 cursor-pointer"
                      >
                        <MapPin size={11} />
                        {expandedProductIds.has(product.id) ? 'Ocultar ubicaciones' : 'Ver ubicaciones'}
                      </button>
                      
                      {expandedProductIds.has(product.id) && (
                        <div className="mt-2 space-y-1.5 pl-2.5 border-l-2 border-[var(--app-primary)]/30 animate-fade-in max-w-[240px]">
                          {loadingProductId === product.id ? (
                            <span className="text-[10px] text-[var(--app-text-muted)] font-bold flex items-center gap-1">
                              <Loader2 className="animate-spin" size={10} /> Cargando...
                            </span>
                          ) : !locationsMap[product.id] || locationsMap[product.id].length === 0 ? (
                            <span className="text-[10px] text-[var(--app-text-muted)] font-bold block italic">Sin existencias en ubicaciones</span>
                          ) : (
                            locationsMap[product.id].map(loc => (
                              <div key={loc.id} className="text-[10px] text-[var(--app-text-soft)] font-semibold flex justify-between gap-4 py-0.5 border-b border-dashed border-[var(--app-border)]/40 last:border-0">
                                <span>{loc.locationCode} <span className="text-[9px] text-[var(--app-text-muted)]">({loc.isPisoVenta ? 'Exhibición' : 'Bodega'})</span>:</span>
                                <span className="font-bold text-[var(--app-text)]">{loc.stock} u.</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {}
                <td className="py-5 px-6 text-right tabular-nums">
                  <div className="text-[11px] font-semibold text-[var(--app-text-muted)]">
                    Costo: <span className="font-bold text-[var(--app-text-soft)]">{formatMoney(product.purchasePrice)}</span>
                  </div>
                  <div className="text-[15px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatMoney(product.salePrice)}
                  </div>
                </td>

                {}
                <td className="py-5 px-6">
                  {product.uomConversions && product.uomConversions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-w-[340px]">
                      {product.uomConversions.map((conv) => (
                        <div
                          key={conv.id}
                          className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-[var(--app-bg-subtle)] hover:bg-[var(--app-bg-subtle)]/80 border border-[var(--app-border)] rounded-full transition-colors duration-150"
                        >
                          <span className="font-extrabold text-[9px] uppercase text-[var(--app-primary)]">
                            {conv.label}
                          </span>
                          <span className="font-mono text-[9px] font-semibold text-[var(--app-text-soft)]">
                            {conv.barcode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(conv.barcode)}
                            className={`p-1 rounded-full border transition-all cursor-pointer ${
                              copiedCode === conv.barcode
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                : 'bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]'
                            }`}
                            title={`Copiar código: ${conv.barcode}`}
                          >
                            {copiedCode === conv.barcode ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[var(--app-text-muted)] italic font-medium">
                      Solo presentación base ({product.uomBase || 'UN'})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryCatalogListView;
