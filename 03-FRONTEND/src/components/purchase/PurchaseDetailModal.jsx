import React from 'react';
import { FileDown, PackageCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ResponsiveModal from '../ui/ResponsiveModal';

const PurchaseDetailModal = ({ order, onClose, money }) => {
  if (!order) return null;

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Orden de Compra: ${order.orderNumber}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Proveedor: ${order.supplierName}`, 14, 22);
    doc.text(`Fecha de emisión: ${new Date(order.createdAt).toLocaleString()}`, 14, 28);

    const tableData = (order.items || []).map((item) => [
      item.product?.name || '',
      item.packLabel ? `${item.quantityInPacks} ${item.packLabel}` : `${item.quantityOrdered} UN`,
      item.quantityOrdered,
      item.quantityReceived,
      item.quantityRejected || 0,
      money(item.unitCost),
      money(item.lineTotal),
    ]);

    doc.autoTable({
      startY: 35,
      head: [['Producto', 'Compra', 'Uds. Inv.', 'Recibido', 'Rechazado', 'Costo/Ud', 'Total']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = doc.lastAutoTable.finalY || 35;
    doc.setFontSize(12);
    doc.text(`Total Facturación: ${money(order.subtotal)}`, 14, finalY + 10);
    doc.save(`PO_${order.orderNumber}.pdf`);
  };

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      title={order.orderNumber}
      subtitle={order.supplierName}
      initialSize="lg"
      sizeOptions={['md', 'lg', 'xl', 'full']}
      headerClassName="bg-slate-900 text-white"
      headerActions={
        <button
          type="button"
          onClick={exportPdf}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold transition-colors hover:bg-white/10"
        >
          <FileDown size={14} /> PDF
        </button>
      }
      footer={
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
            Total de Facturación
          </p>
          <p className="text-xl font-bold text-[var(--app-primary)]">{money(order.subtotal)}</p>
        </div>
      }
    >
      <div className="space-y-6 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-[var(--app-border)] text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
              <tr>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Compra</th>
                <th className="pb-3 text-center">Uds. inventario</th>
                <th className="pb-3 text-center">Recibido</th>
                <th className="pb-3 text-center">Rechazado</th>
                <th className="pb-3 text-right">Costo/ud</th>
                <th className="pb-3 text-right">Venta/ud</th>
                <th className="pb-3 text-right">Venta empaque</th>
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
                  <td className="py-3 text-center font-bold text-amber-700">{item.quantityRejected || 0}</td>
                  <td className="py-3 text-right font-bold text-[var(--app-text-soft)]">{money(item.unitCost)}</td>
                  <td className="py-3 text-right font-bold text-blue-700 dark:text-blue-300">
                    {item.salePricePerUnit != null ? money(item.salePricePerUnit) : '—'}
                  </td>
                  <td className="py-3 text-right font-bold text-blue-700 dark:text-blue-300">
                    {item.salePricePerPack != null ? money(item.salePricePerPack) : '—'}
                  </td>
                  <td className="py-3 text-right font-bold text-[var(--app-text)]">{money(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="border-t border-[var(--app-border)] pt-5">
            <div className="mb-4 flex items-center gap-2">
              <PackageCheck className="text-[var(--app-text)]" size={16} />
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--app-text)]">
                Resumen de Recepción en Bodega
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {order.items.map((line) => {
                const isPack = line.unitsPerPack > 1;
                return (
                  <div
                    key={line.id}
                    className="space-y-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30 p-3 text-xs text-[var(--app-text)]"
                  >
                    <p className="border-b border-[var(--app-border)] pb-1.5 text-[11px] font-extrabold">
                      {line.product?.name}
                    </p>
                    <p className="leading-relaxed">
                      Bodega recibirá{' '}
                      <strong>
                        {line.quantityInPacks || line.quantityOrdered}{' '}
                        {line.packLabel === 'UN' ? 'unidades sueltas' : (line.packLabel || 'UN').toUpperCase()}
                      </strong>
                      .
                    </p>
                    {isPack && (
                      <p className="text-[10px] leading-relaxed text-[var(--app-text-soft)]">
                        Presentación trae <strong>{line.unitsPerPack} unidades base</strong>, sumando un total de{' '}
                        <strong>{line.quantityOrdered} unidades al inventario</strong>.
                      </p>
                    )}
                    <div className="mt-2 rounded border border-[var(--app-border)]/50 bg-[var(--app-surface)] p-2 text-[10px] font-medium">
                      Código a escanear:{' '}
                      <code className="select-all rounded border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-1 py-0.5 font-mono text-[11px] font-bold">
                        {line.product?.barcode || '—'}
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
};

export default PurchaseDetailModal;
