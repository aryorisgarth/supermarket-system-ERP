import { formatMoney } from '../../utils/formatMoney';

const CheckoutProgressMetrics = ({
  payProgress,
  totalPaid,
  pendingAmount,
  isFullyPaid,
  change
}) => {
  return (
    <div className="space-y-1 pt-0.5">
      <div className="h-1 overflow-hidden rounded-full bg-gray-200 border border-gray-300">
        <div
          className="h-full rounded-full bg-black transition-all duration-500"
          style={{ width: `${payProgress}%` }}
        />
      </div>
      <div className="pos-checkout-mix-metrics grid grid-cols-3 gap-1 text-center">
        <div className="bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
          <p className="text-black font-black uppercase tracking-wider text-[8px] mb-0.5">Pagado</p>
          <span className="text-black text-[11px] font-black">{formatMoney(totalPaid)}</span>
        </div>
        <div className="bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
          <p className="text-black font-black uppercase tracking-wider text-[8px] mb-0.5">Pendiente</p>
          <span className="text-red-700 text-[11px] font-black">{formatMoney(pendingAmount)}</span>
        </div>
        <div className="bg-white p-1 rounded-lg border border-gray-300 shadow-sm flex flex-col justify-center">
          <p className="text-black font-black uppercase tracking-wider text-[8px] mb-0.5">Progreso</p>
          <span className="text-black text-[11px] font-black">{payProgress.toFixed(0)}%</span>
        </div>
      </div>
      {isFullyPaid && (
        <div className="pos-checkout-vuelto-banner bg-white border border-green-500 rounded-lg p-1 text-center mt-0.5 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-green-700 mb-0">Vuelto al cliente</p>
          <p className="text-xl font-black text-green-700 leading-none">{formatMoney(change)}</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutProgressMetrics;
