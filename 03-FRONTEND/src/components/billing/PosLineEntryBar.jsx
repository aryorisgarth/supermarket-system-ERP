import { Scale, X } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';
import AuthService from '../../services/AuthService';

const PosLineEntryBar = ({
  mode = 'idle',
  product,
  quantity,
  onQuantityChange,
  onConfirm,
  onClear,
}) => {
  if (mode === 'idle' || !product) return null;

  const maxStock = Number(product.currentStock ?? 0);
  const parsed = parseFloat(String(quantity).replace(',', '.'));
  const valid = !Number.isNaN(parsed) && parsed > 0 && parsed <= maxStock;
  const isEdit = mode === 'edit';
  const linePreview = valid ? parsed * Number(product.salePrice || 0) : 0;

  const user = AuthService.getCurrentUser();
  const isCashier = user?.role?.name === 'CAJERO';

  return (
    <div className="pos-entry-bar pos-entry-bar--active relative z-50 flex translate-y-0 transform flex-wrap items-center gap-4 border-t border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--app-primary)]/50 to-transparent" />

      <div className="pos-entry-bar-product min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`inline-flex h-2 w-2 animate-pulse rounded-full shadow-sm ${
              isEdit ? 'bg-[var(--app-warning)]' : 'bg-[var(--app-primary)]'
            }`}
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
            {isEdit ? 'Editar línea del ticket' : 'Producto en curso'}
          </p>
        </div>
        <p className="truncate text-lg font-black uppercase tracking-tight text-[var(--app-text)]">
          {product.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--app-text-soft)]">
            {product.barcode ? `Cód. ${product.barcode}` : 'Sin código'}
          </span>
          <span className="text-[11px] font-bold text-[var(--app-text-muted)]">•</span>
          <span className="rounded border border-[var(--app-primary)]/30 bg-[var(--app-primary-soft)] px-1.5 py-0.5 text-[12px] font-bold text-[var(--app-primary)]">
            {formatMoney(product.salePrice)} / u
          </span>
          <span className="text-[11px] font-bold text-[var(--app-text-muted)]">•</span>
          <span
            className={`rounded border px-1.5 py-0.5 text-[11px] font-bold ${
              isCashier
                ? maxStock > 0
                  ? 'border-[var(--app-success)]/30 bg-[var(--app-success-soft)] text-[var(--app-success)]'
                  : 'border-[var(--app-danger)]/30 bg-[var(--app-danger-soft)] text-[var(--app-danger)]'
                : 'border-[var(--app-border)] bg-[var(--app-bg-subtle)] text-[var(--app-text-soft)]'
            }`}
          >
            Stock: {isCashier ? (maxStock > 0 ? 'Disponible' : 'Agotado') : maxStock}
          </span>
        </div>
      </div>

      <div className="pos-entry-bar-qty flex flex-col gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-2">
        <label
          className="pos-entry-bar-qty-label flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]"
          htmlFor="pos-entry-qty"
        >
          <Scale size={13} className="text-[var(--app-primary)]" />
          Cantidad
        </label>
        <input
          id="pos-entry-qty"
          type="number"
          inputMode="decimal"
          min="0.001"
          step="any"
          max={maxStock}
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) onConfirm();
            if (e.key === 'Escape') onClear();
          }}
          className="pos-entry-bar-qty-input h-10 w-28 rounded-lg border-2 border-[var(--app-primary)]/30 bg-[var(--app-surface)] text-center text-xl font-black text-[var(--app-text)] shadow-sm outline-none transition-all focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-primary)]/20"
          autoFocus
        />
      </div>

      <div className="pos-entry-bar-actions flex items-center gap-3">
        <div className="hidden h-12 flex-col justify-center border-r border-[var(--app-border)] pr-4 text-right sm:flex">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
            Importe línea
          </p>
          <p className="mt-0.5 text-[22px] font-black tabular-nums leading-none tracking-tight text-[var(--app-text)]">
            {formatMoney(linePreview)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-soft)] shadow-sm transition-colors hover:bg-[var(--app-border)]/30 active:scale-95"
        >
          <X size={16} className="mr-1.5 text-[var(--app-text-muted)]" />
          Cancelar
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={onConfirm}
          className="flex h-12 min-w-[8rem] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--app-primary)] bg-[var(--app-primary)] px-5 text-[11px] font-black uppercase tracking-widest text-white shadow-md shadow-[var(--app-primary)]/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          {isEdit ? 'Actualizar' : 'Agregar (Enter)'}
        </button>
      </div>
    </div>
  );
};

export default PosLineEntryBar;
