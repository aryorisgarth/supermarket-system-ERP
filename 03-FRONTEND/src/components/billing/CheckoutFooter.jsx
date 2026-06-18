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
    <footer className="bg-transparent border-t border-slate-200 dark:border-slate-800 p-4 space-y-3 relative z-10">
      <button
        type="button"
        disabled={!canCheckout}
        onClick={onCheckout}
        className={`relative flex items-center justify-center gap-2.5 w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all duration-200 cursor-pointer overflow-hidden ${
          canCheckout
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_10px_25px_rgba(79,70,229,0.35)] active:scale-[0.98]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200 border-dashed'
        }`}
      >
        {canCheckout && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
        )}
        <Wallet size={20} strokeWidth={2.5} className={canCheckout ? 'text-indigo-200' : ''} />
        <span className="text-lg">
          {isMultiPayment ? 'Finalizar Venta' : `Cobrar ${formatMoney(total)}`}
        </span>
        <div className={`absolute right-3 hidden sm:flex items-center justify-center px-2 py-1 rounded-lg text-xs font-bold ${canCheckout ? 'bg-indigo-800/50 text-indigo-100 border border-indigo-500/30' : 'bg-slate-200 text-slate-500'}`}>
          F10
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        {showPrintButton && !isMultiPayment && (
          <Button
            type="button"
            variant="secondary"
            icon={Printer}
            onClick={onPrintReceipt}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 h-10 text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 shadow-sm"
          >
            Ticket
          </Button>
        )}
        {cartLength > 0 && (
          <Button
            type="button"
            variant="secondary"
            icon={XCircle}
            onClick={onCancelCurrentPurchase}
            className="w-full rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-10 text-[11px] font-bold tracking-wider shadow-sm"
          >
            Cancelar
          </Button>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-1">
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={Printer}
            onClick={onReprintTicket}
            className="rounded-xl h-11 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200"
          >
            Reimprimir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={onEditSale}
            className="rounded-xl h-11 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200"
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={XCircle}
            onClick={onCancelSale}
            className="rounded-xl h-11 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100"
          >
            Anular
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;