import React from 'react';
import { ChevronDown } from 'lucide-react';

const SupplierPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  indexOfFirstItem,
  indexOfLastItem,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}) => {
  if (totalItems <= itemsPerPage) return null;

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-light-dark shadow-enterprise dark:shadow-enterprise-dark p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark">
        <span>Mostrando</span>
        <span className="font-semibold text-text-primary dark:text-text-primary-dark">
          {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}
        </span>
        <span>de</span>
        <span className="font-semibold text-text-primary dark:text-text-primary-dark">{totalItems}</span>
        <span>proveedores</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted">Filas:</label>
          <select
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            className="px-3 py-1.5 bg-surface dark:bg-surface-dark border border-border-light dark:border-border-light-dark rounded-lg text-xs font-medium text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-border-light dark:border-border-light-dark text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface dark:hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronDown size={16} className="rotate-90" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface dark:hover:bg-surface-dark'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-border-light dark:border-border-light-dark text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface dark:hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronDown size={16} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierPagination;
