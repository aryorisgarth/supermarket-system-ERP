import React from 'react';
import { Tag, Barcode, Building2, MapPin, Loader2, Check, Copy } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const InventoryCatalogGridView = ({
  products,
  expandedProductIds,
  toggleLocations,
  loadingProductId,
  locationsMap,
  copiedCode,
  handleCopy,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
      {products.map((product) => (
        <div
          key={product.id}
          className={`bg-[var(--app-surface)] rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-md hover:border-[var(--app-primary)]/30 transition-all duration-300 overflow-hidden flex flex-col ${
            !product.isActive ? 'opacity-75 bg-slate-50/50 dark:bg-slate-900/10' : ''
          }`}
        >
          <div className="p-5 border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30">
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)] text-[10px] font-bold uppercase tracking-wider border border-[var(--app-primary)]/10">
                  <Tag size={10} /> {product.category?.name || 'Sin Categoría'}
                </span>
                {product.brand && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 text-[9px] font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-900">
                    {product.brand.name}
                  </span>
                )}
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                  product.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25'
                    : 'bg-slate-500/10 text-slate-500 border-slate-500/25'
                }`}
              >
                {product.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--app-text)] mt-3 leading-snug hover:text-[var(--app-primary)] transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <Barcode size={12} className="text-[var(--app-text-muted)]" />
              <span className="text-[11px] font-mono font-bold text-[var(--app-text-soft)] bg-[var(--app-bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--app-border)]">
                {product.barcode}
              </span>
            </div>
          </div>

          <div className="p-5 flex-1 space-y-4">
            <div className="text-xs text-[var(--app-text-soft)] leading-relaxed italic bg-[var(--app-bg-subtle)]/40 p-3 rounded-2xl border border-[var(--app-border)]/50">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)] not-italic mb-1">
                Descripción Comercial:
              </span>
              {product.description || 'Sin descripción detallada disponible en el catálogo.'}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                  Proveedor
                </span>
                <span className="font-bold text-[var(--app-text)] flex items-center gap-1.5 truncate">
                  <Building2 size={13} className="text-[var(--app-text-muted)]" />
                  {product.supplier?.companyName || 'Sin Proveedor'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                  Stock Físico
                </span>
                <span className="font-bold text-[var(--app-text)] block">
                  {product.currentStock} {product.uomBase || 'UN'}
                </span>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleLocations(product.id)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-[var(--app-primary)] hover:opacity-75 cursor-pointer"
                  >
                    <MapPin size={9} />
                    {expandedProductIds.has(product.id) ? 'Ocultar stock' : 'Ver stock'}
                  </button>
                </div>
              </div>
            </div>

            {expandedProductIds.has(product.id) && (
              <div className="bg-[var(--app-bg-subtle)]/50 p-3 rounded-2xl border border-[var(--app-border)] text-[10px] space-y-1.5 animate-fade-in">
                <span className="block text-[8px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">Distribución Física de Stock:</span>
                {loadingProductId === product.id ? (
                  <div className="text-center py-2 text-[9px] text-[var(--app-text-muted)] font-bold">
                    <Loader2 className="animate-spin inline mr-1" size={12} /> Cargando ubicaciones...
                  </div>
                ) : !locationsMap[product.id] || locationsMap[product.id].length === 0 ? (
                  <div className="text-[9px] text-[var(--app-text-muted)] font-bold italic py-1">No hay existencias registradas en ubicaciones específicas.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {locationsMap[product.id].map(loc => (
                      <div key={loc.id} className="p-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl flex justify-between items-center text-[9px]">
                        <span className="font-bold text-[var(--app-text)]">{loc.locationCode}</span>
                        <span className="text-[var(--app-text-muted)] font-bold">({loc.isPisoVenta ? 'Exh' : 'Bod'})</span>
                        <span className="font-bold text-[var(--app-primary)]">{loc.stock} u</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--app-border)]/60">
              <div className="bg-[var(--app-bg-subtle)]/40 p-3 rounded-2xl border border-[var(--app-border)]/50">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)] mb-1">
                  Costo de Compra
                </span>
                <span className="text-sm font-bold text-[var(--app-text-soft)] tabular-nums">
                  {formatMoney(product.purchasePrice)}
                </span>
              </div>
              <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                  Precio de Venta (Base)
                </span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatMoney(product.salePrice)}
                </span>
              </div>
            </div>

            {product.uomConversions && product.uomConversions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--app-border)]/60">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                  Códigos y Presentaciones Disponibles
                </span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {product.uomConversions.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between gap-2 p-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl text-xs hover:border-[var(--app-primary)]/20 transition-all duration-200"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[10px] uppercase text-[var(--app-primary)]">
                            {conv.label}
                          </span>
                          <span className="text-[10px] text-[var(--app-text-muted)] font-semibold">
                            (factor: {conv.factor})
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatMoney(conv.salePrice)}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-[var(--app-text-soft)] mt-0.5 truncate select-all">
                          {conv.barcode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(conv.barcode)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          copiedCode === conv.barcode
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]'
                        }`}
                        title="Copiar código de barras"
                      >
                        {copiedCode === conv.barcode ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryCatalogGridView;
