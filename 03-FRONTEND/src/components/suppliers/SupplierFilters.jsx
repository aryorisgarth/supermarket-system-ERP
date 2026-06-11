import React from 'react';
import { Search } from 'lucide-react';

const SupplierFilters = ({
  searchTerm,
  onSearchChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-light-dark shadow-enterprise dark:shadow-enterprise-dark">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, contacto o email..." 
            className="w-full pl-11 pr-4 py-2.5 bg-surface dark:bg-surface-dark border border-border-light dark:border-border-light-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-surface-dark transition-all font-bold text-text-primary dark:text-text-primary-dark text-xs shadow-sm"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto items-center">
          
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="text-xs font-bold text-text-secondary hover:text-primary bg-surface dark:bg-surface-dark hover:bg-primary/10 px-4 py-2.5 rounded-lg transition-all w-full sm:w-auto cursor-pointer border border-border-light dark:border-border-light-dark hover:border-primary"
            >
              Resetear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierFilters;
