import React from 'react';
import { Search, Loader2, Edit, Trash } from 'lucide-react';

const LocationsTable = ({
  locations = [],
  loading = false,
  searchTerm = '',
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex bg-[var(--app-surface)] p-4 rounded-2xl border border-[var(--app-border)] items-center gap-3">
        <Search className="text-[var(--app-text-muted)]" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por código o almacén..."
          className="flex-1 bg-transparent text-sm text-[var(--app-text)] outline-none border-none"
        />
      </div>

      <div className="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--app-bg-subtle)] border-b border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] uppercase tracking-wider">
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Almacén/Bodega</th>
                <th className="px-6 py-4">Pasillo</th>
                <th className="px-6 py-4">Estante / Nivel</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)] text-xs font-medium text-[var(--app-text)]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[var(--app-text-muted)]">
                    <Loader2 className="animate-spin inline-block mr-2" size={16} /> Cargando...
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[var(--app-text-muted)]">
                    No se encontraron ubicaciones físicas registradas.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-[var(--app-bg-subtle)]/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[var(--app-primary)]">{loc.locationCode}</td>
                    <td className="px-6 py-4">{loc.warehouse}</td>
                    <td className="px-6 py-4">{loc.aisle || '-'}</td>
                    <td className="px-6 py-4">
                      {loc.shelf || '-'}{loc.level ? ` / ${loc.level}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          loc.isPisoVenta
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {loc.isPisoVenta ? 'Exhibición/Tienda' : 'Bodega/Almacén'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(loc)}
                        className="p-2 border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] rounded-lg transition-all cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(loc.id, loc.locationCode)}
                        className="p-2 border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LocationsTable;
