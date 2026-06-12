import React from 'react';
import { Database, Store, Layers } from 'lucide-react';
import Card from '../ui/Card';

const LocationsVisualMap = ({
  warehouseRacks = {},
  storeShelves = [],
  selectedMapLoc = null,
  onSelectLocation,
}) => {
  return (
    <div className="space-y-8">
      {/* Bodega Central (Racks Visualizer) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--app-border)] pb-2">
          <Database className="text-[var(--app-primary)]" size={18} />
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--app-text)]">Racks de Bodega Central</h2>
        </div>
        <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] -mt-2">
          Organizados por pasillos, columnas (estantes) y niveles.
        </p>

        {Object.keys(warehouseRacks).length === 0 ? (
          <Card className="py-12 text-center text-xs font-bold text-[var(--app-text-muted)]">
            No hay ubicaciones de Bodega configuradas.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(warehouseRacks).map(([aisleName, locs]) => (
              <Card key={aisleName} className="border-[var(--app-border)] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-2 mb-4">
                  <span className="text-xs font-black text-[var(--app-text)] uppercase tracking-wider">
                    Pasillo: {aisleName}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-[var(--app-text-muted)] bg-[var(--app-bg-subtle)] px-2 py-0.5 rounded-full border border-[var(--app-border)]">
                    {locs.length} celdas
                  </span>
                </div>

                {/* Grid representation of the steel rack */}
                <div className="grid grid-cols-3 gap-3 bg-slate-900/5 dark:bg-slate-950/20 p-4 rounded-2xl border-4 border-slate-350 dark:border-slate-800 shadow-inner relative">
                  {locs.map((loc) => {
                    const isActive = selectedMapLoc?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => onSelectLocation(loc)}
                        className={`flex flex-col justify-center items-center p-3.5 rounded-xl border transition-all cursor-pointer relative group overflow-hidden ${
                          isActive
                            ? 'bg-[var(--app-primary)] border-[var(--app-primary)] text-white shadow-lg scale-105 z-10'
                            : 'bg-[var(--app-surface)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40 hover:scale-[1.03] text-[var(--app-text-soft)] shadow-sm'
                        }`}
                      >
                        <Layers size={14} className={isActive ? 'text-white' : 'text-[var(--app-primary)]'} />
                        <span className="text-[9px] font-black font-mono tracking-tight mt-1.5">{loc.locationCode}</span>
                        <span className="text-[7px] font-bold opacity-60 uppercase mt-0.5">
                          N: {loc.level || '-'} · E: {loc.shelf || '-'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Piso de Venta (Store Layout) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--app-border)] pb-2">
          <Store className="text-indigo-500" size={18} />
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--app-text)]">
            Layout de Exhibición (Piso de Venta)
          </h2>
        </div>
        <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] -mt-2">
          Góndolas y neveras disponibles en la tienda.
        </p>

        {storeShelves.length === 0 ? (
          <Card className="py-12 text-center text-xs font-bold text-[var(--app-text-muted)]">
            No hay ubicaciones de Tienda configuradas.
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {storeShelves.map((loc) => {
              const isActive = selectedMapLoc?.id === loc.id;

              // Theming based on layout name
              let iconColor = 'text-indigo-500';
              let bgTone = 'bg-indigo-500/5 hover:border-indigo-500/30';
              if (loc.locationCode?.toLowerCase().includes('nev') || loc.aisle?.toLowerCase().includes('beb')) {
                iconColor = 'text-sky-500';
                bgTone = 'bg-sky-500/5 hover:border-sky-500/30';
              } else if (loc.locationCode?.toLowerCase().includes('pan')) {
                iconColor = 'text-amber-500';
                bgTone = 'bg-amber-500/5 hover:border-amber-500/30';
              }

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => onSelectLocation(loc)}
                  className={`p-4 rounded-3xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-700 border-transparent text-white shadow-xl scale-[1.02] z-10'
                      : `bg-[var(--app-surface)] border-[var(--app-border)] shadow-sm ${bgTone} text-[var(--app-text-soft)]`
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-2xl border ${
                      isActive ? 'bg-white/10 border-white/20' : 'bg-[var(--app-bg-subtle)] border-[var(--app-border)]'
                    } shrink-0 mt-0.5`}
                  >
                    <Store size={16} className={isActive ? 'text-white' : iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wider truncate">{loc.locationCode}</p>
                    <p
                      className={`text-[9px] font-bold ${
                        isActive ? 'text-white/80' : 'text-[var(--app-text-muted)]'
                      } mt-0.5 truncate`}
                    >
                      {loc.aisle || 'Exhibición'}
                    </p>
                    <p className="text-[7px] font-medium opacity-65 mt-1">{loc.warehouse}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsVisualMap;
