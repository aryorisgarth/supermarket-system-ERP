import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Save,
  ScanLine,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import BarcodeScanInput from '../../components/warehouse/BarcodeScanInput';
import InventoryCountService from '../../services/InventoryCountService';
import ProductBatchService from '../../services/ProductBatchService';
import AuthService from '../../services/AuthService';
import useBarcodeScan from '../../hooks/useBarcodeScan';
import { getApiErrorMessage } from '../../utils/apiError';


const STATUS_LABELS = {
  OPEN: 'Abierto',
  SUBMITTED: 'Enviado',
  APPROVED: 'Aprobado',
  CANCELLED: 'Cancelado',
};

const WarehouseCountSession = () => {
  const { sessionId } = useParams();
  const scanRef = useRef(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [scanQty, setScanQty] = useState(1);

  const canCount = AuthService.hasPermission('INVENTORY_COUNT');
  const canApprove = AuthService.hasPermission('INVENTORY_ADJUST');

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await InventoryCountService.getById(sessionId);
      setSession(data);
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo cargar el conteo.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!loading && session?.status === 'OPEN') scanRef.current?.focus();
  }, [loading, session?.status]);

  const handleScan = useCallback(async (product, barcode) => {
    if (!session || session.status !== 'OPEN') return;
    const qty = Math.max(1, Number(scanQty) || 1);
    try {
      let selectedBatchId = null;

      if (product && (product.requiresBatch || product.requiresExpiration)) {
        setActing(true);
        const batches = await ProductBatchService.getByProduct(product.id);
        setActing(false);

        if (!batches || batches.length === 0) {
          Swal.fire({
            title: 'Sin lotes registrados',
            text: `El producto "${product.name}" requiere lote pero no tiene ningún lote disponible en el sistema.`,
            icon: 'warning',
            confirmButtonText: 'Aceptar'
          });
          return;
        }

        const inputOptions = {};
        batches.forEach(b => {
          inputOptions[b.id] = `${b.batchCode} (Vence: ${b.expirationDate || 'Sin fecha'}) [Stock: ${b.currentQuantity}]`;
        });

        const { value: batchId } = await Swal.fire({
          title: 'Seleccionar Lote',
          text: `Seleccione el lote del producto: ${product.name}`,
          input: 'select',
          inputOptions,
          inputPlaceholder: 'Seleccione un lote...',
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
          inputValidator: (value) => {
            if (!value) {
              return 'Debes seleccionar un lote';
            }
          }
        });

        if (!batchId) return;
        selectedBatchId = Number(batchId);
      }

      setActing(true);
      const updated = await InventoryCountService.scan(session.id, barcode, qty, selectedBatchId);
      setSession(updated);
      setScanQty(1); // reset cantidad después de escanear
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo registrar el escaneo.'), 'error');
    } finally {
      setActing(false);
    }
  }, [session, scanQty]);

  const { scanValue, setScanValue, scanning, handleScanKeyDown } = useBarcodeScan({
    onFound: (product, barcode) => handleScan(product, barcode),
  });

  const runAction = async (action) => {
    const labels = {
      submit: { title: '¿Enviar conteo?', text: 'El supervisor deberá aprobar las diferencias.', fn: () => InventoryCountService.submit(session.id) },
      approve: { title: '¿Aprobar conteo?', text: 'Se aplicarán ajustes de inventario por las diferencias.', fn: () => InventoryCountService.approve(session.id) },
      cancel: { title: '¿Cancelar conteo?', text: 'Se descartará esta sesión abierta.', fn: () => InventoryCountService.cancel(session.id) },
    };
    const config = labels[action];
    const result = await Swal.fire({
      title: config.title,
      text: config.text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      setActing(true);
      const updated = await config.fn();
      setSession(updated);
      Swal.fire({ icon: 'success', title: 'Listo', timer: 1200, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo completar la acción.'), 'error');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--app-primary)]" size={28} />
      </div>
    );
  }

  if (!session) return null;

  const lines = session.lines || [];
  const varianceLines = lines.filter((line) => Number(line.variance) !== 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Conteo cíclico"
        title={session.sessionCode}
        description={`Zona: ${session.warehouseZone || 'General'} · ${lines.length} productos contados`}
        actions={(
          <Link to="/bodega/conteo">
            <Button type="button" variant="secondary" icon={ArrowLeft}>Volver</Button>
          </Link>
        )}
        meta={<Badge tone="blue">{STATUS_LABELS[session.status] || session.status}</Badge>}
      />

      {session.status === 'OPEN' && canCount && (
        <Card className="border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)]/10">
          <CardHeader
            icon={ScanLine}
            title="Escaneo de conteo"
            description={scanQty > 1 ? `Cada escaneo sumará ×${scanQty} al producto.` : 'Cada escaneo suma +1 al producto.'}
          />
          <div className="mt-4 flex items-center gap-3">
            <BarcodeScanInput
              ref={scanRef}
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              onKeyDown={handleScanKeyDown}
              disabled={scanning || acting}
            />
            {/* Campo de cantidad */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <label className="text-[10px] font-black uppercase text-[var(--app-text-muted)] whitespace-nowrap">Cantidad</label>
              <input
                type="number"
                min="1"
                max="9999"
                value={scanQty}
                onChange={(e) => setScanQty(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={scanning || acting}
                className="w-20 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-center text-sm font-black text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] disabled:opacity-50"
              />
            </div>
          </div>
          {scanQty > 1 && (
            <p className="mt-2 text-[11px] text-[var(--app-primary)] font-bold">
              ⚡ Modo bulk: al escanear se registrarán {scanQty} unidades de la presentación escaneada.
            </p>
          )}
        </Card>
      )}

      <Card>
        <CardHeader icon={ClipboardCheck} title="Líneas contadas" description={`${varianceLines.length} con diferencia`} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="text-[10px] font-black uppercase text-[var(--app-text-muted)] bg-[var(--app-surface-2)]">
              <tr>
                <th className="p-2 pl-3">Producto / Lote</th>
                <th className="p-2 text-center">Presentación</th>
                <th className="p-2 text-center">Cant. Comercial</th>
                <th className="p-2 text-center">Equiv. UBI</th>
                <th className="p-2 text-center">Sistema (UBI)</th>
                <th className="p-2 text-center">Diferencia (UBI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]">
              {lines.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-[var(--app-text-muted)]">Escanea productos para iniciar.</td></tr>
              )}
              {lines.map((line) => {
                const variance = Number(line.variance);
                const varTone = variance === 0
                  ? 'text-[var(--app-text-muted)]'
                  : variance > 0 ? 'text-emerald-600 font-black' : 'text-red-500 font-black';

                const hasUom = line.uomLabel && line.uomLabel !== 'UN';
                const commercialQty = Number(line.countedQuantityCommercial ?? line.countedQuantity);
                const ubiQty = Number(line.countedQuantity);
                const factor = Number(line.uomFactor ?? 1);

                return (
                  <tr key={line.id} className="hover:bg-[var(--app-surface-2)]/50 transition-colors">
                    {/* Producto + Lote */}
                    <td className="p-2 pl-3">
                      <p className="font-black text-[var(--app-text)]">{line.productName}</p>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className="text-[10px] text-[var(--app-text-muted)]">{line.barcode}</span>
                        {line.batchCode && (
                          <span className="text-[10px] font-bold text-[var(--app-primary)] bg-[var(--app-primary-soft)]/20 px-1.5 py-0.5 rounded">
                            Lote: {line.batchCode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Presentación escaneada */}
                    <td className="p-2 text-center">
                      {hasUom ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                          {line.uomLabel}
                        </span>
                      ) : (
                        <span className="text-[var(--app-text-muted)]">Unidad</span>
                      )}
                    </td>

                    {/* Cantidad Comercial (cuántas presentaciones se escanearon) */}
                    <td className="p-2 text-center">
                      <span className="font-black text-[var(--app-text)]">{commercialQty}</span>
                      {hasUom && (
                        <p className="text-[9px] text-[var(--app-text-muted)] mt-0.5">×{factor} = {ubiQty} UN</p>
                      )}
                    </td>

                    {/* Equivalente UBI acumulado */}
                    <td className="p-2 text-center">
                      <span className="font-bold text-[var(--app-text)]">{ubiQty}</span>
                      <p className="text-[9px] text-[var(--app-text-muted)]">UN</p>
                    </td>

                    {/* Sistema UBI */}
                    <td className="p-2 text-center">
                      <span className="font-bold text-[var(--app-text)]">{Number(line.systemQuantity)}</span>
                      <p className="text-[9px] text-[var(--app-text-muted)]">UN</p>
                    </td>

                    {/* Varianza */}
                    <td className={`p-2 text-center ${varTone}`}>
                      {variance > 0 ? `+${variance}` : variance}
                      <p className="text-[9px] font-normal text-[var(--app-text-muted)]">UN</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--app-border)] pt-4">
          {session.status === 'OPEN' && canCount && (
            <>
              <Button type="button" icon={Save} loading={acting} onClick={() => runAction('submit')}>
                Enviar conteo
              </Button>
              <Button type="button" variant="secondary" icon={XCircle} loading={acting} onClick={() => runAction('cancel')}>
                Cancelar
              </Button>
            </>
          )}
          {session.status === 'SUBMITTED' && canApprove && (
            <Button type="button" variant="success" icon={ShieldCheck} loading={acting} onClick={() => runAction('approve')}>
              Aprobar y ajustar stock
            </Button>
          )}
          {session.status === 'APPROVED' && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={16} /> Conteo aprobado — ajustes aplicados al inventario.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WarehouseCountSession;
