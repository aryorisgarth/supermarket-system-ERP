import React, { useState, useCallback } from 'react';
import { Plus, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';

import SupplierService from '../services/SupplierService';
import SupplierFilters from '../components/suppliers/SupplierFilters';
import SupplierTable from '../components/suppliers/SupplierTable';
import SupplierFormModal from '../components/suppliers/SupplierFormModal';

import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';

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
        confirmButtonColor: '#ef4444',
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
        address: address.trim(),
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
        timerProgressBar: true,
      });

      Toast.fire({
        icon: 'success',
        title: editingSupplier ? 'Proveedor actualizado' : 'Proveedor creado',
      });
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el proveedor.',
        confirmButtonColor: '#ef4444',
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
      cancelButtonText: 'Cancelar',
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
          timerProgressBar: true,
        });

        Toast.fire({
          icon: 'success',
          title: 'Proveedor eliminado',
        });
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el proveedor.',
          confirmButtonColor: '#ef4444',
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
          <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
            Directorio de proveedores y contactos comerciales.
          </p>
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
        <SupplierFormModal
          onClose={() => setShowModal(false)}
          editingSupplier={editingSupplier}
          saving={saving}
          companyName={companyName}
          setCompanyName={setCompanyName}
          contactName={contactName}
          setContactName={setContactName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          address={address}
          setAddress={setAddress}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Suppliers;
