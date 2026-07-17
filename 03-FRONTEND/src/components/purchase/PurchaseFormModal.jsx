import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { PackagePlus, Plus, Trash2, Loader2, Save, ArrowRight } from 'lucide-react';
import {
  computeBaseUnits,
  computeLineTotal,
  formatPackSummary,
  getDefaultPurchasePack,
  suggestCostPerPack,
  suggestSalePricesForPack,
} from '../../utils/purchaseUnits';
import ResponsiveModal from '../ui/ResponsiveModal';
import PurchaseProductPicker from './PurchaseProductPicker';
import PurchaseSupplierCatalog from './PurchaseSupplierCatalog';

const ROW_INPUT =
  'h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-xs font-bold text-[var(--app-text)] outline-none transition-all focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 placeholder:font-medium placeholder:text-[var(--app-text-muted)]';
const ROW_NUMBER_INPUT = `${ROW_INPUT} text-right tabular-nums`;

const emptyLine = () => ({
  productId: '',
  productSearch: '',
  purchasePackId: '',
  quantityInPacks: '1',
  costPerPack: '',
  salePricePerPack: '',
  salePricePerUnit: '',
  salePriceTouched: false,
});

const buildLineFromProduct = (line, product) => {
  const defaultPack = getDefaultPurchasePack(product);
  const costPerPack = String(suggestCostPerPack(product, defaultPack) || '');
  const next = {
    ...line,
    productId: String(product.id),
    productSearch: product.name,
    purchasePackId: defaultPack.id ? String(defaultPack.id) : '',
    quantityInPacks: line.quantityInPacks || '1',
    costPerPack,
    salePriceTouched: false,
  };
  if (next.salePriceTouched) return next;
  const suggested = suggestSalePricesForPack(product, defaultPack, costPerPack);
  return {
    ...next,
    salePricePerUnit: suggested.salePricePerUnit > 0 ? String(suggested.salePricePerUnit) : '',
    salePricePerPack: suggested.salePricePerPack > 0 ? String(suggested.salePricePerPack) : '',
  };
};

