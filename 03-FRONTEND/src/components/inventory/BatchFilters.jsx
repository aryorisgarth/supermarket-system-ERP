import React from 'react';
import { Search } from 'lucide-react';

const BatchFilters = ({
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  filters
}) => {
  return (
    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por producto, código de barras o lote..."
          className="w-full pl-9 pr-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-[var(--app-text)]"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === f.key
                ? 'bg-[var(--app-primary)] text-white shadow-sm'
                : 'bg-[var(--app-bg-subtle)] text-[var(--app-text-soft)] hover:bg-[var(--app-border)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BatchFilters;
