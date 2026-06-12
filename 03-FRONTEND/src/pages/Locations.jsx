import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MapPin, X, Save, Edit, Trash, Loader2, Search } from 'lucide-react';
import LocationService from '../services/LocationService';
import Swal from 'sweetalert2';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [saving, setSaving] = useState(false);

  const [warehouse, setWarehouse] = useState('');
  const [aisle, setAisle] = useState('');
  const [shelf, setShelf] = useState('');
  const [level, setLevel] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [isPisoVenta, setIsPisoVenta] = useState(false);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await LocationService.getAll();
      setLocations(data || []);
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las ubicaciones.', confirmButtonColor: '#ef4444' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setWarehouse('');
    setAisle('');
    setShelf('');
    setLevel('');
    setLocationCode('');
    setIsPisoVenta(false);
    setShowModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLocation(loc);
    setWarehouse(loc.warehouse || '');
    setAisle(loc.aisle || '');
    setShelf(loc.shelf || '');
    setLevel(loc.level || '');
    setLocationCode(loc.locationCode || '');
    setIsPisoVenta(loc.isPisoVenta || false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouse.trim() || !locationCode.trim()) {
      Swal.fire({ icon: 'warning', title: 'Requerido', text: 'Almacén y Código de ubicación son obligatorios.', confirmButtonColor: '#ef4444' });
      return;
    }
    setSaving(true);
    try {
      const data = {
        warehouse: warehouse.trim(),
        aisle: aisle.trim() || null,
        shelf: shelf.trim() || null,
        level: level.trim() || null,
        locationCode: locationCode.trim(),
        isPisoVenta
      };
      if (editingLocation) {
        await LocationService.update(editingLocation.id, data);
      } else {
        await LocationService.create(data);
      }
      setShowModal(false);
      await fetchLocations();
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true }).fire({
        icon: 'success',
        title: editingLocation ? 'Ubicación actualizada' : 'Ubicación creada'
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la ubicación.', confirmButtonColor: '#ef4444' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: '¿Eliminar ubicación?',
      text: `¿Estás seguro de eliminar la ubicación "${code}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#10b981',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await LocationService.delete(id);
        await fetchLocations();
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true }).fire({
          icon: 'success',
          title: 'Ubicación eliminada'
        });
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'No se pudo eliminar la ubicación.', confirmButtonColor: '#ef4444' });
      }
    }
  };

  const filtered = locations.filter((loc) =>
    loc.locationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.warehouse?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--app-text)] tracking-tight flex items-center gap-2">
            <MapPin className="text-[var(--app-primary)] shrink-0" size={26} />
            Gestión de Ubicaciones
          </h1>
          <p className="text-[var(--app-text-muted)] text-sm font-medium">Define y gestiona las bodegas, estantes y zonas del inventario.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--app-primary)] to-blue-700 hover:to-[var(--app-primary)] text-white px-5 py-3 rounded-xl transition-all shadow-md font-bold hover:scale-[1.02] cursor-pointer text-sm"
        >
          <Plus size={18} /> Nueva Ubicación
        </button>
      </div>

      <div className="flex bg-[var(--app-surface)] p-4 rounded-2xl border border-[var(--app-border)] items-center gap-3">
        <Search className="text-[var(--app-text-muted)]" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por código o almacén..."
          className="flex-1 bg-transparent text-sm text-[var(--app-text)] outline-none border-none"
        />
      </div>

      <div className="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--app-bg-subtle)] border-b border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] uppercase tracking-wider">
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Almacén/Bodega</th>
                <th className="px-6 py-4">Pasillo</th>
                <th className="px-6 py-4">Estante / Nivel</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)] text-xs font-medium text-[var(--app-text)]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[var(--app-text-muted)]">
                    <Loader2 className="animate-spin inline-block mr-2" size={16} /> Cargando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[var(--app-text-muted)]">
                    No se encontraron ubicaciones físicas registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((loc) => (
                  <tr key={loc.id} className="hover:bg-[var(--app-bg-subtle)]/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[var(--app-primary)]">{loc.locationCode}</td>
                    <td className="px-6 py-4">{loc.warehouse}</td>
                    <td className="px-6 py-4">{loc.aisle || '-'}</td>
                    <td className="px-6 py-4">{loc.shelf || '-'}{loc.level ? ` / ${loc.level}` : ''}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${loc.isPisoVenta ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                        {loc.isPisoVenta ? 'Exhibición/Tienda' : 'Bodega/Almacén'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(loc)} className="p-2 border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] rounded-lg transition-all cursor-pointer">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(loc.id, loc.locationCode)} className="p-2 border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer">
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
                <MapPin size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider">{editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-1 rounded-lg transition-all cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[var(--app-surface)]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Almacén/Bodega *</label>
                  <input
                    type="text"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none"
                    placeholder="Ej: Tienda"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Código Ubicación *</label>
                  <input
                    type="text"
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none"
                    placeholder="Ej: EXH-01"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Pasillo</label>
                  <input
                    type="text"
                    value={aisle}
                    onChange={(e) => setAisle(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none"
                    placeholder="Ej: A"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Estante</label>
                  <input
                    type="text"
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none"
                    placeholder="Ej: 3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Nivel</label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none"
                    placeholder="Ej: 2"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPisoVenta"
                  checked={isPisoVenta}
                  onChange={(e) => setIsPisoVenta(e.target.checked)}
                  className="rounded border-[var(--app-border)] text-[var(--app-primary)] focus:ring-[var(--app-primary)]/20"
                />
                <label htmlFor="isPisoVenta" className="text-xs font-bold text-[var(--app-text)] uppercase tracking-wider cursor-pointer">Es Exhibición / Piso de Venta</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-[var(--app-surface)] text-[var(--app-text-muted)] border border-[var(--app-border)] rounded-lg font-bold text-xs hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[var(--app-primary)] to-blue-700 text-white rounded-lg font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editingLocation ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
