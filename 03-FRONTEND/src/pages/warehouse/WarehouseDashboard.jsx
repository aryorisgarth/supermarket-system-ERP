import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Barcode,
  CalendarClock,
  ClipboardList,
  Package,
  RefreshCw,
  Truck,
  ClipboardCheck,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import BarcodeScanInput from '../../components/warehouse/BarcodeScanInput';
import AuthService from '../../services/AuthService';
import PurchaseOrderService from '../../services/PurchaseOrderService';
import ProductBatchService from '../../services/ProductBatchService';
import InventoryCountService from '../../services/InventoryCountService';
import useBarcodeScan from '../../hooks/useBarcodeScan';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const StatCard = ({ title, value, subtitle, icon: Icon, tone = 'blue' }) => {
  const toneClass = {
    blue: 'text-[var(--app-primary)] bg-[var(--app-primary-soft)]',
    green: 'text-[var(--app-success)] bg-[var(--app-success-soft)]',
    amber: 'text-[var(--app-warning)] bg-[var(--app-warning-soft)]',
    red: 'text-[var(--app-danger)] bg-[var(--app-danger-soft)]',
  }[tone];

  return (
    <Card className="min-h-[120px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-eyebrow mb-2 text-[var(--app-text-muted)]">{title}</p>
          <h3 className="text-2xl font-black text-[var(--app-text)]">{value}</h3>
          {subtitle && (
            <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">{subtitle}</p>
          )}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={21} />
        </span>
      </div>
    </Card>
  );
};

