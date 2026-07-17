import React from 'react';
import { Barcode, Wand2, Copy, Info, ArrowRight } from 'lucide-react';
import {
  buildHierarchySummary,
  getPackTemplate,
  PACK_DEFINITIONS,
  PACK_TEMPLATE_OPTIONS,
  sortPurchasePacks,
} from '../../utils/purchaseUnits';
import { PRODUCT_FIELD, PRODUCT_LABEL } from '../ui/formFieldStyles';

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
    <div className="space-y-4 p-4">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--app-border)] pb-4 sm:flex-row sm:items-center">
        <p className="text-[11px] leading-relaxed text-[var(--app-text-muted)]">
          Cada empaque indica cuántas <strong className="text-[var(--app-text)]">unidades base (UN)</strong> trae.
          Orden típico: UN → M-CAJ → CAJILLA → CAJA → REJILLA.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={packTemplateKey}
            onChange={(e) => applyPackTemplate(e.target.value)}
            className={`${PRODUCT_FIELD} min-w-[180px] cursor-pointer text-[11px]`}
          >
            {PACK_TEMPLATE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              setPurchasePacks((rows) => [
                ...rows,
                { label: '', factor: '1', barcode: '', isDefault: false, sortOrder: rows.length },
              ])
            }
            className="cursor-pointer rounded-xl border border-[var(--app-primary)] bg-[var(--app-surface)] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[var(--app-primary)] transition-colors hover:bg-[var(--app-primary-soft)]"
          >
            + Empaque
          </button>
        </div>
      </div>

      {activeTemplate.hint && (
        <div className="flex items-start gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-2.5">
          <Info size={15} className="mt-0.5 shrink-0 text-[var(--app-text-muted)]" />
          <p className="text-[11px] leading-relaxed text-[var(--app-text-soft)]">{activeTemplate.hint}</p>
        </div>
      )}

      {hierarchySummary && (
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Jerarquía</p>
          <p className="mt-1 truncate font-mono text-xs font-semibold text-[var(--app-text)]">{hierarchySummary}</p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 px-3 py-2.5">
        <p className="text-[11px] leading-relaxed text-[var(--app-text-soft)]">
          Cada empaque puede tener su <strong className="text-[var(--app-text)]">propio código de barras</strong> para bodega, conteo y recepción de compras.
        </p>
      </div>

      <div className="space-y-3">
        {sortedPacks.map((pack) => {
          const index = purchasePacks.indexOf(pack);
          const autoBarcode = barcode && pack.label ? `${barcode}-${pack.label.replace(/\s+/g, '')}` : '';
          return (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
            >
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_90px_70px_auto]">
                <div>
                  <label className={PRODUCT_LABEL}>Etiqueta</label>
                  <input
                    type="text"
                    value={pack.label}
                    onChange={(e) =>
                      setPurchasePacks((rows) =>
                        rows.map((row, i) => (i === index ? { ...row, label: e.target.value } : row))
                      )
                    }
                    placeholder="CAJILLA, CAJA, REJILLA"
                    title={PACK_DEFINITIONS[pack.label?.toUpperCase()] || 'Etiqueta del empaque'}
                    className={PRODUCT_FIELD}
                  />
                  {PACK_DEFINITIONS[pack.label?.toUpperCase()] && (
                    <p className="mt-1 text-[10px] text-[var(--app-text-muted)]">
                      {PACK_DEFINITIONS[pack.label?.toUpperCase()]}
                    </p>
                  )}
                </div>
                <div>
                  <label className={PRODUCT_LABEL}>Factor</label>
                  <input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={pack.factor}
                    onChange={(e) =>
                      setPurchasePacks((rows) =>
                        rows.map((row, i) => (i === index ? { ...row, factor: e.target.value } : row))
                      )
                    }
                    className={PRODUCT_FIELD}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 pt-6 text-[11px] font-bold text-[var(--app-text-soft)]">
                  <input
                    type="radio"
                    name="defaultPurchasePack"
                    checked={Boolean(pack.isDefault)}
                    onChange={() =>
                      setPurchasePacks((rows) => rows.map((row, i) => ({ ...row, isDefault: i === index })))
                    }
                    className="accent-[var(--app-primary)]"
                  />
                  Default
                </label>
                <button
                  type="button"
                  disabled={purchasePacks.length <= 1}
                  onClick={() => setPurchasePacks((rows) => rows.filter((_, i) => i !== index))}
                  className="mt-5 cursor-pointer rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2 text-[10px] font-bold uppercase text-[var(--app-danger)] transition-colors hover:bg-[var(--app-danger-soft)] disabled:opacity-40"
                >
                  Quitar
                </button>
              </div>

              {Number(pack.factor) > 1 && (
                <div className="flex w-fit items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-1.5 text-[11px] font-semibold text-[var(--app-text-soft)]">
                  <ArrowRight size={12} className="text-[var(--app-primary)]" />
                  <span>
                    1 {pack.label || 'empaque'} = <strong className="text-[var(--app-text)]">{pack.factor}</strong>{' '}
                    {productName ? `unidades de ${productName}` : 'unidades base'}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Barcode
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
                  />
                  <input
                    type="text"
                    value={pack.barcode || ''}
                    onChange={(e) =>
                      setPurchasePacks((rows) =>
                        rows.map((row, i) => (i === index ? { ...row, barcode: e.target.value } : row))
                      )
                    }
                    placeholder={autoBarcode || 'Código de barras de la presentación…'}
                    className={`${PRODUCT_FIELD} pl-9 font-mono`}
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {autoBarcode && !pack.barcode && (
                    <button
                      type="button"
                      onClick={() =>
                        setPurchasePacks((rows) =>
                          rows.map((row, i) => (i === index ? { ...row, barcode: autoBarcode } : row))
                        )
                      }
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[10px] font-bold uppercase text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]"
                    >
                      <Wand2 size={12} /> Auto
                    </button>
                  )}
                  {pack.barcode && (
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(pack.barcode)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[10px] font-bold uppercase text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)]"
                    >
                      <Copy size={12} /> Copiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPurchasePacksSection;
