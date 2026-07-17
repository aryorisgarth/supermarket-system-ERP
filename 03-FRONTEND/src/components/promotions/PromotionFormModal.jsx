import React, { useState, useEffect } from 'react';
import { Tag, Save, Loader2, CalendarClock } from 'lucide-react';
import Swal from 'sweetalert2';
import PromotionService from '../../services/PromotionService';
import ProductSearchPicker, { EXPIRY_PRESETS } from './ProductSearchPicker';
import ResponsiveModal from '../ui/ResponsiveModal';
import FormSection from '../ui/FormSection';
import { PRODUCT_FIELD, PRODUCT_LABEL, PRODUCT_NUMBER_FIELD } from '../ui/formFieldStyles';

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  name: '',
  description: '',
  type: 'PERCENTAGE',
  value: '',
  minQuantity: '1',
  productId: '',
  categoryId: '',
  expiryDaysTrigger: '',
  startDate: today,
  endDate: '',
  isActive: true,
  scope: 'product',
};

const typeSummary = (form) => {
  if (form.type === 'BOGO') return '2x1 · mín. 2 unidades';
  if (form.type === 'PERCENTAGE') return form.value ? `${form.value}% descuento` : 'Porcentaje pendiente';
  return form.value ? `C$ ${form.value} por unidad` : 'Monto pendiente';
};

