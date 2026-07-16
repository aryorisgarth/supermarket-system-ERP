import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Save,
  ScanLine,
  ShieldCheck,
  XCircle,
  Info,
  Activity,
  Clock,
  Barcode,
  Package,
  Box,
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
import { computeBaseUnits, formatPackSummary } from '../../utils/purchaseUnits';

const STATUS_LABELS = {
  OPEN: 'Abierto',
  SUBMITTED: 'Enviado',
  APPROVED: 'Aprobado',
  CANCELLED: 'Cancelado',
};

/** PACK = cantidad en presentación (cajas); BASE = unidades sueltas de inventario */
const ENTRY_PACK = 'PACK';
const ENTRY_BASE = 'BASE';

const WarehouseCountSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const scanRef = useRef(null);
  const qtyRef = useRef(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [scanQty, setScanQty] = useState(1);
  const [entryMode, setEntryMode] = useState(ENTRY_PACK);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [pendingBarcode, setPendingBarcode] = useState('');
  const [scanLog, setScanLog] = useState([]);

  const canCount = AuthService.hasPermission('INVENTORY_COUNT');
  const canApprove = AuthService.hasPermission('INVENTORY_ADJUST');

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await InventoryCountService.getById(sessionId);

      const currentUser = AuthService.getCurrentUser();
      if (data.status === 'OPEN') {
        const isMine = currentUser?.id != null && String(data.countedBy?.id) === String(currentUser.id);
        if (data.countedBy && !isMine) {
          Swal.fire('Acceso Denegado', `Este conteo está siendo procesado por ${data.countedBy.fullName || data.countedBy.email}`, 'warning');
          navigate('/bodega/conteo');
          return;
        } else if (!data.countedBy) {
          Swal.fire('Aviso', 'Debes tomar esta tarea en la lista de conteos antes de iniciar.', 'info');
          navigate('/bodega/conteo');
          return;
        }
      }

      setSession(data);
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo cargar el conteo.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!loading && session?.status === 'OPEN' && !pendingProduct) {
      scanRef.current?.focus();
    }
  }, [loading, session?.status, pendingProduct]);

  useEffect(() => {
    if (pendingProduct) {
      qtyRef.current?.focus();
      qtyRef.current?.select?.();
    }
  }, [pendingProduct]);

  const packFactor = Number(pendingProduct?.uomFactor || 1);
  const packLabel = pendingProduct?.uomLabel || (packFactor > 1 ? 'CAJA' : 'UN');
  const hasPack = packFactor > 1;

  const preview = useMemo(() => {
    const qty = Math.max(1, Number(scanQty) || 1);
    if (!pendingProduct) return null;
    if (entryMode === ENTRY_PACK && hasPack) {
      const base = computeBaseUnits(qty, packFactor);
      return {
        qty,
        label: packLabel,
        factor: packFactor,
        baseUnits: base,
        summary: formatPackSummary(qty, packLabel, packFactor),
        hint: `Estás contando ${qty} ${packLabel}${qty === 1 ? '' : 's'} (= ${base} unidades base)`,
      };
    }
    return {
      qty,
      label: 'UN',
      factor: 1,
      baseUnits: qty,
      summary: `${qty} unidades base`,
      hint: `Estás contando ${qty} unidades sueltas (sin multiplicar por caja)`,
    };
  }, [pendingProduct, scanQty, entryMode, hasPack, packFactor, packLabel]);

  const clearPending = useCallback(() => {
    setPendingProduct(null);
    setPendingBarcode('');
    setScanQty(1);
    setEntryMode(ENTRY_PACK);
    setTimeout(() => scanRef.current?.focus(), 50);
  }, []);

  const handleProductIdentified = useCallback((product, barcode) => {
    if (!session || session.status !== 'OPEN') return;
    const factor = Number(product?.uomFactor || 1);
    setPendingProduct(product);
    setPendingBarcode(barcode);
    setEntryMode(factor > 1 ? ENTRY_PACK : ENTRY_BASE);
    setScanQty(1);
  }, [session]);

  const registerCount = useCallback(async () => {
    if (!session || session.status !== 'OPEN' || !pendingProduct) return;
    const qty = Math.max(1, Number(scanQty) || 1);
    const product = pendingProduct;
    const scannedCode = pendingBarcode;

    // PACK: enviar barcode de presentación + qty cajas → backend × factor
    // BASE: enviar barcode base + qty unidades → factor 1
    const barcodeToSend =
      entryMode === ENTRY_BASE
        ? (product.baseBarcode || product.barcode || scannedCode)
        : (product.packBarcode || scannedCode || product.barcode);

    try {
      let selectedBatchId = null;

      if (product.requiresBatch || product.requiresExpiration) {
        setActing(true);
        const batches = await ProductBatchService.getByProduct(product.id);
        setActing(false);

        if (!batches || batches.length === 0) {
          Swal.fire({
            title: 'Sin lotes registrados',
            text: `El producto "${product.baseName || product.name}" requiere lote pero no tiene ningún lote disponible.`,
            icon: 'warning',
            confirmButtonText: 'Aceptar',
          });
          return;
        }

        const inputOptions = {};
        batches.forEach((b) => {
          inputOptions[b.id] = `${b.batchCode} (Vence: ${b.expirationDate || 'Sin fecha'}) [Stock: ${b.currentQuantity}]`;
        });

        const { value: batchId } = await Swal.fire({
          title: 'Seleccionar Lote',
          text: `Seleccione el lote: ${product.baseName || product.name}`,
          input: 'select',
          inputOptions,
          inputPlaceholder: 'Seleccione un lote...',
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
          inputValidator: (value) => (!value ? 'Debes seleccionar un lote' : undefined),
        });

        if (!batchId) return;
        selectedBatchId = Number(batchId);
      }

      setActing(true);
      const updated = await InventoryCountService.scan(session.id, barcodeToSend, qty, selectedBatchId);
      setSession(updated);

      const effectiveFactor = entryMode === ENTRY_PACK && hasPack ? packFactor : 1;
      const effectiveLabel = entryMode === ENTRY_PACK && hasPack ? packLabel : 'UN';
      const baseUnits = qty * effectiveFactor;
      const entry = {
        id: Date.now(),
        productName: product.baseName || product.name,
        barcode: barcodeToSend,
        uomLabel: effectiveLabel,
        uomFactor: effectiveFactor,
        qty,
        baseUnits,
        entryMode,
        time: new Date().toLocaleTimeString(),
      };
      setScanLog((prev) => [entry, ...prev.slice(0, 9)]);
      clearPending();
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo registrar el conteo.'), 'error');
    } finally {
      setActing(false);
    }
  }, [session, pendingProduct, pendingBarcode, scanQty, entryMode, hasPack, packFactor, packLabel, clearPending]);

  const { scanValue, setScanValue, scanning, handleScanKeyDown } = useBarcodeScan({
    onFound: (product, barcode) => handleProductIdentified(product, barcode),
    onNotFound: (code) => {
      Swal.fire('No encontrado', `No hay producto con código ${code}`, 'warning');
    },
  });

  const handleQtyKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      registerCount();
    }
  };

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
            description="1) Escanea el código · 2) Elige si cuentas cajas o unidades · 3) Confirma"
          />

          <div className="mt-4">
            <BarcodeScanInput
              ref={scanRef}
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              onKeyDown={handleScanKeyDown}
              disabled={scanning || acting || !!pendingProduct}
            />
          </div>

          {pendingProduct && (
            <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Producto identificado</p>
                  <p className="text-sm font-bold text-[var(--app-text)]">{pendingProduct.baseName || pendingProduct.name}</p>
                  <p className="text-[11px] font-mono text-[var(--app-text-muted)] mt-0.5">{pendingBarcode}</p>
                  {hasPack && (
                    <p className="mt-1 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                      Presentación detectada: {packLabel} × {packFactor} unidades
                    </p>
                  )}
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={clearPending} disabled={acting}>
                  Cancelar
                </Button>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] mb-2">¿Cómo vas a contar?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!hasPack || acting}
                    onClick={() => setEntryMode(ENTRY_PACK)}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                      entryMode === ENTRY_PACK
                        ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)]/20 ring-1 ring-[var(--app-primary)]'
                        : 'border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40'
                    } ${!hasPack ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <Box size={18} className="text-[var(--app-primary)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)]">Cajas / presentación</p>
                      <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                        Ej: pones <strong>20</strong> → se registran 20 × {hasPack ? packFactor : '?'} = {hasPack ? 20 * packFactor : '—'} UN
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => setEntryMode(ENTRY_BASE)}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                      entryMode === ENTRY_BASE
                        ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)]/20 ring-1 ring-[var(--app-primary)]'
                        : 'border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40'
                    }`}
                  >
                    <Package size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)]">Unidades sueltas</p>
                      <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                        Ej: pones <strong>480</strong> → se registran 480 UN (sin multiplicar)
                      </p>
                    </div>
                  </button>
                </div>
                {!hasPack && (
                  <p className="mt-2 text-[10px] text-[var(--app-text-muted)]">
                    Este código es de unidad base. Solo puedes contar en unidades sueltas (o escanea el código de la caja).
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                    {entryMode === ENTRY_PACK && hasPack ? `Cantidad de ${packLabel}` : 'Cantidad de unidades'}
                  </label>
                  <input
                    ref={qtyRef}
                    type="number"
                    min="1"
                    max="99999"
                    value={scanQty}
                    onChange={(e) => setScanQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    onKeyDown={handleQtyKeyDown}
                    disabled={acting}
                    className="w-28 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-center text-lg font-bold text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] disabled:opacity-50"
                  />
                </div>
                <div className="flex-1 min-w-[200px] rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Equivale a</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-200">
                    {preview?.summary || '—'}
                  </p>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">{preview?.hint}</p>
                </div>
                <Button type="button" icon={CheckCircle2} loading={acting} onClick={registerCount}>
                  Registrar conteo
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {session.status === 'OPEN' && canCount && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4">
          <Card className="border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/10">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  Cajas vs unidades: elige el modo después de escanear
                </p>
                <p className="text-[10px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                  Si compraste <strong>20 cajas de 24</strong>, escanea el código de la caja y elige
                  {' '}<strong>Cajas / presentación</strong> con cantidad <strong>20</strong>
                  {' '}(= 480 UN). Si ya contaste piezas sueltas, elige <strong>Unidades sueltas</strong> y pon <strong>480</strong>.
                  El inventario siempre queda en unidades base.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-[var(--app-border)]">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Activity className="text-indigo-500 animate-pulse" size={16} />
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Historial de Escaneos</h4>
              </div>
              {scanLog.length > 0 && (
                <span className="text-[9px] font-bold text-[var(--app-text-muted)] bg-[var(--app-bg-subtle)] px-2 py-0.5 rounded-full">{scanLog.length}</span>
              )}
            </div>

            {scanLog.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-[var(--app-text-muted)] font-bold border-2 border-dashed border-[var(--app-border)] rounded-2xl">
                Esperando escaneos...
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {scanLog.map((log, idx) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2.5 p-2.5 border rounded-xl text-[10px] animate-fade-in transition-all ${
                      idx === 0
                        ? 'bg-[var(--app-primary-soft)]/15 border-[var(--app-primary)]/30'
                        : 'bg-[var(--app-bg-subtle)]/60 border-[var(--app-border)]'
                    }`}
                  >
                    <Barcode size={14} className={idx === 0 ? 'text-[var(--app-primary)] shrink-0 mt-0.5' : 'text-indigo-500 shrink-0 mt-0.5'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--app-text)] truncate">{log.productName}</p>
                      <div className="flex justify-between text-[9px] text-[var(--app-text-muted)] mt-0.5">
                        <span className="font-mono">{log.barcode}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-[var(--app-bg-subtle)] px-1.5 py-0.5 text-[8px] font-bold">
                            {log.entryMode === ENTRY_PACK ? `${log.qty} ${log.uomLabel}` : `${log.qty} UN`}
                          </span>
                          <span className="font-bold text-emerald-600">+{log.baseUnits} UN</span>
                        </div>
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
      )}

      <Card>
        <CardHeader icon={ClipboardCheck} title="Líneas contadas" description={`${varianceLines.length} con diferencia`} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] bg-[var(--app-surface-2)]">
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
                  : variance > 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold';

                const hasUom = line.uomLabel && line.uomLabel !== 'UN';
                const commercialQty = Number(line.countedQuantityCommercial ?? line.countedQuantity);
                const ubiQty = Number(line.countedQuantity);
                const factor = Number(line.uomFactor ?? 1);

                return (
                  <tr key={line.id} className="hover:bg-[var(--app-surface-2)]/50 transition-colors">
                    <td className="p-2 pl-3">
                      <p className="font-bold text-[var(--app-text)]">{line.productName}</p>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className="text-[10px] text-[var(--app-text-muted)]">{line.barcode}</span>
                        {line.batchCode && (
                          <span className="text-[10px] font-bold text-[var(--app-primary)] bg-[var(--app-primary-soft)]/20 px-1.5 py-0.5 rounded">
                            Lote: {line.batchCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      {hasUom ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                          {line.uomLabel}
                        </span>
                      ) : (
                        <span className="text-[var(--app-text-muted)]">Unidad</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span className="font-bold text-[var(--app-text)]">{commercialQty}</span>
                      {hasUom && (
                        <p className="text-[9px] text-[var(--app-text-muted)] mt-0.5">×{factor} = {ubiQty} UN</p>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span className="font-bold text-[var(--app-text)]">{ubiQty}</span>
                      <p className="text-[9px] text-[var(--app-text-muted)]">UN</p>
                    </td>
                    <td className="p-2 text-center">
                      <span className="font-bold text-[var(--app-text)]">{Number(line.systemQuantity)}</span>
                      <p className="text-[9px] text-[var(--app-text-muted)]">UN</p>
                    </td>
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
