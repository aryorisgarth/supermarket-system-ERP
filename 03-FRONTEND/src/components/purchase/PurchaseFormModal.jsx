import React, { useMemo, useCallback } from 'react';
import { PackagePlus, X, Plus, Trash2, Loader2, Save } from 'lucide-react';
import {
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

  const addLine = () => setItems((current) => [...current, emptyLine()]);
  const removeLine = (index) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const handleFormSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-4xl w-full overflow-hidden">
        <div className="p-6 bg-[var(--app-primary)] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PackagePlus size={22} strokeWidth={2.5} />
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider">Registrar Orden de Compra</h3>
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

        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 bg-[var(--app-surface)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
                Proveedor
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => handleSupplierSelect(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-black text-[var(--app-text)] cursor-pointer transition-all"
              >
                <option value="">Seleccionar proveedor...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.companyName}
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-medium text-[var(--app-text-muted)]">
                {supplierId
                  ? `${supplierProducts.length} producto(s) en el catalogo de este proveedor`
                  : 'Primero elige proveedor; solo veras sus productos.'}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
                Notas de Recepción
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength="255"
                className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-[var(--app-text)] transition-all"
                placeholder="Ej. Factura #4452 - Entrega inmediata"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
                Desglose de Productos
              </label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1.5 text-[9px] font-black text-[var(--app-primary)] uppercase hover:opacity-70"
              >
                <Plus size={12} strokeWidth={3} /> Añadir Linea
              </button>
            </div>

            <div className="max-h-[35vh] overflow-y-auto pos-scroll space-y-3 pr-2">
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
                  <div
                    key={index}
                    className="flex flex-col gap-3 bg-[var(--app-bg-subtle)]/50 p-4 rounded-2xl border border-[var(--app-border)] relative group transition-all hover:border-[var(--app-primary)]/30"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-1.5 relative">
                        <label className="text-[8px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">
                          Producto del proveedor
                        </label>
                        <input
                          type="text"
                          value={item.productSearch}
                          onChange={(e) => updateLine(index, 'productSearch', e.target.value)}
                          placeholder={supplierId ? 'Buscar por nombre...' : 'Selecciona proveedor primero'}
                          disabled={!supplierId}
                          className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[11px] font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50"
                        />
                        {supplierId && search && filteredProducts.length > 0 && !item.productId && (
                          <div className="absolute z-20 left-0 right-0 top-full mt-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg overflow-hidden">
                            {filteredProducts.map((candidate) => (
                              <button
                                key={candidate.id}
                                type="button"
                                onClick={() => selectProductForLine(index, candidate)}
                                className="w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-[var(--app-bg-subtle)]"
                              >
                                {candidate.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.productId && product && (
                          <p className="text-[10px] font-medium text-[var(--app-text-muted)]">
                            SKU venta: {product.barcode}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-32 space-y-1.5">
                        <label className="text-[8px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">
                          Presentacion
                        </label>
                        <select
                          required
                          value={item.purchasePackId}
                          onChange={(e) => updateLine(index, 'purchasePackId', e.target.value)}
                          disabled={!item.productId}
                          className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[11px] font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all cursor-pointer disabled:opacity-50"
                        >
                          <option value="">Empaque...</option>
                          {packs.map((pack) => (
                            <option key={pack.id || pack.label} value={pack.id || ''}>
                              {pack.label} ({pack.factor} u)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-24 space-y-1.5">
                        <label className="text-[8px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">
                          Cant. empaques
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          value={item.quantityInPacks}
                          onChange={(e) => updateLine(index, 'quantityInPacks', e.target.value)}
                          disabled={!item.productId}
                          className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[11px] font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50"
                        />
                      </div>
                      <div className="w-full md:w-32 space-y-1.5">
                        <label className="text-[8px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">
                          Precio / empaque
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          value={item.costPerPack}
                          onChange={(e) => updateLine(index, 'costPerPack', e.target.value)}
                          disabled={!item.productId}
                          className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[11px] font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50"
                        />
                      </div>
                      <div className="flex items-end pb-0.5">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          disabled={items.length === 1}
                          className="h-9 w-9 rounded-xl text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30"
                        >
                          <Trash2 size={16} strokeWidth={2.5} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                    {item.productId && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--app-surface)] px-3 py-2 text-[10px] font-bold text-[var(--app-text-muted)]">
                        <span>
                          {formatPackSummary(item.quantityInPacks, selectedPack?.label, selectedPack?.factor)}
                        </span>
                        <span className="text-[var(--app-primary)]">Linea: {money(lineTotal)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-5 border-t border-[var(--app-border)] flex flex-col md:flex-row justify-between items-center gap-5">
            <div className="text-left">
              <p className="text-[9px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">
                Inversión Estimada
              </p>
              <p className="text-2xl font-black text-[var(--app-text)]">{money(total)}</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 md:flex-none px-6 py-3 border border-[var(--app-border)] text-[var(--app-text-soft)] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[var(--app-bg-subtle)] transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 md:flex-none px-8 py-3 bg-[var(--app-primary)] text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
