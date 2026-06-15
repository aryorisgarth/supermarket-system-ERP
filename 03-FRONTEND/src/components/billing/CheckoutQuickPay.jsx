import React, { useEffect } from 'react';
import { Banknote, CreditCard, ArrowLeftRight } from 'lucide-react';

const CheckoutQuickPay = ({
  paymentMethod,
  onPaymentMethodChange,
  billingConfig,
  amountReceived,
  onAmountReceivedChange,
  setExactAmount,
  addCashAmount,
  total,
  change,
  formatMoney,
  transferBank,
  onTransferBankChange,
  transferRef,
  onTransferRefChange,
  onOpenSimulator,
  banks,
}) => {
  const numTotal = Number(total || 0);
  const numAmountReceived = Number(amountReceived || 0);

  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey) return;
      const tag = document.activeElement?.tagName;
      
      if (e.key === '1') { e.preventDefault(); onPaymentMethodChange('CASH'); }
      if (e.key === '2') { e.preventDefault(); onPaymentMethodChange('CARD'); }
      if (e.key === '3') { e.preventDefault(); onPaymentMethodChange('TRANSFER'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPaymentMethodChange]);

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="pos-checkout-quick-row shrink-0 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          id="btn-pay-cash"
          onClick={() => onPaymentMethodChange('CASH')}
          title="Efectivo (Alt+1)"
          className={`relative flex h-9 items-center justify-center gap-1 rounded-lg border text-[11px] font-bold uppercase transition-colors duration-100 cursor-pointer ${
            paymentMethod === 'CASH'
              ? 'border-primary bg-primary text-white shadow-sm'
              : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Banknote size={14} />
          Efectivo
          <span style={{
            position: 'absolute', top: '2px', right: '4px',
            fontSize: '7px', fontWeight: 900, opacity: paymentMethod === 'CASH' ? 0.7 : 0.5,
            letterSpacing: '0.04em',
          }}>Alt+1</span>
        </button>
        <button
          type="button"
          id="btn-pay-card"
          onClick={() => onPaymentMethodChange('CARD')}
          title="Tarjeta (Alt+2)"
          className={`relative flex h-9 items-center justify-center gap-1 rounded-lg border text-[11px] font-bold uppercase transition-colors duration-100 cursor-pointer ${
            paymentMethod === 'CARD'
              ? 'border-primary bg-primary text-white shadow-sm'
              : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <CreditCard size={14} />
          Tarjeta
          <span style={{
            position: 'absolute', top: '2px', right: '4px',
            fontSize: '7px', fontWeight: 900, opacity: paymentMethod === 'CARD' ? 0.7 : 0.5,
            letterSpacing: '0.04em',
          }}>Alt+2</span>
        </button>
        <button
          type="button"
          id="btn-pay-transfer"
          onClick={() => onPaymentMethodChange('TRANSFER')}
          title="Transferencia (Alt+3)"
          className={`relative flex h-9 items-center justify-center gap-1 rounded-lg border text-[11px] font-bold uppercase transition-colors duration-100 cursor-pointer ${
            paymentMethod === 'TRANSFER'
              ? 'border-primary bg-primary text-white shadow-sm'
              : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ArrowLeftRight size={14} />
          Transf.
          <span style={{
            position: 'absolute', top: '2px', right: '4px',
            fontSize: '7px', fontWeight: 900, opacity: paymentMethod === 'TRANSFER' ? 0.7 : 0.5,
            letterSpacing: '0.04em',
          }}>Alt+3</span>
        </button>
      </div>

      {paymentMethod === 'CARD' && billingConfig?.paymentGatewayProvider && (
        <p className="shrink-0 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-700 leading-relaxed">
          Pasarela activa: <span className="font-bold uppercase">{billingConfig.paymentGatewayProvider}</span>
          {billingConfig.paymentGatewayEnabled === false ? ' (deshabilitada — solo registro)' : ' — autorización al cobrar'}
        </p>
      )}

      {paymentMethod === 'TRANSFER' && (
        <div className="shrink-0 space-y-2">
          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="space-y-0.5">
              <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-600">
                Banco Destino
              </label>
              <select
                value={transferBank}
                onChange={(e) => onTransferBankChange(e.target.value)}
                className="ui-input ui-select h-9 min-h-[2.25rem] text-xs rounded-lg font-bold bg-white border-slate-300 text-slate-900 py-1"
              >
                {(banks || []).map((b) => (
                  <option key={b.id || b.accountNumber} value={b.bankName} className="bg-slate-100 text-slate-900">
                    {b.bankName} - {b.name} ({b.accountNumber?.slice(-4) || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-600">
                N° Referencia
              </label>
              <input
                type="text"
                value={transferRef}
                onChange={(e) => onTransferRefChange(e.target.value)}
                placeholder="Referencia..."
                className="ui-input h-9 min-h-[2.25rem] text-xs rounded-lg font-bold bg-white border-slate-300 text-slate-900 focus:bg-white"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenSimulator(total, transferBank, (ref) => onTransferRefChange(ref))}
            className="w-full flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 h-9 text-xs font-bold uppercase text-slate-800 transition-colors cursor-pointer"
          >
            Simular Transferencia
          </button>
        </div>
      )}

      {paymentMethod === 'CASH' && (
        <div className="shrink-0 space-y-2">
          <div className="grid grid-cols-2 gap-2.5 bg-[var(--app-bg-subtle)] p-2.5 rounded-lg border border-[var(--app-border)]">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Monto Recibido
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountReceived || ''}
                onChange={(e) => onAmountReceivedChange(parseFloat(e.target.value) || 0)}
                className="ui-input h-9 min-h-[2.25rem] text-right pr-2 text-base font-bold bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text)] rounded-lg focus:bg-[var(--app-surface)] focus:ring-1 focus:ring-primary"
                placeholder="0.00"
              />
              <button
                type="button"
                onClick={setExactAmount}
                className="w-full rounded-lg bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover,var(--app-border))] text-[var(--app-text)] border border-[var(--app-border)] h-8 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Monto exacto
              </button>
            </div>
            <div className="flex flex-col justify-center items-center rounded-lg p-2 text-center border bg-[var(--app-surface)] border-[var(--app-border)] shadow-sm">
              {(!numAmountReceived || numAmountReceived <= 0) ? (
                <>
                  <span className="text-[10px] font-extrabold uppercase text-[var(--app-text-muted)] tracking-wider">Por Pagar</span>
                  <span className="text-lg font-black text-[var(--app-text)] tracking-tight mt-0.5">
                    {formatMoney(numTotal)}
                  </span>
                </>
              ) : numAmountReceived >= numTotal ? (
                <div className="w-full flex flex-col items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 mb-0.5">Vuelto</span>
                  <p className="text-lg font-black tracking-tight text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-900/50 w-full text-center">
                    {formatMoney(numAmountReceived - numTotal)}
                  </p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 mb-0.5">Restante</span>
                  <p className="text-lg font-black tracking-tight text-rose-400 bg-rose-950/40 px-3 py-1 rounded border border-rose-900/50 w-full text-center">
                    {formatMoney(numTotal - numAmountReceived)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {[10, 20, 50, 100, 200, 500].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => addCashAmount(val)}
                className="rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 py-1.5 text-[9px] font-bold text-slate-700 transition-colors cursor-pointer"
              >
                +{val}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutQuickPay;
