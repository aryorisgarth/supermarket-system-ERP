import React from 'react';

export const getStockBadge = (stock, minStock = 5) => {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-650 text-[11px] font-bold border border-red-150 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40 shadow-sm">
        Agotado (0)
      </span>
    );
  }
  if (stock < minStock) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-650 text-[11px] font-bold border border-amber-150 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40 shadow-sm">
        Crítico ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-gray-900 text-[11px] font-bold border border-emerald-200 dark:bg-emerald-950/40 dark:text-gray-100 dark:border-emerald-900/40 shadow-sm">
      Disponible ({stock})
    </span>
  );
};
