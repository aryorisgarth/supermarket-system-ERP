import React from 'react';
import { Pencil, Power, Trash2, CalendarClock } from 'lucide-react';

const PromotionsTable = ({ promos, onEdit, onToggle, onDelete, formatMoney, formatDate, typeMeta }) => {
  return (
    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--app-bg-subtle)]/50 border-b border-[var(--app-border)] text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
              <th className="py-4 px-6">Nombre</th>
              <th className="py-4 px-6">Tipo de Descuento</th>
              <th className="py-4 px-6">Aplica a</th>
              <th className="py-4 px-6 text-center">Disparador</th>
              <th className="py-4 px-6 text-center">Período de Vigencia</th>
              <th className="py-4 px-6 text-center">Estado</th>
              <th className="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]/60 text-xs">
            {promos.map(p => {
              const meta = typeMeta[p.type] || typeMeta.PERCENTAGE;
              const Icon = meta.icon;
              return (
                <tr key={p.id} className="hover:bg-[var(--app-primary-soft)]/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-[var(--app-text)]">{p.name}</div>
                    {p.description && <div className="text-[10px] text-[var(--app-text-muted)] mt-0.5 line-clamp-1 max-w-[200px]" title={p.description}>{p.description}</div>}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${meta.color}`}>
                      <Icon size={12} /> {meta.label}
                      {p.type === 'PERCENTAGE' && ` ${Number(p.value)}%`}
                      {p.type === 'FIXED' && ` ${formatMoney(p.value)}`}
                    </span>
                    {p.type === 'BOGO' && (
                      <div className="text-[9px] font-bold text-purple-600 dark:text-purple-400 mt-1">Lleva 2, paga 1 · mín. {p.minQuantity || 2} u.</div>
                    )}
                    {p.type !== 'BOGO' && p.minQuantity > 1 && (
                      <div className="text-[9px] text-[var(--app-text-muted)] mt-1 font-semibold">Min. compra: {p.minQuantity} u.</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {p.product ? (
                      <div>
                        <div className="font-bold text-[var(--app-text)]">{p.product.name}</div>
                        <div className="text-[9px] font-mono text-[var(--app-text-muted)] mt-0.5">{p.product.barcode}</div>
                      </div>
                    ) : p.category ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--app-primary-soft)]/40 text-[var(--app-primary)] text-[10px] font-bold border border-[var(--app-primary)]/10">
                        Categoría: {p.category.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {p.expiryDaysTrigger != null ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <CalendarClock size={11} /> Vence en ≤ {p.expiryDaysTrigger} días
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Venta General (Siempre)</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center tabular-nums text-[11px] text-[var(--app-text-soft)]">
                    {formatDate(p.startDate)} al {formatDate(p.endDate)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${p.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' : 'bg-slate-500/10 text-slate-500 border-slate-500/25'}`}>
                      {p.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onEdit(p)} className="p-2 rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)] transition-all cursor-pointer" title="Editar"><Pencil size={14} /></button>
                      <button onClick={() => onToggle(p)} className={`p-2 rounded-lg transition-all cursor-pointer ${p.isActive ? 'text-[var(--app-text-muted)] hover:bg-amber-500/10 hover:text-amber-600' : 'text-[var(--app-text-muted)] hover:bg-emerald-500/10 hover:text-emerald-600'}`} title={p.isActive ? 'Desactivar' : 'Activar'}><Power size={14} /></button>
                      <button onClick={() => onDelete(p)} className="p-2 rounded-lg text-[var(--app-text-muted)] hover:bg-red-500/10 hover:text-[var(--app-danger)] transition-all cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromotionsTable;
