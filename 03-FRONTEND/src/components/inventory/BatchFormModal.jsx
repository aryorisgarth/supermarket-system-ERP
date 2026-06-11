import React, { useState, useEffect } from 'react';
import { CalendarClock, X, Loader2, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import ProductBatchService from '../../services/ProductBatchService';
import { getApiErrorMessage } from '../../utils/apiError';

const emptyForm = {
  productId: '',
  batchCode: '',
  initialQuantity: '',
  entryDate: new Date().toISOString().slice(0, 10),
  expirationDate: '',
};

const BatchFormModal = ({ isOpen, onClose, editing, products, onSuccess }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        setForm({
          productId: String(editing.product?.id ?? ''),
          batchCode: editing.batchCode || '',
          initialQuantity: String(editing.initialQuantity ?? ''),
          entryDate: editing.entryDate || new Date().toISOString().slice(0, 10),
          expirationDate: editing.expirationDate || '',
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, editing]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productId) {
      return Swal.fire({ icon: 'warning', title: 'Producto requerido', text: 'Seleccione el producto del lote.', confirmButtonColor: '#ef4444' });
    }
    if (!form.batchCode.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Código requerido', text: 'Ingrese el código del lote.', confirmButtonColor: '#ef4444' });
    }
    if (!form.expirationDate) {
      return Swal.fire({ icon: 'warning', title: 'Fecha requerida', text: 'Ingrese la fecha de vencimiento.', confirmButtonColor: '#ef4444' });
    }
    if (form.expirationDate < form.entryDate) {
      return Swal.fire({ icon: 'warning', title: 'Fechas inválidas', text: 'El vencimiento debe ser igual o posterior al ingreso.', confirmButtonColor: '#ef4444' });
    }
    if (!editing && (!form.initialQuantity || Number(form.initialQuantity) <= 0)) {
      return Swal.fire({ icon: 'warning', title: 'Cantidad inválida', text: 'La cantidad inicial debe ser mayor a 0.', confirmButtonColor: '#ef4444' });
    }

    const payload = {
      productId: Number(form.productId),
      batchCode: form.batchCode.trim(),
      initialQuantity: Number(form.initialQuantity || 0),
      entryDate: form.entryDate,
      expirationDate: form.expirationDate,
    };

    try {
      setSaving(true);
      if (editing) {
        await ProductBatchService.update(editing.id, payload);
        Swal.fire({
          icon: 'success',
          title: 'Lote actualizado',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await ProductBatchService.create(payload);
        Swal.fire({
          icon: 'success',
          title: 'Lote registrado',
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save batch error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: getApiErrorMessage(error, 'No se pudo guardar el lote.'),
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--app-bg)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <CalendarClock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                {editing ? 'Editar Lote' : 'Nuevo Lote'}
              </h3>
              <p className="text-white/80 text-[10px] font-medium">
                {editing ? 'Actualizar datos del lote' : 'Registrar lote con fecha de vencimiento'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[var(--app-surface)]">
          <div>
            <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Producto *</label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              disabled={!!editing}
              className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-[var(--app-text)] disabled:opacity-60"
              required
            >
              <option value="">Seleccione un producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.barcode ? `· ${p.barcode}` : ''}
                </option>
              ))}
            </select>
            {editing && (
              <p className="text-[10px] text-[var(--app-text-muted)] mt-1">El producto no se puede cambiar en un lote existente.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Código de Lote *</label>
            <input
              type="text"
              value={form.batchCode}
              onChange={(e) => setForm({ ...form, batchCode: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-[var(--app-text)]"
              placeholder="Ej: LOTE-2026-001"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
              Cantidad Inicial *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.initialQuantity}
              onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
              disabled={!!editing}
              className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-[var(--app-text)] disabled:opacity-60"
              placeholder="Ej: 100"
            />
            {editing && (
              <p className="text-[10px] text-[var(--app-text-muted)] mt-1">La cantidad se ajusta con movimientos de inventario y ventas.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Fecha de Ingreso *</label>
              <input
                type="date"
                value={form.entryDate}
                onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-[var(--app-text)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Fecha de Vencimiento *</label>
              <input
                type="date"
                value={form.expirationDate}
                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-[var(--app-text)]"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[var(--app-surface)] text-[var(--app-text-soft)] border border-[var(--app-border)] rounded-lg font-bold text-xs hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg font-bold text-xs transition-all shadow-enterprise hover:shadow-enterprise-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save size={14} /> {editing ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchFormModal;
