import React from 'react';
import { Search } from 'lucide-react';

const CategoryFilters = ({
  searchTerm,
  onSearchChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-[var(--app-surface)] p-4 rounded-xl border border-[var(--app-border)] shadow-enterprise transition-colors">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o descripción..." 
            className="w-full pl-11 pr-4 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto items-center">
          
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-soft)] hover:text-primary bg-[var(--app-bg-subtle)] hover:bg-primary/10 px-5 py-2.5 rounded-lg transition-all w-full sm:w-auto cursor-pointer border border-[var(--app-border)] hover:border-primary"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;
