import React from 'react';
import { CalendarClock, RefreshCw, ShieldAlert, Plus } from 'lucide-react';

const BatchHeader = ({
  canWriteOffExpired,
  canCreateBatch,
  expiredCount,
  onRefresh,
  onWriteOff,
  onCreateClick
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-black text-text-primary dark:text-text-primary-dark tracking-tight flex items-center gap-2">
          <CalendarClock className="text-primary shrink-0" size={26} />
          Lotes y Vencimientos
        </h1>
        <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
          Control de caducidad, merma y rotación PEPS (Primero en Entrar, Primero en Salir).
        </p>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-text-soft)] px-4 py-3 rounded-xl transition-all font-bold hover:bg-[var(--app-bg-subtle)] text-sm cursor-pointer"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
        {canWriteOffExpired && expiredCount > 0 && (
          <button
            type="button"
            onClick={onWriteOff}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer"
          >
            <ShieldAlert size={16} /> Baja vencidos ({expiredCount})
          </button>
        )}
        {canCreateBatch && (
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-5 py-3 rounded-xl transition-all shadow-enterprise font-bold hover:shadow-enterprise-lg hover:scale-[1.02] duration-250 flex-1 md:flex-none justify-center cursor-pointer text-sm"
          >
            <Plus size={18} /> Nuevo Lote
          </button>
        )}
      </div>
    </div>
  );
};

export default BatchHeader;
