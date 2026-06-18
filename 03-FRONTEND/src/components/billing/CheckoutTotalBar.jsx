import { formatMoney } from '../../utils/formatMoney';

const CheckoutTotalBar = ({
  subtotal,
  discountTotal,
  usdEquivalent,
  total,
  taxRate,
  tax,
}) => {
  return (
    <div className="pos-checkout-total-bar flex items-center justify-between gap-1 p-1.5 rounded-lg border border-gray-300 bg-white shadow-sm">
      <div>
        <p className="text-[9px] font-black uppercase tracking-wider text-black">Subtotal</p>
        <p className="text-xs font-black text-black">{formatMoney(subtotal - discountTotal)}</p>
        {discountTotal > 0 && (
          <p className="text-[9px] font-black text-black">Desc. -{formatMoney(discountTotal)}</p>
        )}
        {usdEquivalent && (
          <p className="text-[9px] font-black text-black mt-0.5">≈ {usdEquivalent}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-[9px] font-black uppercase tracking-wider text-black mb-0.5">Total a Cobrar</p>
        <p className="pos-checkout-total-bar-amount text-2xl font-black text-black tracking-tighter leading-none">{formatMoney(total)}</p>
        <p className="text-[9px] font-black text-black mt-0.5">IVA {taxRate}% · {formatMoney(tax)}</p>
      </div>
    </div>
  );
};

export default CheckoutTotalBar;
