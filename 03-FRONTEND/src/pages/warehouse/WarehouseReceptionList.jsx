import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, Loader2, Search, Truck, BookOpen, ChevronDown, ChevronRight, PackageCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PurchaseOrderService from '../../services/PurchaseOrderService';
import { formatMoney } from '../../utils/formatMoney';
import { PURCHASE_STATUS_LABELS } from '../../utils/purchaseReceipt';
import InventoryGuideModal from '../../components/warehouse/InventoryGuideModal';
import AuthService from '../../services/AuthService';
import UserService from '../../services/UserService';
import Swal from 'sweetalert2';

const money = formatMoney;

const OrderRow = ({ order, money }) => {
  const [expanded, setExpanded] = useState(false);
  const [fullOrder, setFullOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = async () => {
    if (!expanded && !fullOrder) {
      setLoading(true);
      try {
        const data = await PurchaseOrderService.getById(order.id);
        setFullOrder(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <div className="rounded-xl border border-[var(--app-border)] overflow-hidden transition-all hover:border-[var(--app-primary)]/40 bg-[var(--app-surface)]">
      <div 
        className="flex items-center justify-between gap-4 px-4 py-4 cursor-pointer hover:bg-[var(--app-primary-soft)]/10"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <Truck size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--app-text)]">{order.orderNumber}</p>
            <p className="truncate text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
              {order.supplierName} · {money(order.subtotal)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge tone={order.status === 'PARTIALLY_RECEIVED' ? 'amber' : 'blue'}>
            {PURCHASE_STATUS_LABELS[order.status] || order.status}
          </Badge>
          
          <div className="flex flex-col items-end">
            {!order.receivedBy ? (
              <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase mb-1">Sin asignar</span>
            ) : (
              <span className="text-[10px] font-bold text-[var(--app-primary)] uppercase mb-1">Responsable: {order.receivedBy.fullName || order.receivedBy.name || order.receivedBy.email}</span>
            )}

            {(!order.receivedBy) ? (
              <button 
                onClick={async (e) => { 
                  e.stopPropagation(); 
                  try {
                    await PurchaseOrderService.claim(order.id);
                    Swal.fire('Éxito', 'Has tomado esta recepción', 'success').then(() => window.location.reload());
                  } catch(err) {
                    Swal.fire('Error', 'No se pudo tomar la tarea. Quizás alguien más la tomó.', 'error');
                  }
                }}
                className="px-3 py-1.5 bg-[var(--app-text)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-gray-800 transition"
              >
                Tomar Tarea <PackageCheck size={14} />
              </button>
            ) : order.receivedBy.id === AuthService.getCurrentUser()?.id ? (
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/bodega/recepcion/${order.id}`); }}
                className="px-3 py-1.5 bg-[var(--app-primary)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition"
              >
                Continuar Recepción <ArrowRight size={14} />
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <button disabled className="px-3 py-1.5 bg-gray-200 text-gray-500 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-not-allowed">
                  En proceso <PackageCheck size={14} />
                </button>
                {(AuthService.hasPermission('ADMIN') || AuthService.getCurrentUser()?.role?.name?.includes('ADMIN')) && (
                  <button 
                    onClick={async (e) => { 
                      e.stopPropagation(); 
                      const { value: userId } = await Swal.fire({
                        title: 'Reasignar Tarea',
                        input: 'number',
                        inputLabel: 'ID del nuevo usuario bodeguero',
                        inputPlaceholder: 'Ej: 5',
                        showCancelButton: true
                      });
                      if (userId) {
                        try {
                          await PurchaseOrderService.assign(order.id, parseInt(userId));
                          Swal.fire('Asignado', 'Tarea reasignada correctamente', 'success').then(() => window.location.reload());
                        } catch(err) {
                          Swal.fire('Error', 'No se pudo reasignar', 'error');
                        }
                      }
                    }}
                    className="px-2 py-1.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg flex items-center hover:bg-red-200 transition"
                  >
                    Reasignar
                  </button>
                )}
              </div>
            )}
          </div>
          <span className="text-[var(--app-text-muted)] w-5 flex justify-center">
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-[var(--app-bg-subtle)]/30 border-t border-[var(--app-border)]/50">
           {loading ? (
             <div className="flex justify-center p-4"><Loader2 size={16} className="animate-spin text-[var(--app-text-muted)]"/></div>
           ) : fullOrder?.items?.length > 0 ? (
             <div>
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <PackageCheck className="text-[var(--app-text)]" size={14} />
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--app-text)]">
                    Resumen de Productos a Recibir
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fullOrder.items.map(line => {
                    const isPack = line.unitsPerPack > 1;
                    return (
                      <div key={line.id} className="p-3 bg-[var(--app-surface)] rounded-xl border border-[var(--app-border)] text-xs text-[var(--app-text)] space-y-2 shadow-sm">
                        <p className="font-extrabold text-[11px] border-b border-[var(--app-border)] pb-1.5">
                          {line.product?.name}
                        </p>
                        <p className="leading-relaxed">
                          Recibir: <strong>{line.quantityInPacks || line.quantityOrdered} {line.packLabel === 'UN' ? 'unidades sueltas' : (line.packLabel || 'UN').toUpperCase()}</strong>.
                        </p>
                        {isPack && (
                          <p className="leading-relaxed text-[10px] text-[var(--app-text-soft)]">
                            Equivale a <strong>{line.quantityOrdered} uds base</strong> ({line.unitsPerPack} uds c/u).
                          </p>
                        )}
                        <div className="bg-[var(--app-bg-subtle)] p-2 rounded text-[10px] mt-2 font-medium border border-[var(--app-border)]/50 flex justify-between items-center">
                          <span>Código: <code className="bg-[var(--app-surface)] px-1 py-0.5 rounded font-mono font-bold text-[11px] border border-[var(--app-border)]">{line.product?.barcode || '—'}</code></span>
                          <span className="text-[var(--app-primary)] font-bold">1 Escaneo = +{line.unitsPerPack || 1} uds</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
           ) : (
             <p className="text-xs text-[var(--app-text-muted)] p-2">No hay productos detallados en esta orden.</p>
           )}
        </div>
      )}
    </div>
  );
};

const WarehouseReceptionList = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);

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
        actions={
          <Button type="button" variant="secondary" icon={BookOpen} onClick={() => setShowGuideModal(true)}>
            Guía de Recepción
          </Button>
        }
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
            <OrderRow key={order.id} order={order} money={money} />
          ))}
        </div>
      </Card>
      
      <InventoryGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialStep={1}
      />
    </div>
  );
};

export default WarehouseReceptionList;
