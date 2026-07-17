import React, { useState, useEffect } from 'react';
import { CalendarClock, Loader2, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import ProductBatchService from '../../services/ProductBatchService';
import { getApiErrorMessage } from '../../utils/apiError';
import ResponsiveModal from '../ui/ResponsiveModal';

const FIELD =
  'h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text)] outline-none transition-all placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60';
const LABEL = 'mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]';

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
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      icon={CalendarClock}
      title={editing ? 'Editar Lote' : 'Nuevo Lote'}
      subtitle={editing ? 'Actualizar datos del lote' : 'Registrar lote con fecha de vencimiento'}
      initialSize="md"
      sizeOptions={['sm', 'md', 'lg']}
      headerClassName="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] text-white"
      footer={
        <div className="flex gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-bg-subtle)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="batch-form"
            disabled={saving}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
      }
    >
      <form id="batch-form" onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
            Identificación del lote
          </p>
          <p className="mt-0.5 text-xs text-[var(--app-text-soft)]">
            Producto, código y fechas para control PEPS y alertas de vencimiento.
          </p>
        </div>

        <div>
          <label className={LABEL}>
            Producto <span className="text-[var(--app-danger)]">*</span>
          </label>
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            disabled={!!editing}
            className={`${FIELD} cursor-pointer`}
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
            <p className="mt-1 text-[10px] text-[var(--app-text-muted)]">
              El producto no se puede cambiar en un lote existente.
            </p>
          )}
        </div>

        <div>
          <label className={LABEL}>
            Código de Lote <span className="text-[var(--app-danger)]">*</span>
          </label>
          <input
            type="text"
            value={form.batchCode}
            onChange={(e) => setForm({ ...form, batchCode: e.target.value })}
            className={FIELD}
            placeholder="Ej: LOTE-2026-001"
            required
          />
        </div>

        <div>
          <label className={LABEL}>
            Cantidad Inicial <span className="text-[var(--app-danger)]">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.initialQuantity}
            onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
            disabled={!!editing}
            className={FIELD}
            placeholder="Ej: 100"
          />
          {editing && (
            <p className="mt-1 text-[10px] text-[var(--app-text-muted)]">
              La cantidad se ajusta con movimientos de inventario y ventas.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>
              Fecha de Ingreso <span className="text-[var(--app-danger)]">*</span>
            </label>
            <input
              type="date"
              value={form.entryDate}
              onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
              className={FIELD}
              required
            />
          </div>
          <div>
            <label className={LABEL}>
              Fecha de Vencimiento <span className="text-[var(--app-danger)]">*</span>
            </label>
            <input
              type="date"
              value={form.expirationDate}
              onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
              className={FIELD}
              required
            />
          </div>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default BatchFormModal;
