import React from 'react';
import { X } from 'lucide-react';

const PurchaseDetailModal = ({ order, onClose, money }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-2xl shadow-2xl border border-[var(--app-border)] max-w-3xl w-full overflow-hidden">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider">{order.orderNumber}</h3>
            <p className="text-xs text-white/70 mt-1 font-bold">{order.supplierName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[65vh] overflow-y-auto pos-scroll bg-[var(--app-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)] border-b border-[var(--app-border)]">
              <tr>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Compra</th>
                <th className="pb-3 text-center">Uds. inventario</th>
                <th className="pb-3 text-center">Recibido</th>
                <th className="pb-3 text-right">Costo/ud</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-black text-[var(--app-text)]">{item.product?.name}</td>
                  <td className="py-3 text-[11px] font-bold text-[var(--app-text-soft)]">
                    {item.quantityInPacks != null && item.packLabel
                      ? `${item.quantityInPacks} ${item.packLabel}${
                          item.unitsPerPack ? ` (${item.unitsPerPack} u/empaque)` : ''
                        }`
                      : `${item.quantityOrdered} UN`}
                  </td>
                  <td className="py-3 text-center font-bold text-[var(--app-text-soft)]">{item.quantityOrdered}</td>
                  <td className="py-3 text-center font-bold text-[var(--app-text-soft)]">{item.quantityReceived}</td>
                  <td className="py-3 text-right font-bold text-[var(--app-text-soft)]">{money(item.unitCost)}</td>
                  <td className="py-3 text-right font-black text-[var(--app-text)]">{money(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-5 bg-[var(--app-bg-subtle)]/50 border-t border-[var(--app-border)] flex justify-between items-center">
          <p className="text-[10px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">
            Total de Facturación
          </p>
          <p className="text-xl font-black text-[var(--app-primary)]">{money(order.subtotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;
