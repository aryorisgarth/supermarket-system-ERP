import React, { useState, useEffect } from 'react';
import { Tag, X, Save, Loader2, CalendarClock } from 'lucide-react';
import Swal from 'sweetalert2';
import PromotionService from '../../services/PromotionService';
import ProductSearchPicker, { EXPIRY_PRESETS } from './ProductSearchPicker';

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
      timerProgressBar: true
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
        confirmButtonColor: '#ef4444'
      });
    }
    
    if (form.type === 'BOGO' && Number(form.minQuantity) < 2) {
      return Swal.fire({
        icon: 'warning',
        title: '2x1 requiere mínimo 2 unidades',
        text: 'En el ticket deben haber al menos 2 unidades del producto para que aplique el descuento (paga 1, lleva 2).',
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
        text: 'Indique en cuántos días antes del vencimiento debe activarse la promo, o desactive la opción de caducidad.',
        confirmButtonColor: '#ef4444',
      });
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      value: form.type === 'BOGO' ? 1 : Number(form.value),
      minQuantity: form.type === 'BOGO' ? Math.max(2, Number(form.minQuantity) || 2) : (Number(form.minQuantity) || 1),
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-lg w-full overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl"><Tag size={18} /></div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">{editing ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
              <p className="text-white/80 text-[10px] font-bold">Configuración de descuento automático</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 pos-scroll">
          <div>
            <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Nombre de la Promoción *</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)]" 
              placeholder="Ej: Descuento por vencimiento 20%" 
              required 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Descripción Comercial</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
              className="w-full px-4 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)] min-h-[50px] resize-none" 
              placeholder="Ej: Oferta especial para liquidar inventario próximo a vencer..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Tipo *</label>
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
                className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)] cursor-pointer"
              >
                <option value="PERCENTAGE">% Descuento</option>
                <option value="FIXED">Monto fijo</option>
                <option value="BOGO">2x1</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                {form.type === 'PERCENTAGE' ? 'Porcentaje (%)' : form.type === 'FIXED' ? 'Monto por unidad (C$)' : 'Valor (Ignorado)'}
              </label>
              <input 
                type="number" 
                min="0.01" 
                step="0.01" 
                value={form.value} 
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))} 
                disabled={form.type === 'BOGO'} 
                className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)] disabled:opacity-50 disabled:cursor-not-allowed" 
                placeholder={form.type === 'PERCENTAGE' ? 'Ej: 20' : 'Ej: 5'} 
              />
            </div>
          </div>

          {form.type === 'BOGO' && (
            <div className="rounded-2xl border border-purple-500/25 bg-purple-500/5 px-4 py-3 text-[10.5px] text-purple-900 leading-relaxed font-medium">
              <strong>Regla 2x1 (BOGO):</strong> el cliente debe llevar <strong>2 unidades</strong> (o el factor equivalente) en la misma línea de venta.
              Se descontará el importe equivalente a 1 unidad gratis.
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
              Cantidad mínima requerida {form.type === 'BOGO' ? ' (2 para 2x1)' : ''}
            </label>
            <input 
              type="number" 
              min="1" 
              step="1" 
              value={form.minQuantity} 
              onChange={e => setForm(f => ({ ...f, minQuantity: e.target.value }))} 
              className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)]" 
            />
          </div>

          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/20 p-4 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={expiryMode}
                onChange={(e) => {
                  setExpiryMode(e.target.checked);
                  if (!e.target.checked) setForm((f) => ({ ...f, expiryDaysTrigger: '' }));
                }}
                className="mt-0.5 rounded text-[var(--app-primary)] focus:ring-[var(--app-primary)]"
              />
              <span>
                <span className="block text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1">
                  <CalendarClock size={11} className="text-amber-500" /> Disparador por Caducidad de Lote
                </span>
                <span className="block text-[10px] text-[var(--app-text-muted)] mt-0.5">
                  Activa el descuento solo cuando el lote en stock del producto está próximo a vencer.
                </span>
              </span>
            </label>
            {expiryMode && (
              <div className="space-y-2.5 pl-6">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.expiryDaysTrigger}
                  onChange={e => setForm(f => ({ ...f, expiryDaysTrigger: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[var(--app-surface)] border border-amber-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-semibold text-[var(--app-text)]"
                  placeholder="Indique los días de anticipación (ej. 15)"
                />
                <p className="text-[10px] text-[var(--app-text-muted)] leading-relaxed font-medium">
                  El POS buscará el lote más próximo a vencer: si su fecha de vencimiento es menor o igual a esta cantidad de días, la promoción se activa.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EXPIRY_PRESETS.map(({ days, label }) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, expiryDaysTrigger: String(days) }))}
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-black transition-colors ${Number(form.expiryDaysTrigger) === days ? 'border-amber-500 bg-amber-500/15 text-amber-800' : 'border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)]'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Aplica a</label>
            <div className="flex gap-2 mb-2.5">
              {[['product', 'Producto específico'], ['category', 'Categoría completa']].map(([v, l]) => (
                <button 
                  type="button" 
                  key={v} 
                  onClick={() => {
                    setForm(f => ({ ...f, scope: v, productId: '', categoryId: '' }));
                    if (v === 'category') setSelectedProduct(null);
                  }} 
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    form.scope === v 
                      ? 'bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-sm' 
                      : 'border-[var(--app-border)] text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)]'
                  }`}
                >
                  {l}
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
              <select 
                value={form.categoryId} 
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} 
                className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)] cursor-pointer" 
                required={form.scope === 'category'}
              >
                <option value="">Seleccione una categoría...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Fecha de Inicio *</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)]" required />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Fecha de Término *</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-[var(--app-text)]" required />
            </div>
          </div>

          <div className="flex items-center gap-3 cursor-pointer pt-1" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
            <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-[var(--app-primary)]' : 'bg-[var(--app-border)]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs font-bold text-[var(--app-text)]">{form.isActive ? 'Habilitar promoción de inmediato' : 'Mantener deshabilitada por ahora'}</span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--app-border)]/60">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-[var(--app-surface)] text-[var(--app-text-soft)] border border-[var(--app-border)] rounded-xl font-bold text-xs hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer">Cancelar</button>
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-1 px-4 py-2.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-strong)] text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Save size={14} /> {editing ? 'Guardar Cambios' : 'Crear Promoción'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionFormModal;
