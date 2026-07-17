import React from 'react';
import { CalendarClock, RefreshCw, ShieldAlert, Plus } from 'lucide-react';

const BatchHeader = ({
  canWriteOffExpired,
  canCreateBatch,
  expiredCount,
  onRefresh,
  onWriteOff,
  onCreateClick,
}) => {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--app-text)]">
          <CalendarClock className="shrink-0 text-[var(--app-primary)]" size={26} />
          Lotes y Vencimientos
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--app-text-muted)]">
          Control de caducidad, merma y rotación PEPS (Primero en Entrar, Primero en Salir).
        </p>
      </div>
      <div className="flex w-full gap-2 md:w-auto">
        <button
          type="button"
          onClick={onRefresh}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-bold text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-bg-subtle)]"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
        {canWriteOffExpired && expiredCount > 0 && (
          <button
            type="button"
            onClick={onWriteOff}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--app-danger)] px-4 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
          >
            <ShieldAlert size={16} /> Baja vencidos ({expiredCount})
          </button>
        )}
        {canCreateBatch && (
          <button
            type="button"
            onClick={onCreateClick}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 md:flex-none"
          >
            <Plus size={18} /> Nuevo Lote
          </button>
        )}
      </div>
    </div>
  );
};

export default BatchHeader;
