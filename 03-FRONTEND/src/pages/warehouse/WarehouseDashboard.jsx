import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  AlertTriangle,
  Barcode,
  CalendarClock,
  ClipboardList,
  Package,
  RefreshCw,
  Truck,
  ClipboardCheck,
  BookOpen,
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
import InventoryGuideModal from '../../components/warehouse/InventoryGuideModal';

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
          <h3 className="text-2xl font-bold text-[var(--app-text)]">{value}</h3>
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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const navigate = useNavigate();

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
          <div className="flex gap-2">
            <Button type="button" variant="secondary" icon={BookOpen} onClick={() => setShowGuideModal(true)}>
              Guía de Flujo
            </Button>
            <Button type="button" variant="secondary" icon={RefreshCw} onClick={loadDashboard} loading={loading}>
              Actualizar
            </Button>
          </div>
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
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">1</span>
            <span><strong className="text-[var(--app-text)]">Recepción:</strong> escaneas la OC de compra, registras lote, vencimiento, zona y QC. El stock sube en kardex automáticamente.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">2</span>
            <span><strong className="text-[var(--app-text)]">Consulta / escaneo:</strong> verifica existencias y códigos de barras sin modificar precios ni catálogo.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">3</span>
            <span><strong className="text-[var(--app-text)]">Conteo cíclico:</strong> cuentas físicamente; el supervisor aprueba y el sistema ajusta diferencias.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">4</span>
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
                <p className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Producto encontrado</p>
                <p className="mt-1 font-bold text-[var(--app-text)]">{lastScanned.name}</p>
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
            {pendingOrders.slice(0, 5).map((order) => {
              const isMine = order.receivedBy?.id === user?.id;
              const isTaken = !!order.receivedBy && !isMine;

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--app-border)] px-4 py-3 bg-[var(--app-surface)]"
                >
                  <div>
                    <p className="text-xs font-bold text-[var(--app-text)]">{order.orderNumber}</p>
                    <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                      {order.supplierName} · {money(order.subtotal)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {isTaken ? (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">En proceso</span>
                    ) : isMine ? (
                      <button
                        onClick={() => navigate(`/bodega/recepcion/${order.id}`)}
                        className="px-2 py-1 bg-[var(--app-primary)] text-white text-[10px] font-bold rounded hover:bg-blue-700 transition"
                      >
                        Continuar
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await PurchaseOrderService.claim(order.id);
                            Swal.fire('Éxito', 'Has tomado esta recepción', 'success').then(() => loadDashboard());
                          } catch(err) {
                            Swal.fire('Error', 'No se pudo tomar la tarea', 'error');
                          }
                        }}
                        className="px-2 py-1 bg-[var(--app-text)] text-white text-[10px] font-bold rounded hover:bg-gray-800 transition"
                      >
                        Tomar Tarea
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

      <InventoryGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
};

export default WarehouseDashboard;
