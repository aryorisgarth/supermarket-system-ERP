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
        <div className="flex flex-col justify-center items-center p-2 bg-white border border-green-500 rounded-lg gap-1 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 border border-green-300">
            <CheckIcon size={20} />
          </div>
          <h4 className="text-xs font-black uppercase text-green-800">Monto Cubierto</h4>
          <p className="text-[10px] text-green-800 text-center font-bold">
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
            className="ui-input min-h-9 h-9 text-xs rounded-lg bg-white border-gray-300 text-black focus:bg-white font-bold flex-1"
          />
          <button
            type="button"
            onClick={onValidateAndAddCoupon}
            disabled={validatingCoupon || !couponCode.trim() || pendingAmount <= 0}
            className="shrink-0 rounded-lg bg-gray-200 hover:bg-gray-300 text-black border border-gray-300 px-4 h-9 text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-colors cursor-pointer"
          >
            {validatingCoupon ? '…' : 'Cupón'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-2 max-h-24 overflow-y-auto">
        <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-black">
          Pagos registrados ({payments.length})
        </p>
        {payments.length === 0 ? (
          <p className="py-1 text-center text-[10px] italic text-gray-500">
            No se han registrado pagos para esta venta.
          </p>
        ) : (
          <ul className="space-y-1">
            {payments.map((p, idx) => (
              <li
                key={`${p.method}-${idx}-${p.couponCode || ''}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 shadow-sm text-xs text-black"
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate font-bold text-black">
                  {p.method === 'COUPON' && <Gift size={14} className="text-gray-600" />}
                  {p.method === 'POINTS' && <Gift size={14} className="text-amber-600" />}
                  {p.method === 'CASH' && <Banknote size={14} className="text-gray-600" />}
                  {p.method === 'CARD' && <CreditCard size={14} className="text-gray-600" />}
                  {p.method === 'TRANSFER' && <ArrowLeftRight size={14} className="text-gray-600" />}
                  {p.method === 'COUPON'
                    ? p.couponCode
                    : p.method === 'TRANSFER'
                      ? `Transf. ${p.bank || ''} (Ref: ${p.reference || ''})`
                      : METHOD_LABELS[p.method] || p.method}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-black">
                  <span className="font-bold tabular-nums text-sm text-black">{formatMoney(p.amount)}</span>
                  <button type="button" onClick={() => onRemovePayment(idx)} className="text-red-600 hover:text-red-700 transition-colors cursor-pointer ml-1">
                    <Trash2 size={14} />
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
            className="mt-1 w-full text-center text-[10px] font-black text-red-600 hover:underline block cursor-pointer py-1"
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
            className={`relative flex h-10 items-center justify-center gap-1 rounded-lg border text-[11px] font-black uppercase transition-colors duration-100 cursor-pointer ${
              manualMethod === 'CASH'
                ? 'border-black bg-black text-white shadow-md'
                : 'border-gray-300 bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Banknote size={14} className={manualMethod === 'CASH' ? 'text-white' : 'text-black'} />
            <span className="hidden sm:inline">Efectivo</span>
            <span className="sm:hidden">Efec</span>
            <span style={{ position:'absolute', top:'2px', right:'4px', fontSize:'8px', fontWeight:900, opacity: manualMethod==='CASH'?0.8:0.5, fontFamily:'monospace' }}>F1</span>
          </button>
          <button
            type="button"
            id="btn-mpay-card"
            onClick={() => handleMethodSelect('CARD')}
            title="Tarjeta (Alt+2)"
            className={`relative flex h-10 items-center justify-center gap-1 rounded-lg border text-[11px] font-black uppercase transition-colors duration-100 cursor-pointer ${
              manualMethod === 'CARD'
                ? 'border-black bg-black text-white shadow-md'
                : 'border-gray-300 bg-white text-black hover:bg-gray-100'
            }`}
          >
            <CreditCard size={14} className={manualMethod === 'CARD' ? 'text-white' : 'text-black'} />
            <span className="hidden sm:inline">Tarjeta</span>
            <span className="sm:hidden">Tarj</span>
            <span style={{ position:'absolute', top:'2px', right:'4px', fontSize:'8px', fontWeight:900, opacity: manualMethod==='CARD'?0.8:0.5, fontFamily:'monospace' }}>F2</span>
          </button>
          <button
            type="button"
            id="btn-mpay-transfer"
            onClick={() => handleMethodSelect('TRANSFER')}
            title="Transferencia (Alt+3)"
            className={`relative flex h-10 items-center justify-center gap-1 rounded-lg border text-[11px] font-black uppercase transition-colors duration-100 cursor-pointer ${
              manualMethod === 'TRANSFER'
                ? 'border-black bg-black text-white shadow-md'
                : 'border-gray-300 bg-white text-black hover:bg-gray-100'
            }`}
          >
            <ArrowLeftRight size={14} className={manualMethod === 'TRANSFER' ? 'text-white' : 'text-black'} />
            <span className="hidden sm:inline">Transf.</span>
            <span className="sm:hidden">Transf</span>
            <span style={{ position:'absolute', top:'2px', right:'4px', fontSize:'8px', fontWeight:900, opacity: manualMethod==='TRANSFER'?0.8:0.5, fontFamily:'monospace' }}>F3</span>
          </button>
          {selectedCustomer && selectedCustomer.points > 0 && (
            <button
              type="button"
              id="btn-mpay-points"
              onClick={() => handleMethodSelect('POINTS')}
              title="Puntos (Alt+4)"
              className={`relative flex h-10 items-center justify-center gap-1 rounded-lg border text-[11px] font-black uppercase transition-colors duration-100 cursor-pointer ${
                manualMethod === 'POINTS'
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-gray-300 bg-white text-black hover:bg-gray-100'
              }`}
            >
              <Gift size={14} className={manualMethod === 'POINTS' ? 'text-white' : 'text-black'} />
              <span className="hidden sm:inline">Puntos</span>
              <span className="sm:hidden">Pts</span>
              <span style={{ position:'absolute', top:'2px', right:'4px', fontSize:'8px', fontWeight:900, opacity: manualMethod==='POINTS'?0.8:0.5, fontFamily:'monospace' }}>F4</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-black text-sm">C$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder={pendingAmount.toFixed(2)}
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPaymentClick()}
              className="ui-input h-10 min-h-[2.5rem] pl-9 text-base font-black tabular-nums rounded-lg bg-white border-gray-300 text-black text-right pr-4 focus:bg-white focus:border-black w-full"
            />
          </div>
          <button
            type="button"
            id="btn-mpay-add"
            onClick={handleAddPaymentClick}
            disabled={pendingAmount <= 0 || !manualAmount || (manualMethod === 'TRANSFER' && !manualRef.trim())}
            title="Agregar pago (Ctrl+Enter)"
            className="relative flex items-center justify-center rounded-lg bg-black hover:bg-gray-800 text-white border border-black px-4 h-10 disabled:opacity-40 transition-all cursor-pointer shadow-sm active:scale-95 disabled:active:scale-100"
          >
            <Plus size={18} strokeWidth={3} />
            <span style={{ position:'absolute', bottom:'2px', right:'3px', fontSize:'7px', fontWeight:900, opacity:0.8, fontFamily:'monospace' }}>Ctrl+Enter</span>
          </button>
        </div>

        {manualMethod === 'TRANSFER' && (
          <div className="space-y-2 animate-fade-in pt-1">
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="block text-[9px] font-black uppercase tracking-widest text-black ml-1">
                  Banco Destino
                </label>
                <select
                  value={manualBank}
                  onChange={(e) => setManualBank(e.target.value)}
                  className="ui-input ui-select h-9 w-full text-xs rounded-lg font-bold bg-white border-gray-300 text-black shadow-sm"
                >
                  {(banks || []).map((b) => (
                    <option key={b.id || b.accountNumber} value={b.bankName} className="bg-white text-black">
                      {b.bankName} - {b.name} ({b.accountNumber?.slice(-4) || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[9px] font-black uppercase tracking-widest text-black ml-1">
                  N° Referencia
                </label>
                <input
                  type="text"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  placeholder="Referencia..."
                  className="ui-input h-9 w-full text-xs rounded-lg font-bold bg-white border-gray-300 text-black focus:bg-white shadow-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenSimulator(parseFloat(manualAmount) || pendingAmount, manualBank, (ref) => setManualRef(ref))}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-gray-400 bg-gray-200 hover:bg-gray-300 h-8 text-[10px] font-black uppercase text-black transition-colors cursor-pointer"
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