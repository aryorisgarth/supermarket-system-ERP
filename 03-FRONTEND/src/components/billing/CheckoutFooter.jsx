import React from 'react';
import { Wallet, Printer, Edit, XCircle } from 'lucide-react';
import Button from '../ui/Button';
import AuthService from '../../services/AuthService';

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
  const canManagePostSale = AuthService.hasPermission('SALE_CANCEL');

  return (
    <footer className="relative z-10 space-y-3 border-t border-[var(--app-border)] bg-transparent p-4">
      <button
        type="button"
        disabled={!canCheckout}
        onClick={onCheckout}
        className={`relative flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-2xl font-black uppercase tracking-widest transition-all duration-200 ${
          canCheckout
            ? 'bg-[var(--app-primary)] text-white shadow-[0_8px_20px_rgba(30,58,138,0.25)] hover:opacity-95 hover:shadow-[0_10px_25px_rgba(30,58,138,0.35)] active:scale-[0.98]'
            : 'cursor-not-allowed border-2 border-dashed border-[var(--app-border)] bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)]'
        }`}
      >
        {canCheckout && (
          <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}
        <Wallet size={20} strokeWidth={2.5} className={canCheckout ? 'text-white/80' : ''} />
        <span className="text-lg">
          {isMultiPayment ? 'Finalizar Venta' : `Cobrar ${formatMoney(total)}`}
        </span>
        <div
          className={`absolute right-3 hidden items-center justify-center rounded-lg px-2 py-1 text-xs font-bold sm:flex ${
            canCheckout
              ? 'border border-white/20 bg-black/20 text-white/90'
              : 'bg-[var(--app-border)]/40 text-[var(--app-text-muted)]'
          }`}
        >
          F10
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        {showPrintButton && (
          <Button
            type="button"
            variant="secondary"
            icon={Printer}
            onClick={onPrintReceipt}
            className="h-10 w-full rounded-xl border border-[var(--app-border)] text-[11px] font-bold tracking-wider text-[var(--app-text-soft)] shadow-sm hover:bg-[var(--app-bg-subtle)]"
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
            className="h-10 w-full rounded-xl border border-[var(--app-danger)]/30 text-[11px] font-bold tracking-wider text-[var(--app-danger)] shadow-sm hover:bg-[var(--app-danger-soft)]"
          >
            Cancelar
          </Button>
        )}
      </div>

      <div className="mt-1 border-t border-[var(--app-border)] pt-3">
        <div className={`grid gap-2 ${canManagePostSale ? 'grid-cols-3' : 'grid-cols-1'}`}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={Printer}
            onClick={onReprintTicket}
            className="h-11 rounded-xl border border-transparent text-xs font-bold uppercase tracking-wider text-[var(--app-text-soft)] hover:border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]"
          >
            Reimprimir
          </Button>
          {canManagePostSale && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={onEditSale}
              className="h-11 rounded-xl border border-transparent text-xs font-bold uppercase tracking-wider text-[var(--app-text-soft)] hover:border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]"
            >
              Editar
            </Button>
          )}
          {canManagePostSale && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={XCircle}
              onClick={onCancelSale}
              className="h-11 rounded-xl border border-transparent text-xs font-bold uppercase tracking-wider text-[var(--app-danger)] hover:border-[var(--app-danger)]/20 hover:bg-[var(--app-danger-soft)]"
            >
              Anular
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;
