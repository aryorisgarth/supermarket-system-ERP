import React from 'react';
import { Search } from 'lucide-react';

const SupplierFilters = ({
  searchTerm,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
          size={16}
        />
        <input
          type="text"
          placeholder="Buscar por nombre, contacto o email..."
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] py-3 pl-11 pr-4 text-sm font-medium text-[var(--app-text)] outline-none transition-all placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/20"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="w-full cursor-pointer rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-3 text-sm font-bold text-[var(--app-text-muted)] transition-all hover:border-[var(--app-primary)]/30 hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)] sm:w-auto"
        >
          Resetear
        </button>
      )}
    </div>
  );
};

export default SupplierFilters;
