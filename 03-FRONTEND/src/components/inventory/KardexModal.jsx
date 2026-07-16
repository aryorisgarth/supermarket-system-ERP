import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  DollarSign,
  Download,
  FileText,
  Inbox,
  Loader2,
  RefreshCw,
  Scale,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';
import ReportService from '../../services/ReportService';
import { formatMoney } from '../../utils/formatMoney';
import { getApiErrorMessage } from '../../utils/apiError';

const money = formatMoney;

const number = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const defaultFrom = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return toIsoDate(d);
};

const defaultTo = () => toIsoDate(new Date());

const MOVEMENT_LABELS = {
  ENTRY: 'Entrada',
  SALE: 'Venta',
  ADJUSTMENT: 'Ajuste',
  RETURN: 'Devolución',
  EXPIRED: 'Merma / vencido',
  TRANSFER: 'Traslado',
};

const SOURCE_LABELS = {
  PURCHASE_ORDER: 'Orden de compra',
  SALE: 'Venta POS',
  MANUAL_ADJUSTMENT: 'Ajuste manual',
  LOCATION_TRANSFER: 'Traslado ubicaciones',
  LOCATION_STOCK_SET: 'Ajuste por ubicación',
  INVENTORY_COUNT: 'Conteo cíclico',
  BATCH: 'Lote',
};

const PAGE_SIZE = 25;

const StatCard = ({ title, value, hint, icon: Icon, tone = 'blue' }) => {
  const toneClass = {
    blue: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
    green: 'bg-[var(--app-success-soft)] text-[var(--app-success)]',
    amber: 'bg-[var(--app-warning-soft)] text-[var(--app-warning)]',
    red: 'bg-[var(--app-danger-soft)] text-[var(--app-danger)]',
  }[tone];

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
          <p className="mt-2 truncate text-xl font-bold text-[var(--app-text)] tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">{hint}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
};