const PurchaseFormModal = ({
  onClose,
  suppliers = [],
  supplierId,
  notes,
  setNotes,
  items = [emptyLine()],
  setItems,
  saving,
  supplierProducts = [],
  catalogLoading = false,
  onSupplierChange,
  onSubmit,
  money,
  isEditing = false,
}) => {
  const packSelectsRef = useRef([]);
  const quantityInputsRef = useRef([]);

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => String(supplier.id) === String(supplierId)),
    [suppliers, supplierId]
  );

  const selectedProductIds = useMemo(
    () => items.filter((item) => item.productId).map((item) => String(item.productId)),
    [items]
  );

  const findProduct = useCallback(
    (productId) => supplierProducts.find((product) => String(product.id) === String(productId)),
    [supplierProducts]
  );

  const findPack = useCallback((product, packId) => {
    const packs = product?.purchasePacks || [];
    return packs.find((pack) => String(pack.id) === String(packId)) || getDefaultPurchasePack(product);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + computeLineTotal(item.quantityInPacks, item.costPerPack), 0),
    [items]
  );

  const applySuggestedSalePrices = (line, product, pack, costPerPack) => {
    if (line.salePriceTouched) return line;
    const suggested = suggestSalePricesForPack(product, pack, costPerPack);
    return {
      ...line,
      salePricePerUnit: suggested.salePricePerUnit > 0 ? String(suggested.salePricePerUnit) : '',
      salePricePerPack: suggested.salePricePerPack > 0 ? String(suggested.salePricePerPack) : '',
    };
  };

  const handleSupplierSelect = (nextSupplierId) => {
    onSupplierChange(nextSupplierId);
  };

  const selectProductForLine = (index, product, focusPack = true) => {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? buildLineFromProduct(item, product) : item))
    );

    if (focusPack) {
      setTimeout(() => {
        packSelectsRef.current[index]?.focus();
      }, 80);
    }
  };

  const addProductFromCatalog = (product) => {
    setItems((current) => {
      const emptyIndex = current.findIndex((item) => !item.productId);
      if (emptyIndex >= 0) {
        return current.map((item, index) =>
          index === emptyIndex ? buildLineFromProduct(item, product) : item
        );
      }
      return [...current, buildLineFromProduct(emptyLine(), product)];
    });
  };

  const clearProductForLine = (index) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...emptyLine(), quantityInPacks: item.quantityInPacks || '1' }
          : item
      )
    );
  };

  const updateLine = (index, key, value) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        let next = { ...item, [key]: value };
        const product = findProduct(next.productId);
        const pack = findPack(product, next.purchasePackId);
        const factor = Number(pack?.factor || 1) || 1;

        if (key === 'purchasePackId') {
          next.costPerPack = String(suggestCostPerPack(product, pack) || next.costPerPack || '');
          next.salePriceTouched = false;
          next = applySuggestedSalePrices(next, product, pack, next.costPerPack);
        }

        if (key === 'costPerPack') {
          next = applySuggestedSalePrices(next, product, pack, value);
        }

        if (key === 'salePricePerUnit') {
          next.salePriceTouched = true;
          const unit = Number(value) || 0;
          next.salePricePerPack = unit > 0 ? String(Math.round(unit * factor * 100) / 100) : '';
        }

        if (key === 'salePricePerPack') {
          next.salePriceTouched = true;
          const packPrice = Number(value) || 0;
          next.salePricePerUnit =
            packPrice > 0 && factor > 0 ? String(Math.round((packPrice / factor) * 100) / 100) : '';
        }

        return next;
      })
    );
  };

  const addLine = () => {
    setItems((current) => [...current, emptyLine()]);
  };

  const removeLine = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  useEffect(() => {
    if (items.length > 1) {
      const lastIndex = items.length - 1;
      if (!items[lastIndex]?.productId) {
        setTimeout(() => {
          quantityInputsRef.current[lastIndex]?.focus();
        }, 80);
      }
    }
  }, [items.length, items]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  const supplierLabel = selectedSupplier?.name || selectedSupplier?.companyName || 'Proveedor';

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      icon={PackagePlus}
      title={isEditing ? 'Editar Orden de Compra' : 'Registrar Orden de Compra'}
      subtitle="Define costo y precio de venta por unidad y empaque. Se aplican al recibir en bodega."
      initialSize="xl"
      sizeOptions={['md', 'lg', 'xl', 'full']}
      bodyClassName="bg-[var(--app-surface)] p-0"
      footer={
        <div className="flex flex-col items-end gap-3 px-6 py-4 sm:flex-row sm:items-end sm:justify-end sm:gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
              Inversión Estimada
            </p>
            <p className="text-2xl font-bold tabular-nums text-[var(--app-text)]">{money(total)}</p>
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-[var(--app-border)] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-bg-subtle)] sm:flex-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="purchase-order-form"
              disabled={saving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 sm:flex-none"
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} strokeWidth={2.5} />}
              {isEditing ? 'Guardar cambios' : 'Guardar Orden'}
            </button>
          </div>
        </div>
      }
    >
      <form id="purchase-order-form" onSubmit={handleFormSubmit} className="flex h-full flex-col">
        {/* Bloque superior: metadatos fijos */}
        <section className="sticky top-0 z-10 shrink-0 border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/90 px-4 py-4 backdrop-blur-sm md:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                Proveedor
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => handleSupplierSelect(e.target.value)}
                className={`${ROW_INPUT} cursor-pointer bg-[var(--app-surface)]`}
              >
                <option value="">Seleccionar proveedor...</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name || supplier.companyName}
                  </option>
                ))}
              </select>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                {supplierId
                  ? catalogLoading
                    ? 'Cargando catálogo del proveedor…'
                    : `${supplierProducts.length} producto${supplierProducts.length === 1 ? '' : 's'} asignados a este proveedor`
                  : 'Elige proveedor para habilitar catálogo y búsqueda.'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                Notas de Recepción
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength="255"
                className={`${ROW_INPUT} bg-[var(--app-surface)]`}
                placeholder="Ej. Factura #4452 - Entrega inmediata"
              />
            </div>
          </div>
        </section>

        {/* Bloque central: catálogo + tabla de ítems */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 md:px-6">
          {supplierId ? (
            <PurchaseSupplierCatalog
              supplierName={supplierLabel}
              products={supplierProducts}
              loading={catalogLoading}
              onPickProduct={addProductFromCatalog}
              selectedProductIds={selectedProductIds}
            />
          ) : null}

          <div className="rounded-xl border border-amber-500/25 bg-amber-50/40 px-3 py-2 text-[10px] font-medium text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
            Al <strong>recibir</strong> esta compra se actualiza el <strong>costo</strong> (último/promedio) y los{' '}
            <strong>precios de venta</strong> de la unidad y del empaque indicados aquí.
          </div>

          <section className="space-y-3">
            <label className="block px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
              Desglose de Ítems
            </label>

            <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
              <div className="max-h-[46vh] min-h-[240px] overflow-auto pos-scroll">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/70 text-[10px] font-extrabold uppercase tracking-wider text-[var(--app-text-muted)]">
                      <th className="w-[24%] px-3 py-2.5">Producto</th>
                      <th className="w-[12%] px-2 py-2.5">Empaque</th>
                      <th className="w-[8%] px-2 py-2.5 text-right">Cant.</th>
                      <th className="w-[12%] px-2 py-2.5 text-right">Costo empaque</th>
                      <th className="w-[12%] px-2 py-2.5 text-right">P. venta / UN</th>
                      <th className="w-[12%] px-2 py-2.5 text-right">P. venta empaque</th>
                      <th className="w-[12%] px-2 py-2.5 text-right">Subtotal</th>
                      <th className="w-[40px] px-2 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]/50">
                    {items.map((item, index) => {
                      const product = findProduct(item.productId);
                      const packs = product?.purchasePacks?.length
                        ? product.purchasePacks
                        : [{ id: '', label: 'UN', factor: 1 }];
                      const selectedPack = findPack(product, item.purchasePackId);
                      const lineTotal = computeLineTotal(item.quantityInPacks, item.costPerPack);
                      const unitCost =
                        Number(item.costPerPack || 0) > 0 && Number(selectedPack?.factor || 1) > 0
                          ? Number(item.costPerPack) / Number(selectedPack.factor)
                          : 0;

                      return (
                        <tr key={index} className="align-top transition-all hover:bg-[var(--app-bg-subtle)]/20">
                          <td className="px-3 py-3">
                            <PurchaseProductPicker
                              supplierId={supplierId}
                              supplierProducts={supplierProducts}
                              productId={item.productId}
                              productSearch={item.productSearch}
                              disabled={!supplierId}
                              inputClassName={ROW_INPUT}
                              onSelect={(candidate) => selectProductForLine(index, candidate)}
                              onSearchChange={(value) => updateLine(index, 'productSearch', value)}
                              onClear={() => clearProductForLine(index)}
                            />
                            {item.productId && product && (
                              <div className="mt-1 text-[9px] font-semibold text-[var(--app-text-muted)]">
                                Margen mín. {Number(product.minMarginPercent ?? 20)}%
                              </div>
                            )}
                          </td>

                          <td className="px-2 py-3">
                            <select
                              required
                              ref={(el) => {
                                packSelectsRef.current[index] = el;
                              }}
                              value={item.purchasePackId}
                              onChange={(e) => updateLine(index, 'purchasePackId', e.target.value)}
                              disabled={!item.productId}
                              className={`${ROW_INPUT} cursor-pointer`}
                            >
                              <option value="">Empaque...</option>
                              {packs.map((pack) => (
                                <option key={pack.id || pack.label} value={pack.id || ''}>
                                  {pack.label} ({pack.factor} u)
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-2 py-3">
                            <input
                              type="number"
                              ref={(el) => {
                                quantityInputsRef.current[index] = el;
                              }}
                              min="0.01"
                              step="0.01"
                              required
                              value={item.quantityInPacks}
                              onChange={(e) => updateLine(index, 'quantityInPacks', e.target.value)}
                              disabled={!item.productId}
                              className={ROW_NUMBER_INPUT}
                            />
                            {item.productId && (
                              <div className="mt-1 truncate text-right text-[9px] text-[var(--app-text-muted)]">
                                {formatPackSummary(item.quantityInPacks, selectedPack?.label, selectedPack?.factor)}
                              </div>
                            )}
                          </td>

                          <td className="px-2 py-3">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              required
                              value={item.costPerPack}
                              onChange={(e) => updateLine(index, 'costPerPack', e.target.value)}
                              disabled={!item.productId}
                              placeholder="C$ 0.00"
                              className={ROW_NUMBER_INPUT}
                            />
                            {unitCost > 0 && (
                              <div className="mt-1 text-right text-[9px] font-bold text-emerald-600">
                                = {money(unitCost)}/UN costo
                              </div>
                            )}
                          </td>

                          <td className="px-2 py-3">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              required
                              value={item.salePricePerUnit}
                              onChange={(e) => updateLine(index, 'salePricePerUnit', e.target.value)}
                              disabled={!item.productId}
                              placeholder="C$ 0.00"
                              className={`${ROW_NUMBER_INPUT} border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20`}
                            />
                            <div className="mt-1 text-right text-[9px] font-bold text-blue-700 dark:text-blue-300">
                              Venta unidad
                            </div>
                          </td>

                          <td className="px-2 py-3">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              required
                              value={item.salePricePerPack}
                              onChange={(e) => updateLine(index, 'salePricePerPack', e.target.value)}
                              disabled={!item.productId}
                              placeholder="C$ 0.00"
                              className={`${ROW_NUMBER_INPUT} border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20`}
                            />
                            <div className="mt-1 text-right text-[9px] font-bold text-blue-700 dark:text-blue-300">
                              Venta {selectedPack?.label || 'empaque'}
                            </div>
                          </td>

                          <td className="px-2 py-3 text-right tabular-nums">
                            {item.productId ? (
                              <>
                                <div className="flex h-10 items-center justify-end text-sm font-bold text-[var(--app-text)]">
                                  {money(lineTotal)}
                                </div>
                                {selectedPack?.factor > 1 && Number(item.quantityInPacks) > 0 && (
                                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] font-bold text-[var(--app-primary)]">
                                    <ArrowRight size={8} />
                                    <span>{computeBaseUnits(item.quantityInPacks, selectedPack.factor)} UN</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex h-10 items-center justify-end text-xs italic text-[var(--app-text-muted)]">
                                —
                              </div>
                            )}
                          </td>

                          <td className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              disabled={items.length === 1}
                              className="mt-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-[var(--app-text-muted)] transition-all hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30"
                              title="Eliminar fila"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addLine}
                disabled={!supplierId}
                className="flex w-full cursor-pointer items-center gap-2 border-t border-dashed border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30 px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-[var(--app-primary)] transition-colors hover:bg-[var(--app-bg-subtle)]/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={14} strokeWidth={3} />
                Añadir fila
              </button>
            </div>
          </section>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default PurchaseFormModal;
