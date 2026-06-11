import React, { useState, useCallback } from 'react';
import { Plus, Building2, X, Save, Loader2 } from 'lucide-react';
import SupplierService from '../services/SupplierService';
import SupplierFilters from '../components/suppliers/SupplierFilters';
import SupplierTable from '../components/suppliers/SupplierTable';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';
import Swal from 'sweetalert2';

const Suppliers = () => {
  const loadPage = useCallback((params) => SupplierService.getPage(params), []);
  const {
    items: suppliers,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    reload,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
    handleItemsPerPageChange,
  } = useBackendList({ loadPage, sort: 'companyName,asc' });

  
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [saving, setSaving] = useState(false);

  
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setCompanyName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setShowModal(true);
  };

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setCompanyName(supplier.companyName || '');
    setContactName(supplier.contactName || '');
    setPhone(supplier.phone || '');
    setEmail(supplier.email || '');
    setAddress(supplier.address || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo Requerido',
        text: 'El nombre de la empresa es obligatorio.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    try {
      setSaving(true);

      const supplierData = {
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim()
      };

      if (editingSupplier) {
        await SupplierService.update(editingSupplier.id, supplierData);
      } else {
        await SupplierService.create(supplierData);
      }

      setShowModal(false);
      await reload();

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      Toast.fire({
        icon: 'success',
        title: editingSupplier ? 'Proveedor actualizado' : 'Proveedor creado'
      });
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el proveedor.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupplier = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      text: `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#10b981',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await SupplierService.delete(id);
        await reload();

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });

        Toast.fire({
          icon: 'success',
          title: 'Proveedor eliminado'
        });
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el proveedor.',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const clearFilters = () => setSearchTerm('');

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary dark:text-text-primary-dark tracking-tight flex items-center gap-2">
            <Building2 className="text-primary shrink-0" size={26} />
            Gestión de Proveedores
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium">Directorio de proveedores y contactos comerciales.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-5 py-3 rounded-xl transition-all shadow-enterprise font-bold hover:shadow-enterprise-lg hover:scale-[1.02] duration-250 w-full md:w-auto justify-center cursor-pointer text-sm"
        >
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      
      <SupplierFilters
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onClearFilters={clearFilters}
        hasActiveFilters={searchTerm}
      />

      
      <SupplierTable
        suppliers={suppliers}
        loading={loading}
        onOpenEdit={handleOpenEdit}
        onDeleteSupplier={handleDeleteSupplier}
      />

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        label="proveedores"
      />

      
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-border-light dark:border-border-light-dark max-w-md w-full overflow-hidden">
            
            <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-white">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                  </h3>
                  <p className="text-white/80 text-[10px] font-medium">
                    {editingSupplier ? 'Actualizar información del proveedor' : 'Registrar nuevo proveedor'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  onClick={() => setShowModal(false)}
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
      )}
    </div>
  );
};

export default Suppliers;
