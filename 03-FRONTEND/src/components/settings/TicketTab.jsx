import React from 'react';
import { ReceiptText, MessageSquareText, Type } from 'lucide-react';

const fieldClass = 'w-full px-4 py-3 rounded-2xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-[var(--app-text)]';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]';

const TicketTab = ({ form, setField, logo }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[var(--app-border)] pb-4">
        <h3 className="text-lg font-black text-[var(--app-text)] flex items-center gap-2">
          <ReceiptText className="text-[var(--app-primary)]" size={20} />
          Diseño del ticket
        </h3>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.showTicketLogo} onChange={(e) => setField('showTicketLogo', e.target.checked)} className="h-4 w-4" />
            <span className="text-sm font-bold">Mostrar logo en ticket</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5 block">
              <span className={`${labelClass} flex items-center gap-1`}><MessageSquareText size={12} />Mensaje superior</span>
              <input type="text" maxLength={80} value={form.ticketHeaderMessage} onChange={(e) => setField('ticketHeaderMessage', e.target.value)} className={fieldClass} />
            </label>
            <label className="space-y-1.5 block">
              <span className={`${labelClass} flex items-center gap-1`}><MessageSquareText size={12} />Mensaje final</span>
              <input type="text" maxLength={80} value={form.ticketFooterMessage} onChange={(e) => setField('ticketFooterMessage', e.target.value)} className={fieldClass} />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5 block"><span className={labelClass}>Código ASFC</span><input type="text" value={form.ticketAsfcCode} onChange={(e) => setField('ticketAsfcCode', e.target.value)} className={fieldClass} /></label>
            <label className="space-y-1.5 block"><span className={labelClass}>Serie</span><input type="text" value={form.ticketSeries} onChange={(e) => setField('ticketSeries', e.target.value)} className={fieldClass} /></label>
            <label className="space-y-1.5 block"><span className={labelClass}>Forma de pago</span><input type="text" value={form.ticketPaymentLabel} onChange={(e) => setField('ticketPaymentLabel', e.target.value)} className={fieldClass} /></label>
            <label className="space-y-1.5 block"><span className={labelClass}>Leyenda cambios</span><input type="text" value={form.ticketExchangeNote} onChange={(e) => setField('ticketExchangeNote', e.target.value)} className={fieldClass} /></label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1.5 block">
              <span className={`${labelClass} flex items-center gap-1`}><Type size={12} />Tipografía</span>
              <select value={form.ticketFontFamily} onChange={(e) => setField('ticketFontFamily', e.target.value)} className={`${fieldClass} ui-select`}>
                <option value="monospace">Monoespaciada</option>
                <option value="Inter, Arial, sans-serif">Sans</option>
                <option value="Georgia, serif">Serif</option>
              </select>
            </label>
            <label className="space-y-1.5 block"><span className={labelClass}>Tamaño (px)</span><input type="number" min="8" max="13" value={form.ticketFontSize} onChange={(e) => setField('ticketFontSize', e.target.value)} className={fieldClass} /></label>
            <label className="flex items-end gap-3 pb-1 cursor-pointer">
              <input type="checkbox" checked={form.ticketShowTaxId} onChange={(e) => setField('ticketShowTaxId', e.target.checked)} className="h-4 w-4" />
              <span className="text-xs font-black uppercase">Mostrar NIT</span>
            </label>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
          <p className="text-xs font-black uppercase text-[var(--app-text-muted)] mb-3">Vista previa</p>
          <div className="mx-auto max-w-[240px] rounded-lg bg-white p-3 text-slate-900 shadow-md" style={{ fontFamily: form.ticketFontFamily, fontSize: `${form.ticketFontSize}px` }}>
            <div className="text-center space-y-1">
              {form.showTicketLogo && logo && <img src={logo} alt="" className="mx-auto h-10 object-contain" />}
              <p className="font-black uppercase">{form.companyName}</p>
              {form.ticketHeaderMessage && <p className="text-[0.85em]">{form.ticketHeaderMessage}</p>}
              {form.ticketShowTaxId && <p className="text-[0.75em]">{form.taxId}</p>}
            </div>
            <div className="my-2 border-b border-dashed border-slate-300" />
            <div className="flex justify-between font-black"><span>Total</span><span>{form.currencySymbol}28.75</span></div>
            <p className="mt-2 text-center text-[0.75em] font-bold">{form.ticketFooterMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketTab;
