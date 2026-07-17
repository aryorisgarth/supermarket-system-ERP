import React, { useState } from 'react';
import { RefreshCw, Plus, SlidersHorizontal, Loader2, Save } from 'lucide-react';
import InventoryMovementService from '../../services/InventoryMovementService';
import Swal from 'sweetalert2';
import ResponsiveModal from '../ui/ResponsiveModal';

const StockAdjustmentModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('ADD');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adjustQty || parseFloat(adjustQty) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad Inválida',
        text: 'Por favor ingresa una cantidad mayor que cero.',
        confirmButtonColor: '#10b981',
      });
      return;
    }

    if (!adjustNotes.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Indica el motivo del movimiento para dejar trazabilidad en Kardex.',
        confirmButtonColor: '#10b981',
      });
      return;
    }

    setAdjusting(true);
    const sign = adjustType === 'ADD' ? 1 : -1;
    const current = parseFloat(product.currentStock || 0);
    const delta = parseFloat(adjustQty) * sign;
    const finalAbsoluteQty = current + delta;

    if (finalAbsoluteQty < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Ajuste Inválido',
        text: 'El stock resultante en almacén no puede ser menor que cero.',
        confirmButtonColor: '#ef4444',
      });
      setAdjusting(false);
      return;
    }

    try {
      await InventoryMovementService.create({
        productId: product.id,
        movementType: adjustType === 'ADD' ? 'ENTRY' : 'ADJUSTMENT',
        quantity: parseFloat(adjustQty),
        factor: sign,
        notes: adjustNotes.trim(),
      });

      Swal.fire({
        icon: 'success',
        title: 'Movimiento Registrado',
        text: `El stock se ha actualizado a ${finalAbsoluteQty} unidades y quedo registrado en Kardex.`,
        timer: 1800,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Adjust stock error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Ajuste',
        text: error.response?.data?.message || 'No se pudo registrar el ajuste en el servidor.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      icon={RefreshCw}
      title="Ajuste de Bodega"
      subtitle={product.name}
      initialSize="sm"
      sizeOptions={['sm', 'md', 'lg']}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div className="flex items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 p-3 text-xs font-bold text-[var(--app-text-muted)] shadow-inner">
          <span>Stock Actual en Bodega:</span>
          <span className="text-sm font-bold text-[var(--app-primary)]">{product.currentStock} unidades</span>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
            Tipo de Movimiento
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustType('ADD')}
              className={`flex cursor-pointer items-center justify-center gap-1 rounded-xl border py-3 text-xs font-bold transition-all ${
                adjustType === 'ADD'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-sm'
                  : 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)]'
              }`}
            >
              <Plus size={14} /> Entrada / Compra
            </button>
            <button
              type="button"
              onClick={() => setAdjustType('SUB')}
              className={`flex cursor-pointer items-center justify-center gap-1 rounded-xl border py-3 text-xs font-bold transition-all ${
                adjustType === 'SUB'
                  ? 'border-red-500/20 bg-red-500/10 text-red-500 shadow-sm'
                  : 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)]'
              }`}
            >
              <SlidersHorizontal size={14} className="rotate-90" /> Salida / Merma
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
            Cantidad a Ajustar
          </label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 px-3 py-2.5 text-lg font-bold text-[var(--app-text)] shadow-sm transition-all focus:border-primary focus:bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
            Motivo / Referencia
          </label>
          <textarea
            required
            rows="3"
            maxLength="255"
            placeholder="Ej. Compra a proveedor, merma por vencimiento, ajuste por conteo fisico"
            className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 px-3 py-2.5 text-xs font-bold text-[var(--app-text)] shadow-sm transition-all focus:border-primary focus:bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={adjustNotes}
            onChange={(e) => setAdjustNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3 border-t border-[var(--app-border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-3 text-xs font-bold uppercase tracking-wider text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-bg-subtle)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={adjusting}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[var(--app-primary)] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:opacity-90 disabled:opacity-60"
          >
            {adjusting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default StockAdjustmentModal;
