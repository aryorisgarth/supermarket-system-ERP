import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Building2,
  User,
} from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';
import ResponsiveModal from '../ui/ResponsiveModal';

const METHOD_LABEL = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', COUPON: 'Cupón', MIXED: 'Mixto' };
const fmt = (d) =>
  d
    ? new Date(d).toLocaleString('es-NI', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const ElectronicInvoiceModal = ({ invoice, onClose }) => {
  const printRef = useRef();

  if (!invoice) return null;

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const w = window.open('', '_blank', 'width=800,height=900');
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Factura Electrónica ${invoice.invoiceNumber}</title>
      <style>
        body{font-family:sans-serif;font-size:11px;color:#111;margin:0;padding:16px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
        th{background:#f3f4f6;font-weight:700;font-size:10px;text-transform:uppercase}
        .section{margin-bottom:14px}
        .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:#fef3c7;color:#92400e;border:1px solid #fcd34d}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .qr-wrap{text-align:center}
        h1{font-size:16px;margin:0}h2{font-size:12px;margin:4px 0}
        p{margin:2px 0}
      </style></head><body>${content}</body></html>`);
    w.document.close();
    w.print();
  };

  const isTest = invoice.environment === 'TEST';

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      icon={FileText}
      title="Factura Electrónica"
      subtitle="Documento tributario simulado — DGI Nicaragua"
      initialSize="lg"
      sizeOptions={['md', 'lg', 'xl', 'full']}
      headerClassName="bg-[var(--app-primary)] text-white"
      headerActions={
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
        >
          <Printer size={13} /> Imprimir
        </button>
      }
      bodyClassName="p-4 md:p-6"
    >
      <div ref={printRef} className="space-y-5 text-[var(--app-text)]">
        {isTest && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-800">
            <AlertTriangle size={14} /> DOCUMENTO EN AMBIENTE DE PRUEBA — No tiene validez fiscal
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 border-b border-[var(--app-border)] pb-4 md:grid-cols-3">
          <div className="space-y-1 md:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Autorizada
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">N° Autorización</p>
            <p className="font-bold tracking-wider text-[var(--app-text)]">{invoice.authorizationNumber}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">CUF</p>
            <p className="font-mono text-xs font-bold text-[var(--app-primary)] break-all">{invoice.cuf}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">Código de Control</p>
            <p className="font-mono text-xs font-bold text-[var(--app-text)]">{invoice.controlCode}</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <QRCodeSVG value={invoice.verificationUrl} size={100} bgColor="#ffffff" fgColor="#1e293b" level="M" />
            <p className="text-center text-[9px] text-[var(--app-text-muted)]">Escanee para verificar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 rounded-xl bg-[var(--app-bg-subtle)]/50 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[var(--app-text-muted)]">
              <Building2 size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Emisor</span>
            </div>
            <p className="text-sm font-bold">{invoice.emitter?.name}</p>
            <p className="text-xs text-[var(--app-text-soft)]">RUC: {invoice.emitter?.ruc}</p>
            <p className="text-xs text-[var(--app-text-soft)]">{invoice.emitter?.address}</p>
            <p className="text-xs text-[var(--app-text-soft)]">Tel: {invoice.emitter?.phone}</p>
          </div>
          <div className="space-y-1 rounded-xl bg-[var(--app-bg-subtle)]/50 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[var(--app-text-muted)]">
              <User size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Receptor</span>
            </div>
            <p className="text-sm font-bold">{invoice.receiver?.name}</p>
            <p className="text-xs text-[var(--app-text-soft)]">ID: {invoice.receiver?.identification}</p>
            <p className="text-xs text-[var(--app-text-soft)]">{invoice.receiver?.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
          {[['N° Factura', invoice.invoiceNumber], ['Fecha Emisión', fmt(invoice.issuedAt)], ['Tipo', 'FACTURA']].map(
            ([l, v]) => (
              <div key={l} className="rounded-xl bg-[var(--app-bg-subtle)]/50 p-3">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">{l}</p>
                <p className="text-xs font-bold break-all">{v}</p>
              </div>
            )
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--app-bg-subtle)] text-[10px] uppercase tracking-wider text-[var(--app-text-muted)]">
                <th className="px-3 py-2 text-left font-bold">#</th>
                <th className="px-3 py-2 text-left font-bold">Descripción</th>
                <th className="px-3 py-2 text-center font-bold">Cant.</th>
                <th className="px-3 py-2 text-right font-bold">P. Unit.</th>
                <th className="px-3 py-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.lines || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[var(--app-text-muted)]">
                    Sin detalle de líneas (venta sin ítems cargados).
                  </td>
                </tr>
              ) : (
                (invoice.lines || []).map((l) => (
                  <tr key={l.lineNumber} className="border-t border-[var(--app-border)]">
                    <td className="px-3 py-2 text-[var(--app-text-muted)]">{l.lineNumber}</td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-[var(--app-text)]">{l.productName}</p>
                      <p className="text-[10px] text-[var(--app-text-muted)]">{l.productCode}</p>
                    </td>
                    <td className="px-3 py-2 text-center font-bold">{l.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(l.unitPrice)}</td>
                    <td className="px-3 py-2 text-right font-bold">{formatMoney(l.lineTotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="min-w-[200px] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--app-text-soft)]">Subtotal</span>
              <span className="font-semibold">{formatMoney(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--app-border)] pt-2">
              <span className="text-sm font-bold">TOTAL</span>
              <span className="text-lg font-bold text-[var(--app-primary)]">{formatMoney(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {invoice.payments?.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Forma de Pago</p>
            <div className="flex flex-wrap gap-2">
              {invoice.payments.map((p, i) => (
                <span
                  key={i}
                  className="rounded-full border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-1 text-xs font-semibold text-[var(--app-text)]"
                >
                  {METHOD_LABEL[p.method] || p.method}: {formatMoney(p.amount)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
};

export default ElectronicInvoiceModal;
