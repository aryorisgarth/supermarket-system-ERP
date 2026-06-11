import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';

const fieldClass = 'w-full px-4 py-3 rounded-2xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-[var(--app-text)]';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]';

const SecurityTab = ({ form, setField }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[var(--app-border)] pb-4">
        <h3 className="text-lg font-black text-[var(--app-text)] flex items-center gap-2">
          <Shield className="text-[var(--app-primary)]" size={20} />
          Seguridad operativa
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1.5 block">
          <span className={labelClass}>Política de contraseñas</span>
          <select value={form.passStrength} onChange={(e) => setField('passStrength', e.target.value)} className={`${fieldClass} ui-select`}>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>Tiempo de sesión (min)</span>
          <input type="number" min="5" max="120" value={form.sessionTimeout} onChange={(e) => setField('sessionTimeout', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block md:col-span-2">
          <span className={labelClass}>Umbral stock crítico global</span>
          <input type="number" min="1" max="100" value={form.stockThreshold} onChange={(e) => setField('stockThreshold', e.target.value)} className={fieldClass} />
          <p className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-1">
            <AlertCircle size={14} /> Referencia para alertas de inventario bajo mínimo.
          </p>
        </label>
      </div>
    </div>
  );
};

export default SecurityTab;
