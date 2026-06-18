import React from 'react';
import { Barcode, Wand2, Copy, Info, ArrowRight } from 'lucide-react';
import {
  buildHierarchySummary,
  getPackTemplate,
  PACK_DEFINITIONS,
  PACK_TEMPLATE_OPTIONS,
  sortPurchasePacks,
} from '../../utils/purchaseUnits';

const ProductPurchasePacksSection = ({
  barcode,
  productName,
  purchasePacks,
  setPurchasePacks,
  packTemplateKey,
  applyPackTemplate,
}) => {
  const activeTemplate = getPackTemplate(packTemplateKey);
  const hierarchySummary = buildHierarchySummary(purchasePacks);
  const sortedPacks = sortPurchasePacks(purchasePacks);

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm p-5 relative overflow-hidden transition-all hover:shadow-md">
      {/* Decorative gradient background element for modern corporate aesthetic */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-[var(--app-border)] pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[var(--app-text)] tracking-tight">Presentaciones de Compra</h3>
            <span className="flex items-center justify-center h-5 px-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-[9px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider shadow-sm">
              {purchasePacks.length} EMPAQUE{purchasePacks.length !== 1 ? 'S' : ''}
            </span>
          </div>
          <p className="text-[11px] font-medium text-[var(--app-text-muted)] max-w-xl leading-relaxed">
            Cada empaque indica cuántas <strong>unidades base (UN)</strong> trae. Orden típico: UN → M-CAJ/PAQ → CAJILLA → CAJA → REJILLA/SACO.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={packTemplateKey}
            onChange={(e) => applyPackTemplate(e.target.value)}
            className="ui-input text-[11px] font-semibold min-w-[180px] shadow-sm bg-[var(--app-bg-subtle)]"
          >
            {PACK_TEMPLATE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPurchasePacks((rows) => [...rows, { label: '', factor: '1', barcode: '', isDefault: false, sortOrder: rows.length }])}
            className="flex items-center justify-center px-3 py-1.5 h-[34px] rounded-lg bg-[var(--app-primary)]/10 text-[var(--app-primary)] hover:bg-[var(--app-primary)] hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wide shadow-sm"
          >
            + Empaque
          </button>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {activeTemplate.hint && (
          <div className="flex items-start gap-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm transition-all">
            <Info size={16} className="text-black dark:text-white shrink-0 mt-0.5" />
            <p className="text-[12px] leading-relaxed text-black dark:text-white font-medium">
              {activeTemplate.hint}
            </p>
          </div>
        )}
        
        {hierarchySummary && (
          <div className="flex items-center gap-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-center shrink-0">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 shadow-sm border border-gray-300 dark:border-gray-600 text-[10px] font-bold text-black dark:text-white">
                UN
              </span>
            </div>
            <p className="text-[12px] font-mono font-medium text-black dark:text-white truncate">
              {hierarchySummary}
            </p>
          </div>
        )}

        {/* Info banner */}
        <div className="flex items-start gap-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3.5 shadow-sm transition-all">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0 shadow-sm border border-gray-300 dark:border-gray-600">
            <Barcode size={16} className="text-black dark:text-white" />
          </div>
          <p className="text-[12px] text-black dark:text-white font-medium leading-relaxed">
            Cada empaque puede tener su <strong>propio código de barras único</strong>. Este código se usa para escaneos rápidos en <strong>bodega</strong>, <strong>conteo cíclico</strong> y <strong>recepción de compras</strong>. El sistema convierte automáticamente a unidades base.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {sortedPacks.map((pack) => {
          const index = purchasePacks.indexOf(pack);
          const autoBarcode = barcode && pack.label
            ? `${barcode}-${pack.label.replace(/\s+/g, '')}`
            : '';
          return (
            <div key={index} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30 p-4 space-y-3 transition-all hover:border-[var(--app-border-hover)] hover:bg-[var(--app-surface-hover)]">
              <div className="grid grid-cols-[1fr_90px_70px_auto] gap-3 items-start">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={pack.label}
                    onChange={(e) => setPurchasePacks((rows) => rows.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)))}
                    placeholder="CAJILLA, CAJA, REJILLA, M-CAJ"
                    title={PACK_DEFINITIONS[pack.label?.toUpperCase()] || 'Etiqueta del empaque'}
                    className="ui-input text-xs font-bold w-full bg-white dark:bg-[var(--app-surface)] shadow-sm"
                  />
                  {PACK_DEFINITIONS[pack.label?.toUpperCase()] && (
                    <p className="text-[10px] text-[var(--app-text-muted)] px-1">{PACK_DEFINITIONS[pack.label?.toUpperCase()]}</p>
                  )}
                </div>
                <input
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={pack.factor}
                  onChange={(e) => setPurchasePacks((rows) => rows.map((row, i) => (i === index ? { ...row, factor: e.target.value } : row)))}
                  placeholder="Factor"
                  className="ui-input text-xs font-bold bg-white dark:bg-[var(--app-surface)] shadow-sm"
                />
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--app-text-soft)] cursor-pointer mt-2.5">
                  <input
                    type="radio"
                    name="defaultPurchasePack"
                    checked={Boolean(pack.isDefault)}
                    onChange={() => setPurchasePacks((rows) => rows.map((row, i) => ({ ...row, isDefault: i === index })))}
                    className="w-3.5 h-3.5 accent-[var(--app-primary)]"
                  />
                  Default
                </label>
                <button
                  type="button"
                  disabled={purchasePacks.length <= 1}
                  onClick={() => setPurchasePacks((rows) => rows.filter((_, i) => i !== index))}
                  className="mt-1 flex items-center justify-center px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Quitar
                </button>
              </div>

              {/* Conversion badge */}
              {Number(pack.factor) > 1 && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-green-900 dark:text-green-100 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg px-3 py-1.5 w-fit shadow-sm">
                  <ArrowRight size={12} className="text-green-700 dark:text-green-300" />
                  <span>1 <span className="font-bold">{pack.label || 'empaque'}</span> = <strong>{pack.factor}</strong> {productName ? `unidades de ${productName}` : 'unidades base'} en inventario</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 border-r border-gray-300 dark:border-gray-600 pr-2 my-1">
                    <Barcode size={14} />
                  </div>
                  <input
                    type="text"
                    style={{ paddingLeft: '2.75rem' }}
                    value={pack.barcode || ''}
                    onChange={(e) => setPurchasePacks((rows) => rows.map((row, i) => (i === index ? { ...row, barcode: e.target.value } : row)))}
                    placeholder={autoBarcode || 'Código de barras de la presentación...'}
                    className="ui-input text-xs font-mono w-full bg-white dark:bg-[var(--app-surface)] shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {autoBarcode && !pack.barcode && (
                    <button
                      type="button"
                      title={`Auto-generar: ${autoBarcode}`}
                      onClick={() => setPurchasePacks((rows) => rows.map((row, i) => (i === index ? { ...row, barcode: autoBarcode } : row)))}
                      className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-lg px-3 py-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 shadow-sm transition-colors whitespace-nowrap"
                    >
                      <Wand2 size={12} /> Auto
                    </button>
                  )}
                  
                  {pack.barcode && (
                    <button
                      type="button"
                      title="Copiar barcode"
                      onClick={() => { navigator.clipboard.writeText(pack.barcode); }}
                      className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 rounded-lg px-3 py-2 hover:bg-teal-100 dark:hover:bg-teal-500/20 shadow-sm transition-colors whitespace-nowrap"
                    >
                      <Copy size={12} /> Copiar
                    </button>
                  )}
                </div>
              </div>
              
              {pack.barcode && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[var(--app-surface)] border border-slate-200 dark:border-[var(--app-border)] rounded-lg w-fit shadow-sm">
                  <span className="text-[12px]">📦</span>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                    Escanear en bodega/conteo: <span className="font-mono font-bold text-slate-900 dark:text-slate-200 tracking-wide bg-white dark:bg-slate-800 px-1 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">{pack.barcode}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPurchasePacksSection;
