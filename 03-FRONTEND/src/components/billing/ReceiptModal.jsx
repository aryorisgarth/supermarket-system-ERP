import { CheckCircle2, Printer, ReceiptText, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const ReceiptModal = ({ show, receiptData, billingConfig, taxRate, onClose, onPrint }) => {
  if (!show || !receiptData) return null;

  const saved = localStorage.getItem('supernova_settings');
  let company = 'SuperNova Market';
  let ownerName = '';
  let addr = '12 Calle 4-55 Zona 10, Ciudad de Guatemala';
  let ruc = billingConfig?.issuerTaxId || '1234567-8';
  let phone = '';
  let telefax = '';
  let enableMulti = false;
  let rate = 36.85;
  let showTicketLogo = true;
  let ticketHeaderMessage = 'Gracias por elegir SuperNova';
  let ticketFooterMessage = '*** GRACIAS POR SU COMPRA ***';
  let ticketAsfcCode = 'ASFC 19/0001/08/2020/5';
  let ticketSeries = 'A';
  let ticketPaymentLabel = 'PAGO CONTADO';
  let ticketExchangeNote = 'POR FAVOR PRESENTAR FACTURA PARA REALIZAR CAMBIOS';
  let ticketFontFamily = 'monospace';
  let ticketFontSize = 10;
  let ticketShowTaxId = true;
  let ticketLogo = localStorage.getItem('supernova_logo');

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.companyName) company = parsed.companyName;
      if (parsed.ownerName) ownerName = parsed.ownerName;
      if (parsed.address) addr = parsed.address;
      if (parsed.taxId) ruc = parsed.taxId;
      if (parsed.phone) phone = parsed.phone;
      if (parsed.telefax) telefax = parsed.telefax;
      enableMulti = parsed.enableMultiCurrency ?? false;
      rate = parsed.exchangeRate ?? 36.85;
      showTicketLogo = parsed.showTicketLogo ?? true;
      ticketHeaderMessage = parsed.ticketHeaderMessage || '';
      ticketFooterMessage = parsed.ticketFooterMessage || '*** GRACIAS POR SU COMPRA ***';
      ticketAsfcCode = parsed.ticketAsfcCode || ticketAsfcCode;
      ticketSeries = parsed.ticketSeries || ticketSeries;
      ticketPaymentLabel = parsed.ticketPaymentLabel || ticketPaymentLabel;
      ticketExchangeNote = parsed.ticketExchangeNote || ticketExchangeNote;
      ticketFontFamily = parsed.ticketFontFamily || 'monospace';
      ticketFontSize = parsed.ticketFontSize || 10;
      ticketShowTaxId = parsed.ticketShowTaxId ?? true;
    } catch (e) {}
  }

  const printedAt = receiptData.date ? new Date(receiptData.date) : new Date();
  const printedDate = Number.isNaN(printedAt.getTime()) ? receiptData.date : printedAt.toLocaleDateString();
  const printedTime = Number.isNaN(printedAt.getTime()) ? '' : printedAt.toLocaleTimeString();
  const articleCount = receiptData.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const getLineDiscount = (item) => Number(item.discountAmount || item.discount || 0);
  const getLineGross = (item) => Number(item.salePrice || 0) * Number(item.quantity || 0);
  const discountTotal = receiptData.discountTotal ?? receiptData.items.reduce((sum, item) => sum + getLineDiscount(item), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/55 p-4 backdrop-blur-sm no-print"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
        className="grid max-h-[88vh] w-full max-w-5xl grid-cols-[minmax(280px,360px)_minmax(320px,1fr)] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl max-lg:grid-cols-1"
      >
        <aside className="flex flex-col border-r border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-5 max-lg:hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="ui-eyebrow">Venta procesada</p>
              <h3 className="text-xl font-black text-[var(--app-text)]">{money(receiptData.total)}</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">
                Factura {receiptData.invoiceNumber}
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-success-soft)] text-[var(--app-success)]">
              <CheckCircle2 size={22} />
            </span>
          </div>

          <div className="mt-6 space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-[var(--app-text-muted)]">Cliente</span>
              <span className="max-w-[160px] truncate text-[var(--app-text)]">{receiptData.customerName}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-[var(--app-text-muted)]">Pago</span>
              <span className="text-[var(--app-text)]">{receiptData.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-[var(--app-text-muted)]">Articulos</span>
              <span className="text-[var(--app-text)]">{receiptData.items.length}</span>
            </div>
            <div className="border-t border-dashed border-[var(--app-border)] pt-3">
              <div className="flex justify-between text-sm font-semibold text-[var(--app-text-muted)]">
                <span>Subtotal</span>
                <span>{money(receiptData.subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm font-semibold text-[var(--app-text-muted)]">
                <span>IVA</span>
                <span>{money(receiptData.tax)}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
            <Button type="button" variant="primary" icon={Printer} onClick={onPrint}>
              Imprimir
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Nueva venta
            </Button>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <header className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <ReceiptText size={20} />
              </span>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.06em] text-[var(--app-text)]">
                  Vista previa de ticket
                </h3>
                <p className="text-xs font-semibold text-[var(--app-text-muted)]">
                  Contenido con scroll interno, listo para impresion termica
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)]"
              aria-label="Cerrar ticket"
            >
              <X size={17} />
            </button>
          </header>

          <div className="pos-scroll min-h-0 flex-1 overflow-auto bg-[var(--app-bg-subtle)] p-5">
            <div
              className="ticket-paper print-area mx-auto w-full max-w-[80mm] p-5 leading-relaxed shadow-md"
              style={{ fontFamily: ticketFontFamily, fontSize: `${ticketFontSize}px` }}
            >
              <div className="mb-3 space-y-0.5 text-center">
                {showTicketLogo && ticketLogo && (
                  <img src={ticketLogo} alt="Logo ticket" className="mx-auto mb-2 max-h-14 max-w-[140px] object-contain" />
                )}
                <h2 className="text-[1.2em] font-bold uppercase text-slate-900">{company}</h2>
                {ticketHeaderMessage && <p className="text-[0.85em] font-semibold text-slate-600">{ticketHeaderMessage}</p>}
                {ownerName && <p className="text-[8px] font-semibold uppercase text-slate-600">{ownerName}</p>}
                {ticketShowTaxId && <p className="text-[8px] text-slate-500">RUC: {ruc}</p>}
                {ticketAsfcCode && <p className="text-[8px] text-slate-500">{ticketAsfcCode}</p>}
                <p className="text-[8px] text-slate-500">{addr}</p>
                {(phone || telefax) && (
                  <p className="text-[8px] text-slate-500">
                    {phone && `TEL: ${phone}`} {telefax && ` TELEFAX: ${telefax}`}
                  </p>
                )}
              </div>

              <div className="my-2 border-b border-dashed border-slate-300" />

              <div className="space-y-1 text-[8.5px]">
                <div className="grid grid-cols-2 gap-x-2">
                  <div><span>SERIE:</span> <b>{ticketSeries}</b></div>
                  <div className="text-right"><span>FACTURA:</span> <b>{receiptData.invoiceNumber}</b></div>
                  <div><span>{ticketPaymentLabel}</span></div>
                  <div className="text-right"><span>T/C:</span> <b>{Number(rate || 0).toFixed(2)}</b></div>
                  <div><span>FECHA:</span> <b>{printedDate}</b></div>
                  <div className="text-right"><span>HORA:</span> <b>{printedTime}</b></div>
                </div>
                <div className="flex justify-between"><span>CLIENTE:</span><b className="max-w-[150px] truncate uppercase">{receiptData.customerName}</b></div>
                <div className="flex justify-between"><span>RUC/ID:</span><b>{receiptData.customerTaxId}</b></div>
              </div>

              <div className="my-2 border-b border-dashed border-slate-300" />

              <div className="grid grid-cols-12 text-[7.5px] font-bold uppercase text-slate-500">
                <span className="col-span-3">Codigo</span>
                <span className="col-span-1 text-center">U/M</span>
                <span className="col-span-2 text-right">Cant</span>
                <span className="col-span-2 text-right">P/U</span>
                <span className="col-span-2 text-right">Desc</span>
                <span className="col-span-2 text-right">Valor</span>
              </div>

              <div className="mt-1 space-y-1.5">
                {receiptData.items.map((item, index) => (
                  <div key={`${item.id}-${index}`}>
                    <div className="truncate uppercase text-[8px] font-bold text-slate-900">{item.name}</div>
                    <div className="grid grid-cols-12 text-[8px]">
                      <span className="col-span-3 truncate text-slate-900">{item.barcode || 'N/A'}</span>
                      <span className="col-span-1 text-center text-slate-900">UND</span>
                      <span className="col-span-2 text-right text-slate-900">{item.quantity}</span>
                      <span className="col-span-2 text-right text-slate-900">{money(item.salePrice)}</span>
                      <span className="col-span-2 text-right text-slate-900">{money(getLineDiscount(item))}</span>
                      <span className="col-span-2 text-right text-slate-900">{money(Math.max(0, getLineGross(item) - getLineDiscount(item)))}</span>
                    </div>
                    {item.extraData && <p className="text-[8px] italic text-slate-600">Extra: {item.extraData}</p>}
                  </div>
                ))}
              </div>

              <div className="my-2 border-b border-dashed border-slate-300" />

               <div className="space-y-1">
                <div className="flex justify-between"><span>CANTIDAD DE ARTICULOS:</span><span>{articleCount}</span></div>
                <div className="flex justify-between"><span>SUBTOTAL:</span><span>{money(receiptData.subtotal)}</span></div>
                <div className="flex justify-between"><span>DESCUENTO:</span><span>{money(discountTotal)}</span></div>
                <div className="flex justify-between"><span>IVA ({taxRate}%):</span><span>{money(receiptData.tax)}</span></div>
                <div className="flex justify-between pt-1 text-[12px] font-black"><span>TOTAL:</span><span>{money(receiptData.total)}</span></div>
                {enableMulti && (
                  <div className="flex justify-between text-[9px] font-bold text-emerald-600 border-t border-dotted border-slate-200 mt-1 pt-1">
                    <span>TOTAL USD REF:</span>
                    <span>USD ${(receiptData.total / rate).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="my-2 border-b border-dashed border-slate-300" />

              <div className="space-y-1">
                <div className="flex justify-between"><span>CANCELO CON:</span><b>{receiptData.paymentMethod}</b></div>
                {receiptData.paymentMethod === 'EFECTIVO' && receiptData.amountReceived > 0 && (
                  <>
                    <div className="flex justify-between"><span>RECIBIDO:</span><b>{money(receiptData.amountReceived)}</b></div>
                    <div className="flex justify-between"><span>VUELTO:</span><b>{money(receiptData.change)}</b></div>
                  </>
                )}
              </div>

              {receiptData.felAuthNumber && (
                <>
                  <div className="my-2 border-b border-dashed border-slate-300" />
                  <div className="space-y-1 text-center">
                    <p className="text-[8px] font-bold uppercase">Documento Tributario Electronico</p>
                    <p className="break-all text-[7.5px]">AUTORIZACION SAT: {receiptData.felAuthNumber}</p>
                    <p className="text-[7.5px]">SERIE: DTE-1 / NUMERO: {receiptData.felInvoiceNumber}</p>
                  </div>
                </>
              )}

              {ticketFooterMessage && (
                <div className="mt-4 text-center text-[0.85em] font-bold tracking-wider text-slate-500">
                  {ticketFooterMessage}
                </div>
              )}
              {ticketExchangeNote && (
                <div className="mt-2 text-center text-[0.75em] font-bold uppercase text-slate-500">
                  {ticketExchangeNote}
                </div>
              )}
              {enableMulti && (
                <p className="mt-2 text-center text-[0.75em] font-semibold text-slate-500">
                  TASA DE CAMBIO: 1 USD = {rate} MONEDA LOCAL
                </p>
              )}
            </div>
          </div>

          <footer className="grid grid-cols-2 gap-2 border-t border-[var(--app-border)] p-4 lg:hidden">
            <Button type="button" variant="primary" icon={Printer} onClick={onPrint}>
              Imprimir
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Nueva venta
            </Button>
          </footer>
        </section>
      </motion.div>
    </motion.div>
  );
};

export default ReceiptModal;
