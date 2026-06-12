import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Save,
  ScanLine,
  Activity,
  Clock,
  Sparkles,
  Barcode,
  TrendingUp,
  Percent,
} from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import BarcodeScanInput from '../../components/warehouse/BarcodeScanInput';
import PurchaseReceiptLineFields from '../../components/warehouse/PurchaseReceiptLineFields';
import PurchaseOrderService from '../../services/PurchaseOrderService';
import LocationService from '../../services/LocationService';
import useBarcodeScan from '../../hooks/useBarcodeScan';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  buildReceiptLinesFromOrder,
  buildReceiptPayload,
  calcReceiptTotal,
  matchReceiptLineByProduct,
  updateReceiptLine,
  validateReceiptPayload,
} from '../../utils/purchaseReceipt';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const WarehouseReceiveOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const scanInputRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receiptNotes, setReceiptNotes] = useState('');
  const [lines, setLines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [scanLog, setScanLog] = useState([]);
  const [activeLineId, setActiveLineId] = useState(null);

  const backPath = location.state?.from === 'purchases' ? '/compras' : '/bodega/recepcion';
  const backLabel = location.state?.from === 'purchases' ? 'Volver a compras' : 'Volver';

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const [orderData, locationsData] = await Promise.all([
        PurchaseOrderService.getById(orderId),
        LocationService.getAll(),
      ]);
      setOrder(orderData);
      setLocations(locationsData || []);
      setLines(buildReceiptLinesFromOrder(orderData, { pendingOnly: true }));
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo cargar la orden de compra.'), 'error');
      navigate(backPath);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate, backPath]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!loading) scanInputRef.current?.focus();
  }, [loading]);

  const onBarcodeFound = useCallback((product) => {
    const line = matchReceiptLineByProduct(lines, product);
    if (!line) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto no esperado',
        text: 'Este código no corresponde a ninguna línea pendiente de esta orden.',
        timer: 2200,
        showConfirmButton: false,
      });
      return;
    }
    const factor = product.uomFactor || 1;
    setActiveLineId(line.itemId);
    setLines((current) =>
      updateReceiptLine(current, line.itemId, 'quantityReceived', Number(line.quantityReceived || 0) + factor)
    );

    // Live scan console feedback
    const timestamp = new Date().toLocaleTimeString();
    setScanLog((prev) => [
      { id: Date.now(), productName: product.name, barcode: product.barcode, qty: factor, time: timestamp },
      ...prev.slice(0, 4)
    ]);
  }, [lines]);

  const {
    scanValue,
    setScanValue,
    scanning,
    handleScanKeyDown,
  } = useBarcodeScan({ onFound: onBarcodeFound });

  const handleLineChange = (itemId, field, value) => {
    setLines((current) => updateReceiptLine(current, itemId, field, value));
  };

  const receiptTotal = useMemo(() => calcReceiptTotal(lines), [lines]);

  // Calcular progreso general de la recepción
  const progressStats = useMemo(() => {
    if (lines.length === 0) return { percent: 100, receivedItems: 0, totalItems: 0 };
    const totalPending = lines.reduce((sum, l) => sum + Number(l.pending || 0), 0);
    const totalReceived = lines.reduce((sum, l) => sum + Number(l.quantityReceived || 0), 0);
    const totalOrdered = lines.reduce((sum, l) => sum + Number(l.pending || 0) + Number(l.alreadyReceived || 0), 0);
    
    const percent = totalOrdered > 0 ? Math.round((totalReceived / totalPending) * 100) : 0;
    return {
      percent: Math.min(percent, 100),
      receivedItems: totalReceived,
      totalItems: totalPending
    };
  }, [lines]);

  const submitReceipt = async (event) => {
    event.preventDefault();
    const payload = buildReceiptPayload(lines, receiptNotes);
    const validation = validateReceiptPayload(payload.items, lines);
    if (!validation.valid) {
      Swal.fire('Validación', validation.message, 'warning');
      return;
    }

    try {
      setSaving(true);
      await PurchaseOrderService.receive(order.id, payload);
      Swal.fire({
        icon: 'success',
        title: 'Mercadería recibida',
        text: 'Stock y lotes actualizados con éxito.',
        timer: 1600,
        showConfirmButton: false,
      });
      navigate(backPath);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo completar la recepción.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--app-text-muted)]">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Recepción"
        title={order.orderNumber}
        description={`Proveedor: ${order.supplierName} · Registrar entrada con lote, vencimiento y control de calidad.`}
        actions={(
          <Link to={backPath}>
            <Button type="button" variant="secondary" icon={ArrowLeft}>{backLabel}</Button>
          </Link>
        )}
        meta={<Badge tone="blue">{lines.length} líneas pendientes</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_350px]">
        {/* Lado Izquierdo: Listado de líneas */}
        <div className="space-y-4">
          <form onSubmit={submitReceipt} className="space-y-4">
            {lines.map((line) => {
              // Calcular porcentaje completado por ítem
              const itemPercent = line.pending > 0 
                ? Math.min(Math.round((Number(line.quantityReceived || 0) / Number(line.pending)) * 100), 100)
                : 100;
              
              // Determinar color de barra de progreso
              let progressColor = 'bg-red-500';
              if (itemPercent > 75) progressColor = 'bg-emerald-500';
              else if (itemPercent > 25) progressColor = 'bg-amber-500';

              return (
                <Card
                  key={line.itemId}
                  className={`transition-all duration-300 border ${activeLineId === line.itemId ? 'ring-2 ring-[var(--app-primary)]/40 border-[var(--app-primary)]' : 'border-[var(--app-border)]'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--app-text)]">{line.productName}</p>
                      <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] mt-0.5">
                        Código {line.barcode || '—'} · Pendiente {line.pending} · Recibido antes {line.alreadyReceived}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-all ${
                        activeLineId === line.itemId
                          ? 'bg-[var(--app-primary)] text-white'
                          : 'text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]/20'
                      }`}
                      onClick={() => {
                        setActiveLineId(line.itemId);
                        scanInputRef.current?.focus();
                      }}
                    >
                      {activeLineId === line.itemId ? 'Línea Activa' : 'Seleccionar'}
                    </button>
                  </div>

                  {/* Barra de progreso visual por ítem */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black text-[var(--app-text-muted)] uppercase tracking-wider">
                      <span>Progreso de recepción</span>
                      <span>{itemPercent}% ({line.quantityReceived || 0} / {line.pending})</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--app-bg-subtle)] rounded-full overflow-hidden border border-[var(--app-border)]">
                      <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${itemPercent}%` }} />
                    </div>
                  </div>

                  <PurchaseReceiptLineFields
                    line={line}
                    locations={locations}
                    onChange={(field, value) => handleLineChange(line.itemId, field, value)}
                  />
                </Card>
              );
            })}

            <Card>
              <label className="block space-y-1">
                <span className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Notas generales de recepción</span>
                <textarea
                  className="ui-input w-full min-h-[80px]"
                  value={receiptNotes}
                  onChange={(event) => setReceiptNotes(event.target.value)}
                  placeholder="Observaciones del ingreso..."
                />
              </label>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border)] pt-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Valor recibido</p>
                  <p className="text-xl font-black text-[var(--app-text)]">{money(receiptTotal)}</p>
                </div>
                <Button type="submit" icon={Save} loading={saving}>
                  Confirmar recepción
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* Lado Derecho: Panel lateral de escaneo */}
        <div className="space-y-4 lg:sticky lg:top-4 h-fit">
          {/* Tarjeta del Escáner */}
          <Card className="border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)]/5">
            <CardHeader
              icon={ScanLine}
              title="Lector de Códigos"
              description="Coloca el foco en el campo para escanear."
            />
            <div className="mt-4">
              <BarcodeScanInput
                ref={scanInputRef}
                value={scanValue}
                onChange={(event) => setScanValue(event.target.value)}
                onKeyDown={handleScanKeyDown}
                disabled={scanning || saving}
              />
            </div>
          </Card>

          {/* Progreso consolidado */}
          <Card className="border-[var(--app-border)]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-[var(--app-primary)]" size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">Resumen General</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-[var(--app-text-soft)]">Total Recibido</span>
                <span className="text-sm font-black text-[var(--app-text)]">{progressStats.receivedItems} u / {progressStats.totalItems} u</span>
              </div>
              <div className="w-full h-3 bg-[var(--app-bg-subtle)] rounded-full overflow-hidden border border-[var(--app-border)]">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--app-primary)] to-blue-500 transition-all duration-500" 
                  style={{ width: `${progressStats.percent}%` }} 
                />
              </div>
              <div className="text-[9px] font-bold text-[var(--app-text-muted)] text-right">
                {progressStats.percent}% del total completado
              </div>
            </div>
          </Card>

          {/* Live Scan Console (Historial) */}
          <Card className="border-[var(--app-border)]">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Activity className="text-indigo-500 animate-pulse" size={16} />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">Historial en Vivo</h4>
              </div>
              <Sparkles size={13} className="text-indigo-500" />
            </div>

            {scanLog.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-[var(--app-text-muted)] font-bold border-2 border-dashed border-[var(--app-border)] rounded-2xl">
                Esperando escaneos...
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {scanLog.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-2.5 p-2.5 bg-[var(--app-bg-subtle)]/60 border border-[var(--app-border)] rounded-xl text-[10px] animate-fade-in"
                  >
                    <Barcode size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[var(--app-text)] truncate">{log.productName}</p>
                      <div className="flex justify-between text-[9px] text-[var(--app-text-muted)] mt-0.5">
                        <span className="font-mono">{log.barcode}</span>
                        <span className="font-black text-indigo-600">+{log.qty} u</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[8px] text-[var(--app-text-muted)] font-bold bg-[var(--app-surface)] px-1 py-0.5 rounded border border-[var(--app-border)] shrink-0">
                      <Clock size={8} /> {log.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {lines.length === 0 && (
        <Card className="py-10 text-center">
          <CheckCircle2 size={32} className="mx-auto text-[var(--app-success)]" />
          <p className="mt-3 font-black text-[var(--app-text)]">Esta orden ya fue recibida completamente.</p>
          <Link to={backPath} className="mt-4 inline-block">
            <Button type="button" variant="secondary" icon={PackageCheck}>Volver a recepciones</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default WarehouseReceiveOrder;
