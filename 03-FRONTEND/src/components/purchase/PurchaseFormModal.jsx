import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  onSupplierChange,
  onSubmit,
  money,
  isEditing = false,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const productInputsRef = useRef([]);
  const packSelectsRef = useRef([]);
  const quantityInputsRef = useRef([]);

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

  const selectProductForLine = (index, product) => {
    const defaultPack = getDefaultPurchasePack(product);
    const costPerPack = String(suggestCostPerPack(product, defaultPack) || '');
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const next = {
          ...item,
          productId: String(product.id),
          productSearch: product.name,
          purchasePackId: defaultPack.id ? String(defaultPack.id) : '',
          quantityInPacks: '1',
          costPerPack,
          salePriceTouched: false,
        };
        return applySuggestedSalePrices(next, product, defaultPack, costPerPack);
      })
    );

    setTimeout(() => {
      packSelectsRef.current[index]?.focus();
    }, 80);
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
      setTimeout(() => {
        productInputsRef.current[lastIndex]?.focus();
      }, 80);
    }
  }, [items.length]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      icon={PackagePlus}
      title={isEditing ? 'Editar Orden de Compra' : 'Registrar Orden de Compra'}
      subtitle="Define costo y precio de venta por unidad y empaque. Se aplican al recibir en bodega."
      initialSize="xl"
      sizeOptions={['lg', 'xl', 'full']}
      bodyClassName="bg-[var(--app-surface)]"
    >
      <form onSubmit={handleFormSubmit} className="flex h-full flex-col bg-[var(--app-surface)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                Proveedor
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => handleSupplierSelect(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-[var(--app-text)] cursor-pointer transition-all"
              >
                <option value="">Seleccionar proveedor...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.companyName}
                  </option>
                ))}
              </select>
              <p className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider mt-0.5">
                {supplierId
                  ? `${supplierProducts.length} productos disponibles`
                  : 'Elige proveedor para habilitar la búsqueda de productos.'}
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
                className="w-full px-3 py-2 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-[var(--app-text)] transition-all"
                placeholder="Ej. Factura #4452 - Entrega inmediata"
              />
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/25 bg-amber-50/40 dark:bg-amber-950/20 px-3 py-2 text-[10px] font-medium text-amber-900 dark:text-amber-200">
            Al <strong>recibir</strong> esta compra: se actualiza el <strong>costo</strong> (último/promedio)
            y los <strong>precios de venta</strong> de la unidad y del empaque que indiques aquí.
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                Desglose de Ítems
              </label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--app-primary-soft)]/20 text-[10px] font-extrabold text-[var(--app-primary)] uppercase hover:opacity-85 rounded-lg border border-[var(--app-primary)]/10 cursor-pointer"
              >
                <Plus size={11} strokeWidth={3} /> Añadir Fila
              </button>
            </div>

            <div className="border border-[var(--app-border)] rounded-2xl overflow-hidden bg-[var(--app-surface)] shadow-sm">
              <div className="max-h-[55vh] min-h-[300px] overflow-y-auto pos-scroll">
                <table className="w-full text-left border-collapse min-w-[980px]">
                  <thead>
                    <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/70 text-[10px] font-extrabold uppercase tracking-wider text-[var(--app-text-muted)]">
                      <th className="py-2.5 px-3 w-[22%]">Producto</th>
                      <th className="py-2.5 px-2 w-[12%]">Empaque</th>
                      <th className="py-2.5 px-2 w-[8%]">Cant.</th>
                      <th className="py-2.5 px-2 w-[12%]">Costo empaque</th>
                      <th className="py-2.5 px-2 w-[12%]">P. venta / UN</th>
                      <th className="py-2.5 px-2 w-[12%]">P. venta empaque</th>
                      <th className="py-2.5 px-2 w-[12%] text-right">Subtotal</th>
                      <th className="py-2.5 px-2 w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]/50">
                    {items.map((item, index) => {
                      const product = findProduct(item.productId);
                      const packs = product?.purchasePacks?.length
                        ? product.purchasePacks
                        : [{ id: '', label: 'UN', factor: 1 }];
                      const selectedPack = findPack(product, item.purchasePackId);
                      const search = (item.productSearch || '').trim().toLowerCase();
                      const filteredProducts = supplierProducts
                        .filter((candidate) => {
                          if (!search) return true;
                          return (
                            candidate.name?.toLowerCase().includes(search) ||
                            candidate.barcode?.toLowerCase().includes(search)
                          );
                        })
                        .slice(0, 8);
                      const lineTotal = computeLineTotal(item.quantityInPacks, item.costPerPack);
                      const unitCost =
                        Number(item.costPerPack || 0) > 0 && Number(selectedPack?.factor || 1) > 0
                          ? Number(item.costPerPack) / Number(selectedPack.factor)
                          : 0;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-[var(--app-bg-subtle)]/20 transition-all align-top"
                        >
                          <td className={`py-3 px-3 relative overflow-visible ${focusedIndex === index ? 'z-30' : 'z-10'}`}>
                            <input
                              type="text"
                              ref={(el) => (productInputsRef.current[index] = el)}
                              value={item.productSearch}
                              onChange={(e) => updateLine(index, 'productSearch', e.target.value)}
                              onFocus={() => setFocusedIndex(index)}
                              onBlur={() => setFocusedIndex(null)}
                              placeholder={supplierId ? 'Producto...' : 'Selecciona proveedor...'}
                              disabled={!supplierId}
                              className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50"
                            />
                            {supplierId && focusedIndex === index && filteredProducts.length > 0 && !item.productId && (
                              <div className="absolute z-50 left-3 right-3 top-full mt-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                                {filteredProducts.map((candidate) => (
                                  <button
                                    key={candidate.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      selectProductForLine(index, candidate);
                                      setFocusedIndex(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-[var(--app-bg-subtle)] border-b border-[var(--app-border)]/40 last:border-0 cursor-pointer"
                                  >
                                    <span className="text-[var(--app-text)]">{candidate.name}</span>
                                    <span className="block text-[10px] text-[var(--app-text-muted)]">
                                      Cod: {candidate.barcode}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {item.productId && product && (
                              <div className="mt-1 text-[9px] font-semibold text-[var(--app-text-muted)]">
                                Margen mín. {Number(product.minMarginPercent ?? 20)}%
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-2">
                            <select
                              required
                              ref={(el) => (packSelectsRef.current[index] = el)}
                              value={item.purchasePackId}
                              onChange={(e) => updateLine(index, 'purchasePackId', e.target.value)}
                              disabled={!item.productId}
                              className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-2 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] cursor-pointer disabled:opacity-50"
                            >
                              <option value="">Empaque...</option>
                              {packs.map((pack) => (
                                <option key={pack.id || pack.label} value={pack.id || ''}>
                                  {pack.label} ({pack.factor} u)
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-3 px-2">
                            <input
                              type="number"
                              ref={(el) => (quantityInputsRef.current[index] = el)}
                              min="0.01"
                              step="0.01"
                              required
                              value={item.quantityInPacks}
                              onChange={(e) => updateLine(index, 'quantityInPacks', e.target.value)}
                              disabled={!item.productId}
                              className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-2 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] disabled:opacity-50"
                            />
                            {item.productId && (
                              <div className="mt-1 text-[9px] text-[var(--app-text-muted)] truncate">
                                {formatPackSummary(item.quantityInPacks, selectedPack?.label, selectedPack?.factor)}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              required
                              value={item.costPerPack}
                              onChange={(e) => updateLine(index, 'costPerPack', e.target.value)}
                              disabled={!item.productId}
                              className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-2 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] disabled:opacity-50"
                            />
                            {unitCost > 0 && (
                              <div className="mt-1 text-[9px] font-bold text-emerald-600">
                                = {money(unitCost)}/UN costo
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              required
                              value={item.salePricePerUnit}
                              onChange={(e) => updateLine(index, 'salePricePerUnit', e.target.value)}
                              disabled={!item.productId}
                              className="w-full bg-[var(--app-surface)] border border-blue-500/30 rounded-lg px-2 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-blue-500 disabled:opacity-50"
                            />
                            <div className="mt-1 text-[9px] text-blue-700 dark:text-blue-300 font-bold">
                              Venta unidad
                            </div>
                          </td>

                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              required
                              value={item.salePricePerPack}
                              onChange={(e) => updateLine(index, 'salePricePerPack', e.target.value)}
                              disabled={!item.productId}
                              className="w-full bg-[var(--app-surface)] border border-blue-500/30 rounded-lg px-2 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-blue-500 disabled:opacity-50"
                            />
                            <div className="mt-1 text-[9px] text-blue-700 dark:text-blue-300 font-bold">
                              Venta {selectedPack?.label || 'empaque'}
                            </div>
                          </td>

                          <td className="py-3 px-2 text-right tabular-nums">
                            {item.productId ? (
                              <>
                                <div className="font-bold text-sm text-[var(--app-text)] pt-1.5">
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
                              <div className="text-xs text-[var(--app-text-muted)] italic pt-1.5">—</div>
                            )}
                          </td>

                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              disabled={items.length === 1}
                              className="h-8 w-8 mt-0.5 rounded-lg text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30 cursor-pointer"
                              title="Eliminar fila"
                            >
                              <Trash2 size={14} strokeWidth={2.5} className="mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="h-40"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-6 pt-4 border-t border-[var(--app-border)] flex flex-col md:flex-row justify-between items-center gap-5 pb-6">
          <div className="text-left">
            <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
              Inversión Estimada
            </p>
            <p className="text-2xl font-bold text-[var(--app-text)]">{money(total)}</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-2.5 border border-[var(--app-border)] text-[var(--app-text-soft)] font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 md:flex-none px-8 py-2.5 bg-[var(--app-primary)] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Save size={14} strokeWidth={2.5} />
              )}{' '}
              {isEditing ? 'Guardar cambios' : 'Guardar Orden'}
            </button>
          </div>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default PurchaseFormModal;
