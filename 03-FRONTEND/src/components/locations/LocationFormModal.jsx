import React from 'react';
import { MapPin, Loader2, Save } from 'lucide-react';
import ResponsiveModal from '../ui/ResponsiveModal';

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
  isDuplicateCode = false,
  saving = false,
  onClose,
  onSubmit,
}) => {
  return (
    <ResponsiveModal
      onClose={onClose}
      icon={MapPin}
      title={editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
      subtitle="Coordenada Física"
      initialSize="md"
      sizeOptions={['sm', 'md', 'lg']}
    >
      <form onSubmit={onSubmit} className="p-6 space-y-5 bg-white">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Almacén/Bodega *
            </label>
            <input
              type="text"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold"
              placeholder="Ej: Bodega o Almacén"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold uppercase tracking-wider ${isDuplicateCode ? 'text-red-600' : 'text-slate-700'}`}>
              Código Ubicación *
            </label>
            <input
              type="text"
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 transition-all font-bold ${
                isDuplicateCode 
                  ? 'bg-red-50 border-red-500 text-red-600 focus:bg-white focus:border-red-600 focus:ring-red-100' 
                  : 'bg-slate-50 border-slate-300 text-slate-950 focus:bg-white focus:border-indigo-600 focus:ring-indigo-100'
              }`}
              placeholder="Ej: BOD-A-EST3-N1"
              required
            />
            {isDuplicateCode ? (
              <span className="block text-xs font-bold text-red-600 leading-tight mt-1.5 animate-pulse">
                ⚠️ Este código ya está registrado
              </span>
            ) : (
              !editingLocation && (
                <span className="block text-xs font-bold text-amber-600 leading-tight mt-1.5">
                  💡 Autogenerado de los campos inferiores
                </span>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pasillo
            </label>
            <input
              type="text"
              value={aisle}
              onChange={(e) => setAisle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold"
              placeholder="Ej: A o Pasillo 1 (Bebidas)"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Estante
            </label>
            <input
              type="text"
              value={shelf}
              onChange={(e) => setShelf(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold"
              placeholder="Ej: 3 o Nevera Coca-Cola"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nivel
            </label>
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold"
              placeholder="Ej: 2 o Nivel 1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="isPisoVenta"
            checked={isPisoVenta}
            onChange={(e) => setIsPisoVenta(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 text-xs w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="isPisoVenta"
            className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer select-none"
          >
            Es Exhibición / Piso de Venta
          </label>
        </div>

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || isDuplicateCode}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-indigo-100 cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {editingLocation ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default LocationFormModal;
