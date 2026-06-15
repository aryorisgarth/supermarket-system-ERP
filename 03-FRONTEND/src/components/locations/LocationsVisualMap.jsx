import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Store, Layers, Plus, Box, Info, Snowflake, Sparkles } from 'lucide-react';

const LocationsVisualMap = ({
  locations = [],
  selectedMapLoc = null,
  onSelectLocation,
  onAddLocation,
}) => {
  const uniqueWarehouses = useMemo(() => {
    const list = Array.from(new Set(locations.map((loc) => loc.warehouse).filter(Boolean)));
    return list.length > 0 ? list : ['Bodega Central'];
  }, [locations]);

  const [activeWarehouse, setActiveWarehouse] = useState('');

  const currentWarehouse = uniqueWarehouses.includes(activeWarehouse)
    ? activeWarehouse
    : uniqueWarehouses[0] || 'Bodega Central';

  const warehouseLocs = useMemo(() => {
    return locations.filter((loc) => (loc.warehouse || 'Bodega Central') === currentWarehouse);
  }, [locations, currentWarehouse]);

  const isStore = useMemo(() => {
    return warehouseLocs.some((loc) => loc.isPisoVenta);
  }, [warehouseLocs]);

  const aisleGroups = useMemo(() => {
    const groups = {};
    warehouseLocs.forEach((loc) => {
      const aisleName = loc.aisle || 'General';
      if (!groups[aisleName]) {
        groups[aisleName] = [];
      }
      groups[aisleName].push(loc);
    });
    return groups;
  }, [warehouseLocs]);

  const stats = useMemo(() => {
    const total = warehouseLocs.length;
    const activeCount = warehouseLocs.filter((l) => l.id === selectedMapLoc?.id).length;
    const storeCount = warehouseLocs.filter((l) => l.isPisoVenta).length;
    const whCount = total - storeCount;
    return { total, activeCount, storeCount, whCount };
  }, [warehouseLocs, selectedMapLoc]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--app-surface)] p-4 rounded-2xl border border-[var(--app-border)] shadow-sm">
        <div className="flex flex-wrap gap-2">
          {uniqueWarehouses.map((wh) => {
            const isActive = currentWarehouse === wh;
            return (
              <button
                key={wh}
                onClick={() => setActiveWarehouse(wh)}
                className="relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer overflow-hidden"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeWarehouseBg"
                    className="absolute inset-0 bg-[var(--app-primary-soft)] border border-[var(--app-primary)]/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'}`}>
                  {wh.toLowerCase().includes('tienda') || wh.toLowerCase().includes('exhibi') ? (
                    <Store size={14} />
                  ) : (
                    <Database size={14} />
                  )}
                  {wh}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 text-xs font-bold text-[var(--app-text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--app-primary)]" />
            <span>{stats.total} Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{isStore ? 'Exhibición' : 'Almacenamiento'}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWarehouse}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          {isStore ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-[var(--app-border)] pb-2">
                <Store className="text-indigo-500" size={18} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--app-text)]">
                  Disposición de Tienda ({currentWarehouse})
                </h2>
              </div>

              {warehouseLocs.length === 0 ? (
                <div className="py-16 text-center text-xs font-bold text-[var(--app-text-muted)] bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)]">
                  No hay ubicaciones registradas en este sector.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {warehouseLocs.map((loc) => {
                    const isActive = selectedMapLoc?.id === loc.id;
                    const isCold =
                      loc.locationCode?.toLowerCase().includes('nev') ||
                      loc.locationCode?.toLowerCase().includes('frio') ||
                      loc.aisle?.toLowerCase().includes('beb') ||
                      loc.aisle?.toLowerCase().includes('lact');

                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => onSelectLocation(loc)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-br from-[var(--app-primary)] to-blue-700 border-transparent text-white shadow-xl scale-[1.02] z-10'
                            : `bg-[var(--app-surface)] border-[var(--app-border)] shadow-sm hover:border-[var(--app-primary)]/45 text-[var(--app-text-soft)]`
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl border ${
                            isActive ? 'bg-white/10 border-white/20' : 'bg-[var(--app-bg-subtle)] border-[var(--app-border)]'
                          } shrink-0 mt-0.5`}
                        >
                          {isCold ? (
                            <Snowflake size={16} className={isActive ? 'text-white' : 'text-sky-500'} />
                          ) : (
                            <Store size={16} className={isActive ? 'text-white' : 'text-indigo-500'} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-wider truncate">{loc.locationCode}</p>
                          <p className={`text-[10px] font-bold ${isActive ? 'text-white/80' : 'text-[var(--app-text-muted)]'} mt-0.5 truncate`}>
                            Pasillo: {loc.aisle || 'N/A'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/10 text-white' : 'bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] border border-[var(--app-border)]'}`}>
                              Exhibición
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(aisleGroups).length === 0 ? (
                <div className="py-16 text-center text-xs font-bold text-[var(--app-text-muted)] bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)]">
                  No hay pasillos configurados en este almacén.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {Object.entries(aisleGroups).map(([aisleName, locs]) => {
                    const gridLocs = locs.filter((l) => l.level && l.shelf);
                    const unclassifiedLocs = locs.filter((l) => !l.level || !l.shelf);

                    const levels = Array.from(new Set(gridLocs.map((l) => l.level)));
                    const shelves = Array.from(new Set(gridLocs.map((l) => l.shelf)));

                    const sortedLevels = [...levels].sort((a, b) => {
                      const aNum = parseInt(a, 10);
                      const bNum = parseInt(b, 10);
                      return !isNaN(aNum) && !isNaN(bNum) ? bNum - aNum : String(b).localeCompare(String(a));
                    });

                    const sortedShelves = [...shelves].sort((a, b) => {
                      const aNum = parseInt(a, 10);
                      const bNum = parseInt(b, 10);
                      return !isNaN(aNum) && !isNaN(bNum) ? aNum - bNum : String(a).localeCompare(String(b));
                    });

                    if (sortedLevels.length === 0) sortedLevels.push('1');
                    if (sortedShelves.length === 0) sortedShelves.push('1');

                    return (
                      <div
                        key={aisleName}
                        className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 shadow-sm space-y-6"
                      >
                        <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)] border border-[var(--app-border)]/20">
                              <Box size={15} />
                            </span>
                            <div>
                              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
                                Pasillo: {aisleName}
                              </h3>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mt-0.5">
                                Vista Frontal del Estante
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-primary)] bg-[var(--app-primary-soft)] px-2.5 py-1 rounded-full border border-[var(--app-primary)]/10">
                            {locs.length} celdas
                          </span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-stretch">
                          <div className="flex-1 overflow-x-auto pb-4">
                            <div className="min-w-[480px] flex items-stretch">
                              <div className="flex flex-col justify-between py-4 pr-3 text-[9px] font-bold text-[var(--app-text-muted)] select-none">
                                {sortedLevels.map((lvl) => (
                                  <div key={lvl} className="h-14 flex items-center justify-end uppercase tracking-wider font-extrabold pr-1">
                                    Nivel {lvl}
                                  </div>
                                ))}
                                <div className="h-6" />
                              </div>

                              <div className="flex-1 border-t-8 border-b-8 border-l-4 border-r-4 border-slate-600 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/20 rounded-xl p-4 shadow-inner relative flex flex-col justify-between gap-3">
                                {sortedLevels.map((lvl, rIdx) => (
                                  <div key={lvl} className="flex-1 flex gap-3 relative">
                                    {sortedShelves.map((shf) => {
                                      const loc = gridLocs.find((l) => l.level === lvl && l.shelf === shf);
                                      const isCellSelected = selectedMapLoc?.id === loc?.id;

                                      return (
                                        <div key={shf} className="flex-1 h-14 relative">
                                          {loc ? (
                                            <button
                                              onClick={() => onSelectLocation(loc)}
                                              className={`w-full h-full rounded-lg border text-left p-2 flex flex-col justify-between transition-all cursor-pointer select-none group overflow-hidden ${
                                                isCellSelected
                                                  ? 'bg-gradient-to-br from-[var(--app-primary)] to-blue-700 border-transparent text-white shadow-lg scale-102 z-10'
                                                  : 'bg-[var(--app-surface)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40 text-[var(--app-text)] hover:scale-[1.01]'
                                              }`}
                                            >
                                              <span className="text-[10px] font-black tracking-tight truncate">
                                                {loc.locationCode}
                                              </span>
                                              <div className="flex items-center justify-between mt-auto">
                                                <span className={`text-[7px] font-extrabold uppercase ${isCellSelected ? 'text-white/80' : 'text-[var(--app-text-muted)]'}`}>
                                                  Est. {shf}
                                                </span>
                                                <Layers size={10} className={isCellSelected ? 'text-white' : 'text-[var(--app-primary)]'} />
                                              </div>
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() =>
                                                onAddLocation({
                                                  warehouse: currentWarehouse,
                                                  aisle: aisleName,
                                                  shelf: shf,
                                                  level: lvl,
                                                  isPisoVenta: false,
                                                })
                                              }
                                              className="w-full h-full rounded-lg border border-dashed border-[var(--app-border)] hover:border-[var(--app-primary)]/50 bg-transparent flex flex-col items-center justify-center gap-1 group transition-all cursor-pointer text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]"
                                            >
                                              <Plus size={12} className="group-hover:scale-110 transition-transform" />
                                              <span className="text-[8px] font-extrabold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                Crear
                                              </span>
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                    {rIdx < sortedLevels.length - 1 && (
                                      <div className="absolute left-0 right-0 -bottom-1.5 h-1 border-b border-amber-600/60 dark:border-amber-600/40 select-none pointer-events-none" />
                                    )}
                                  </div>
                                ))}

                                <div className="mt-2 border-t-4 border-slate-500 dark:border-slate-800 pt-3 flex gap-3 text-[9px] font-extrabold text-[var(--app-text-muted)] select-none text-center">
                                  {sortedShelves.map((shf) => (
                                    <div key={shf} className="flex-1 uppercase tracking-wider">
                                      Estante {shf}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {unclassifiedLocs.length > 0 && (
                          <div className="border-t border-[var(--app-border)] pt-4 space-y-3">
                            <div className="flex items-center gap-1.5">
                              <Info size={12} className="text-[var(--app-text-muted)]" />
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-soft)]">
                                Celdas sin cuadrícula (Pasillo {aisleName})
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {unclassifiedLocs.map((loc) => {
                                const isCellSelected = selectedMapLoc?.id === loc.id;
                                return (
                                  <button
                                    key={loc.id}
                                    onClick={() => onSelectLocation(loc)}
                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                                      isCellSelected
                                        ? 'bg-[var(--app-primary)] border-[var(--app-primary)] text-white shadow-md'
                                        : 'bg-[var(--app-bg-subtle)] border-[var(--app-border)] text-[var(--app-text-soft)] hover:border-[var(--app-primary)]/40'
                                    }`}
                                  >
                                    {loc.locationCode}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LocationsVisualMap;
