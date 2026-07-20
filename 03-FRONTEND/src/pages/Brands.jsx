import React, { useState, useCallback } from 'react';
import { Plus, Bookmark, Save, Edit, Trash, Loader2, Search } from 'lucide-react';
import BrandService from '../services/BrandService';
import BackendPagination from '../components/ui/BackendPagination';
import PageHeader from '../components/ui/PageHeader';
import ResponsiveModal from '../components/ui/ResponsiveModal';
import useBackendList from '../hooks/useBackendList';
import Swal from 'sweetalert2';

const FIELD =
  'h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text)] outline-none transition-all placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/20';
const LABEL = 'mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]';

const Brands = () => {
  const loadPage = useCallback((params) => BrandService.getPage(params), []);
  const {
    items: brands,
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
  } = useBackendList({ loadPage, sort: 'name,asc' });

  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setName('');
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setName(brand.name || '');
    setIsActive(brand.isActive !== undefined ? brand.isActive : true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Requerido', text: 'El nombre es obligatorio.', confirmButtonColor: '#ef4444' });
      return;
    }
    setSaving(true);
    try {
      const brandData = { name: name.trim(), isActive };
      if (editingBrand) {
        await BrandService.update(editingBrand.id, brandData);
      } else {
        await BrandService.create(brandData);
      }
      setShowModal(false);
      await reload();
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true }).fire({
        icon: 'success',
        title: editingBrand ? 'Marca actualizada' : 'Marca creada'
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la marca.', confirmButtonColor: '#ef4444' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, brandName) => {
    const result = await Swal.fire({
      title: '¿Eliminar marca?',
      text: `¿Estás seguro de eliminar "${brandName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#10b981',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await BrandService.delete(id);
        await reload();
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true }).fire({
          icon: 'success',
          title: 'Marca eliminada'
        });
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la marca.', confirmButtonColor: '#ef4444' });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gestión de Marcas"
        description="Administra las marcas de productos disponibles en el sistema."
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--app-primary)] to-blue-700 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] sm:w-auto"
          >
            <Plus size={18} /> Nueva Marca
          </button>
        }
      />

      <div className="flex bg-[var(--app-surface)] p-4 rounded-2xl border border-[var(--app-border)] items-center gap-3">
        <Search className="text-[var(--app-text-muted)]" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar marcas..."
          className="flex-1 bg-transparent text-sm text-[var(--app-text)] outline-none border-none"
        />
      </div>

      <div className="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--app-bg-subtle)] border-b border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)] text-xs font-medium text-[var(--app-text)]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-[var(--app-text-muted)]">
                    <Loader2 className="animate-spin inline-block mr-2" size={16} /> Cargando...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-[var(--app-text-muted)]">
                    No se encontraron marcas registradas.
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <tr key={b.id} className="hover:bg-[var(--app-bg-subtle)]/50 transition-colors">
                    <td className="px-6 py-4">{b.id}</td>
                    <td className="px-6 py-4 font-bold">{b.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'}`}>
                        {b.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button type="button" onClick={() => handleOpenEdit(b)} className="p-2 border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] rounded-lg transition-all cursor-pointer">
                        <Edit size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(b.id, b.name)} className="p-2 border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer">
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

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        label="marcas"
      />

      {showModal && (
        <ResponsiveModal
          onClose={() => setShowModal(false)}
          icon={Bookmark}
          title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
          subtitle={editingBrand ? 'Actualizar información de la marca' : 'Registrar nueva marca'}
          initialSize="sm"
          sizeOptions={['sm', 'md']}
          headerClassName="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] text-white"
          footer={
            <div className="flex gap-3 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 cursor-pointer rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-bg-subtle)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="brand-form"
                disabled={saving}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editingBrand ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          }
        >
          <form id="brand-form" onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className={LABEL}>Nombre *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={FIELD}
                placeholder="Ej: Nestlé"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-[var(--app-border)] text-[var(--app-primary)] focus:ring-[var(--app-primary)]/20"
              />
              <label htmlFor="isActive" className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[var(--app-text)]">
                Activo
              </label>
            </div>
          </form>
        </ResponsiveModal>
      )}
    </div>
  );
};

export default Brands;
