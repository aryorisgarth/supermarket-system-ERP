import { useMemo } from 'react';
import { CheckCircle2, FileDown, Printer, ReceiptText } from 'lucide-react';
import Button from '../ui/Button';
import ResponsiveModal from '../ui/ResponsiveModal';
import { formatMoney } from '../../utils/formatMoney';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { loadTicketSettings } from '../../utils/ticketSettings';
import ThermalReceiptView from './ThermalReceiptView';

const money = formatMoney;

const ReceiptModal = ({ show, receiptData, billingConfig, taxRate, onClose, onPrint }) => {
  const ticketSettings = useMemo(() => loadTicketSettings(billingConfig), [billingConfig]);

  if (!show || !receiptData) return null;

  const printedAt = receiptData.date ? new Date(receiptData.date) : new Date();
  const printedDate = Number.isNaN(printedAt.getTime()) ? receiptData.date : printedAt.toLocaleDateString();
  const printedTime = Number.isNaN(printedAt.getTime()) ? '' : printedAt.toLocaleTimeString();
  const articleCount = receiptData.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const getLineDiscount = (item) => Number(item.discountAmount || item.discount || 0);
  const discountTotal = receiptData.discountTotal ?? receiptData.items.reduce((sum, item) => sum + getLineDiscount(item), 0);
  const paymentLines = Array.isArray(receiptData.payments) && receiptData.payments.length > 0
    ? receiptData.payments
    : [{ label: receiptData.paymentMethod, amount: receiptData.amountReceived || receiptData.total }];
  const isMixedPayment = paymentLines.length > 1;

  const modalFooter = (
    <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3 sm:p-4">
      <Button
        type="button"
        variant="primary"
        icon={Printer}
        onClick={onPrint}
        className="h-11 w-full"
      >
        Imprimir ticket
      </Button>
      <button
        type="button"
        onClick={() => generateInvoicePDF(receiptData)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-4 text-xs font-bold uppercase tracking-wide text-[var(--app-text)] transition-colors hover:bg-[var(--app-surface)]"
      >
        <FileDown size={16} />
        Exportar PDF
      </button>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        className="h-11 w-full"
      >
        Nueva venta
      </Button>
    </div>
  );

  return (
    <ResponsiveModal
      isOpen={show}
      onClose={onClose}
      icon={ReceiptText}
      title={`Venta procesada · ${money(receiptData.total)}`}
      subtitle={`Factura ${receiptData.invoiceNumber}`}
      initialSize="md"
      sizeOptions={['sm', 'md', 'lg', 'xl', 'full']}
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
      panelClassName="flex h-[min(92vh,860px)] max-h-[92vh] w-[min(96vw,720px)] flex-col"
      headerClassName="shrink-0 bg-[var(--app-bg-subtle)] text-[var(--app-text)] border-b border-[var(--app-border)]"
      footer={modalFooter}
      resizable={false}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
        <aside className="max-h-[38vh] shrink-0 overflow-y-auto border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-3 pos-scroll lg:max-h-none lg:border-b-0 lg:border-r lg:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="ui-eyebrow">Venta procesada</p>
              <h3 className="text-xl font-bold text-[var(--app-text)]">{money(receiptData.total)}</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">
                Factura {receiptData.invoiceNumber}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-success-soft)] text-[var(--app-success)]">
              <CheckCircle2 size={20} />
            </span>
          </div>

          <div className="mt-3 space-y-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <div className="flex justify-between gap-3 text-sm font-semibold">
              <span className="text-[var(--app-text-muted)]">Cliente</span>
              <span className="max-w-[160px] truncate text-right text-[var(--app-text)]">{receiptData.customerName}</span>
            </div>
            <div className="flex justify-between gap-3 text-sm font-semibold">
              <span className="text-[var(--app-text-muted)]">Pago</span>
              <span className="text-right text-[var(--app-text)]">{receiptData.paymentMethod}</span>
            </div>
            <div className="flex justify-between gap-3 text-sm font-semibold">
              <span className="text-[var(--app-text-muted)]">Artículos</span>
              <span className="text-[var(--app-text)]">{receiptData.items.length}</span>
            </div>
            <div className="border-t border-dashed border-[var(--app-border)] pt-2">
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

          {isMixedPayment && (
            <div className="mt-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Desglose de pago mixto
              </p>
              <div className="mt-2 space-y-1.5">
                {paymentLines.map((payment, index) => (
                  <div key={`${payment.label}-${index}`} className="flex items-start justify-between gap-3 text-sm font-semibold">
                    <span className="text-[var(--app-text-soft)]">{payment.label}</span>
                    <span className="text-[var(--app-text)]">{money(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {receiptData.change > 0 && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Vuelto a entregar
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {money(receiptData.change)}
              </p>
            </div>
          )}
        </aside>

        <section className="min-h-0 flex-1 overflow-y-auto bg-[var(--app-bg-subtle)] p-3 pos-scroll lg:p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] lg:hidden">
            Vista previa del ticket
          </p>
          <ThermalReceiptView
            receiptData={receiptData}
            taxRate={taxRate}
            {...ticketSettings}
            printedDate={printedDate}
            printedTime={printedTime}
            articleCount={articleCount}
            discountTotal={discountTotal}
            paymentLines={paymentLines}
            isMixedPayment={isMixedPayment}
          />
        </section>
      </div>
    </ResponsiveModal>
  );
};

export default ReceiptModal;
