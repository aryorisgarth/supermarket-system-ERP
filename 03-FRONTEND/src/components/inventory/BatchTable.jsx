import React from 'react';
import { Loader2, PackageX, Pencil, Trash2 } from 'lucide-react';

const BatchTable = ({
  loading,
  filtered,
  canDeleteBatches,
  onEdit,
  onDelete,
  formatDate,
  formatQty,
  toneClasses,
  rowAccent
}) => {
  return (
    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center py-16 text-[var(--app-text-muted)]">
          <Loader2 className="animate-spin mr-2" size={20} /> Cargando lotes...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--app-text-muted)]">
          <PackageX size={40} className="mb-3 opacity-40" />
          <p className="font-semibold text-sm">No hay lotes que coincidan.</p>
          <p className="text-xs opacity-70">Registre un lote nuevo para empezar a controlar vencimientos.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] text-[11px] uppercase tracking-wider">
                <th className="text-left font-black px-4 py-3">Producto</th>
                <th className="text-left font-black px-4 py-3">Lote</th>
                <th className="text-center font-black px-4 py-3">Ingreso</th>
                <th className="text-center font-black px-4 py-3">Vence</th>
                <th className="text-center font-black px-4 py-3">Días</th>
                <th className="text-right font-black px-4 py-3">Existencia</th>
                <th className="text-center font-black px-4 py-3">Estado</th>
                <th className="text-center font-black px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ batch, state }) => (
                <tr
                  key={batch.id}
                  className={`border-t border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]/40 transition-colors ${rowAccent[state.key]}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-bold text-[var(--app-text)] leading-tight">{batch.product?.name}</p>
                    <p className="text-[11px] text-[var(--app-text-muted)] font-medium">{batch.product?.barcode}</p>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-[var(--app-text-soft)]">{batch.batchCode}</td>
                  <td className="px-4 py-3 text-center text-[var(--app-text-soft)]">{formatDate(batch.entryDate)}</td>
                  <td className="px-4 py-3 text-center font-bold text-[var(--app-text)]">{formatDate(batch.expirationDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-black ${state.days < 0 ? 'text-red-600' : state.days <= 7 ? 'text-orange-600' : state.days <= 15 ? 'text-amber-600' : 'text-[var(--app-text-soft)]'}`}>
                      {state.days < 0 ? `vencido ${Math.abs(state.days)}d` : `${state.days}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--app-text)]">
                    {formatQty(batch.currentQuantity)}
                    <span className="text-[11px] text-[var(--app-text-muted)] font-medium"> / {formatQty(batch.initialQuantity)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${toneClasses[state.tone]}`}>
                      {state.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(batch)}
                        className="p-2 rounded-lg text-[var(--app-text-muted)] hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      {canDeleteBatches && (
                        <button
                          onClick={() => onDelete(batch)}
                          className="p-2 rounded-lg text-[var(--app-text-muted)] hover:bg-red-500/10 hover:text-red-600 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BatchTable;
