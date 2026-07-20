import React, { useState, useCallback } from 'react';
import { Plus, Tag, Save, Loader2 } from 'lucide-react';
import CategoryService from '../services/CategoryService';
import CategoryFilters from '../components/categories/CategoryFilters';
import CategoryTable from '../components/categories/CategoryTable';
import BackendPagination from '../components/ui/BackendPagination';
import PageHeader from '../components/ui/PageHeader';
import ResponsiveModal from '../components/ui/ResponsiveModal';
import useBackendList from '../hooks/useBackendList';
import Swal from 'sweetalert2';

const FIELD =
  'h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text)] outline-none transition-all placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/20 resize-none';
const LABEL = 'mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]';

const Categories = () => {
  const loadPage = useCallback((params) => CategoryService.getPage(params), []);
  const {
    items: categories,
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
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setName(category.name || '');
    setDescription(category.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo Requerido',
        text: 'El nombre de la categoría es obligatorio.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: name.trim(),
        description: description.trim()
      };

      if (editingCategory) {
        await CategoryService.update(editingCategory.id, categoryData);
      } else {
        await CategoryService.create(categoryData);
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
        title: editingCategory ? 'Categoría actualizada' : 'Categoría creada'
      });
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la categoría.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
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
        await CategoryService.delete(id);
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
          title: 'Categoría eliminada'
        });
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la categoría.',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const clearFilters = () => setSearchTerm('');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gestión de Categorías"
        description="Clasificación y organización de productos."
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--app-primary)] to-blue-700 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] sm:w-auto"
          >
            <Plus size={18} /> Nueva Categoría
          </button>
        }
      />

      
      <CategoryFilters
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onClearFilters={clearFilters}
        hasActiveFilters={searchTerm}
      />

      
      <CategoryTable
        categories={categories}
        loading={loading}
        onOpenEdit={handleOpenEdit}
        onDeleteCategory={handleDeleteCategory}
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
        label="categorías"
      />

      
      {showModal && (
        <ResponsiveModal
          onClose={() => setShowModal(false)}
          icon={Tag}
          title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          subtitle={editingCategory ? 'Actualizar información de la categoría' : 'Registrar nueva categoría'}
          initialSize="md"
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
                form="category-form"
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
                    {editingCategory ? 'Actualizar' : 'Guardar'}
                  </>
                )}
              </button>
            </div>
          }
        >
          <form id="category-form" onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className={LABEL}>
                Nombre de la Categoría <span className="text-[var(--app-danger)]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={FIELD}
                placeholder="Ej: Lácteos"
                required
              />
            </div>
            <div>
              <label className={LABEL}>Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className={`${FIELD} min-h-[72px] py-2.5`}
                placeholder="Ej: Productos lácteos como leche, queso, yogur, etc."
              />
            </div>
          </form>
        </ResponsiveModal>
      )}
    </div>
  );
};

export default Categories;
