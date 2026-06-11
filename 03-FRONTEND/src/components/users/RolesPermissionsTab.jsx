import React from 'react';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

const RolesPermissionsTab = ({
  roles,
  permissions,
  selectedRoleId,
  setSelectedRoleId,
  selectedRole,
  savingRole,
  toggleRolePermission,
  saveRolePermissions
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm animate-fade-in">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h3 className="text-sm font-black text-[var(--app-text)] uppercase tracking-wide">Puestos / Roles</h3>
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">Elige el rol para editar sus permisos globales.</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition cursor-pointer ${
                selectedRoleId === role.id
                  ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                  : 'border-[var(--app-border)] bg-[var(--app-bg-subtle)] text-[var(--app-text-soft)] hover:border-[var(--app-primary)]/40'
              }`}
            >
              <span className="block text-xs font-black uppercase tracking-widest">{role.name?.replaceAll('_', ' ')}</span>
              <span className="mt-1 block text-[10px] font-bold opacity-75">{role.permissions?.length || 0} permisos asignados</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--app-border)] pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">Configurando privilegios de</p>
            <h4 className="text-lg font-black text-[var(--app-text)]">{selectedRole?.name?.replaceAll('_', ' ') || 'Seleccione un rol'}</h4>
          </div>
          <button
            type="button"
            onClick={saveRolePermissions}
            disabled={!selectedRole || savingRole}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--app-primary)] px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {savingRole ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Guardar permisos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
          {permissions.map((permission) => {
            const checked = selectedRole?.permissions?.includes(permission.code) || false;
            const isDiscount = permission.code === 'SALE_DISCOUNT';
            return (
              <label
                key={permission.code}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  checked
                    ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)]'
                    : 'border-[var(--app-border)] bg-[var(--app-bg-subtle)] hover:border-[var(--app-primary)]/40'
                } ${isDiscount ? 'ring-1 ring-emerald-500/20' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleRolePermission(permission.code)}
                  className="mt-1 h-4 w-4 rounded text-[var(--app-primary)] cursor-pointer"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-black uppercase tracking-wide text-[var(--app-text)]">{permission.code}</span>
                  <span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">{permission.description || 'Sin descripción'}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsTab;
