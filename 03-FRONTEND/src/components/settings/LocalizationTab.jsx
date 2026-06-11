import React from 'react';
import { Globe } from 'lucide-react';

const fieldClass = 'w-full px-4 py-3 rounded-2xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-[var(--app-text)]';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]';

const LocalizationTab = ({ form, setField, applyCountry }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[var(--app-border)] pb-4">
        <h3 className="text-lg font-black text-[var(--app-text)] flex items-center gap-2">
          <Globe className="text-[var(--app-primary)]" size={20} />
          Localización y moneda
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1.5 block">
          <span className={labelClass}>País</span>
          <select value={form.country} onChange={(e) => applyCountry(e.target.value)} className={`${fieldClass} ui-select`}>
            <option value="NI">Nicaragua (C$)</option>
            <option value="GT">Guatemala (Q)</option>
            <option value="MX">México ($)</option>
            <option value="USD">Estados Unidos (USD)</option>
          </select>
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>Símbolo</span>
          <input type="text" required value={form.currencySymbol} onChange={(e) => setField('currencySymbol', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>Nombre de moneda</span>
          <input type="text" required value={form.currencyName} onChange={(e) => setField('currencyName', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>Tasa USD → local</span>
          <input type="number" step="0.0001" value={form.exchangeRate} onChange={(e) => setField('exchangeRate', e.target.value)} disabled={form.country === 'USD'} className={fieldClass} />
        </label>
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 cursor-pointer">
        <input type="checkbox" checked={form.enableMultiCurrency} onChange={(e) => setField('enableMultiCurrency', e.target.checked)} className="mt-1 h-4 w-4" />
        <span>
          <span className="block text-xs font-black uppercase text-[var(--app-text)]">Cobro bimonetario en POS</span>
          <span className="block text-[11px] text-[var(--app-text-muted)] mt-1">Muestra equivalente en USD en caja y ticket (1 USD = {form.exchangeRate} {form.currencySymbol}).</span>
        </span>
      </label>
    </div>
  );
};

export default LocalizationTab;
