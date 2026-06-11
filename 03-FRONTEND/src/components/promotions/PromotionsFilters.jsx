import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

const PromotionsFilters = ({ searchTerm, setSearchTerm, filterActive, setFilterActive, viewMode, setViewMode }) => {
  return (
    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Buscar por nombre, producto o categoría..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--app-bg-subtle)]/40 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)]" 
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-[var(--app-bg-subtle)] rounded-xl border border-[var(--app-border)]/50 self-start sm:self-auto">
          {[['all', 'Todas'], ['active', 'Activas'], ['inactive', 'Inactivas']].map(([k, l]) => (
            <button 
              key={k} 
              onClick={() => setFilterActive(k)} 
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                filterActive === k 
                  ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]' 
                  : 'text-[var(--app-text-soft)] hover:text-[var(--app-text)]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 bg-[var(--app-bg-subtle)] p-1 rounded-xl border border-[var(--app-border)] self-end md:self-auto">
        <button
          type="button"
          onClick={() => setViewMode('CARD')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            viewMode === 'CARD'
              ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
          title="Vista de Tarjetas"
        >
          <LayoutGrid size={12} />
          Tarjetas
        </button>
        <button
          type="button"
          onClick={() => setViewMode('TABLE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            viewMode === 'TABLE'
              ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
          title="Vista de Tabla"
        >
          <List size={12} />
          Tabla
        </button>
      </div>
    </div>
  );
};

export default PromotionsFilters;
