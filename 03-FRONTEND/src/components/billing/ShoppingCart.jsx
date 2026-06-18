import React from 'react';
import { Percent, ShoppingCart as ShoppingCartIcon, Trash2 } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const QTY_WARNING = 5;
const QTY_ALERT = 10;

const getQtyBadgeClass = (quantity, justAdded) => {
  const qtyNum = Number(quantity);
  const isAlert = qtyNum >= QTY_ALERT;
  const isWarning = qtyNum >= QTY_WARNING;

  let colorClasses = '';
  if (isAlert) {
    colorClasses = 'bg-red-100 text-red-900 border-red-500';
  } else if (isWarning) {
    colorClasses = 'bg-yellow-100 text-yellow-900 border-yellow-500';
  } else {
    colorClasses = 'bg-gray-200 text-black border-gray-400';
  }

  return `inline-flex min-w-[2.75rem] h-8 items-center justify-center rounded-lg px-2 text-[13px] font-black tabular-nums border shadow-sm transition-all ${colorClasses} ${
    justAdded ? 'pos-qty-badge--pulse scale-110 shadow-md' : ''
  }`;
};


const ShoppingCart = ({
  cart,
  selectedLineId,
  lastAddedLineId,
  onSelectLine,
  onRemoveFromCart,
  onSetLineDiscount,
  onCancelPurchase,
  canApplyDiscount,
  subtotal,
  discountTotal,
  tax,
  total,
}) => {
  return (
    <div className="pos-ticket flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md m-2 relative">
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none z-0"></div>
      
      <div className="pos-ticket-header shrink-0 bg-white border-b-2 border-gray-300 p-4 flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white shadow-md">
            <ShoppingCartIcon size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[15px] font-black text-black tracking-tight uppercase">Ticket de Venta</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-black text-black border border-gray-400">
                {cart.length} LÍNEA{cart.length !== 1 ? 'S' : ''}
              </span>
              <span className="text-[10px] text-black font-black">#{Date.now().toString().slice(-6)}</span>
            </div>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="text-right flex flex-col items-end">
            <span className="block text-[10px] font-black uppercase tracking-widest text-black">Total a Cobrar</span>
            <span className="text-3xl font-black tabular-nums text-black tracking-tight block leading-none mt-1">
              {money(total)}
            </span>
            {discountTotal > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 border border-red-300 px-2 py-1 text-[10px] font-black text-red-900 mt-1.5 shadow-sm">
                Ahorro: -{money(discountTotal)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pos-ticket-table-wrap overflow-x-auto overflow-y-auto pos-scroll min-h-0 min-w-0 flex-1 relative z-10 bg-[var(--app-surface)]">
        {cart.length === 0 ? (
          <div className="flex h-full min-h-[15rem] flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-700">
              <ShoppingCartIcon size={32} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Ticket vacío</p>
              <p className="max-w-sm text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Escanea productos o presiona <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 font-bold font-mono text-[11px] shadow-sm">F4</kbd> para buscar en el catálogo.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-w-[600px]">
            <table className="pos-ticket-table w-full border-collapse">
              <colgroup>
              <col className="pos-col-line" />
              <col className="pos-col-code" />
              <col className="pos-col-desc" />
              <col className="pos-col-qty" />
              <col className="pos-col-unit" />
              <col className="pos-col-amount" />
              <col className="pos-col-action" />
            </colgroup>

            <thead>
              <tr className="border-b-2 border-black bg-gray-200 text-black sticky top-0 z-20">
                <th className="text-center py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-black">#</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-black">Código</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-black">Descripción</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-black">Cant</th>
                <th className="text-right py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-black">Precio</th>
                <th className="text-right pr-3 py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-black">Importe</th>
                <th className="pr-3 py-2.5 px-1 w-12" aria-label="Acciones" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {cart.map((item, index) => {
                const selected = selectedLineId === item.id;
                const justAdded = lastAddedLineId === item.id;
                const lineGross = (item.salePrice || 0) * item.quantity;
                const lineDiscount = Number(item.discountAmount ?? item.discount ?? 0);
                const lineTotal = Math.max(0, lineGross - lineDiscount);
                
                return (
                  <tr
                    key={item.id}
                    className={`
                      group/row relative
                      transition-all duration-200 ease-out
                      cursor-pointer
                      ${selected 
                        ? 'bg-gray-200 hover:bg-gray-300' 
                        : 'bg-white hover:bg-gray-50'
                      } 
                      ${justAdded ? 'pos-ticket-row--fresh bg-green-50' : ''}
                    `}
                    onClick={() => onSelectLine(item.id)}
                  >
                    <td className="text-center py-4 px-2 font-black text-black text-[12px] tabular-nums relative">
                      {/* Active Line Indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-black scale-y-0 transition-transform duration-200 origin-center opacity-0" 
                          style={{ transform: selected ? 'scaleY(1)' : 'scaleY(0)', opacity: selected ? 1 : 0 }} />
                      {index + 1}
                    </td>

                    <td className="py-4 px-2 font-mono text-[11px] font-black text-black">
                      {item.barcode || '—'}
                    </td>

                    <td className="py-4 px-2">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`line-clamp-2 font-black text-sm uppercase tracking-tight leading-snug ${selected ? 'text-black' : 'text-black'}`}>
                          {item.name}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.extraData && (
                            <span className="inline-flex items-center rounded-md bg-gray-200 px-1.5 py-0.5 text-[10px] font-black uppercase text-black border border-gray-400">
                              {item.extraData}
                            </span>
                          )}
                          {item.promo?.displayLabel && (
                            <span className="inline-flex items-center rounded-md bg-green-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-green-900 border border-green-400 shadow-sm">
                              ✨ {item.promo.displayLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="text-center py-4 px-1">
                      <span
                        className={getQtyBadgeClass(item.quantity, justAdded)}
                        title={Number(item.quantity) > QTY_WARNING ? 'Cantidad alta — verifique antes de cobrar' : undefined}
                      >
                        {item.quantity}
                      </span>
                    </td>

                    <td className="text-right py-4 px-2 font-black text-black text-[13px] tabular-nums">
                      {money(item.salePrice)}
                    </td>

                    <td className="text-right py-4 px-2 tabular-nums">
                      <span className={`text-[15px] font-black block leading-none text-black`}>
                        {money(lineTotal)}
                      </span>
                      {lineDiscount > 0 && (
                        <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-rose-500 shadow-sm">
                          -{money(lineDiscount)}
                        </span>
                      )}
                    </td>

                    <td className="text-right py-4 px-1 pr-3 align-middle">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity">
                        {canApplyDiscount && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetLineDiscount(item.id);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            aria-label="Aplicar descuento"
                            title="Aplicar descuento"
                          >
                            <Percent size={16} strokeWidth={3} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromCart(item.id);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          aria-label="Quitar línea"
                          title="Quitar línea"
                        >
                          <Trash2 size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;