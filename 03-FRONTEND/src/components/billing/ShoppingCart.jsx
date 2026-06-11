import { Percent, ShoppingCart as ShoppingCartIcon, Trash2, XCircle } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const QTY_WARNING = 5;
const QTY_ALERT = 10;

const getQtyBadgeClass = (quantity, justAdded) => {
  const qty = Number(quantity || 0);
  if (qty > QTY_ALERT) {
    return `bg-amber-100 text-amber-900 ring-1 ring-amber-400/60 ${justAdded ? 'pos-qty-badge--pulse' : ''}`;
  }
  if (qty > QTY_WARNING) {
    return `bg-amber-50 text-amber-800 ring-1 ring-amber-300/50 ${justAdded ? 'pos-qty-badge--pulse' : ''}`;
  }
  return `bg-[var(--app-primary-soft)] text-[var(--app-primary)] ${justAdded ? 'pos-qty-badge--pulse' : ''}`;
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
      <div className="pos-ticket-header shrink-0">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <ShoppingCartIcon size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[var(--app-text)] sm:text-sm">Ticket de Venta</h3>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>
        {cart.length > 0 && (
          <div className="flex shrink-0 items-center gap-3">
            <div className="pos-ticket-totals text-right">
              <span className="block text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Total a Pagar</span>
              <span className="text-3xl font-black tabular-nums text-[var(--app-primary)] lg:text-4xl">
                {money(total)}
              </span>
              {discountTotal > 0 && (
                <span className="block text-[10px] font-bold text-emerald-600">
                  Desc. {money(discountTotal)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pos-ticket-table-wrap pos-scroll min-h-0 min-w-0 flex-1">
        {cart.length === 0 ? (
          <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingCartIcon size={48} className="opacity-25" />
            <p className="text-lg font-bold text-[var(--app-text)]">Ticket vacío</p>
            <p className="max-w-lg text-sm text-[var(--app-text-muted)]">
              Las líneas aparecen aquí con código, cantidad, precio e importe. Use el buscador o categorías [F4].
            </p>
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
              <tr>
                <th className="text-center">#</th>
                <th>Código</th>
                <th>Descripción</th>
                <th className="text-center">Cant.</th>
                <th className="text-right">P. unit. (Neto)</th>
                <th className="text-right pr-4 text-[var(--app-primary-strong)]">Importe (Neto)</th>
                <th className="pr-4" aria-label="Quitar" />
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
                    className={`pos-ticket-row border-l-4 transition-all ${
                      selected ? 'pos-ticket-row--selected border-l-[var(--app-primary)]' : 'border-l-transparent'
                    } ${justAdded ? 'pos-ticket-row--fresh' : ''}`}
                    onClick={() => onSelectLine(item.id)}
                  >
                    <td className="pos-cell-line text-center font-bold text-[var(--app-text-muted)]">{index + 1}</td>
                    <td className="pos-cell-code font-mono text-xs text-[var(--app-text-muted)]">
                      {item.barcode || '—'}
                    </td>
                    <td className="pos-cell-desc">
                      <span className="line-clamp-1 font-bold leading-tight text-[var(--app-text)]">{item.name}</span>
                      {item.extraData && (
                        <span className="mt-0.5 block text-[10px] font-medium text-[var(--app-text-muted)] uppercase">
                          {item.extraData}
                        </span>
                      )}
                      {item.promo?.displayLabel && (
                        <span className="mt-0.5 block text-[10px] font-bold text-emerald-600">
                          {item.promo.displayLabel}
                        </span>
                      )}
                    </td>
                    <td className="pos-cell-qty text-center py-2">
                      <span
                        className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-lg px-2 py-1 text-sm font-black tabular-nums ${getQtyBadgeClass(item.quantity, justAdded)}`}
                        title={Number(item.quantity) > QTY_WARNING ? 'Cantidad alta — verifique antes de cobrar' : undefined}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="pos-cell-unit text-right tabular-nums text-xs font-medium text-[var(--app-text-muted)]">
                      {money(item.salePrice)}
                    </td>
                    <td className="pos-cell-amount text-right tabular-nums pr-4">
                      <span className="text-base font-black text-[var(--app-primary-strong)] lg:text-lg">
                        {money(lineTotal)}
                      </span>
                      {lineDiscount > 0 && (
                        <span className="block text-[10px] font-bold text-emerald-600">
                          -{money(lineDiscount)}
                        </span>
                      )}
                    </td>
                    <td className="pos-cell-action text-right pr-4">
                      {canApplyDiscount && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetLineDiscount(item.id);
                          }}
                          className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-500/10"
                          aria-label="Aplicar descuento"
                          title="Aplicar descuento"
                        >
                          <Percent size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromCart(item.id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-danger)] transition-colors hover:bg-[var(--app-danger-soft)]"
                        aria-label="Quitar línea"
                      >
                        <Trash2 size={16} />
                      </button>
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
