import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Clock, HardDrive, ExternalLink } from 'lucide-react';

const fieldClass = 'w-full px-4 py-3 rounded-2xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-[var(--app-text)]';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]';

const BackupsTab = ({ form, setField }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[var(--app-border)] pb-4">
        <h3 className="text-lg font-black text-[var(--app-text)] flex items-center gap-2">
          <Database className="text-[var(--app-primary)]" size={20} />
          Política de respaldos
        </h3>
        <p className="text-xs text-[var(--app-text-muted)] mt-1">Preferencias locales. La ejecución manual y restauración están en Mantenimiento.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1.5 block">
          <span className={labelClass}>Frecuencia deseada</span>
          <select value={form.backupFrequency} onChange={(e) => setField('backupFrequency', e.target.value)} className={`${fieldClass} ui-select`}>
            <option value="HOURLY">Cada hora</option>
            <option value="DAILY">Diario</option>
            <option value="WEEKLY">Semanal</option>
            <option value="NEVER">Desactivado</option>
          </select>
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}><Clock size={12} className="inline mr-1" />Hora preferida</span>
          <input type="time" value={form.backupTime} onChange={(e) => setField('backupTime', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block md:col-span-2">
          <span className={labelClass}>Destino preferido</span>
          <select value={form.backupDest || 'LOCAL'} onChange={(e) => setField('backupDest', e.target.value)} className={`${fieldClass} ui-select`}>
            <option value="LOCAL">Descarga local (SQL)</option>
            <option value="NAS">Servidor / NAS interno</option>
            <option value="CLOUD">Nube (S3 / Drive)</option>
          </select>
        </label>
      </div>
      <Link
        to="/mantenimiento"
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--app-primary)]/30 bg-[var(--app-primary-soft)] px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--app-primary)] hover:opacity-90"
      >
        <HardDrive size={16} />
        Ir a respaldos y restauración
        <ExternalLink size={14} />
      </Link>
    </div>
  );
};

export default BackupsTab;
