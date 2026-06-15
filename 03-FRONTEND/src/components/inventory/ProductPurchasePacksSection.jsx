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
    <div className="space-y-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Presentaciones de compra</p>
          <p className="text-[10px] font-medium text-[var(--app-text-muted)] max-w-xl">
            Cada empaque indica cuántas <strong>unidades base (UN)</strong> trae. Orden típico: UN → M-CAJ/PAQ → CAJILLA → CAJA → REJILLA/SACO (de menor a mayor).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={packTemplateKey}
            onChange={(e) => applyPackTemplate(e.target.value)}
            className="ui-input text-[10px] font-bold min-w-[160px]"
          >
            {PACK_TEMPLATE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPurchasePacks((rows) => [...rows, { label: '', factor: '1', barcode: '', isDefault: false, sortOrder: rows.length }])}
            className="text-[10px] font-bold uppercase text-[var(--app-primary)]"
          >
            + Empaque
          </button>
        </div>
      </div>
      {activeTemplate.hint && (
        <p className="text-[10px] leading-relaxed rounded-xl border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-800/40 px-3 py-2 text-amber-900 dark:text-amber-100">
          {activeTemplate.hint}
        </p>
      )}
      {hierarchySummary && (
        <p className="text-[10px] font-mono rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[var(--app-text-soft)]">
          {hierarchySummary}
        </p>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-blue-200/60 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-800/40 px-3 py-2.5">
        <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
          Cada empaque puede tener su <strong>propio código de barras único</strong>. Este código se usa para escaneos rápidos en <strong>bodega</strong>, <strong>conteo cíclico</strong> y <strong>recepción de compras</strong>. El sistema convierte automáticamente a unidades base.
        </p>
      </div>
      <div className="space-y-3">
        {sortedPacks.map((pack) => {
          const index = purchasePacks.indexOf(pack);
          const autoBarcode = barcode && pack.label
            ? `${barcode}-${pack.label.replace(/\s+/g, '')}`
            : '';
          return (
            <div key={index} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 space-y-2">
              <div className="grid grid-cols-[1fr_90px_70px_auto] gap-2 items-start">
                <div className="space-y-0.5">
                  <input
                    type="text"
                    value={pack.label}
                    onChange={(e) => setPurchasePacks((rows) => rows.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)))}
                    placeholder="CAJILLA, CAJA, REJILLA, M-CAJ"
                    title={PACK_DEFINITIONS[pack.label?.toUpperCase()] || 'Etiqueta del empaque'}
                    className="ui-input text-xs font-bold w-full"
                  />
                  {PACK_DEFINITIONS[pack.label?.toUpperCase()] && (
                    <p className="text-[9px] text-[var(--app-text-muted)]">{PACK_DEFINITIONS[pack.label?.toUpperCase()]}</p>
                  )}
                </div>
                <input
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={pack.factor}
                  onChange={(e) => setPurchasePacks((rows) => rows.map((row, i) => (i === index ? { ...row, factor: e.target.value } : row)))}
                  placeholder="Factor"
                  className="ui-input text-xs font-bold"
                />
                <label className="flex items-center gap-1 text-[10px] font-bold text-[var(--app-text-soft)]">
                  <input
                    type="radio"
                    name="defaultPurchasePack"
                    checked={Boolean(pack.isDefault)}
                    onChange={() => setPurchasePacks((rows) => rows.map((row, i) => ({ ...row, isDefault: i === index })))}
                  />
                  Default
                </label>
                <button
                  type="button"
                  disabled={purchasePacks.length <= 1}
                  onClick={() => setPurchasePacks((rows) => rows.filter((_, i) => i !== index))}
                  className="text-[10px] font-bold uppercase text-red-500 disabled:opacity-30"
                >
                  Quitar
                </button>
              </div>

              {/* Conversion badge */}
              {Number(pack.factor) > 1 && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg px-2.5 py-1">
                  <ArrowRight size={9} />
                  <span>1 {pack.label || 'empaque'} = <strong>{pack.factor}</strong> {productName ? `unidades de ${productName}` : 'unidades base'} en inventario</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Barcode size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
                  <input
                    type="text"
                    value={pack.barcode || ''}
                    onChange={(e) => setPurchasePacks((rows) => rows.map((row, i) => (i === index ? { ...row, barcode: e.target.value } : row)))}
                    placeholder={autoBarcode || 'Código de barras de la presentación...'}
                    className="ui-input text-xs font-mono pl-7 w-full"
                  />
                </div>
                
                {autoBarcode && !pack.barcode && (
                  <button
                    type="button"
                    title={`Auto-generar: ${autoBarcode}`}
                    onClick={() => setPurchasePacks((rows) => rows.map((row, i) => (i === index ? { ...row, barcode: autoBarcode } : row)))}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-[var(--app-primary)] border border-[var(--app-primary)]/30 rounded-lg px-2 py-1.5 hover:bg-[var(--app-primary-soft)]/20 transition-colors whitespace-nowrap"
                  >
                    <Wand2 size={11} /> Auto
                  </button>
                )}
                
                {pack.barcode && (
                  <button
                    type="button"
                    title="Copiar barcode"
                    onClick={() => { navigator.clipboard.writeText(pack.barcode); }}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 border border-emerald-600/30 rounded-lg px-2 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors whitespace-nowrap"
                  >
                    <Copy size={11} /> Copiar
                  </button>
                )}
              </div>
              
              {pack.barcode && (
                <p className="text-[9px] text-[var(--app-text-muted)] font-mono bg-[var(--app-bg-subtle)] rounded-lg px-2 py-1">
                  📦 Escanear en bodega/conteo: <span className="font-bold text-[var(--app-text)]">{pack.barcode}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPurchasePacksSection;
