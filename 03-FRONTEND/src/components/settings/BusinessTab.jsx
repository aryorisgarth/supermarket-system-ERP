import React from 'react';
import { Building2, Sparkles } from 'lucide-react';

const fieldClass = 'w-full px-4 py-3 rounded-2xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-[var(--app-text)]';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]';

const BusinessTab = ({ form, setField, logo, setLogo }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[var(--app-border)] pb-4">
        <h3 className="text-lg font-black text-[var(--app-text)] flex items-center gap-2">
          <Building2 className="text-[var(--app-primary)]" size={20} />
          Datos empresariales
        </h3>
        <p className="text-xs text-[var(--app-text-muted)] mt-1">Información fiscal que aparece en tickets, facturas y reportes impresos.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)]">
        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[var(--app-border)] flex items-center justify-center overflow-hidden bg-[var(--app-surface)]">
          {logo ? (
            <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
          ) : (
            <Building2 className="text-[var(--app-text-muted)] opacity-40" size={32} />
          )}
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h4 className="text-sm font-black text-[var(--app-text)]">Logotipo</h4>
          <p className="text-xs text-[var(--app-text-muted)]">PNG o JPG recomendado 512×512. Visible en sidebar, POS y tickets.</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 py-2 text-xs font-black uppercase text-white">
              Seleccionar imagen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setLogo(reader.result);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {logo && (
              <button type="button" onClick={() => setLogo(null)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-black uppercase text-red-600 cursor-pointer">
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1.5 block">
          <span className={labelClass}>Nombre comercial</span>
          <input type="text" required value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>Propietario / razón social</span>
          <input type="text" value={form.ownerName} onChange={(e) => setField('ownerName', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>NIT / RUC</span>
          <input type="text" required value={form.taxId} onChange={(e) => setField('taxId', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>IVA (%)</span>
          <input type="number" min="0" max="100" value={form.taxRate} onChange={(e) => setField('taxRate', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block md:col-span-2">
          <span className={labelClass}>Dirección</span>
          <input type="text" required value={form.address} onChange={(e) => setField('address', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>Teléfono</span>
          <input type="text" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={fieldClass} />
        </label>
        <label className="space-y-1.5 block">
          <span className={labelClass}>Telefax</span>
          <input type="text" value={form.telefax} onChange={(e) => setField('telefax', e.target.value)} className={fieldClass} />
        </label>
      </div>

      <div className="rounded-2xl bg-[var(--app-primary-soft)] border border-[var(--app-primary)]/15 p-4 flex gap-3">
        <Sparkles className="text-[var(--app-primary)] shrink-0" size={18} />
        <p className="text-xs font-semibold text-[var(--app-primary)]">El IVA configurado se usa como referencia fiscal en ventas, tickets y reportes.</p>
      </div>
    </div>
  );
};

export default BusinessTab;
