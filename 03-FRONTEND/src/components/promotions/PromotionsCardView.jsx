import React from 'react';
import { Pencil, Power, Trash2, CalendarClock } from 'lucide-react';

const PromotionsCardView = ({ promos, onEdit, onToggle, onDelete, formatMoney, formatDate, typeMeta }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
      {promos.map(p => {
        const meta = typeMeta[p.type] || typeMeta.PERCENTAGE;
        const Icon = meta.icon;
        const isBogo = p.type === 'BOGO';
        return (
          <div 
            key={p.id} 
            className={`bg-[var(--app-surface)] rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-md hover:border-[var(--app-primary)]/30 transition-all duration-300 overflow-hidden flex flex-col ${
              !p.isActive ? 'opacity-75 bg-slate-50/50 dark:bg-slate-900/10' : ''
            }`}
          >
            <div className="p-5 border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30 flex justify-between items-start gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${meta.color}`}>
                <Icon size={12} /> {meta.label}
                {!isBogo && p.type === 'PERCENTAGE' && ` ${Number(p.value)}%`}
                {!isBogo && p.type === 'FIXED' && ` ${formatMoney(p.value)}`}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${p.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' : 'bg-slate-500/10 text-slate-500 border-slate-500/25'}`}>
                {p.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col space-y-4">
              <div>
                <h3 className="text-base font-bold text-[var(--app-text)] leading-snug hover:text-[var(--app-primary)] transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-[var(--app-text-soft)] italic mt-1.5 line-clamp-2" title={p.description}>
                  {p.description || 'Sin descripción comercial.'}
                </p>
              </div>

              <div className="bg-[var(--app-bg-subtle)]/40 p-3.5 rounded-2xl border border-[var(--app-border)]/50 space-y-1.5 flex-1">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                  Aplica a:
                </span>
                {p.product ? (
                  <div>
                    <div className="font-bold text-xs text-[var(--app-text)]">{p.product.name}</div>
                    <div className="text-[10px] font-mono text-[var(--app-text-muted)] mt-0.5">Barras: {p.product.barcode}</div>
                  </div>
                ) : p.category ? (
                  <div className="font-bold text-xs text-[var(--app-primary)]">
                    Categoría: {p.category.name}
                  </div>
                ) : (
                  <div className="text-xs italic text-[var(--app-text-muted)]">No especificado</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="space-y-1">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                    Disparador
                  </span>
                  {p.expiryDaysTrigger != null ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold leading-none mt-0.5">
                      Vence ≤ {p.expiryDaysTrigger}d
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Venta General</span>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                    Compra Mínima
                  </span>
                  <span className="font-bold text-[var(--app-text)]">
                    {p.minQuantity} {p.product?.uomBase || 'unidad(es)'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--app-border)]/60 flex items-center gap-2 text-[10px] font-semibold text-[var(--app-text-soft)]">
                <CalendarClock size={13} className="text-[var(--app-text-muted)]" />
                <span>Vigente: <span className="font-bold tabular-nums">{formatDate(p.startDate)}</span> al <span className="font-bold tabular-nums">{formatDate(p.endDate)}</span></span>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-[var(--app-border)]/60 bg-[var(--app-bg-subtle)]/20 flex justify-end gap-1.5">
              <button 
                onClick={() => onEdit(p)} 
                className="p-2 rounded-xl text-[var(--app-text-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)] border border-transparent hover:border-[var(--app-primary)]/10 transition-all cursor-pointer" 
                title="Editar"
              >
                <Pencil size={13} />
              </button>
              <button 
                onClick={() => onToggle(p)} 
                className={`p-2 rounded-xl border border-transparent transition-all cursor-pointer ${
                  p.isActive 
                    ? 'text-[var(--app-text-muted)] hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/10' 
                    : 'text-[var(--app-text-muted)] hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/10'
                }`} 
                title={p.isActive ? 'Desactivar' : 'Activar'}
              >
                <Power size={13} />
              </button>
              <button 
                onClick={() => onDelete(p)} 
                className="p-2 rounded-xl text-[var(--app-text-muted)] hover:bg-red-500/10 hover:text-[var(--app-danger)] border border-transparent hover:border-[var(--app-danger)]/10 transition-all cursor-pointer" 
                title="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PromotionsCardView;
