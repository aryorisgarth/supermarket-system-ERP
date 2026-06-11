import React from 'react';
import { Search, Loader2, Edit, UserX, Trash2, Circle } from 'lucide-react';
import BackendPagination from '../ui/BackendPagination';

const getRoleBadge = (role) => {
  const styles = {
    'ADMIN_INGENIERO': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    'ADMINISTRADOR': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    'SUPERVISOR': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'CAJERO': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'CONSULTOR': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${styles[role] || 'bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] border-[var(--app-border)]'}`}>
      {role?.replace('_', ' ') || 'S/R'}
    </span>
  );
};

const getStatusBadge = (active) => {
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${active !== false ? 'text-emerald-500' : 'text-[var(--app-text-muted)]'}`}>
      <Circle size={8} fill="currentColor" />
      {active !== false ? 'Activo' : 'Inactivo'}
    </span>
  );
};

const UsersTable = ({
  users,
  loading,
  searchTerm,
  setSearchTerm,
  onEdit,
  onToggleStatus,
  onDelete,
  currentPage,
  totalPages,
  itemsPerPage,
  indexOfFirstItem,
  indexOfLastItem,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="w-full pl-9 pr-3 py-2.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-[var(--app-text)]"
        />
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-[var(--app-text-muted)] gap-3">
          <Loader2 className="animate-spin text-[var(--app-primary)]" size={40} />
          <p className="font-black uppercase tracking-widest text-xs">Cargando personal...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] p-12 rounded-3xl text-center text-[var(--app-text-muted)]">
          No hay usuarios registrados en el sistema.
        </div>
      ) : (
        <div className="table-scroll rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[var(--app-bg-subtle)] border-b border-[var(--app-border)]">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">Empleado</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">Correo</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">Rol</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">Estado</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]">
              {users.map((user) => {
                const initials = user.fullName
                  .split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr key={user.id} className="hover:bg-[var(--app-bg-subtle)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)] flex items-center justify-center font-black text-xs border border-[var(--app-border)]">
                          {initials || 'U'}
                        </div>
                        <span className="font-bold text-[var(--app-text)]">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--app-text-soft)]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role?.name)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onEdit(user)}
                          className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] rounded-xl transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit size={15} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => onToggleStatus(user)}
                          className="p-2 text-[var(--app-text-muted)] hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer"
                          title="Estado"
                        >
                          <UserX size={15} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => onDelete(user)}
                          className="p-2 text-[var(--app-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        label="usuarios"
      />
    </div>
  );
};

export default UsersTable;
