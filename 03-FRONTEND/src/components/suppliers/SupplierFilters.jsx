import React from 'react';
import { Search } from 'lucide-react';

const SupplierFilters = ({
  searchTerm,
  onSearchChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, contacto o email..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-slate-800 dark:text-slate-100 text-sm shadow-inner"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto items-center">
          
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="text-sm font-bold text-slate-500 hover:text-violet-600 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-900/30 px-5 py-3 rounded-xl transition-all w-full sm:w-auto cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800"
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
