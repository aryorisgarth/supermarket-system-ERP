import React, { useState } from 'react';
import { X, RefreshCw, Plus, SlidersHorizontal, Loader2, Save } from 'lucide-react';
import InventoryMovementService from '../../services/InventoryMovementService';
import Swal from 'sweetalert2';

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
        confirmButtonColor: '#10b981'
      });
      return;
    }

    if (!adjustNotes.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Indica el motivo del movimiento para dejar trazabilidad en Kardex.',
        confirmButtonColor: '#10b981'
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
        confirmButtonColor: '#ef4444'
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
        notes: adjustNotes.trim()
      });

      Swal.fire({
        icon: 'success',
        title: 'Movimiento Registrado',
        text: `El stock se ha actualizado a ${finalAbsoluteQty} unidades y quedo registrado en Kardex.`,
        timer: 1800,
        showConfirmButton: false
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Adjust stock error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Ajuste',
        text: error.response?.data?.message || 'No se pudo registrar el ajuste en el servidor.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-sm w-full overflow-hidden">
        
        <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <RefreshCw size={18} className="animate-spin animate-duration-1500" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Ajuste de Bodega</h3>
              <p className="text-white/80 text-[10px] font-medium truncate max-w-[200px] mt-0.5">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        
        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-[var(--app-surface)]">
          <div className="bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] p-3 rounded-xl text-xs font-bold text-[var(--app-text-muted)] flex justify-between items-center shadow-inner">
            <span>Stock Actual en Bodega:</span>
            <span className="text-[var(--app-primary)] font-bold text-sm">{product.currentStock} unidades</span>
          </div>

          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">Tipo de Movimiento</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('ADD')}
                className={`py-3 rounded-xl font-bold transition-all text-xs border flex items-center justify-center gap-1 cursor-pointer ${adjustType === 'ADD' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm font-bold' : 'bg-[var(--app-surface)] text-[var(--app-text-soft)] border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]'}`}
              >
                <Plus size={14} /> Entrada / Compra
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('SUB')}
                className={`py-3 rounded-xl font-bold transition-all text-xs border flex items-center justify-center gap-1 cursor-pointer ${adjustType === 'SUB' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-sm font-bold' : 'bg-[var(--app-surface)] text-[var(--app-text-soft)] border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]'}`}
              >
                <SlidersHorizontal size={14} className="rotate-90" /> Salida / Merma
              </button>
            </div>
          </div>

          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">Cantidad a Ajustar</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-lg shadow-sm"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">Motivo / Referencia</label>
            <textarea
              required
              rows="3"
              maxLength="255"
              placeholder="Ej. Compra a proveedor, merma por vencimiento, ajuste por conteo fisico"
              className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm resize-none"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
            />
          </div>

          
          <div className="flex gap-3 pt-4 border-t border-[var(--app-border)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[var(--app-border)] hover:border-[var(--app-border-strong)] rounded-xl font-bold text-[var(--app-text-soft)] bg-[var(--app-surface)] hover:bg-[var(--app-bg-subtle)] transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={adjusting}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-xl font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              {adjusting ? (
                <Loader2 size={14} className="animate-spin animate-duration-1000" />
              ) : (
                <Save size={14} />
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
