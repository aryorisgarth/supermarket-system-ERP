import React from 'react';
import { Building2, Phone, Mail, MapPin, Edit2, Trash2, Loader2, Inbox } from 'lucide-react';

const SupplierTable = ({
  suppliers,
  loading,
  onOpenEdit,
  onDeleteSupplier
}) => {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-light-dark shadow-enterprise dark:shadow-enterprise-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-text-muted text-[10px] font-extrabold uppercase tracking-widest border-b border-border-light dark:border-border-light-dark bg-surface dark:bg-surface-dark">
              <th className="p-3.5 pl-6">Empresa</th>
              <th className="p-3.5">Contacto</th>
              <th className="p-3.5">Teléfono</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Dirección</th>
              <th className="p-3.5 pr-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-light-dark">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 size={36} className="animate-spin text-primary" />
                    <p className="font-bold text-xs">Cargando proveedores...</p>
                  </div>
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-20 text-center text-text-muted font-medium">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Inbox size={36} className="text-text-muted opacity-60" />
                    <p className="text-xs font-bold">No se encontraron proveedores.</p>
                  </div>
                </td>
              </tr>
            ) : suppliers.map((supplier) => (
              <tr key={supplier.id} className="text-xs hover:bg-surface dark:hover:bg-surface-dark transition-colors group">
                
                <td className="p-3.5 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-surface dark:bg-surface-dark rounded-lg flex items-center justify-center text-text-muted border border-border-light dark:border-border-light-dark shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Building2 size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-extrabold text-text-primary dark:text-text-primary-dark truncate max-w-[180px] group-hover:text-primary transition-colors text-sm" title={supplier.companyName}>{supplier.companyName}</p>
                      <p className="text-[10px] text-text-muted">ID: {supplier.id}</p>
                    </div>
                  </div>
                </td>

                
                <td className="p-3.5">
                  <span className="font-medium text-text-secondary dark:text-text-secondary-dark">{supplier.contactName || '—'}</span>
                </td>

                
                <td className="p-3.5">
                  <div className="flex items-center gap-1 text-text-secondary dark:text-text-secondary-dark">
                    <Phone size={12} className="opacity-60" />
                    <span className="font-medium">{supplier.phone || '—'}</span>
                  </div>
                </td>

                
                <td className="p-3.5">
                  <div className="flex items-center gap-1 text-text-secondary dark:text-text-secondary-dark">
                    <Mail size={12} className="opacity-60" />
                    <span className="font-medium truncate max-w-[150px]" title={supplier.email}>{supplier.email || '—'}</span>
                  </div>
                </td>

                
                <td className="p-3.5">
                  <div className="flex items-center gap-1 text-text-secondary dark:text-text-secondary-dark">
                    <MapPin size={12} className="opacity-60" />
                    <span className="font-medium truncate max-w-[150px]" title={supplier.address}>{supplier.address || '—'}</span>
                  </div>
                </td>

                
                <td className="p-3.5 pr-6 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button 
                      onClick={() => onOpenEdit(supplier)}
                      className="p-1.5 text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-all cursor-pointer border border-transparent hover:border-border-light dark:hover:border-border-light-dark"
                      title="Editar proveedor"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button 
                      onClick={() => onDeleteSupplier(supplier.id, supplier.companyName)}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer border border-transparent hover:border-danger/20"
                      title="Eliminar proveedor"
                    >
                      <Trash2 size={13} />
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

export default SupplierTable;
