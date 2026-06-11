import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Banknote,
  CreditCard,
  Edit,
  Gift,
  Plus,
  Printer,
  Search,
  Trash2,
  Check,
  User,
  X,
  XCircle,
  Wallet,
  ArrowLeftRight,
} from 'lucide-react';
import Button from '../ui/Button';
import CustomerService from '../../services/CustomerService';
import { formatMoney, formatUsdEquivalent, getCurrencySettings } from '../../utils/formatMoney';

const METHOD_LABELS = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  COUPON: 'Cupón',
};

const CheckoutPanel = ({
  selectedCustomer,
  onCustomerSelect,
  subtotal,
  discountTotal,
  tax,
  total,
  taxRate,
  isMultiPayment,
  onToggleMultiPayment,
  payments,
  onAddPayment,
  onRemovePayment,
  onClearPayments,
  paymentMethod,
  onPaymentMethodChange,
  amountReceived,
  onAmountReceivedChange,
  couponCode,
  onCouponCodeChange,
  onValidateAndAddCoupon,
  validatingCoupon,
  onCheckout,
  cartLength,
  showPrintButton,
  onPrintReceipt,
  onReprintTicket,
  onEditSale,
  onCancelCurrentPurchase,
  onCancelSale,
  billingConfig,
}) => {
  const settings = getCurrencySettings();
  const enableMulti = settings.enableMultiCurrency ?? false;

  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState('CASH');

  // --- Autocompletado de clientes ---
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const customerDropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounce: buscar clientes en backend tras 300ms de inactividad
  const searchCustomers = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingCustomers(true);
      try {
        const results = await CustomerService.search(query);
        setCustomerResults(results || []);
        setShowCustomerDropdown(true);
      } catch (err) {
        console.error('Error buscando clientes:', err);
        setCustomerResults([]);
      } finally {
        setLoadingCustomers(false);
      }
    }, 300);
  }, []);

  const handleCustomerInputChange = (e) => {
    const val = e.target.value;
    setCustomerQuery(val);
    searchCustomers(val);
  };

  const handleSelectCustomer = (customer) => {
    onCustomerSelect({ id: customer.id, fullName: customer.fullName });
    setCustomerQuery('');
    setCustomerResults([]);
    setShowCustomerDropdown(false);
  };

  const handleClearCustomer = () => {
    onCustomerSelect(null);
    setCustomerQuery('');
    setCustomerResults([]);
    setShowCustomerDropdown(false);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = Math.max(0, total - totalPaid);
  const payProgress = total > 0 ? Math.min(100, (totalPaid / total) * 100) : 0;

  const cashPayments = payments.filter((p) => p.method === 'CASH');
  const totalCashPaid = cashPayments.reduce((sum, p) => sum + p.amount, 0);
  const change = isMultiPayment
    ? totalPaid > total
      ? Math.min(totalCashPaid, totalPaid - total)
      : 0
    : amountReceived - total;

  const usdEquivalent = formatUsdEquivalent(total);
  const isFullyPaid = isMultiPayment
    ? totalPaid >= total
    : paymentMethod === 'CASH'
      ? amountReceived >= total
      : true;
  const canCheckout = cartLength > 0 && isFullyPaid;

  const handleAddManualPayment = () => {
    const amt = parseFloat(manualAmount);
    if (Number.isNaN(amt) || amt <= 0) return;
    onAddPayment({ method: manualMethod, amount: amt });
    setManualAmount('');
  };

  const quickPay = (method, amount) => {
    if (amount <= 0) return;
    onAddPayment({ method, amount });
  };

  const setExactAmount = () => {
    onAmountReceivedChange(total);
  };

  const addCashAmount = (value) => {
    onAmountReceivedChange((amountReceived || 0) + value);
  };

  return (
    <div className="pos-checkout bg-[var(--app-surface)]">
      <header className="pos-checkout-head">
        <div className="flex gap-1 rounded-lg bg-[var(--app-bg-subtle)] p-0.5">
          <button
            type="button"
            onClick={() => isMultiPayment && onToggleMultiPayment()}
            className={`relative flex-1 rounded-md py-2 text-[10px] font-black uppercase tracking-wider transition ${
              !isMultiPayment
                ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm'
                : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface)]/50'
            }`}
          >
            Cobro rápido
          </button>
          <button
            type="button"
            onClick={() => !isMultiPayment && onToggleMultiPayment()}
            className={`relative flex-1 rounded-md py-2 text-[10px] font-black uppercase tracking-wider transition ${
              isMultiPayment
                ? 'bg-[var(--app-surface)] text-amber-700 shadow-sm'
                : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface)]/50'
            }`}
          >
            Pago mixto
          </button>
        </div>

        <div className="pos-checkout-customer-compact" ref={customerDropdownRef}>
          {selectedCustomer ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[var(--app-primary)]/30 bg-[var(--app-primary-soft)] px-2 py-1.5">
              <User size={13} className="shrink-0 text-[var(--app-primary)]" />
              <span className="min-w-0 flex-1 truncate text-xs font-bold">{selectedCustomer.fullName}</span>
              <button type="button" onClick={handleClearCustomer} className="shrink-0 text-[var(--app-text-muted)] hover:text-[var(--app-danger)]">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative min-w-0 flex-1">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
              <input
                type="text"
                placeholder="Cliente (CF si vacío)…"
                value={customerQuery}
                onChange={handleCustomerInputChange}
                onFocus={() => customerQuery.length >= 2 && customerResults.length > 0 && setShowCustomerDropdown(true)}
                className="ui-input w-full pl-8 pr-2 text-xs"
                autoComplete="off"
              />
              {showCustomerDropdown && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-36 overflow-y-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl">
                  {customerResults.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs hover:bg-[var(--app-primary-soft)]"
                      >
                        <span className="truncate font-medium">{c.fullName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="pos-checkout-total-bar">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">Total Neto</p>
            <p className="text-sm font-bold text-[var(--app-text)]">{formatMoney(subtotal - discountTotal)}</p>
            {discountTotal > 0 && (
              <p className="text-[9px] font-bold text-emerald-600">Desc. -{formatMoney(discountTotal)}</p>
            )}
            {enableMulti && usdEquivalent && (
              <p className="text-[9px] font-semibold text-[var(--app-text-soft)]">≈ {usdEquivalent}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">Total a Pagar</p>
            <p className="pos-checkout-total-bar-amount">{formatMoney(total)}</p>
            <p className="text-[9px] font-bold text-[var(--app-text-muted)]">IVA {taxRate}% · {formatMoney(tax)}</p>
          </div>
        </div>

        {isMultiPayment && (
          <>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--app-bg-subtle)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${payProgress}%` }}
              />
            </div>
            <div className="pos-checkout-mix-metrics">
              <div>
                <p className="text-[var(--app-text-muted)]">Pagado</p>
                <span className="text-emerald-700">{formatMoney(totalPaid)}</span>
              </div>
              <div>
                <p className="text-[var(--app-text-muted)]">Pendiente</p>
                <span className={pendingAmount > 0 ? 'text-amber-600' : 'text-[var(--app-text-muted)]'}>
                  {formatMoney(pendingAmount)}
                </span>
              </div>
              <div>
                <p className="text-[var(--app-text-muted)]">Progreso</p>
                <span>{payProgress.toFixed(0)}%</span>
              </div>
            </div>
            {isFullyPaid && (
              <div className="pos-checkout-vuelto-banner">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-800">Vuelto al cliente</p>
                <p>{formatMoney(change)}</p>
              </div>
            )}
          </>
        )}
      </header>

      <div className="pos-checkout-main">
        {isMultiPayment ? (
          <>
            <div className="shrink-0 space-y-1.5">
              <div className="pos-checkout-quick-row">
                <button
                  type="button"
                  disabled={pendingAmount <= 0}
                  onClick={() => quickPay('CASH', pendingAmount)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-[11px] font-bold text-emerald-800 disabled:opacity-50"
                >
                  <Banknote size={14} /> Todo efectivo
                </button>
                <button
                  type="button"
                  disabled={pendingAmount <= 0}
                  onClick={() => quickPay('CARD', pendingAmount)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 py-2 text-[11px] font-bold text-blue-800 disabled:opacity-50"
                >
                  <CreditCard size={14} /> Todo tarjeta
                </button>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Cupón / gift card"
                  value={couponCode}
                  onChange={(e) => onCouponCodeChange(e.target.value)}
                  className="ui-input min-h-9 flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={onValidateAndAddCoupon}
                  disabled={validatingCoupon || !couponCode.trim() || pendingAmount <= 0}
                  className="shrink-0 rounded-lg bg-amber-600 px-3 text-[11px] font-bold text-white disabled:opacity-50"
                >
                  {validatingCoupon ? '…' : 'Cupón'}
                </button>
              </div>
            </div>

            <div className="pos-checkout-payments-scroll pos-scroll min-h-0 flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 p-2">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Pagos registrados ({payments.length})
              </p>
              {payments.length === 0 ? (
                <p className="py-6 text-center text-[11px] italic text-[var(--app-text-muted)]">
                  Use los botones de arriba o agregue un monto abajo
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {payments.map((p, idx) => (
                    <li
                      key={`${p.method}-${idx}-${p.couponCode || ''}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5"
                    >
                      <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-bold">
                        {p.method === 'COUPON' && <Gift size={13} className="text-amber-600" />}
                        {p.method === 'CASH' && <Banknote size={13} className="text-emerald-600" />}
                        {p.method === 'CARD' && <CreditCard size={13} className="text-blue-600" />}
                        {p.method === 'COUPON' ? p.couponCode : METHOD_LABELS[p.method] || p.method}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="text-xs font-black tabular-nums">{formatMoney(p.amount)}</span>
                        <button type="button" onClick={() => onRemovePayment(idx)} className="text-[var(--app-danger)]">
                          <Trash2 size={13} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {payments.length > 0 && (
                <button
                  type="button"
                  onClick={onClearPayments}
                  className="mt-2 w-full text-center text-[9px] font-bold text-[var(--app-danger)] hover:underline"
                >
                  Limpiar pagos
                </button>
              )}
            </div>

            <div className="shrink-0">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Agregar monto</p>
              <div className="pos-checkout-add-row">
                <select
                  value={manualMethod}
                  onChange={(e) => setManualMethod(e.target.value)}
                  className="ui-input ui-select min-h-9 text-xs"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder={pendingAmount.toFixed(2)}
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddManualPayment()}
                  className="ui-input min-h-9 text-xs font-bold tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleAddManualPayment}
                  disabled={pendingAmount <= 0 || !manualAmount}
                  className="flex items-center justify-center rounded-lg bg-[var(--app-primary)] px-2.5 text-white disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pos-scroll">
            <div className="pos-checkout-quick-row shrink-0 grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onPaymentMethodChange('CASH')}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-[10px] font-bold transition ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-[var(--app-border)] opacity-75 hover:opacity-100'
                }`}
              >
                <Banknote size={18} />
                Efectivo
              </button>
              <button
                type="button"
                onClick={() => onPaymentMethodChange('CARD')}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-[10px] font-bold transition ${
                  paymentMethod === 'CARD'
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-[var(--app-border)] opacity-75 hover:opacity-100'
                }`}
              >
                <CreditCard size={18} />
                Tarjeta
              </button>
              <button
                type="button"
                onClick={() => onPaymentMethodChange('TRANSFER')}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-[10px] font-bold transition ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-violet-500 bg-violet-50 text-violet-800'
                    : 'border-[var(--app-border)] opacity-75 hover:opacity-100'
                }`}
              >
                <ArrowLeftRight size={18} />
                Transfer.
              </button>
            </div>

            {paymentMethod === 'CARD' && billingConfig?.paymentGatewayProvider && (
              <p className="shrink-0 rounded-lg border border-blue-500/20 bg-blue-50/80 px-2 py-1.5 text-[10px] font-bold text-blue-800">
                Pasarela activa: {billingConfig.paymentGatewayProvider}
                {billingConfig.paymentGatewayEnabled === false ? ' (deshabilitada — solo registro)' : ' — autorización al cobrar'}
              </p>
            )}

            {paymentMethod === 'TRANSFER' && (
              <p className="shrink-0 rounded-lg border border-violet-500/20 bg-violet-50/80 px-2 py-1.5 text-[10px] font-bold text-violet-800">
                Confirme el depósito o comprobante antes de finalizar (sin pasarela POS).
              </p>
            )}

            {paymentMethod === 'CASH' && (
              <div className="shrink-0 space-y-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--app-text-soft)]">
                    Monto Recibido
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountReceived || ''}
                    onChange={(e) => onAmountReceivedChange(parseFloat(e.target.value) || 0)}
                    className="pos-qty-input ui-input min-h-12 w-full text-right pr-4 text-2xl font-black border-2 border-[var(--app-border-strong)] focus:border-[var(--app-primary)] bg-[var(--app-surface)] text-[var(--app-text)] placeholder-slate-400"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={setExactAmount}
                    className="col-span-4 rounded-lg border border-emerald-500 bg-emerald-50 py-1.5 text-[10px] font-black uppercase text-emerald-700"
                  >
                    Monto exacto
                  </button>
                  {[10, 20, 50, 100, 200, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => addCashAmount(val)}
                      className="rounded-lg border border-[var(--app-border)] py-1.5 text-[10px] font-bold hover:bg-[var(--app-bg-subtle)]"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
                {amountReceived > 0 && (
                  <div
                    className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                      amountReceived >= total
                        ? 'border-2 border-emerald-500/35 bg-emerald-50/90'
                        : 'bg-[var(--app-bg-subtle)]'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Vuelto</span>
                    <span
                      className={`font-black tabular-nums ${
                        amountReceived >= total ? 'text-xl text-emerald-700' : 'text-lg text-[var(--app-danger)]'
                      }`}
                    >
                      {formatMoney(change)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="pos-checkout-foot space-y-2">
        <button
          type="button"
          disabled={!canCheckout}
          onClick={onCheckout}
          className={`group relative flex w-full min-h-14 items-center justify-center gap-3 rounded-xl text-base font-black uppercase tracking-widest transition-all ${
            canCheckout
              ? 'bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)]'
              : 'cursor-not-allowed bg-slate-400 text-slate-100 shadow-none'
          }`}
        >
          <Wallet size={20} className="transition-transform group-hover:scale-110" />
          {isMultiPayment ? 'Finalizar Venta' : `Cobrar ${formatMoney(total)}`}
          <div className="absolute right-4 hidden rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold sm:block">F10</div>
        </button>


        {showPrintButton && !isMultiPayment && (
          <Button type="button" variant="secondary" className="w-full" icon={Printer} onClick={onPrintReceipt}>
            Imprimir ticket
          </Button>
        )}

        {cartLength > 0 && (
          <Button type="button" variant="secondary" className="w-full" icon={XCircle} onClick={onCancelCurrentPurchase}>
            Cancelar compra actual
          </Button>
        )}

        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          <Button type="button" variant="ghost" size="sm" icon={Printer} onClick={onReprintTicket}>
            Reimpr.
          </Button>
          <Button type="button" variant="ghost" size="sm" icon={Edit} onClick={onEditSale}>
            Editar
          </Button>
          <Button type="button" variant="ghost" size="sm" icon={XCircle} onClick={onCancelSale}>
            Anular
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPanel;
