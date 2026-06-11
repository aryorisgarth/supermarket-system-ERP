import React from 'react';
import { Printer } from 'lucide-react';

const fieldClass = 'w-full px-4 py-3 rounded-2xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-[var(--app-text)]';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]';

const HardwareTab = ({ form, setField }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[var(--app-border)] pb-4">
        <h3 className="text-lg font-black text-[var(--app-text)] flex items-center gap-2">
          <Printer className="text-[var(--app-primary)]" size={20} />
          Hardware POS
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1.5 block">
          <span className={labelClass}>Ancho de papel</span>
          <select value={form.paperWidth} onChange={(e) => setField('paperWidth', e.target.value)} className={`${fieldClass} ui-select`}>
            <option value="80mm">Térmico 80mm</option>
            <option value="58mm">Térmico 58mm</option>
          </select>
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>Modo escáner</span>
          <select value={form.barcodeMode} onChange={(e) => setField('barcodeMode', e.target.value)} className={`${fieldClass} ui-select`}>
            <option value="AUTO">Automático</option>
            <option value="ENTER">Con Enter</option>
            <option value="MANUAL">Manual</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.openDrawer} onChange={(e) => setField('openDrawer', e.target.checked)} className="h-5 w-5" />
        <span className="text-sm font-semibold text-[var(--app-text-soft)]">Abrir cajón automáticamente al cobrar</span>
      </label>
    </div>
  );
};

export default HardwareTab;
