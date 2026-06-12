import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Bookmark, X, Save, Edit, Trash, Loader2, Search } from 'lucide-react';
import BrandService from '../services/BrandService';
import Swal from 'sweetalert2';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BrandService.getAll();
      setBrands(data || []);
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las marcas.', confirmButtonColor: '#ef4444' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

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
      await fetchBrands();
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
        await fetchBrands();
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

  const filtered = brands.filter((b) => b.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--app-text)] tracking-tight flex items-center gap-2">
            <Bookmark className="text-[var(--app-primary)] shrink-0" size={26} />
            Gestión de Marcas
          </h1>
          <p className="text-[var(--app-text-muted)] text-sm font-medium">Administra las marcas de productos disponibles en el sistema.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--app-primary)] to-blue-700 hover:to-[var(--app-primary)] text-white px-5 py-3 rounded-xl transition-all shadow-md font-bold hover:scale-[1.02] cursor-pointer text-sm"
        >
          <Plus size={18} /> Nueva Marca
        </button>
      </div>

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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-[var(--app-text-muted)]">
                    No se encontraron marcas registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[var(--app-bg-subtle)]/50 transition-colors">
                    <td className="px-6 py-4">{b.id}</td>
                    <td className="px-6 py-4 font-bold">{b.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'}`}>
                        {b.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(b)} className="p-2 border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] rounded-lg transition-all cursor-pointer">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(b.id, b.name)} className="p-2 border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer">
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

      {showModal && (
        <div className="fixed inset-0 bg-[var(--app-bg)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--app-primary)] to-blue-700 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bookmark size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider">{editingBrand ? 'Editar Marca' : 'Nueva Marca'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-1 rounded-lg transition-all cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[var(--app-surface)]">
              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20 focus:border-[var(--app-primary)] text-xs font-medium text-[var(--app-text)]"
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
                <label htmlFor="isActive" className="text-xs font-bold text-[var(--app-text)] uppercase tracking-wider cursor-pointer">Activo</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-[var(--app-surface)] text-[var(--app-text-muted)] border border-[var(--app-border)] rounded-lg font-bold text-xs hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[var(--app-primary)] to-blue-700 text-white rounded-lg font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editingBrand ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
