import React, { useState, useCallback } from 'react';
import { Plus, Tag, X, Save, Loader2 } from 'lucide-react';
import CategoryService from '../services/CategoryService';
import CategoryFilters from '../components/categories/CategoryFilters';
import CategoryTable from '../components/categories/CategoryTable';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';
import Swal from 'sweetalert2';

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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary dark:text-text-primary-dark tracking-tight flex items-center gap-2">
            <Tag className="text-primary shrink-0" size={26} />
            Gestión de Categorías
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium">Clasificación y organización de productos.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-5 py-3 rounded-xl transition-all shadow-enterprise font-bold hover:shadow-enterprise-lg hover:scale-[1.02] duration-250 w-full md:w-auto justify-center cursor-pointer text-sm"
        >
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      
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
        <div className="fixed inset-0 bg-[var(--app-bg)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-md w-full overflow-hidden">
            
            <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-white">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                  <p className="text-white/80 text-[10px] font-medium">
                    {editingCategory ? 'Actualizar información de la categoría' : 'Registrar nueva categoría'}
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

            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[var(--app-surface)]">
              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-[var(--app-text)]"
                  placeholder="Ej: Lácteos"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-[var(--app-text)] resize-none"
                  placeholder="Ej: Productos lácteos como leche, queso, yogur, etc."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-[var(--app-surface)] text-[var(--app-text-soft)] border border-[var(--app-border)] rounded-lg font-bold text-xs hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer"
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
                      {editingCategory ? 'Actualizar' : 'Guardar'}
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

export default Categories;
