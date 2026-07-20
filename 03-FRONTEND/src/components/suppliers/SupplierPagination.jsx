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
  onItemsPerPageChange,
}) => {
  if (totalItems <= itemsPerPage) return null;

  return (
    <div className="ui-card ui-card-pad flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
        <span>Mostrando</span>
        <span className="font-semibold text-[var(--app-text)]">
          {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}
        </span>
        <span>de</span>
        <span className="font-semibold text-[var(--app-text)]">{totalItems}</span>
        <span>proveedores</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--app-text-muted)]">Filas:</label>
          <select
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            className="cursor-pointer rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="cursor-pointer rounded-lg border border-[var(--app-border)] p-2 text-[var(--app-text-muted)] transition-all hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown size={16} className="rotate-90" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-8 w-8 cursor-pointer rounded-lg text-xs font-medium transition-all ${
                currentPage === page
                  ? 'bg-[var(--app-primary)] text-white'
                  : 'text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="cursor-pointer rounded-lg border border-[var(--app-border)] p-2 text-[var(--app-text-muted)] transition-all hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown size={16} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierPagination;
