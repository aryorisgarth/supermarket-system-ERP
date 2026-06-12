import React from 'react';
import { Loader2, Send, Truck, Ban } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_TONES,
  RECEIVABLE_STATUSES,
} from '../../utils/purchaseReceipt';

const PurchaseOrderTable = ({
  orders = [],
  loading,
  metaLoading,
  money,
  canManagePurchases,
  canReceivePurchases,
  onSelectOrder,
  onRunAction,
  onReceiveOrder,
}) => {
  return (
    <div className="bg-[var(--app-surface)] rounded-xl border border-[var(--app-border)] shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[var(--app-text-muted)] text-[10px] font-extrabold uppercase tracking-widest border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50">
              <th className="p-3.5 pl-6">Orden</th>
              <th className="p-3.5">Proveedor</th>
              <th className="p-3.5">Estado</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Fecha</th>
              <th className="p-3.5 pr-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {loading || metaLoading ? (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                  <Loader2 className="mx-auto animate-spin text-[var(--app-primary)]" size={34} />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-20 text-center text-xs font-bold text-[var(--app-text-muted)]">
                  No hay ordenes de compra registradas.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="text-xs hover:bg-[var(--app-bg-subtle)]/30 transition-colors">
                  <td className="p-3.5 pl-6">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="font-black text-[var(--app-primary)] hover:underline"
                    >
                      {order.orderNumber}
                    </button>
                  </td>
                  <td className="p-3.5 font-bold text-[var(--app-text-soft)]">{order.supplierName}</td>
                  <td className="p-3.5">
                    <Badge tone={PURCHASE_STATUS_TONES[order.status] || 'neutral'}>
                      {PURCHASE_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-black text-[var(--app-text)]">{money(order.subtotal)}</td>
                  <td className="p-3.5 font-bold text-[var(--app-text-muted)]">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="p-3.5 pr-6">
                    <div className="flex justify-center gap-1.5">
                      {canManagePurchases && order.status === 'DRAFT' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          icon={Send}
                          onClick={() => onRunAction(order, 'order', 'Marcar como ordenada')}
                        >
                          Ordenar
                        </Button>
                      )}
                      {canReceivePurchases && RECEIVABLE_STATUSES.includes(order.status) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="success"
                          icon={Truck}
                          onClick={() => onReceiveOrder(order)}
                        >
                          Recibir
                        </Button>
                      )}
                      {canManagePurchases && !['RECEIVED', 'PARTIALLY_RECEIVED', 'CANCELLED'].includes(order.status) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          icon={Ban}
                          onClick={() => onRunAction(order, 'cancel', 'Cancelar compra')}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderTable;
