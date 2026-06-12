import React from 'react';
import { X, Loader2, Package } from 'lucide-react';
import Card from '../ui/Card';

const LocationDetailsDrawer = ({
  selectedMapLoc,
  mapLocProducts = [],
  loadingMapProducts = false,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!selectedMapLoc) return null;

  return (
    <div className="animate-fade-in">
      <Card className="border-[var(--app-primary)]/30 bg-[var(--app-surface)]/80 backdrop-blur-md shadow-xl lg:sticky lg:top-4 max-h-[85vh] overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start border-b border-[var(--app-border)] pb-3 mb-4">
            <div>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider mb-1.5 ${
                  selectedMapLoc.isPisoVenta
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                    : 'bg-amber-50 text-amber-700 border border-amber-150'
                }`}
              >
                {selectedMapLoc.isPisoVenta ? 'Exhibición' : 'Almacén de Bodega'}
              </span>
              <h3 className="text-base font-black text-[var(--app-text)] leading-none">{selectedMapLoc.locationCode}</h3>
              <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider mt-1">
                {selectedMapLoc.warehouse}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-50/10 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {selectedMapLoc.aisle && (
            <div className="grid grid-cols-3 gap-2 bg-[var(--app-bg-subtle)] p-3 rounded-2xl border border-[var(--app-border)] text-[10px] font-bold text-[var(--app-text-soft)] mb-4">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-[var(--app-text-muted)] mb-0.5">
                  Pasillo
                </span>
                {selectedMapLoc.aisle}
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-[var(--app-text-muted)] mb-0.5">
                  Estante
                </span>
                {selectedMapLoc.shelf || '-'}
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-[var(--app-text-muted)] mb-0.5">
                  Nivel
                </span>
                {selectedMapLoc.level || '-'}
              </div>
            </div>
          )}

          {/* Stock inventory in this specific location */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">
              Productos Almacenados
            </h4>

            {loadingMapProducts ? (
              <div className="py-12 text-center text-[10px] font-bold text-[var(--app-text-muted)]">
                <Loader2 className="animate-spin inline mr-1.5" size={14} /> Cargando existencias...
              </div>
            ) : mapLocProducts.length === 0 ? (
              <div className="py-8 text-center text-[10px] font-bold text-[var(--app-text-muted)] border-2 border-dashed border-[var(--app-border)] rounded-2xl bg-[var(--app-bg-subtle)]/30">
                <Package size={20} className="mx-auto text-[var(--app-text-muted)]/50 mb-1.5" />
                Ubicación vacía (Sin Stock)
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {mapLocProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-2xl flex justify-between items-center hover:border-[var(--app-primary)]/20 transition-all"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-[11px] font-black text-[var(--app-text)] line-clamp-2 leading-snug">
                        {p.productName || 'Producto'}
                      </p>
                      <span className="inline-block font-mono text-[9px] text-[var(--app-text-muted)] mt-1">
                        SKU: {p.locationCode || 'N/A'}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[var(--app-primary)]">{p.stock} u</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--app-border)] pt-4 mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(selectedMapLoc)}
            className="flex-1 py-2 border border-[var(--app-border)] text-[var(--app-text-soft)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all"
          >
            Editar Ficha
          </button>
          <button
            type="button"
            onClick={() => onDelete(selectedMapLoc.id, selectedMapLoc.locationCode)}
            className="py-2 px-4 border border-[var(--app-border)] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all"
          >
            Eliminar
          </button>
        </div>
      </Card>
    </div>
  );
};

export default LocationDetailsDrawer;
