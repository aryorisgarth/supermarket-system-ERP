import React from 'react';
import { MapPin, X, Loader2, Save } from 'lucide-react';

const LocationFormModal = ({
  editingLocation = null,
  warehouse = '',
  setWarehouse,
  locationCode = '',
  setLocationCode,
  aisle = '',
  setAisle,
  shelf = '',
  setShelf,
  level = '',
  setLevel,
  isPisoVenta = false,
  setIsPisoVenta,
  saving = false,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-[var(--app-bg)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--app-primary)] to-blue-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MapPin size={18} />
            <h3 className="text-sm font-black uppercase tracking-wider">
              {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4 bg-[var(--app-surface)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                Almacén/Bodega *
              </label>
              <input
                type="text"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none font-bold"
                placeholder="Ej: Tienda"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                Código Ubicación *
              </label>
              <input
                type="text"
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none font-black"
                placeholder="Ej: EXH-01"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                Pasillo
              </label>
              <input
                type="text"
                value={aisle}
                onChange={(e) => setAisle(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none font-bold"
                placeholder="Ej: A"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                Estante
              </label>
              <input
                type="text"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none font-bold"
                placeholder="Ej: 3"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                Nivel
              </label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs text-[var(--app-text)] focus:outline-none font-bold"
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
              className="rounded border-[var(--app-border)] text-[var(--app-primary)] focus:ring-[var(--app-primary)]/20 text-xs"
            />
            <label
              htmlFor="isPisoVenta"
              className="text-xs font-bold text-[var(--app-text)] uppercase tracking-wider cursor-pointer select-none"
            >
              Es Exhibición / Piso de Venta
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[var(--app-surface)] text-[var(--app-text-muted)] border border-[var(--app-border)] rounded-lg font-bold text-xs hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[var(--app-primary)] to-blue-700 text-white rounded-lg font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {editingLocation ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationFormModal;
