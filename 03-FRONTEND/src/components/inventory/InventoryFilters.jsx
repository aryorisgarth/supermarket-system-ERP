import React from 'react';
import { Search, Tag, Building2, X, SlidersHorizontal } from 'lucide-react';
import Button from '../ui/Button';

const InventoryFilters = ({
  searchTerm,
  onSearchChange,
  catFilter,
  onCatFilterChange,
  supFilter,
  onSupFilterChange,
  categories,
  suppliers,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="ui-card p-4 sm:p-5 shadow-enterprise border-[var(--app-border)]">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        
        <div className="relative w-full lg:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            className="ui-input pl-10 pr-10 min-h-[44px] text-sm font-bold"
            value={searchTerm}
            onChange={onSearchChange}
          />
          {searchTerm && (
            <button 
              onClick={() => onSearchChange({ target: { value: '' } })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text)] p-1 rounded-md hover:bg-[var(--app-bg-subtle)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          <div className="relative flex-1 min-w-[160px] lg:w-48">
            <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-primary)] opacity-60 pointer-events-none" />
            <select
              className="ui-input ui-select !pl-10 text-xs font-black uppercase tracking-tight"
              value={catFilter}
              onChange={onCatFilterChange}
            >
              <option value="">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          
          <div className="relative flex-1 min-w-[160px] lg:w-56">
            <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-primary)] opacity-60 pointer-events-none" />
            <select
              className="ui-input ui-select !pl-10 text-xs font-black uppercase tracking-tight"
              value={supFilter}
              onChange={onSupFilterChange}
            >
              <option value="">Todos los Proveedores</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>{sup.companyName || sup.fullName || sup.name}</option>
              ))}
            </select>
          </div>

          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              icon={X} 
              onClick={onClearFilters}
              className="text-[var(--app-danger)] hover:bg-[var(--app-danger-soft)] border-dashed border-[var(--app-danger)]/20"
            >
              Limpiar
            </Button>
          )}
          
          <div className="hidden xl:flex items-center gap-2 ml-2 px-3 py-2 rounded-xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] text-[var(--app-text-muted)]">
            <SlidersHorizontal size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filtros Activos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
