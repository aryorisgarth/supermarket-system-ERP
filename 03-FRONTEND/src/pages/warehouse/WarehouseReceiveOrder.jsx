import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Save,
  ScanLine,
} from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import BarcodeScanInput from '../../components/warehouse/BarcodeScanInput';
import PurchaseReceiptLineFields from '../../components/warehouse/PurchaseReceiptLineFields';
import PurchaseOrderService from '../../services/PurchaseOrderService';
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
  const [activeLineId, setActiveLineId] = useState(null);

  const backPath = location.state?.from === 'purchases' ? '/compras' : '/bodega/recepcion';
  const backLabel = location.state?.from === 'purchases' ? 'Volver a compras' : 'Volver';

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PurchaseOrderService.getById(orderId);
      setOrder(data);
      setLines(buildReceiptLinesFromOrder(data, { pendingOnly: true }));
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo cargar la orden de compra.'), 'error');
      navigate(backPath);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

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
        text: 'Stock y lotes actualizados.',
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

      <Card className="border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)]/10">
        <CardHeader
          icon={ScanLine}
          title="Escaneo de recepción"
          description="Escanea el código de barras para sumar +1 a la línea correspondiente."
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

      <form onSubmit={submitReceipt} className="space-y-4">
        {lines.map((line) => (
          <Card
            key={line.itemId}
            className={activeLineId === line.itemId ? 'ring-2 ring-[var(--app-primary)]/40' : ''}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[var(--app-text)]">{line.productName}</p>
                <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                  Código {line.barcode || '—'} · Pendiente {line.pending} · Recibido antes {line.alreadyReceived}
                </p>
              </div>
              <button
                type="button"
                className="text-[10px] font-black uppercase text-[var(--app-primary)]"
                onClick={() => setActiveLineId(line.itemId)}
              >
                Seleccionar línea
              </button>
            </div>

            <PurchaseReceiptLineFields
              line={line}
              onChange={(field, value) => handleLineChange(line.itemId, field, value)}
            />
          </Card>
        ))}

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
