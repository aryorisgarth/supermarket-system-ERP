import React from 'react';
import { Building2, Phone, Mail, MapPin, Edit2, Trash2, Loader2, Inbox } from 'lucide-react';

const SupplierTable = ({
  suppliers,
  loading,
  onOpenEdit,
  onDeleteSupplier,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)] text-[10px] font-extrabold uppercase tracking-widest text-[var(--app-text-muted)]">
              <th className="p-3.5 pl-6">Empresa</th>
              <th className="p-3.5">Contacto</th>
              <th className="p-3.5">Teléfono</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Dirección</th>
              <th className="p-3.5 pr-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-[var(--app-text-muted)]">
                    <Loader2 size={36} className="animate-spin text-[var(--app-primary)]" />
                    <p className="text-xs font-bold">Cargando proveedores...</p>
                  </div>
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-20 text-center font-medium text-[var(--app-text-muted)]">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Inbox size={36} className="opacity-60" />
                    <p className="text-xs font-bold">No se encontraron proveedores.</p>
                  </div>
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="group text-xs transition-colors hover:bg-[var(--app-bg-subtle)]/60"
                >
                  <td className="p-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] transition-transform duration-200 group-hover:scale-105">
                        <Building2 size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p
                          className="max-w-[180px] truncate text-sm font-extrabold text-[var(--app-text)] transition-colors group-hover:text-[var(--app-primary)]"
                          title={supplier.companyName}
                        >
                          {supplier.companyName}
                        </p>
                        <p className="text-[10px] text-[var(--app-text-muted)]">ID: {supplier.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-medium text-[var(--app-text-soft)]">
                      {supplier.contactName || '—'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-[var(--app-text-soft)]">
                      <Phone size={12} className="opacity-60" />
                      <span className="font-medium">{supplier.phone || '—'}</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-[var(--app-text-soft)]">
                      <Mail size={12} className="opacity-60" />
                      <span className="max-w-[150px] truncate font-medium" title={supplier.email}>
                        {supplier.email || '—'}
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-[var(--app-text-soft)]">
                      <MapPin size={12} className="opacity-60" />
                      <span className="max-w-[150px] truncate font-medium" title={supplier.address}>
                        {supplier.address || '—'}
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5 pr-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenEdit(supplier)}
                        className="cursor-pointer rounded-lg border border-transparent p-1.5 text-[var(--app-text-muted)] transition-all hover:border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-primary)]"
                        title="Editar proveedor"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSupplier(supplier.id, supplier.companyName)}
                        className="cursor-pointer rounded-lg border border-transparent p-1.5 text-[var(--app-text-muted)] transition-all hover:border-[var(--app-danger)]/20 hover:bg-[var(--app-danger-soft)] hover:text-[var(--app-danger)]"
                        title="Eliminar proveedor"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierTable;