const PromotionFormModal = ({ isOpen, onClose, editing, categories, suppliers, onSuccess }) => {
  const [form, setForm] = useState(emptyForm);
  const [expiryMode, setExpiryMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        setExpiryMode(editing.expiryDaysTrigger != null);
        setSelectedProduct(editing.product || null);
        setForm({
          name: editing.name || '',
          description: editing.description || '',
          type: editing.type || 'PERCENTAGE',
          value: String(editing.value ?? ''),
          minQuantity: String(editing.minQuantity ?? '1'),
          productId: editing.product ? String(editing.product.id) : '',
          categoryId: editing.category ? String(editing.category.id) : '',
          expiryDaysTrigger: editing.expiryDaysTrigger != null ? String(editing.expiryDaysTrigger) : '',
          startDate: editing.startDate || today,
          endDate: editing.endDate || '',
          isActive: editing.isActive ?? true,
          scope: editing.product ? 'product' : 'category',
        });
      } else {
        setForm(emptyForm);
        setExpiryMode(false);
        setSelectedProduct(null);
      }
    }
  }, [isOpen, editing]);

  if (!isOpen) return null;

  const toast = (icon, title) => {
    Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
    }).fire({ icon, title });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return Swal.fire({ icon: 'warning', title: 'Nombre requerido', confirmButtonColor: '#ef4444' });

    if (form.type !== 'BOGO' && (!form.value || Number(form.value) <= 0)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Valor inválido',
        text: 'Ingrese un valor mayor a 0.',
        confirmButtonColor: '#ef4444',
      });
    }

    if (form.type === 'BOGO' && Number(form.minQuantity) < 2) {
      return Swal.fire({
        icon: 'warning',
        title: '2x1 requiere mínimo 2 unidades',
        text: 'En el ticket deben haber al menos 2 unidades del producto para que aplique el descuento.',
        confirmButtonColor: '#ef4444',
      });
    }

    if (!form.endDate) return Swal.fire({ icon: 'warning', title: 'Fecha fin requerida', confirmButtonColor: '#ef4444' });
    if (form.scope === 'product' && !form.productId) return Swal.fire({ icon: 'warning', title: 'Seleccione un producto', confirmButtonColor: '#ef4444' });
    if (form.scope === 'category' && !form.categoryId) return Swal.fire({ icon: 'warning', title: 'Seleccione una categoría', confirmButtonColor: '#ef4444' });

    if (expiryMode && (!form.expiryDaysTrigger || Number(form.expiryDaysTrigger) < 1)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Días de caducidad requeridos',
        text: 'Indique los días antes del vencimiento o desactive la opción de caducidad.',
        confirmButtonColor: '#ef4444',
      });
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      value: form.type === 'BOGO' ? 1 : Number(form.value),
      minQuantity: form.type === 'BOGO' ? Math.max(2, Number(form.minQuantity) || 2) : Number(form.minQuantity) || 1,
      productId: form.scope === 'product' ? Number(form.productId) : null,
      categoryId: form.scope === 'category' ? Number(form.categoryId) : null,
      expiryDaysTrigger: expiryMode && form.expiryDaysTrigger ? Number(form.expiryDaysTrigger) : null,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      if (editing) {
        await PromotionService.update(editing.id, payload);
        toast('success', 'Promoción actualizada');
      } else {
        await PromotionService.create(payload);
        toast('success', 'Promoción creada');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudo guardar la promoción.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#ef4444' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Tag}
      title={editing ? 'Editar promoción' : 'Nueva promoción'}
      subtitle="Descuentos automáticos en caja por producto, categoría o caducidad"
      initialSize="lg"
      sizeOptions={['md', 'lg', 'xl', 'full']}
      bodyClassName="bg-[var(--app-bg-subtle)]/40 p-0"
      headerClassName="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] text-white"
      footer={
        <div className="flex flex-col items-end gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
          <p className="text-right text-[11px] font-bold text-[var(--app-text-muted)]">{typeSummary(form)}</p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-bg-subtle)] sm:flex-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="promotion-form"
              disabled={saving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-7 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50 sm:flex-none"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      }
    >
      <form id="promotion-form" onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5 pos-scroll">
          <FormSection title="1. Datos generales" description="Nombre visible en caja y descripción comercial.">
            <div>
              <label className={PRODUCT_LABEL}>
                Nombre de la promoción <span className="text-[var(--app-danger)]">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={PRODUCT_FIELD}
                placeholder="Ej: Descuento por vencimiento 20%"
                required
              />
            </div>
            <div>
              <label className={PRODUCT_LABEL}>Descripción comercial</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={`${PRODUCT_FIELD} min-h-[72px] resize-none py-2.5`}
                placeholder="Texto opcional para el equipo comercial"
              />
            </div>
          </FormSection>

          <FormSection title="2. Regla de descuento" description="Tipo, valor y cantidad mínima en ticket.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={PRODUCT_LABEL}>
                  Tipo <span className="text-[var(--app-danger)]">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setForm((f) => ({
                      ...f,
                      type: nextType,
                      ...(nextType === 'BOGO' ? { minQuantity: '2', value: '1' } : {}),
                    }));
                  }}
                  className={`${PRODUCT_FIELD} cursor-pointer`}
                >
                  <option value="PERCENTAGE">% Descuento</option>
                  <option value="FIXED">Monto fijo (C$)</option>
                  <option value="BOGO">2x1 (BOGO)</option>
                </select>
              </div>
              <div>
                <label className={PRODUCT_LABEL}>
                  {form.type === 'PERCENTAGE' ? 'Porcentaje (%)' : form.type === 'FIXED' ? 'Monto (C$)' : 'Valor'}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  disabled={form.type === 'BOGO'}
                  className={PRODUCT_NUMBER_FIELD}
                  placeholder={form.type === 'PERCENTAGE' ? 'Ej: 20' : 'Ej: 5.00'}
                />
              </div>
            </div>

            <div>
              <label className={PRODUCT_LABEL}>
                Cantidad mínima en ticket {form.type === 'BOGO' ? '(mín. 2 para 2x1)' : ''}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.minQuantity}
                onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
                className={`${PRODUCT_NUMBER_FIELD} max-w-xs`}
              />
            </div>

            {form.type === 'BOGO' && (
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--app-text-soft)]">
                <strong className="text-[var(--app-text)]">Regla 2x1:</strong> el cliente lleva al menos 2 unidades del producto en la misma línea; se descuenta el importe de 1 unidad.
              </div>
            )}
          </FormSection>

          <FormSection title="3. Alcance" description="Producto específico o categoría completa.">
            <div className="flex gap-2">
              {[
                ['product', 'Producto específico'],
                ['category', 'Categoría completa'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => {
                    setForm((f) => ({ ...f, scope: value, productId: '', categoryId: '' }));
                    if (value === 'category') setSelectedProduct(null);
                  }}
                  className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                    form.scope === value
                      ? 'border-[var(--app-primary)] bg-[var(--app-primary)] text-white'
                      : 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {form.scope === 'product' ? (
              <ProductSearchPicker
                productId={form.productId}
                selectedProduct={selectedProduct}
                categories={categories}
                suppliers={suppliers}
                required
                onSelect={(product) => {
                  setSelectedProduct(product);
                  setForm((f) => ({ ...f, productId: product ? String(product.id) : '' }));
                }}
              />
            ) : (
              <div>
                <label className={PRODUCT_LABEL}>
                  Categoría <span className="text-[var(--app-danger)]">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className={`${PRODUCT_FIELD} cursor-pointer`}
                  required={form.scope === 'category'}
                >
                  <option value="">Seleccione una categoría…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </FormSection>

          <FormSection
            title="4. Disparador por caducidad (opcional)"
            description="Activa la promo solo cuando un lote del producto está por vencer."
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3">
              <input
                type="checkbox"
                checked={expiryMode}
                onChange={(e) => {
                  setExpiryMode(e.target.checked);
                  if (!e.target.checked) setForm((f) => ({ ...f, expiryDaysTrigger: '' }));
                }}
                className="mt-0.5 accent-[var(--app-primary)]"
              />
              <span>
                <span className="flex items-center gap-1 text-xs font-bold text-[var(--app-text)]">
                  <CalendarClock size={14} className="text-[var(--app-warning)]" />
                  Usar caducidad de lote
                </span>
                <span className="mt-0.5 block text-[11px] text-[var(--app-text-muted)]">
                  El POS evalúa el lote más próximo a vencer antes de aplicar el descuento.
                </span>
              </span>
            </label>

            {expiryMode && (
              <div className="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
                <div>
                  <label className={PRODUCT_LABEL}>Días antes del vencimiento</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.expiryDaysTrigger}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDaysTrigger: e.target.value }))}
                    className={PRODUCT_NUMBER_FIELD}
                    placeholder="Ej: 15"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EXPIRY_PRESETS.map(({ days, label }) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, expiryDaysTrigger: String(days) }))}
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-colors ${
                        Number(form.expiryDaysTrigger) === days
                          ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                          : 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </FormSection>

          <FormSection title="5. Vigencia y estado" description="Periodo activo de la promoción.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={PRODUCT_LABEL}>
                  Fecha de inicio <span className="text-[var(--app-danger)]">*</span>
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className={PRODUCT_FIELD}
                  required
                />
              </div>
              <div>
                <label className={PRODUCT_LABEL}>
                  Fecha de término <span className="text-[var(--app-danger)]">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className={PRODUCT_FIELD}
                  required
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="sr-only peer"
              />
              <div
                className={`relative h-5 w-10 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--app-primary)]/30 ${form.isActive ? 'bg-[var(--app-primary)]' : 'bg-[var(--app-border)]'}`}
                aria-hidden
              >
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-xs font-semibold text-[var(--app-text)]">
                {form.isActive ? 'Promoción habilitada en caja' : 'Promoción deshabilitada'}
              </span>
            </label>
          </FormSection>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default PromotionFormModal;
