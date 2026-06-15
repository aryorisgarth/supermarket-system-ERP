import React from 'react';
import { Tag, CheckCircle2, CalendarClock, ShoppingBag } from 'lucide-react';

const PromotionsKpis = ({ totalItems, activeCount, expiryCount, bogoCount }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[var(--app-surface)] p-4 rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-500/15">
          <Tag size={20} />
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Total Promos</span>
          <span className="text-xl font-bold tabular-nums">{totalItems}</span>
        </div>
      </div>

      <div className="bg-[var(--app-surface)] p-4 rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
        <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/15">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Activas Pág.</span>
          <span className="text-xl font-bold tabular-nums">{activeCount}</span>
        </div>
      </div>

      <div className="bg-[var(--app-surface)] p-4 rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/15">
          <CalendarClock size={20} />
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Por Caducidad</span>
          <span className="text-xl font-bold tabular-nums">{expiryCount}</span>
        </div>
      </div>

      <div className="bg-[var(--app-surface)] p-4 rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
        <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl border border-purple-500/15">
          <ShoppingBag size={20} />
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Combos 2x1</span>
          <span className="text-xl font-bold tabular-nums">{bogoCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionsKpis;
