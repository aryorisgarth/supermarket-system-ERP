import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  DollarSign,
  FileText,
  Inbox,
  Loader2,
  RefreshCw,
  Scale,
  X,
} from 'lucide-react';
import InventoryMovementService from '../../services/InventoryMovementService';
import Swal from 'sweetalert2';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const number = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });

const movementLabel = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  ADJUSTMENT: 'Ajuste',
  SALE: 'Venta',
  PURCHASE: 'Compra',
  RETURN: 'Devolución',
};

const sourceLabel = {
  PURCHASE_ORDER: 'Compra',
  SALE: 'Venta',
  MANUAL_ADJUSTMENT: 'Ajuste manual',
};

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
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
          <p className="mt-2 truncate text-xl font-black text-[var(--app-text)] tabular-nums">{value}</p>
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
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchMovements();
    }
  }, [isOpen, product]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const data = await InventoryMovementService.getByProduct(product.id);
      setMovements(data || []);
    } catch (error) {
      console.error('Kardex error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el Kardex del producto.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedMovements = useMemo(
    () => [...movements].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [movements]
  );

  const summary = useMemo(() => {
    const entries = movements
      .filter((movement) => Number(movement.factor || 0) > 0)
      .reduce((sum, movement) => sum + Number(movement.quantity || 0), 0);
    const exits = movements
      .filter((movement) => Number(movement.factor || 0) < 0)
      .reduce((sum, movement) => sum + Number(movement.quantity || 0), 0);
    const valuedEntries = movements
      .filter((movement) => Number(movement.factor || 0) > 0)
      .reduce((sum, movement) => sum + Number(movement.totalCost || 0), 0);
    const valuedExits = movements
      .filter((movement) => Number(movement.factor || 0) < 0)
      .reduce((sum, movement) => sum + Number(movement.totalCost || 0), 0);
    const lastMovement = sortedMovements[0];

    return {
      entries,
      exits,
      netFlow: entries - exits,
      valuedEntries,
      valuedExits,
      currentStock: Number(product?.currentStock || lastMovement?.newStock || 0),
      estimatedValue: Number(product?.currentStock || 0) * Number(product?.purchasePrice || 0),
      lastMovement,
    };
  }, [movements, product, sortedMovements]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-6xl w-full overflow-hidden">
        <div className="bg-[var(--app-text)] p-5 text-[var(--app-surface)] flex justify-between items-center shadow-sm">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">Kardex de Inventario</h3>
            <p className="opacity-70 text-[11px] font-medium mt-1">
              {product.name} | SKU {product.barcode} | Stock actual: {number(product.currentStock)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto bg-[var(--app-surface)]">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-[var(--app-text-muted)]">
              <Loader2 size={32} className="animate-spin text-[var(--app-primary)]" />
              <p className="text-xs font-bold">Cargando movimientos...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-[var(--app-text-muted)]">
              <Inbox size={34} className="opacity-60" />
              <p className="text-xs font-bold">Este producto aun no tiene movimientos registrados.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Entradas" value={number(summary.entries)} hint={money(summary.valuedEntries)} icon={ArrowDownToLine} tone="green" />
                <StatCard title="Salidas" value={number(summary.exits)} hint={money(summary.valuedExits)} icon={ArrowUpFromLine} tone="red" />
                <StatCard title="Flujo neto" value={number(summary.netFlow)} hint="Entradas menos salidas" icon={Scale} tone={summary.netFlow >= 0 ? 'blue' : 'amber'} />
                <StatCard title="Valor actual" value={money(summary.estimatedValue)} hint={`${number(summary.currentStock)} unidades`} icon={DollarSign} tone="blue" />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="overflow-x-auto border border-[var(--app-border)] rounded-xl">
                  <table className="w-full min-w-[980px] text-left border-collapse">
                    <thead>
                      <tr className="text-[var(--app-text-muted)] text-[10px] font-extrabold uppercase tracking-widest border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50">
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Movimiento</th>
                        <th className="p-3 text-right">Entrada</th>
                        <th className="p-3 text-right">Salida</th>
                        <th className="p-3 text-right">Stock ant.</th>
                        <th className="p-3 text-right">Stock nuevo</th>
                        <th className="p-3 text-right">Costo</th>
                        <th className="p-3">Referencia</th>
                        <th className="p-3">Usuario</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--app-border)]">
                      {sortedMovements.map((movement) => {
                        const isEntry = Number(movement.factor || 0) > 0;
                        return (
                          <tr key={movement.id} className="text-xs text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)]/30 transition-colors">
                            <td className="p-3 font-bold whitespace-nowrap">
                              {movement.createdAt ? new Date(movement.createdAt).toLocaleString() : '-'}
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full font-black text-[10px] border ${isEntry
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}>
                                {movementLabel[movement.movementType] || movement.movementType}
                              </span>
                            </td>
                            <td className="p-3 text-right font-black text-emerald-600">{isEntry ? number(movement.quantity) : '-'}</td>
                            <td className="p-3 text-right font-black text-red-600">{!isEntry ? number(movement.quantity) : '-'}</td>
                            <td className="p-3 text-right font-bold tabular-nums">{number(movement.previousStock)}</td>
                            <td className="p-3 text-right font-black text-[var(--app-text)] tabular-nums">{number(movement.newStock)}</td>
                            <td className="p-3 text-right">
                              <p className="font-bold">{movement.unitCost != null ? money(movement.unitCost) : '-'}</p>
                              <p className="text-[10px] text-[var(--app-text-muted)]">{movement.totalCost != null ? money(movement.totalCost) : ''}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-black text-[var(--app-text)]">{sourceLabel[movement.sourceType] || movement.sourceType || 'Movimiento'}</p>
                              <p className="text-[10px] font-bold text-[var(--app-text-muted)]">
                                {movement.referenceId ? `Ref #${movement.referenceId}` : 'Sin referencia'}
                              </p>
                            </td>
                            <td className="p-3 font-bold text-[var(--app-text)]">
                              {movement.user?.fullName || movement.user?.username || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <aside className="space-y-3">
                  <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
                    <div className="flex items-center gap-2 text-[var(--app-primary)]">
                      <Boxes size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Ficha del producto</p>
                    </div>
                    <div className="mt-3 space-y-2 text-xs font-bold text-[var(--app-text-soft)]">
                      <p className="flex justify-between gap-3"><span>Stock mínimo</span><b>{number(product.minimumStock)}</b></p>
                      <p className="flex justify-between gap-3"><span>Costo compra</span><b>{money(product.purchasePrice)}</b></p>
                      <p className="flex justify-between gap-3"><span>Precio venta</span><b>{money(product.salePrice)}</b></p>
                      <p className="flex justify-between gap-3"><span>Movimientos</span><b>{movements.length}</b></p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
                    <div className="flex items-center gap-2 text-[var(--app-primary)]">
                      <FileText size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Último evento</p>
                    </div>
                    <p className="mt-3 text-sm font-black text-[var(--app-text)]">
                      {summary.lastMovement ? movementLabel[summary.lastMovement.movementType] || summary.lastMovement.movementType : 'Sin evento'}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[var(--app-text-muted)]">
                      {summary.lastMovement?.createdAt ? new Date(summary.lastMovement.createdAt).toLocaleString() : '-'}
                    </p>
                    {summary.lastMovement?.notes && (
                      <p className="mt-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-xs font-semibold text-[var(--app-text-soft)]">
                        {summary.lastMovement.notes}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={fetchMovements}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-xs font-black uppercase tracking-widest text-[var(--app-text-soft)] transition hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]"
                  >
                    <RefreshCw size={14} />
                    Actualizar Kardex
                  </button>
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
