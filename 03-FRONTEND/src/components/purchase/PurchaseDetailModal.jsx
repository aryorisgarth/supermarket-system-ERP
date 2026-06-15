import React from 'react';
import { X, FileDown, PackageCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PurchaseDetailModal = ({ order, onClose, money }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-2xl shadow-2xl border border-[var(--app-border)] max-w-3xl w-full overflow-hidden">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider">{order.orderNumber}</h3>
            <p className="text-xs text-white/70 mt-1 font-bold">{order.supplierName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const doc = new jsPDF();
                doc.setFontSize(16);
                doc.text(`Orden de Compra: ${order.orderNumber}`, 14, 15);
                doc.setFontSize(10);
                doc.text(`Proveedor: ${order.supplierName}`, 14, 22);
                doc.text(`Fecha de emisión: ${new Date(order.createdAt).toLocaleString()}`, 14, 28);
                
                const tableData = (order.items || []).map(item => [
                  item.product?.name || '',
                  item.packLabel ? `${item.quantityInPacks} ${item.packLabel}` : `${item.quantityOrdered} UN`,
                  item.quantityOrdered,
                  item.quantityReceived,
                  money(item.unitCost),
                  money(item.lineTotal)
                ]);

                doc.autoTable({
                  startY: 35,
                  head: [['Producto', 'Compra', 'Uds. Inv.', 'Recibido', 'Costo/Ud', 'Total']],
                  body: tableData,
                  theme: 'striped',
                  styles: { fontSize: 8 },
                  headStyles: { fillColor: [41, 128, 185] }
                });

                const finalY = doc.lastAutoTable.finalY || 35;
                doc.setFontSize(12);
                doc.text(`Total Facturación: ${money(order.subtotal)}`, 14, finalY + 10);
                doc.save(`PO_${order.orderNumber}.pdf`);
              }}
              className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors text-xs font-bold"
            >
              <FileDown size={14} /> PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-5 max-h-[65vh] overflow-y-auto pos-scroll bg-[var(--app-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)] border-b border-[var(--app-border)]">
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
                  <td className="py-3 font-bold text-[var(--app-text)]">{item.product?.name}</td>
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
                  <td className="py-3 text-right font-bold text-[var(--app-text)]">{money(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {order.items && order.items.length > 0 && (
            <div className="mt-8 border-t border-[var(--app-border)] pt-5">
              <div className="flex items-center gap-2 mb-4">
                <PackageCheck className="text-[var(--app-text)]" size={16} />
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--app-text)]">
                  Resumen de Recepción en Bodega
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {order.items.map((line) => {
                  const isPack = line.unitsPerPack > 1;
                  return (
                    <div key={line.id} className="p-3 bg-[var(--app-bg-subtle)]/30 rounded-xl border border-[var(--app-border)] text-xs text-[var(--app-text)] space-y-2">
                      <p className="font-extrabold text-[11px] border-b border-[var(--app-border)] pb-1.5">
                        {line.product?.name}
                      </p>
                      <p className="leading-relaxed">
                        Bodega recibirá <strong>{line.quantityInPacks || line.quantityOrdered} {line.packLabel === 'UN' ? 'unidades sueltas' : (line.packLabel || 'UN').toUpperCase()}</strong>.
                      </p>
                      {isPack && (
                        <p className="leading-relaxed text-[10px] text-[var(--app-text-soft)]">
                          Presentación trae <strong>{line.unitsPerPack} unidades base</strong>, sumando un total de <strong>{line.quantityOrdered} unidades al inventario</strong>.
                        </p>
                      )}
                      <div className="bg-[var(--app-surface)] p-2 rounded text-[10px] mt-2 font-medium border border-[var(--app-border)]/50">
                        Código a escanear: <code className="bg-[var(--app-bg-subtle)] px-1 py-0.5 rounded font-mono font-bold text-[11px] select-all border border-[var(--app-border)]">{line.product?.barcode || '—'}</code>
                        <div className="mt-1.5 flex flex-col gap-0.5 border-t border-[var(--app-border)]/50 pt-1.5">
                          <span className="flex justify-between items-center text-[var(--app-text-soft)]">
                            <span>1 Escaneo:</span> <strong className="text-[var(--app-primary)]">+{line.unitsPerPack || 1} unid.</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="p-5 bg-[var(--app-bg-subtle)]/50 border-t border-[var(--app-border)] flex justify-between items-center">
          <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
            Total de Facturación
          </p>
          <p className="text-xl font-bold text-[var(--app-primary)]">{money(order.subtotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;
