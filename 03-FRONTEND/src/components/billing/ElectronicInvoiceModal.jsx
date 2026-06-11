import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Building2,
  User,
} from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const METHOD_LABEL = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', COUPON: 'Cupón', MIXED: 'Mixto' };
const fmt = (d) => d ? new Date(d).toLocaleString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

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
    <div className="fixed inset-0 bg-[var(--app-bg)]/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8 animate-fade-in overflow-y-auto">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg"><FileText size={18} /></div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Factura Electrónica</h3>
              <p className="text-white/70 text-[10px] font-medium">Documento tributario simulado — DGI Nicaragua</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
              <Printer size={13} /> Imprimir
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"><X size={16} /></button>
          </div>
        </div>

        {/* Contenido */}
        <div ref={printRef} className="p-6 space-y-5 text-[var(--app-text)]">

          {/* Advertencia entorno TEST */}
          {isTest && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-700 px-4 py-2.5 rounded-xl text-xs font-bold">
              <AlertTriangle size={14} /> DOCUMENTO EN AMBIENTE DE PRUEBA — No tiene validez fiscal
            </div>
          )}

          {/* Cabecera del documento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-[var(--app-border)]">
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Autorizada</span>
              </div>
              <p className="text-[10px] text-[var(--app-text-muted)] font-semibold uppercase tracking-wider">N° Autorización</p>
              <p className="font-black text-[var(--app-text)] tracking-wider">{invoice.authorizationNumber}</p>
              <p className="text-[10px] text-[var(--app-text-muted)] font-semibold uppercase tracking-wider mt-2">CUF</p>
              <p className="font-mono text-xs font-bold text-primary">{invoice.cuf}</p>
              <p className="text-[10px] text-[var(--app-text-muted)] font-semibold uppercase tracking-wider mt-2">Código de Control</p>
              <p className="font-mono text-xs font-bold text-[var(--app-text)]">{invoice.controlCode}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <QRCodeSVG value={invoice.verificationUrl} size={100} bgColor="#ffffff" fgColor="#1e293b" level="M" />
              <p className="text-[9px] text-[var(--app-text-muted)] text-center">Escanee para verificar</p>
            </div>
          </div>

          {/* Emisor / Receptor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--app-bg-subtle)]/50 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 mb-2 text-[var(--app-text-muted)]"><Building2 size={13} /><span className="text-[10px] font-black uppercase tracking-wider">Emisor</span></div>
              <p className="font-black text-sm">{invoice.emitter?.name}</p>
              <p className="text-xs text-[var(--app-text-soft)]">RUC: {invoice.emitter?.ruc}</p>
              <p className="text-xs text-[var(--app-text-soft)]">{invoice.emitter?.address}</p>
              <p className="text-xs text-[var(--app-text-soft)]">Tel: {invoice.emitter?.phone}</p>
              <p className="text-xs text-[var(--app-text-soft)]">{invoice.emitter?.economicActivity}</p>
            </div>
            <div className="bg-[var(--app-bg-subtle)]/50 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 mb-2 text-[var(--app-text-muted)]"><User size={13} /><span className="text-[10px] font-black uppercase tracking-wider">Receptor</span></div>
              <p className="font-black text-sm">{invoice.receiver?.name}</p>
              <p className="text-xs text-[var(--app-text-soft)]">ID: {invoice.receiver?.identification}</p>
              <p className="text-xs text-[var(--app-text-soft)]">{invoice.receiver?.address}</p>
              <p className="text-xs text-[var(--app-text-soft)]">Tel: {invoice.receiver?.phone}</p>
            </div>
          </div>

          {/* Datos generales */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[['N° Factura', invoice.invoiceNumber], ['Fecha Emisión', fmt(invoice.issuedAt)], ['Tipo', 'FACTURA']].map(([l, v]) => (
              <div key={l} className="bg-[var(--app-bg-subtle)]/50 rounded-xl p-3">
                <p className="text-[9px] font-black uppercase tracking-wider text-[var(--app-text-muted)] mb-1">{l}</p>
                <p className="font-bold text-xs">{v}</p>
              </div>
            ))}
          </div>

          {/* Líneas */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] text-[10px] uppercase tracking-wider">
                  <th className="text-left px-3 py-2 font-black">#</th>
                  <th className="text-left px-3 py-2 font-black">Descripción</th>
                  <th className="text-center px-3 py-2 font-black">Cant.</th>
                  <th className="text-right px-3 py-2 font-black">P. Unit.</th>
                  <th className="text-right px-3 py-2 font-black">Dto.</th>
                  <th className="text-right px-3 py-2 font-black">IVA%</th>
                  <th className="text-right px-3 py-2 font-black">IVA</th>
                  <th className="text-right px-3 py-2 font-black">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.lines || []).map(l => (
                  <tr key={l.lineNumber} className="border-t border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]/30">
                    <td className="px-3 py-2 text-[var(--app-text-muted)]">{l.lineNumber}</td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-[var(--app-text)]">{l.productName}</p>
                      <p className="text-[10px] text-[var(--app-text-muted)]">{l.productCode}</p>
                    </td>
                    <td className="px-3 py-2 text-center font-bold">{l.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(l.unitPrice)}</td>
                    <td className="px-3 py-2 text-right text-rose-600">{l.discount > 0 ? `-${formatMoney(l.discount)}` : '—'}</td>
                    <td className="px-3 py-2 text-right">{Number(l.taxRate)}%</td>
                    <td className="px-3 py-2 text-right">{formatMoney(l.taxAmount)}</td>
                    <td className="px-3 py-2 text-right font-black">{formatMoney(l.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="flex justify-end">
            <div className="min-w-[240px] space-y-1.5">
              {[
                ['Subtotal', invoice.subtotal],
                ['Descuentos', invoice.totalDiscount, true],
                ['IVA', invoice.totalTax],
              ].map(([label, value, neg]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-[var(--app-text-soft)]">{label}</span>
                  <span className={`font-semibold ${neg ? 'text-rose-500' : ''}`}>{neg && value > 0 ? '-' : ''}{formatMoney(value)}</span>
                </div>
              ))}
              <div className="border-t border-[var(--app-border)] pt-2 flex justify-between">
                <span className="font-black text-sm">TOTAL</span>
                <span className="font-black text-lg text-primary">{formatMoney(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Pagos */}
          {invoice.payments?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] mb-2">Forma de Pago</p>
              <div className="flex flex-wrap gap-2">
                {invoice.payments.map((p, i) => (
                  <span key={i} className="bg-[var(--app-bg-subtle)] border border-[var(--app-border)] text-[var(--app-text)] text-xs px-3 py-1 rounded-full font-semibold">
                    {METHOD_LABEL[p.method] || p.method}: {formatMoney(p.amount)} {p.currency}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pie */}
          <p className="text-center text-[10px] text-[var(--app-text-muted)] border-t border-[var(--app-border)] pt-4">
            Verifique este documento en {invoice.verificationUrl} · Generado por Sistema de Gestión Supermercado
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElectronicInvoiceModal;
