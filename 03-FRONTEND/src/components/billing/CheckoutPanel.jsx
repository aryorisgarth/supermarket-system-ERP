import { useState, useEffect, useRef, useCallback } from 'react';
import CustomerService from '../../services/CustomerService';
import { formatMoney, formatUsdEquivalent, getCurrencySettings } from '../../utils/formatMoney';
import CheckoutCustomerSelector from './CheckoutCustomerSelector';
import CheckoutQuickPay from './CheckoutQuickPay';
import CheckoutMultiPay from './CheckoutMultiPay';
import CheckoutFooter from './CheckoutFooter';
import TransferSimulatorModal from './TransferSimulatorModal';

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
  transferBank,
  onTransferBankChange,
  transferRef,
  onTransferRefChange,
  paymentAccounts,
}) => {
  const settings = getCurrencySettings();
  const enableMulti = settings.enableMultiCurrency ?? false;

  const defaultBanks = [
    { id: 'BAC', bankName: 'BAC Credomatic', name: 'BAC Monetaria', accountNumber: '1002-3984-7291-8472', accountHolder: 'SUPERMERCADO EL CENTRO S.A.' },
    { id: 'BANPRO', bankName: 'BANPRO', name: 'BANPRO Ahorros', accountNumber: '9021-4820-1928-3746', accountHolder: 'SUPERMERCADO EL CENTRO S.A.' },
    { id: 'LAFISE', bankName: 'LAFISE Bancentro', name: 'LAFISE Corriente', accountNumber: '2840-1928-3847-1928', accountHolder: 'SUPERMERCADO EL CENTRO S.A.' },
  ];
  const banks = paymentAccounts && paymentAccounts.length > 0 ? paymentAccounts : defaultBanks;

  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState('CASH');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorAmount, setSimulatorAmount] = useState(0);
  const [simulatorBank, setSimulatorBank] = useState('BAC');
  const [simulatorCallback, setSimulatorCallback] = useState(null);

  const handleOpenSimulator = (amount, bank, onSuccessCallback) => {
    setSimulatorAmount(amount);
    setSimulatorBank(bank);
    setSimulatorCallback(() => onSuccessCallback);
    setShowSimulator(true);
  };

  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const customerDropdownRef = useRef(null);
  const debounceRef = useRef(null);

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
    onCustomerSelect({ id: customer.id, fullName: customer.fullName, points: customer.points || 0 });
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

  useEffect(() => {
    if (pendingAmount > 0) {
      setManualAmount(pendingAmount.toFixed(2));
    } else {
      setManualAmount('');
    }
  }, [pendingAmount, manualMethod]);
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

  const handleAddManualPayment = (bank = '', ref = '') => {
    const amt = parseFloat(manualAmount);
    if (Number.isNaN(amt) || amt <= 0) return;

    if (manualMethod === 'POINTS') {
      if (!selectedCustomer) {
        Swal.fire({ icon: 'warning', title: 'Cliente requerido', text: 'Debe seleccionar un cliente para pagar con puntos.' });
        return;
      }
      const pointsAvailable = selectedCustomer.points || 0;
      if (amt > pointsAvailable) {
        Swal.fire({ icon: 'warning', title: 'Puntos insuficientes', text: `El cliente solo tiene ${pointsAvailable} puntos disponibles.` });
        return;
      }
    }

    const paymentObj = { method: manualMethod, amount: amt };
    if (manualMethod === 'TRANSFER') {
      paymentObj.bank = bank;
      paymentObj.reference = ref;
    }
    onAddPayment(paymentObj);
    setManualAmount('');
  };

  const setExactAmount = () => {
    onAmountReceivedChange(Number(total || 0));
  };

  const addCashAmount = (value) => {
    onAmountReceivedChange(Number(amountReceived || 0) + Number(value || 0));
  };

  const selectedAccount = (banks && banks.length > 0)
    ? (banks.find(b => b.bankName === simulatorBank || b.id === simulatorBank) || banks[0])
    : null;

  return (
    <div className="pos-checkout bg-[var(--app-surface)] flex flex-col h-full rounded-lg overflow-hidden border border-[var(--app-border)] shadow-sm">
      <header className="pos-checkout-head p-3 space-y-2.5 border-b border-[var(--app-border)]">
        <div className="flex gap-1.5 rounded-lg bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => isMultiPayment && onToggleMultiPayment()}
            className={`relative flex-1 rounded-md py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              !isMultiPayment
                ? 'bg-white text-black shadow-sm border border-slate-350'
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            Cobro rápido
          </button>
          <button
            type="button"
            onClick={() => !isMultiPayment && onToggleMultiPayment()}
            className={`relative flex-1 rounded-md py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              isMultiPayment
                ? 'bg-white text-black shadow-sm border border-slate-350'
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            Pago mixto
          </button>
        </div>

        <CheckoutCustomerSelector
          selectedCustomer={selectedCustomer}
          showCustomerSearch={showCustomerSearch}
          setShowCustomerSearch={setShowCustomerSearch}
          customerDropdownRef={customerDropdownRef}
          customerQuery={customerQuery}
          handleCustomerInputChange={handleCustomerInputChange}
          customerResults={customerResults}
          handleSelectCustomer={handleSelectCustomer}
          handleClearCustomer={handleClearCustomer}
          showCustomerDropdown={showCustomerDropdown}
          setShowCustomerDropdown={setShowCustomerDropdown}
        />

        <div className="pos-checkout-total-bar flex items-center justify-between gap-4 p-2.5 rounded-lg border border-[var(--app-border)] bg-gradient-to-tr from-[var(--app-bg-subtle)] to-[var(--app-surface)]">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Subtotal</p>
            <p className="text-sm font-bold text-[var(--app-text-soft)]">{formatMoney(subtotal - discountTotal)}</p>
            {discountTotal > 0 && (
              <p className="text-[9px] font-bold text-slate-700">Desc. -{formatMoney(discountTotal)}</p>
            )}
            {enableMulti && usdEquivalent && (
              <p className="text-[9px] font-bold text-[var(--app-text-muted)]">≈ {usdEquivalent}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Total a Cobrar</p>
            <p className="pos-checkout-total-bar-amount text-xl font-bold text-slate-900 tracking-tight">{formatMoney(total)}</p>
            <p className="text-[9px] font-bold text-[var(--app-text-muted)]">IVA {taxRate}% · {formatMoney(tax)}</p>
          </div>
        </div>

        {isMultiPayment && (
          <div className="space-y-1.5 pt-0.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 border border-slate-300">
              <div
                className="h-full rounded-full bg-slate-850 transition-all duration-500"
                style={{ width: `${payProgress}%` }}
              />
            </div>
            <div className="pos-checkout-mix-metrics grid grid-cols-3 gap-1.5 text-center text-[9px]">
              <div className="bg-slate-100 p-1 rounded border border-slate-200">
                <p className="text-slate-655 font-bold uppercase tracking-wider text-[8px]">Pagado</p>
                <span className="text-slate-900 text-xs font-bold">{formatMoney(totalPaid)}</span>
              </div>
              <div className="bg-slate-100 p-1 rounded border border-slate-200">
                <p className="text-slate-655 font-bold uppercase tracking-wider text-[8px]">Pendiente</p>
                <span className="text-slate-900 text-xs font-bold">{formatMoney(pendingAmount)}</span>
              </div>
              <div className="bg-[var(--app-bg-subtle)] p-1 rounded border border-[var(--app-border)]">
                <p className="text-[var(--app-text-soft)] font-bold uppercase tracking-wider text-[8px]">Progreso</p>
                <span className="text-[var(--app-text)] text-xs font-bold">{payProgress.toFixed(0)}%</span>
              </div>
            </div>
            {isFullyPaid && (
              <div className="pos-checkout-vuelto-banner bg-slate-100 border border-slate-300 rounded-lg p-2 text-center mt-1 transition-all">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-550 mb-0.5">Vuelto al cliente</p>
                <p className="text-lg font-bold text-slate-900">{formatMoney(change)}</p>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="pos-checkout-main flex-1 p-3 overflow-y-auto pos-scroll flex flex-col gap-3">
        {isMultiPayment ? (
          <CheckoutMultiPay
            isFullyPaid={isFullyPaid}
            change={change}
            payments={payments}
            pendingAmount={pendingAmount}
            couponCode={couponCode}
            onCouponCodeChange={onCouponCodeChange}
            onValidateAndAddCoupon={onValidateAndAddCoupon}
            validatingCoupon={validatingCoupon}
            onRemovePayment={onRemovePayment}
            onClearPayments={onClearPayments}
            manualMethod={manualMethod}
            setManualMethod={setManualMethod}
            manualAmount={manualAmount}
            setManualAmount={setManualAmount}
            handleAddManualPayment={handleAddManualPayment}
            formatMoney={formatMoney}
            onOpenSimulator={handleOpenSimulator}
            banks={banks}
            selectedCustomer={selectedCustomer}
          />
        ) : (
          <CheckoutQuickPay
            paymentMethod={paymentMethod}
            onPaymentMethodChange={onPaymentMethodChange}
            billingConfig={billingConfig}
            amountReceived={amountReceived}
            onAmountReceivedChange={onAmountReceivedChange}
            setExactAmount={setExactAmount}
            addCashAmount={addCashAmount}
            total={total}
            change={change}
            formatMoney={formatMoney}
            transferBank={transferBank}
            onTransferBankChange={onTransferBankChange}
            transferRef={transferRef}
            onTransferRefChange={onTransferRefChange}
            onOpenSimulator={handleOpenSimulator}
            banks={banks}
          />
        )}
      </div>

      <CheckoutFooter
        canCheckout={canCheckout}
        onCheckout={onCheckout}
        isMultiPayment={isMultiPayment}
        total={total}
        formatMoney={formatMoney}
        showPrintButton={showPrintButton}
        onPrintReceipt={onPrintReceipt}
        cartLength={cartLength}
        onCancelCurrentPurchase={onCancelCurrentPurchase}
        onReprintTicket={onReprintTicket}
        onEditSale={onEditSale}
        onCancelSale={onCancelSale}
      />
      <TransferSimulatorModal
        show={showSimulator}
        onClose={() => setShowSimulator(false)}
        onSuccess={(ref) => {
          if (simulatorCallback) simulatorCallback(ref);
        }}
        amount={simulatorAmount}
        bankName={selectedAccount?.bankName || 'BAC Credomatic'}
        accountNumber={selectedAccount?.accountNumber || '1002-3984-7291-8472'}
        accountHolder={selectedAccount?.accountHolder || 'SUPERMERCADO EL CENTRO S.A.'}
      />
    </div>
  );
};

export default CheckoutPanel;