const WarehouseDashboard = () => {
  const user = AuthService.getCurrentUser();
  const roleLabel = user?.role?.name?.replace('_', ' ') || 'BODEGUERO';
  const canApproveCounts = AuthService.hasPermission('INVENTORY_ADJUST');
  const [loading, setLoading] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [expirySummary, setExpirySummary] = useState(null);
  const [pendingCountSessions, setPendingCountSessions] = useState(0);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const countPromise = canApproveCounts
        ? InventoryCountService.getPage({ status: 'SUBMITTED', page: 0, size: 1, sort: 'submittedAt,desc' })
        : Promise.resolve(null);

      const [ordered, partial, summary, countPage] = await Promise.all([
        PurchaseOrderService.getPage({ status: 'ORDERED', page: 0, size: 50, sort: 'createdAt,desc' }),
        PurchaseOrderService.getPage({ status: 'PARTIALLY_RECEIVED', page: 0, size: 50, sort: 'createdAt,desc' }),
        ProductBatchService.getSummary(),
        countPromise,
      ]);
      setPendingOrders([...(ordered?.content || []), ...(partial?.content || [])]);
      setExpirySummary(summary);
      setPendingCountSessions(countPage?.totalElements ?? 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [canApproveCounts]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const { scanValue, setScanValue, scanning, lastScanned, handleScanKeyDown } = useBarcodeScan();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Bodega"
        title={`Hola, ${user?.fullName?.split(' ')[0] || 'Bodeguero'}`}
        description="Recepción de mercadería, control de lotes y seguimiento de vencimientos. El stock del POS se actualiza cuando apruebas recepciones y conteos."
        actions={(
          <Button type="button" variant="secondary" icon={RefreshCw} onClick={loadDashboard} loading={loading}>
            Actualizar
          </Button>
        )}
        meta={<Badge tone="blue">{roleLabel}</Badge>}
      />

      {canApproveCounts && pendingCountSessions > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-[var(--app-warning-soft)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--app-text)]">
              <ClipboardCheck size={18} className="text-[var(--app-warning)]" />
              {pendingCountSessions} conteo(s) cíclico(s) pendiente(s) de aprobación
            </div>
            <Link to="/bodega/conteo">
              <Button type="button" variant="secondary" size="sm">
                Revisar conteos
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="OC pendientes" value={pendingOrders.length} subtitle="Por recibir en bodega" icon={Truck} tone="blue" />
        <StatCard title="Vence ≤ 7 días" value={expirySummary?.within7Count ?? '—'} subtitle="Lotes con stock" icon={AlertTriangle} tone="amber" />
        <StatCard title="Vence ≤ 30 días" value={expirySummary?.within30Count ?? '—'} subtitle="Planificar rotación FEFO" icon={CalendarClock} tone="green" />
        <StatCard title="Lotes vencidos" value={expirySummary?.expiredCount ?? '—'} subtitle="Requieren acción" icon={Package} tone="red" />
        {canApproveCounts && (
          <StatCard
            title="Conteos por aprobar"
            value={pendingCountSessions}
            subtitle="Enviados por bodega"
            icon={ClipboardCheck}
            tone={pendingCountSessions > 0 ? 'amber' : 'green'}
          />
        )}
      </div>

      <Card className="border-[var(--app-border)]">
        <CardHeader
          icon={ClipboardList}
          title="¿Qué hace el módulo Bodega?"
          description="Flujo operativo — no es caja ni inventario administrativo."
        />
        <ol className="mt-3 space-y-3 text-sm text-[var(--app-text-soft)]">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-black text-[var(--app-primary)]">1</span>
            <span><strong className="text-[var(--app-text)]">Recepción:</strong> escaneas la OC de compra, registras lote, vencimiento, zona y QC. El stock sube en kardex automáticamente.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-black text-[var(--app-primary)]">2</span>
            <span><strong className="text-[var(--app-text)]">Consulta / escaneo:</strong> verifica existencias y códigos de barras sin modificar precios ni catálogo.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-black text-[var(--app-primary)]">3</span>
            <span><strong className="text-[var(--app-text)]">Conteo cíclico:</strong> cuentas físicamente; el supervisor aprueba y el sistema ajusta diferencias.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-black text-[var(--app-primary)]">4</span>
            <span><strong className="text-[var(--app-text)]">Lotes vencidos:</strong> revisa alertas en Analítica → Alertas; aplica baja desde Lotes y vencimientos.</span>
          </li>
        </ol>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader icon={Barcode} title="Escaneo rápido" description="Escanea un código de barras para consultar el producto." />
          <div className="mt-4 space-y-3">
            <BarcodeScanInput
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              onKeyDown={handleScanKeyDown}
              disabled={scanning}
            />
            {lastScanned && (
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 p-4">
                <p className="text-xs font-black uppercase text-[var(--app-text-muted)]">Producto encontrado</p>
                <p className="mt-1 font-black text-[var(--app-text)]">{lastScanned.name}</p>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Código: {lastScanned.barcode} · Stock: {lastScanned.currentStock}
                </p>
              </div>
            )}
            <Link to="/bodega/productos" className="text-xs font-bold text-[var(--app-primary)] hover:underline">
              Ir a consulta de productos →
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader icon={ClipboardList} title="Recepciones pendientes" description="Órdenes de compra listas para ingreso a bodega." />
          <div className="mt-4 space-y-2">
            {loading && <p className="text-xs text-[var(--app-text-muted)]">Cargando órdenes...</p>}
            {!loading && pendingOrders.length === 0 && (
              <p className="text-xs text-[var(--app-text-muted)]">No hay recepciones pendientes.</p>
            )}
            {pendingOrders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/bodega/recepcion/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-[var(--app-border)] px-4 py-3 transition hover:border-[var(--app-primary)]/40 hover:bg-[var(--app-primary-soft)]/30"
              >
                <div>
                  <p className="text-xs font-black text-[var(--app-text)]">{order.orderNumber}</p>
                  <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                    {order.supplierName} · {money(order.subtotal)}
                  </p>
                </div>
                <Badge tone={order.status === 'PARTIALLY_RECEIVED' ? 'amber' : 'blue'}>
                  {order.status === 'PARTIALLY_RECEIVED' ? 'Parcial' : 'Ordenada'}
                </Badge>
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {pendingOrders.length > 0 && (
                <Link to="/bodega/recepcion">
                  <Button type="button" variant="secondary" className="w-full" icon={ClipboardList}>
                    Ver todas las recepciones
                  </Button>
                </Link>
              )}
              <Link to="/bodega/conteo">
                <Button type="button" variant="secondary" className="w-full" icon={ClipboardCheck}>
                  Conteo cíclico
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
