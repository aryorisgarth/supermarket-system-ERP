import React from 'react';
import { MapPin, X, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
      >
        {/* Cabecera del Modal - Fondo Claro */}
        <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <MapPin size={20} />
            </span>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-slate-800 leading-none">
                {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest">Coordenada Física</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario - Letra Negra sobre Fondo Blanco */}
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
      </motion.div>
    </div>
  );
};

export default LocationFormModal;
