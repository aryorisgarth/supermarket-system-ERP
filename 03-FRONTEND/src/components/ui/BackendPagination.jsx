import { ChevronDown } from 'lucide-react';

const BackendPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  indexOfFirstItem,
  indexOfLastItem,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  label = 'registros',
}) => {
  if (totalItems === 0) return null;

  const showPageNav = totalPages > 1;
  const pageNumbers = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  })();

  return (
    <div className="ui-card ui-card-pad flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
        <span>Mostrando</span>
        <span className="font-semibold text-[var(--app-text)]">
          {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}
        </span>
        <span>de</span>
        <span className="font-semibold text-[var(--app-text)]">{totalItems}</span>
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--app-text-muted)]">Filas:</label>
          <select
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            className="px-3 py-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg text-xs font-medium text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {showPageNav && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronDown size={16} className="rotate-90" />
            </button>

            {pageNumbers.map((page, idx) => (
              <span key={page} className="flex items-center">
                {idx > 0 && pageNumbers[idx - 1] !== page - 1 && (
                  <span className="px-1 text-[var(--app-text-muted)]">…</span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`min-w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer px-2 ${
                    currentPage === page
                      ? 'bg-[var(--app-primary)] text-white'
                      : 'text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)]'
                  }`}
                >
                  {page}
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronDown size={16} className="-rotate-90" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendPagination;
