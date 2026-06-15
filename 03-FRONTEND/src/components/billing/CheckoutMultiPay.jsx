import React, { useEffect } from 'react';
import { Banknote, CreditCard, Gift, Trash2, Plus, ArrowLeftRight } from 'lucide-react';

const METHOD_LABELS = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  COUPON: 'Cupón',
  POINTS: 'Puntos',
};

const CheckoutMultiPay = ({
  isFullyPaid,
  change,
  payments,
  pendingAmount,
  couponCode,
  onCouponCodeChange,
  onValidateAndAddCoupon,
  validatingCoupon,
  onRemovePayment,
  onClearPayments,
  manualMethod,
  setManualMethod,
  manualAmount,
  setManualAmount,
  handleAddManualPayment,
  formatMoney,
  onOpenSimulator,
  banks,
  selectedCustomer,
}) => {
  const [manualBank, setManualBank] = React.useState('BAC');
  const [manualRef, setManualRef] = React.useState('');

  React.useEffect(() => {
    if (banks && banks.length > 0) {
      setManualBank(banks[0].bankName);
    }
  }, [banks]);

  const handleMethodSelect = (method) => {
    setManualMethod(method);
    setManualRef('');
    if (banks && banks.length > 0) {
      setManualBank(banks[0].bankName);
    }
  };

  const handleAddPaymentClick = () => {
    handleAddManualPayment(manualBank, manualRef);
    setManualRef('');
  };

  
  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey) return;
      if (e.key === '1') { e.preventDefault(); handleMethodSelect('CASH'); }
      if (e.key === '2') { e.preventDefault(); handleMethodSelect('CARD'); }
      if (e.key === '3') { e.preventDefault(); handleMethodSelect('TRANSFER'); }
      if (e.key === '4' && selectedCustomer?.points > 0) { e.preventDefault(); handleMethodSelect('POINTS'); }
      
      if (e.key === 'Enter' && pendingAmount > 0) { e.preventDefault(); handleAddPaymentClick(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedCustomer, pendingAmount, manualAmount, manualRef, manualBank]);

  return (    <div className="flex flex-col gap-2">
      {isFullyPaid && (
        <div className="flex flex-col justify-center items-center p-2 bg-emerald-50 border border-emerald-250 rounded-lg gap-1 animate-fade-in">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-650 border border-emerald-300">
            <CheckIcon size={16} />
          </div>
          <h4 className="text-[10px] font-bold uppercase text-emerald-855">Monto Cubierto</h4>
          <p className="text-[10px] text-emerald-700 text-center font-bold">
            La factura ha sido cubierta por completo.
          </p>
        </div>
      )}

      <div className="shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Cupón / gift card"
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value)}
            className="ui-input min-h-10 h-10 text-xs rounded-lg bg-slate-100 border-slate-300 text-slate-950 focus:bg-white font-bold flex-1"
          />
          <button
            type="button"
            onClick={onValidateAndAddCoupon}
            disabled={validatingCoupon || !couponCode.trim() || pendingAmount <= 0}
            className="shrink-0 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-850 border border-slate-300 px-4 h-10 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors cursor-pointer"
          >
            {validatingCoupon ? '…' : 'Cupón'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30 p-2 max-h-24 overflow-y-auto">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
          Pagos registrados ({payments.length})
        </p>
        {payments.length === 0 ? (
          <p className="py-2 text-center text-[10px] italic text-[var(--app-text-muted)]">
            No se han registrado pagos para esta venta.
          </p>
        ) : (
          <ul className="space-y-1">
            {payments.map((p, idx) => (
              <li
                key={`${p.method}-${idx}-${p.couponCode || ''}`}
                className="flex items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 shadow-sm text-[11px]"
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate font-bold text-[var(--app-text)]">
                  {p.method === 'COUPON' && <Gift size={12} className="text-slate-605" />}
                  {p.method === 'POINTS' && <Gift size={12} className="text-amber-600" />}
                  {p.method === 'CASH' && <Banknote size={12} className="text-slate-605" />}
                  {p.method === 'CARD' && <CreditCard size={12} className="text-slate-655" />}
                  {p.method === 'TRANSFER' && <ArrowLeftRight size={12} className="text-slate-605" />}
                  {p.method === 'COUPON'
                    ? p.couponCode
                    : p.method === 'TRANSFER'
                      ? `Transf. ${p.bank || ''} (Ref: ${p.reference || ''})`
                      : METHOD_LABELS[p.method] || p.method}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="font-bold tabular-nums">{formatMoney(p.amount)}</span>
                  <button type="button" onClick={() => onRemovePayment(idx)} className="text-[var(--app-danger)] hover:text-red-700 transition-colors cursor-pointer">
                    <Trash2 size={12} />
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
            className="mt-1 w-full text-center text-[9px] font-bold text-[var(--app-danger)] hover:underline block cursor-pointer"
          >
            Limpiar todos los pagos
          </button>
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-[var(--app-border)] pt-2.5 pb-1">
        <div className={`grid gap-1.5 ${selectedCustomer && selectedCustomer.points > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <button
            type="button"
            id="btn-mpay-cash"
            onClick={() => handleMethodSelect('CASH')}
            title="Efectivo (Alt+1)"
            className={`relative flex h-10 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold uppercase transition-colors duration-100 cursor-pointer ${
              manualMethod === 'CASH'
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Banknote size={14} />
            Efectivo
            <span style={{ position:'absolute', top:'2px', right:'4px', fontSize:'7px', fontWeight:900, opacity: manualMethod==='CASH'?0.7:0.45 }}>Alt+1</span>
          </button>
          <button
            type="button"
            id="btn-mpay-card"
            onClick={() => handleMethodSelect('CARD')}
            title="Tarjeta (Alt+2)"
            className={`relative flex h-10 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold uppercase transition-colors duration-100 cursor-pointer ${
              manualMethod === 'CARD'
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CreditCard size={14} />
            Tarjeta
            <span style={{ position:'absolute', top:'2px', right:'4px', fontSize:'7px', fontWeight:900, opacity: manualMethod==='CARD'?0.7:0.45 }}>Alt+2</span>
          </button>
          <button
            type="button"
            id="btn-mpay-transfer"
            onClick={() => handleMethodSelect('TRANSFER')}
            title="Transferencia (Alt+3)"
            className={`relative flex h-10 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold uppercase transition-colors duration-100 cursor-pointer ${
              manualMethod === 'TRANSFER'
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ArrowLeftRight size={14} />
            Transf.
            <span style={{ position:'absolute', top:'2px', right:'4px', fontSize:'7px', fontWeight:900, opacity: manualMethod==='TRANSFER'?0.7:0.45 }}>Alt+3</span>
          </button>
          {selectedCustomer && selectedCustomer.points > 0 && (
            <button
              type="button"
              id="btn-mpay-points"
              onClick={() => handleMethodSelect('POINTS')}
              title="Puntos (Alt+4)"
              className={`relative flex h-10 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold uppercase transition-colors duration-100 cursor-pointer ${
                manualMethod === 'POINTS'
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Gift size={14} />
              Puntos
              <span style={{ position:'absolute', top:'2px', right:'4px', fontSize:'7px', fontWeight:900, opacity: manualMethod==='POINTS'?0.7:0.45 }}>Alt+4</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder={pendingAmount.toFixed(2)}
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPaymentClick()}
            className="ui-input h-10 min-h-[2.5rem] text-sm font-bold tabular-nums rounded-lg bg-slate-100 border-slate-300 text-slate-950 text-right pr-3 focus:bg-white"
          />
          <button
            type="button"
            id="btn-mpay-add"
            onClick={handleAddPaymentClick}
            disabled={pendingAmount <= 0 || !manualAmount || (manualMethod === 'TRANSFER' && !manualRef.trim())}
            title="Agregar pago (Alt+Enter)"
            className="relative flex items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-850 border border-slate-300 px-4 h-10 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Plus size={18} />
            <span style={{ position:'absolute', bottom:'1px', right:'3px', fontSize:'6px', fontWeight:900, opacity:0.5 }}>Alt+↵</span>
          </button>
        </div>

        {manualMethod === 'TRANSFER' && (
          <div className="space-y-2 animate-fade-in pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="block text-[8px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                  Banco Destino
                </label>
                <select
                  value={manualBank}
                  onChange={(e) => setManualBank(e.target.value)}
                  className="ui-input ui-select h-10 min-h-[2.5rem] text-xs rounded-lg font-bold bg-slate-100 border-slate-300 text-slate-900 py-1"
                >
                  {(banks || []).map((b) => (
                    <option key={b.id || b.accountNumber} value={b.bankName} className="bg-slate-100 text-slate-900">
                      {b.bankName} - {b.name} ({b.accountNumber?.slice(-4) || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[8px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                  N° Referencia
                </label>
                <input
                  type="text"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  placeholder="Referencia de pago..."
                  className="ui-input h-10 min-h-[2.5rem] text-xs rounded-lg font-bold bg-slate-100 border-slate-300 text-slate-900 focus:bg-white"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenSimulator(parseFloat(manualAmount) || pendingAmount, manualBank, (ref) => setManualRef(ref))}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-350 bg-slate-200 hover:bg-slate-300 h-9 text-xs font-bold uppercase text-slate-800 transition-colors cursor-pointer"
            >
              Simular Transferencia
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckIcon = ({ size }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
};

export default CheckoutMultiPay;