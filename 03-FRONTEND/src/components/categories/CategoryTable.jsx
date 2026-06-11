import React from 'react';
import { Tag, Edit2, Trash2, Loader2, Inbox } from 'lucide-react';

const CategoryTable = ({
  categories,
  loading,
  onOpenEdit,
  onDeleteCategory
}) => {
  return (
    <div className="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] shadow-enterprise overflow-hidden transition-colors">
      <div className="overflow-x-auto pos-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[var(--app-text-muted)] text-[10px] font-black uppercase tracking-[0.15em] border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50">
              <th className="p-4 pl-6">Categoría</th>
              <th className="p-4">Descripción</th>
              <th className="p-4 pr-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {loading ? (
              <tr>
                <td colSpan="3" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-[var(--app-text-muted)]">
                    <Loader2 size={36} className="animate-spin text-[var(--app-primary)]" />
                    <p className="font-bold text-xs">Cargando categorías...</p>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-20 text-center text-[var(--app-text-muted)] font-medium">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Inbox size={36} className="opacity-60" />
                    <p className="text-xs font-bold">No se encontraron categorías.</p>
                  </div>
                </td>
              </tr>
            ) : categories.map((category) => (
              <tr key={category.id} className="text-xs hover:bg-[var(--app-bg-subtle)]/30 transition-colors group">
                {/* Categoría */}
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[var(--app-bg-subtle)] rounded-xl flex items-center justify-center text-[var(--app-primary)] border border-[var(--app-border)] shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Tag size={18} strokeWidth={2.5} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-[var(--app-text)] truncate max-w-[200px] group-hover:text-[var(--app-primary)] transition-colors text-sm" title={category.name}>{category.name}</p>
                      <p className="text-[10px] font-bold text-[var(--app-text-muted)]">ID: {category.id}</p>
                    </div>
                  </div>
                </td>

                {/* Descripción */}
                <td className="p-4">
                  <span className="font-bold text-[var(--app-text-soft)] line-clamp-2 max-w-[400px] leading-relaxed" title={category.description}>
                    {category.description || '— Sin descripción disponible —'}
                  </span>
                </td>

                {/* Acciones */}
                <td className="p-4 pr-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onOpenEdit(category)}
                      className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] rounded-xl transition-all cursor-pointer border border-transparent hover:border-[var(--app-primary)]/20"
                      title="Editar categoría"
                    >
                      <Edit2 size={15} strokeWidth={2.5} />
                    </button>

                    <button 
                      onClick={() => onDeleteCategory(category.id, category.name)}
                      className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-danger)] hover:bg-[var(--app-danger-soft)] rounded-xl transition-all cursor-pointer border border-transparent hover:border-[var(--app-danger)]/20"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={15} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;
