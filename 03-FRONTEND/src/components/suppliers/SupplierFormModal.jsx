import React from 'react';
import { Building2, Loader2, Save } from 'lucide-react';
import ResponsiveModal from '../ui/ResponsiveModal';

const FIELD =
  'h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text)] outline-none transition-all placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/20';
const LABEL = 'mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]';

const SupplierFormModal = ({
  onClose,
  editingSupplier = null,
  saving = false,
  companyName = '',
  setCompanyName,
  contactName = '',
  setContactName,
  phone = '',
  setPhone,
  email = '',
  setEmail,
  address = '',
  setAddress,
  onSubmit,
}) => {
  return (
    <ResponsiveModal
      onClose={onClose}
      icon={Building2}
      title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      subtitle={editingSupplier ? 'Actualizar información del proveedor' : 'Registrar nuevo proveedor'}
      initialSize="md"
      sizeOptions={['sm', 'md', 'lg']}
      headerClassName="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] text-white"
      footer={
        <div className="flex gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-bg-subtle)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="supplier-form"
            disabled={saving}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={14} />
                {editingSupplier ? 'Actualizar' : 'Guardar'}
              </>
            )}
          </button>
        </div>
      }
    >
      <form id="supplier-form" onSubmit={onSubmit} className="space-y-4 p-6">
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
            Datos del proveedor
          </p>
          <p className="mt-0.5 text-xs text-[var(--app-text-soft)]">
            Información usada en compras, recepción en bodega y catálogo por proveedor.
          </p>
        </div>

        <div>
          <label className={LABEL}>
            Nombre de la Empresa <span className="text-[var(--app-danger)]">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={FIELD}
            placeholder="Ej: Supermercado Central S.A."
            required
          />
        </div>

        <div>
          <label className={LABEL}>Nombre de Contacto</label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={FIELD}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Teléfono</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={FIELD}
              placeholder="Ej: +502 1234-5678"
            />
          </div>
          <div>
            <label className={LABEL}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD}
              placeholder="Ej: contacto@empresa.com"
            />
          </div>
        </div>

        <div>
          <label className={LABEL}>Dirección</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows="2"
            className={`${FIELD} min-h-[72px] resize-none py-2.5`}
            placeholder="Ej: Calle Principal #123, Ciudad"
          />
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default SupplierFormModal;
