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
    colorClasses = 'bg-rose-100 text-rose-700 border-rose-300';
  } else if (isWarning) {
    colorClasses = 'bg-amber-100 text-amber-700 border-amber-300';
  } else {
    colorClasses = 'bg-slate-150 text-slate-800 border-slate-300';
  }

  return `inline-flex min-w-[2.75rem] h-8 items-center justify-center rounded-lg px-2 text-sm font-bold tabular-nums border ${colorClasses} ${
    justAdded ? 'pos-qty-badge--pulse scale-105' : ''
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
    <div className="pos-ticket flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="pos-ticket-header shrink-0 bg-slate-100 border-b border-slate-200 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-150 text-slate-800 border border-slate-250 shadow-sm">
            <ShoppingCartIcon size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Ticket de Venta</h3>
            <span className="inline-flex items-center rounded-full bg-slate-250 px-2.5 py-0.5 text-xs font-bold text-slate-700 mt-0.5">
              {cart.length} {cart.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">Total a Cobrar</span>
            <span className="text-2xl font-bold tabular-nums text-slate-900 lg:text-3xl tracking-tight block leading-none mt-1">
              {money(total)}
            </span>
            {discountTotal > 0 && (
              <span className="inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-250 px-1.5 py-0.5 text-[10px] font-bold text-rose-650 mt-1">
                Ahorro: -{money(discountTotal)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pos-ticket-table-wrap pos-scroll min-h-0 min-w-0 flex-1">
        {cart.length === 0 ? (
          <div className="flex h-full min-h-[15rem] flex-col items-center justify-center gap-4 p-8 text-center bg-slate-50/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border-2 border-dashed border-slate-300">
              <ShoppingCartIcon size={28} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 uppercase tracking-wider">Ticket vacío</p>
              <p className="max-w-md text-xs font-semibold text-slate-500 mt-2 leading-relaxed">
                Las líneas aparecerán aquí al registrar productos. Use la barra de búsqueda o presione <span className="font-extrabold text-slate-700">[F4]</span> para navegar por las categorías.
              </p>
            </div>
          </div>
        ) : (
          <table className="pos-ticket-table w-full">
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
              <tr className="!border-b-2 !border-slate-300 bg-slate-200 text-slate-950 shadow-sm">
                <th className="text-center !py-3 !px-1.5 !text-[11px] !font-bold !uppercase !tracking-wider !text-slate-950">#</th>
                <th className="text-left !py-3 !px-1.5 !text-[11px] !font-bold !uppercase !tracking-wider !text-slate-950">Código</th>
                <th className="text-left !py-3 !px-1.5 !text-[11px] !font-bold !uppercase !tracking-wider !text-slate-950">Descripción</th>
                <th className="text-center !py-3 !px-1.5 !text-[11px] !font-bold !uppercase !tracking-wider !text-slate-950">Cant</th>
                <th className="text-right !py-3 !px-1.5 !text-[11px] !font-bold !uppercase !tracking-wider !text-slate-950">Precio</th>
                <th className="text-right pr-2 !py-3 !px-1.5 !text-[11px] !font-bold !uppercase !tracking-wider !text-slate-950">Importe (Neto)</th>
                <th className="pr-2 !py-3 !px-1.5" aria-label="Quitar" />
              </tr>
            </thead>

            <tbody>
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
                      group/row
                      border-b border-slate-200
                      border-l-4
                      transition-all duration-150
                      cursor-pointer
                      ${selected 
                        ? '!bg-zinc-200 !border-l-zinc-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:!bg-zinc-200' 
                        : 'odd:!bg-white odd:hover:!bg-slate-100/60 even:!bg-slate-50 even:hover:!bg-slate-100/60 !border-l-transparent'
                      } 
                      ${justAdded ? 'pos-ticket-row--fresh' : ''}
                    `}
                    onClick={() => onSelectLine(item.id)}
                  >
                    <td className="text-center !py-3.5 !px-1.5 !font-bold text-slate-500 !text-xs tabular-nums">
                      {index + 1}
                    </td>

                    <td className="!py-3.5 !px-1.5 font-mono !text-xs !font-bold !text-slate-900">
                      {item.barcode || '—'}
                    </td>

                    <td className="!py-3.5 !px-1.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="line-clamp-2 !font-extrabold !text-sm text-slate-900 uppercase tracking-tight leading-snug">
                          {item.name}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {item.extraData && (
                            <span className="inline-flex items-center rounded bg-slate-150 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700 border border-slate-200">
                              {item.extraData}
                            </span>
                          )}
                          {item.promo?.displayLabel && (
                            <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-705 border border-emerald-150">
                              {item.promo.displayLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="text-center !py-3.5 !px-1">
                      <span
                        className={getQtyBadgeClass(item.quantity, justAdded)}
                        title={Number(item.quantity) > QTY_WARNING ? 'Cantidad alta — verifique antes de cobrar' : undefined}
                      >
                        {item.quantity}
                      </span>
                    </td>

                    <td className="text-right !py-3.5 !px-1 font-bold text-slate-700 !text-sm tabular-nums">
                      {money(item.salePrice)}
                    </td>

                    <td className="text-right !py-3.5 !px-1.5 tabular-nums">
                      <span className="!text-base font-bold text-slate-900 block leading-none">
                        {money(lineTotal)}
                      </span>
                      {lineDiscount > 0 && (
                        <span className="inline-block mt-1 text-[11px] font-bold text-rose-600">
                          -{money(lineDiscount)}
                        </span>
                      )}
                    </td>

                    <td className="text-right !py-3.5 !px-1 pr-2">
                      <div className="flex items-center justify-end gap-1">
                        {canApplyDiscount && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetLineDiscount(item.id);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            aria-label="Aplicar descuento"
                            title="Aplicar descuento"
                          >
                            <Percent size={14} strokeWidth={2.8} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromCart(item.id);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white border border-red-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          aria-label="Quitar línea"
                          title="Quitar línea"
                        >
                          <Trash2 size={14} strokeWidth={2.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;