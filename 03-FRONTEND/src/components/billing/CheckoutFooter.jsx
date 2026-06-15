import React from 'react';
import { Wallet, Printer, Edit, XCircle } from 'lucide-react';
import Button from '../ui/Button';

const CheckoutFooter = ({
  canCheckout,
  onCheckout,
  isMultiPayment,
  total,
  formatMoney,
  showPrintButton,
  onPrintReceipt,
  cartLength,
  onCancelCurrentPurchase,
  onReprintTicket,
  onEditSale,
  onCancelSale,
}) => {
  return (
    <footer className="bg-[var(--app-surface)] border-t border-[var(--app-border)] p-2.5 space-y-2.5">
      <button
        type="button"
        disabled={!canCheckout}
        onClick={onCheckout}
        className={`relative flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
          canCheckout
            ? 'bg-gradient-to-r from-[var(--app-primary)] to-blue-700 hover:to-[var(--app-primary)] text-white shadow-lg shadow-primary/20 active:scale-[0.99]'
            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
        }`}
      >
        <Wallet size={18} strokeWidth={2.5} />
        <span>
          {isMultiPayment ? 'Finalizar Venta' : `Cobrar ${formatMoney(total)}`}
        </span>
        <div className="absolute right-3 hidden sm:flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20">
          F10
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2">
        {showPrintButton && !isMultiPayment && (
          <Button
            type="button"
            variant="secondary"
            icon={Printer}
            onClick={onPrintReceipt}
            className="w-full rounded-lg h-9 text-xs"
          >
            Imprimir Ticket
          </Button>
        )}
        {cartLength > 0 && (
          <Button
            type="button"
            variant="secondary"
            icon={XCircle}
            onClick={onCancelCurrentPurchase}
            className="w-full rounded-lg border border-red-200 text-red-650 hover:bg-red-50 h-9 text-xs"
          >
            Cancelar Venta
          </Button>
        )}
      </div>

      <div className="border-t border-[var(--app-border)] pt-2">
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={Printer}
            onClick={onReprintTicket}
            className="rounded-lg h-9 text-[10px]"
          >
            Reimprimir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={onEditSale}
            className="rounded-lg h-9 text-[10px]"
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={XCircle}
            onClick={onCancelSale}
            className="rounded-lg h-9 text-[10px] text-red-600 hover:bg-red-50"
          >
            Anular
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;