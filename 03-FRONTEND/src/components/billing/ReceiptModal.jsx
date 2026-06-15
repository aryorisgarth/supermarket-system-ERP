import { CheckCircle2, Printer, ReceiptText, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { formatMoney } from '../../utils/formatMoney';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import ThermalReceiptView from './ThermalReceiptView';

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
  let ticketLogo = localStorage.getItem('supernova_ticket_logo') || localStorage.getItem('supernova_logo');

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
              <h3 className="text-xl font-bold text-[var(--app-text)]">{money(receiptData.total)}</h3>
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

          {receiptData.change > 0 && (
            <div className="mt-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-3.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Vuelto a entregar</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{money(receiptData.change)}</p>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-5">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="primary" icon={Printer} onClick={onPrint}>
                Imprimir
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Nueva venta
              </Button>
            </div>
            <button
              type="button"
              onClick={() => generateInvoicePDF(receiptData)}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-350 bg-slate-100 hover:bg-slate-200 h-10 text-xs font-bold uppercase text-slate-800 transition-colors cursor-pointer"
            >
              Exportar PDF (A4)
            </button>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <header className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                <ReceiptText size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.06em] text-[var(--app-text)]">
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
            <ThermalReceiptView
              receiptData={receiptData}
              taxRate={taxRate}
              company={company}
              ownerName={ownerName}
              addr={addr}
              ruc={ruc}
              phone={phone}
              telefax={telefax}
              enableMulti={enableMulti}
              rate={rate}
              showTicketLogo={showTicketLogo}
              ticketLogo={ticketLogo}
              ticketHeaderMessage={ticketHeaderMessage}
              ticketFooterMessage={ticketFooterMessage}
              ticketAsfcCode={ticketAsfcCode}
              ticketSeries={ticketSeries}
              ticketPaymentLabel={ticketPaymentLabel}
              ticketExchangeNote={ticketExchangeNote}
              ticketFontFamily={ticketFontFamily}
              ticketFontSize={ticketFontSize}
              ticketShowTaxId={ticketShowTaxId}
              printedDate={printedDate}
              printedTime={printedTime}
              articleCount={articleCount}
              discountTotal={discountTotal}
            />
          </div>

          <footer className="flex flex-col gap-2 border-t border-[var(--app-border)] p-4 lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="primary" icon={Printer} onClick={onPrint}>
                Imprimir
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Nueva venta
              </Button>
            </div>
            <button
              type="button"
              onClick={() => generateInvoicePDF(receiptData)}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-350 bg-slate-100 hover:bg-slate-200 h-10 text-xs font-bold uppercase text-slate-800 transition-colors cursor-pointer"
            >
              Exportar PDF (A4)
            </button>
          </footer>
        </section>
      </motion.div>
    </motion.div>
  );
};

export default ReceiptModal;