const KardexModal = ({ isOpen, onClose, product }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [page, setPage] = useState(1);

  const fetchKardex = useCallback(async () => {
    if (!product?.id) return;
    if (!from || !to) {
      Swal.fire({ icon: 'warning', title: 'Fechas requeridas', text: 'Indica el rango Desde / Hasta.' });
      return;
    }
    if (from > to) {
      Swal.fire({ icon: 'warning', title: 'Rango inválido', text: 'La fecha Desde no puede ser mayor que Hasta.' });
      return;
    }

    setLoading(true);
    try {
      const data = await ReportService.getKardex(product.id, from, to);
      setRows(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (error) {
      console.error('Kardex error:', error);
      setRows([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: getApiErrorMessage(error, 'No se pudo cargar el Kardex del producto.'),
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  }, [product?.id, from, to]);

  useEffect(() => {
    if (isOpen && product) {
      setFrom(defaultFrom());
      setTo(defaultTo());
    }
  }, [isOpen, product?.id]);

  useEffect(() => {
    if (isOpen && product) {
      fetchKardex();
    }
  }, [isOpen, product?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- carga inicial al abrir

  const sortedDesc = useMemo(
    () => [...rows].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [rows],
  );

  const totalPages = Math.max(1, Math.ceil(sortedDesc.length / PAGE_SIZE));
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedDesc.slice(start, start + PAGE_SIZE);
  }, [sortedDesc, page]);

  const summary = useMemo(() => {
    const entries = rows.reduce((sum, row) => sum + Number(row.entryQuantity || 0), 0);
    const exits = rows.reduce((sum, row) => sum + Number(row.exitQuantity || 0), 0);
    const transfers = rows
      .filter((row) => row.movementType === 'TRANSFER')
      .reduce((sum, row) => sum + Number(row.quantity || 0), 0);
    const valuedEntries = rows
      .filter((row) => Number(row.entryQuantity || 0) > 0)
      .reduce((sum, row) => sum + Number(row.totalCost || 0), 0);
    const valuedExits = rows
      .filter((row) => Number(row.exitQuantity || 0) > 0)
      .reduce((sum, row) => sum + Number(row.totalCost || 0), 0);
    const lastMovement = sortedDesc[0];
    const chronological = rows;
    const closingStock = chronological.length
      ? Number(chronological[chronological.length - 1].newStock ?? product?.currentStock ?? 0)
      : Number(product?.currentStock || 0);

    return {
      entries,
      exits,
      transfers,
      netFlow: entries - exits,
      valuedEntries,
      valuedExits,
      currentStock: Number(product?.currentStock ?? closingStock),
      estimatedValue: Number(product?.currentStock || 0) * Number(product?.averageCost ?? product?.purchasePrice ?? 0),
      lastMovement,
    };
  }, [rows, product, sortedDesc]);

  const handleExport = async () => {
    if (!product?.id) return;
    setExporting(true);
    try {
      const blob = await ReportService.downloadKardexExcel(product.id, from, to);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kardex_${product.barcode || product.id}_${from}_${to}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: getApiErrorMessage(error, 'No se pudo exportar el Kardex.'),
      });
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-6xl w-full overflow-hidden">
        <div className="bg-[var(--app-text)] p-5 text-[var(--app-surface)] flex justify-between items-center shadow-sm">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Kardex de Inventario</h3>
            <p className="opacity-70 text-[11px] font-medium mt-1">
              {product.name} · Código {product.barcode || 'N/A'} · Stock actual: {number(product.currentStock)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="opacity-70 hover:opacity-100 hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 px-5 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Desde</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="ui-input w-full text-xs font-bold"
                />
              </div>
              <div>
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Hasta</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="ui-input w-full text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fetchKardex}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-soft)] hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)] disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Consultar
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || loading || rows.length === 0}
                className="flex items-center gap-2 rounded-xl border border-[var(--app-primary)]/30 bg-[var(--app-primary-soft)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-primary)] disabled:opacity-50"
              >
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                Excel
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto bg-[var(--app-surface)]">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-[var(--app-text-muted)]">
              <Loader2 size={32} className="animate-spin text-[var(--app-primary)]" />
              <p className="text-xs font-bold">Cargando kardex...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-[var(--app-text-muted)]">
              <Inbox size={34} className="opacity-60" />
              <p className="text-xs font-bold">No hay movimientos en el rango seleccionado.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Entradas" value={number(summary.entries)} hint={money(summary.valuedEntries)} icon={ArrowDownToLine} tone="green" />
                <StatCard title="Salidas" value={number(summary.exits)} hint={money(summary.valuedExits)} icon={ArrowUpFromLine} tone="red" />
                <StatCard
                  title="Flujo neto"
                  value={number(summary.netFlow)}
                  hint={summary.transfers > 0 ? `Traslados: ${number(summary.transfers)} u` : 'Entradas − salidas'}
                  icon={Scale}
                  tone={summary.netFlow >= 0 ? 'blue' : 'amber'}
                />
                <StatCard title="Valor actual" value={money(summary.estimatedValue)} hint={`${number(summary.currentStock)} unidades`} icon={DollarSign} tone="blue" />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-[var(--app-border)] rounded-xl">
                    <table className="w-full min-w-[1100px] text-left border-collapse">
                      <thead>
                        <tr className="text-[var(--app-text-muted)] text-[10px] font-extrabold uppercase tracking-widest border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50">
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Movimiento</th>
                          <th className="p-3">Lote</th>
                          <th className="p-3 text-right">Entrada</th>
                          <th className="p-3 text-right">Salida</th>
                          <th className="p-3 text-right">Cant.</th>
                          <th className="p-3 text-right">Stock ant.</th>
                          <th className="p-3 text-right">Stock nuevo</th>
                          <th className="p-3 text-right">Costo</th>
                          <th className="p-3">Origen</th>
                          <th className="p-3">Usuario</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--app-border)]">
                        {pageRows.map((row, index) => {
                          const isTransfer = row.movementType === 'TRANSFER';
                          const isEntry = Number(row.entryQuantity || 0) > 0;
                          const isExit = Number(row.exitQuantity || 0) > 0;
                          return (
                            <tr key={`${row.createdAt}-${row.referenceId || ''}-${index}`} className="text-xs text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)]/30 transition-colors">
                              <td className="p-3 font-bold whitespace-nowrap">
                                {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                                    isTransfer
                                      ? 'bg-sky-500/10 text-sky-700 border-sky-500/20'
                                      : isEntry
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                                  }`}
                                >
                                  {MOVEMENT_LABELS[row.movementType] || row.movementType}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[10px] font-bold">
                                {row.batchCode || '—'}
                              </td>
                              <td className="p-3 text-right font-bold text-emerald-600">
                                {isEntry ? number(row.entryQuantity) : '—'}
                              </td>
                              <td className="p-3 text-right font-bold text-red-600">
                                {isExit ? number(row.exitQuantity) : '—'}
                              </td>
                              <td className="p-3 text-right font-bold tabular-nums">
                                {isTransfer ? number(row.quantity) : '—'}
                              </td>
                              <td className="p-3 text-right font-bold tabular-nums">{number(row.previousStock)}</td>
                              <td className="p-3 text-right font-bold text-[var(--app-text)] tabular-nums">{number(row.newStock)}</td>
                              <td className="p-3 text-right">
                                <p className="font-bold">{row.unitCost != null ? money(row.unitCost) : '—'}</p>
                                <p className="text-[10px] text-[var(--app-text-muted)]">
                                  {row.totalCost != null ? money(row.totalCost) : ''}
                                </p>
                              </td>
                              <td className="p-3 max-w-[180px]">
                                <p className="font-bold text-[var(--app-text)]">
                                  {SOURCE_LABELS[row.sourceType] || row.sourceType || 'Movimiento'}
                                </p>
                                {row.notes && (
                                  <p className="mt-0.5 text-[10px] font-semibold text-[var(--app-text-muted)] line-clamp-2">
                                    {row.notes}
                                  </p>
                                )}
                                {row.referenceId != null && !isTransfer && (
                                  <p className="text-[10px] font-bold text-[var(--app-text-muted)]">Ref #{row.referenceId}</p>
                                )}
                              </td>
                              <td className="p-3 font-bold text-[var(--app-text)]">
                                {row.userFullName || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                    <span>
                      {sortedDesc.length} movimiento(s) · Página {page} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 disabled:opacity-40"
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 disabled:opacity-40"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>

                <aside className="space-y-3">
                  <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
                    <div className="flex items-center gap-2 text-[var(--app-primary)]">
                      <Boxes size={16} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Ficha del producto</p>
                    </div>
                    <div className="mt-3 space-y-2 text-xs font-bold text-[var(--app-text-soft)]">
                      <p className="flex justify-between gap-3"><span>Stock mínimo</span><b>{number(product.minimumStock)}</b></p>
                      <p className="flex justify-between gap-3"><span>Costo promedio</span><b>{money(product.averageCost ?? product.purchasePrice)}</b></p>
                      <p className="flex justify-between gap-3"><span>Precio venta</span><b>{money(product.salePrice)}</b></p>
                      <p className="flex justify-between gap-3"><span>Movimientos</span><b>{rows.length}</b></p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
                    <div className="flex items-center gap-2 text-[var(--app-primary)]">
                      <FileText size={16} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Último evento</p>
                    </div>
                    <p className="mt-3 text-sm font-bold text-[var(--app-text)]">
                      {summary.lastMovement
                        ? MOVEMENT_LABELS[summary.lastMovement.movementType] || summary.lastMovement.movementType
                        : 'Sin evento'}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[var(--app-text-muted)]">
                      {summary.lastMovement?.createdAt
                        ? new Date(summary.lastMovement.createdAt).toLocaleString()
                        : '—'}
                    </p>
                    {summary.lastMovement?.notes && (
                      <p className="mt-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-xs font-semibold text-[var(--app-text-soft)]">
                        {summary.lastMovement.notes}
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KardexModal;
