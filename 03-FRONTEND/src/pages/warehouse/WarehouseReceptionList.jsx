import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Loader2, Search, Truck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PurchaseOrderService from '../../services/PurchaseOrderService';
import { formatMoney } from '../../utils/formatMoney';
import { PURCHASE_STATUS_LABELS } from '../../utils/purchaseReceipt';

const money = formatMoney;

const WarehouseReceptionList = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [ordered, partial] = await Promise.all([
        PurchaseOrderService.getPage({ status: 'ORDERED', page: 0, size: 100, sort: 'createdAt,desc' }),
        PurchaseOrderService.getPage({ status: 'PARTIALLY_RECEIVED', page: 0, size: 100, sort: 'createdAt,desc' }),
      ]);
      setOrders([...(ordered?.content || []), ...(partial?.content || [])]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders.filter((order) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      order.orderNumber?.toLowerCase().includes(q)
      || order.supplierName?.toLowerCase().includes(q)
      || order.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Bodega"
        title="Recepción de compras"
        description="Selecciona una orden de compra para registrar la entrada de mercadería con lote y control de calidad."
        meta={<Badge tone="blue">{filtered.length} pendientes</Badge>}
      />

      <Card>
        <CardHeader icon={ClipboardList} title="Cola de recepción" description="Solo órdenes ordenadas o parcialmente recibidas." />
        <div className="mt-4 relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
          <input
            className="ui-input w-full pl-9"
            placeholder="Buscar por número, proveedor..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="mt-5 space-y-2">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
              <Loader2 size={14} className="animate-spin" /> Cargando órdenes...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <p className="text-xs text-[var(--app-text-muted)]">No hay órdenes pendientes de recepción.</p>
          )}
          {filtered.map((order) => (
            <Link
              key={order.id}
              to={`/bodega/recepcion/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] px-4 py-4 transition hover:border-[var(--app-primary)]/40 hover:bg-[var(--app-primary-soft)]/20"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                  <Truck size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--app-text)]">{order.orderNumber}</p>
                  <p className="truncate text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                    {order.supplierName} · {money(order.subtotal)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={order.status === 'PARTIALLY_RECEIVED' ? 'amber' : 'blue'}>
                  {PURCHASE_STATUS_LABELS[order.status] || order.status}
                </Badge>
                <ArrowRight size={16} className="text-[var(--app-text-muted)]" />
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WarehouseReceptionList;
