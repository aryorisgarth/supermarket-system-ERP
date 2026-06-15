import React from 'react';
import { Building2, X, Loader2, Save } from 'lucide-react';

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-border-light dark:border-border-light-dark max-w-md w-full overflow-hidden">
        
        <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h3>
              <p className="text-white/80 text-[10px] font-medium">
                {editingSupplier ? 'Actualizar información del proveedor' : 'Registrar nuevo proveedor'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-primary dark:text-text-primary-dark mb-1.5">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface dark:bg-surface-dark border border-border-light dark:border-border-light-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-text-primary dark:text-text-primary-dark"
              placeholder="Ej: Supermercado Central S.A."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary dark:text-text-primary-dark mb-1.5">
              Nombre de Contacto
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface dark:bg-surface-dark border border-border-light dark:border-border-light-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-text-primary dark:text-text-primary-dark"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary dark:text-text-primary-dark mb-1.5">
              Teléfono
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface dark:bg-surface-dark border border-border-light dark:border-border-light-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-text-primary dark:text-text-primary-dark"
              placeholder="Ej: +502 1234-5678"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary dark:text-text-primary-dark mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface dark:bg-surface-dark border border-border-light dark:border-border-light-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-text-primary dark:text-text-primary-dark"
              placeholder="Ej: contacto@empresa.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary dark:text-text-primary-dark mb-1.5">
              Dirección
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="2"
              className="w-full px-4 py-2.5 bg-surface dark:bg-surface-dark border border-border-light dark:border-border-light-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-text-primary dark:text-text-primary-dark resize-none"
              placeholder="Ej: Calle Principal #123, Ciudad"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border-light dark:border-border-light-dark rounded-lg font-bold text-xs hover:bg-surface/80 dark:hover:bg-surface-dark/80 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg font-bold text-xs transition-all shadow-enterprise hover:shadow-enterprise-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
        </form>
      </div>
    </div>
  );
};

export default SupplierFormModal;
