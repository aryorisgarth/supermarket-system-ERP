import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { PackagePlus, X, Plus, Trash2, Loader2, Save, ArrowRight } from 'lucide-react';
import {
  computeBaseUnits,
  computeLineTotal,
  formatPackSummary,
  getDefaultPurchasePack,
  suggestCostPerPack,
} from '../../utils/purchaseUnits';

const emptyLine = () => ({
  productId: '',
  productSearch: '',
  purchasePackId: '',
  quantityInPacks: '1',
  costPerPack: '',
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

  const handleSupplierSelect = (nextSupplierId) => {
    onSupplierChange(nextSupplierId);
  };

  const selectProductForLine = (index, product) => {
    const defaultPack = getDefaultPurchasePack(product);
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          productId: String(product.id),
          productSearch: product.name,
          purchasePackId: defaultPack.id ? String(defaultPack.id) : '',
          quantityInPacks: '1',
          costPerPack: String(suggestCostPerPack(product, defaultPack) || ''),
        };
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
        const next = { ...item, [key]: value };
        if (key === 'purchasePackId') {
          const product = findProduct(next.productId);
          const pack = findPack(product, value);
          next.costPerPack = String(suggestCostPerPack(product, pack) || next.costPerPack || '');
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-7xl w-full overflow-hidden">
        {}
        <div className="p-5 bg-[var(--app-primary)] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PackagePlus size={22} strokeWidth={2.5} />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider">Registrar Orden de Compra</h3>
              <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-0.5">
                Entrada de stock a bodega SuperNova
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 bg-[var(--app-surface)]">
          {}
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

          {}
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
                <Plus size={11} strokeWidth={3} /> Añadir Fila (Tab/Enter)
              </button>
            </div>

            {}
            <div className="border border-[var(--app-border)] rounded-2xl overflow-hidden bg-[var(--app-surface)] shadow-sm">
              <div className="max-h-[50vh] min-h-[300px] overflow-y-auto pos-scroll">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/70 text-[10px] font-extrabold uppercase tracking-wider text-[var(--app-text-muted)]">
                      <th className="py-2.5 px-4 w-[42%]">Producto del Proveedor</th>
                      <th className="py-2.5 px-3 w-[18%]">Presentación (Empaque)</th>
                      <th className="py-2.5 px-3 w-[12%]">Cantidad</th>
                      <th className="py-2.5 px-3 w-[14%]">Costo Unit.</th>
                      <th className="py-2.5 px-4 w-[14%] text-right">Subtotal</th>
                      <th className="py-2.5 px-2 w-[40px] text-center"></th>
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

                      return (
                        <tr
                          key={index}
                          className="hover:bg-[var(--app-bg-subtle)]/20 transition-all align-top"
                        >
                          {}
                          <td className={`py-3 px-4 relative overflow-visible ${focusedIndex === index ? 'z-30' : 'z-10'}`}>
                            <input
                              type="text"
                              ref={(el) => (productInputsRef.current[index] = el)}
                              value={item.productSearch}
                              onChange={(e) => updateLine(index, 'productSearch', e.target.value)}
                              onFocus={() => setFocusedIndex(index)}
                              onBlur={() => setFocusedIndex(null)}
                              placeholder={supplierId ? 'Escribe o selecciona producto...' : 'Selecciona proveedor...'}
                              disabled={!supplierId}
                              className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50"
                            />
                            
                            {}
                            {supplierId && focusedIndex === index && filteredProducts.length > 0 && !item.productId && (
                              <div className="absolute z-50 left-4 right-4 top-full mt-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                                {filteredProducts.map((candidate) => (
                                  <button
                                    key={candidate.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      selectProductForLine(index, candidate);
                                      setFocusedIndex(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-[var(--app-bg-subtle)] border-b border-[var(--app-border)]/40 last:border-0 transition-colors flex flex-col gap-0.5 cursor-pointer"
                                  >
                                    <span className="text-xs font-bold text-[var(--app-text)]">{candidate.name}</span>
                                    <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase">
                                      Cod: {candidate.barcode} · {candidate.category?.name || 'Abarrotes'}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {item.productId && product && (
                              <div className="mt-1 flex gap-2 text-[10px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider pl-1">
                                <span>Cod: {product.barcode}</span>
                                <span>·</span>
                                <span>{product.category?.name || 'General'}</span>
                              </div>
                            )}
                          </td>

                          {}
                          <td className="py-3 px-3">
                            <select
                              required
                              ref={(el) => (packSelectsRef.current[index] = el)}
                              value={item.purchasePackId}
                              onChange={(e) => updateLine(index, 'purchasePackId', e.target.value)}
                              disabled={!item.productId}
                              className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-2 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all cursor-pointer disabled:opacity-50"
                            >
                              <option value="">Empaque...</option>
                              {packs.map((pack) => (
                                <option key={pack.id || pack.label} value={pack.id || ''}>
                                  {pack.label} ({pack.factor} u)
                                </option>
                              ))}
                            </select>
                          </td>

                          {}
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              ref={(el) => (quantityInputsRef.current[index] = el)}
                              min="0.01"
                              step="0.01"
                              required
                              value={item.quantityInPacks}
                              onChange={(e) => updateLine(index, 'quantityInPacks', e.target.value)}
                              disabled={!item.productId}
                              className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50"
                            />
                            {item.productId && (
                              <div className="mt-1 pl-1 text-[10px] font-semibold text-[var(--app-text-muted)] lowercase text-ellipsis overflow-hidden whitespace-nowrap">
                                {formatPackSummary(item.quantityInPacks, selectedPack?.label, selectedPack?.factor)}
                              </div>
                            )}
                          </td>

                          {}
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              required
                              value={item.costPerPack}
                              onChange={(e) => updateLine(index, 'costPerPack', e.target.value)}
                              disabled={!item.productId}
                              className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50"
                            />
                            {item.productId && item.costPerPack && selectedPack?.factor > 1 && (
                              <div className="mt-1 pl-1 text-[9px] font-bold text-emerald-600">
                                = {money(Number(item.costPerPack) / Number(selectedPack.factor))}/UN
                              </div>
                            )}
                          </td>

                          {}
                          <td className="py-3 px-4 text-right tabular-nums">
                            {item.productId ? (
                              <>
                                <div className="font-bold text-sm text-[var(--app-text)] pt-1.5">
                                  {money(lineTotal)}
                                </div>
                                {selectedPack?.factor > 1 && Number(item.quantityInPacks) > 0 && (
                                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] font-bold text-[var(--app-primary)]">
                                    <ArrowRight size={8} />
                                    <span>{computeBaseUnits(item.quantityInPacks, selectedPack.factor)} UN al stock</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-[var(--app-text-muted)] italic pt-1.5">—</div>
                            )}
                          </td>

                          {}
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
                <div className="h-64"></div>
              </div>
            </div>
          </div>

          {}
          <div className="pt-4 border-t border-[var(--app-border)] flex flex-col md:flex-row justify-between items-center gap-5">
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
                Guardar Orden
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseFormModal;
