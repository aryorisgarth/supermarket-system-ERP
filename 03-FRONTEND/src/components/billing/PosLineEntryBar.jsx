import { Scale, X } from 'lucide-react';
import Button from '../ui/Button';
import { formatMoney } from '../../utils/formatMoney';


const PosLineEntryBar = ({
  mode = 'idle',
  product,
  quantity,
  onQuantityChange,
  onConfirm,
  onClear,
}) => {
  if (mode === 'idle') {
    return null;
  }

  if (!product) return null;

  const maxStock = Number(product.currentStock ?? 0);
  const parsed = parseFloat(String(quantity).replace(',', '.'));
  const valid = !Number.isNaN(parsed) && parsed > 0 && parsed <= maxStock;
  const isEdit = mode === 'edit';
  const linePreview = valid ? parsed * Number(product.salePrice || 0) : 0;

  return (
    <div className="pos-entry-bar pos-entry-bar--active">
      <div className="pos-entry-bar-product min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-primary)]">
          {isEdit ? 'Editar línea del ticket' : 'Producto a agregar'}
        </p>
        <p className="truncate text-base font-black text-[var(--app-text)] sm:text-lg">{product.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-[var(--app-text-muted)] sm:text-sm">
          {product.barcode ? `Cód. ${product.barcode}` : 'Sin código de barras'}
          {' · '}
          {formatMoney(product.salePrice)} / u
          {' · '}
          Stock {maxStock}
        </p>
      </div>

      <div className="pos-entry-bar-qty">
        <label className="pos-entry-bar-qty-label" htmlFor="pos-entry-qty">
          <Scale size={16} />
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
          className="pos-entry-bar-qty-input"
          autoFocus
        />
      </div>

      <div className="pos-entry-bar-actions">
        <div className="hidden text-right sm:block">
          <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Importe línea</p>
          <p className="text-lg font-black tabular-nums text-[var(--app-primary)]">{formatMoney(linePreview)}</p>
        </div>
        <Button type="button" variant="secondary" onClick={onClear} className="shrink-0">
          <X size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Cancelar</span>
        </Button>
        <Button type="button" disabled={!valid} onClick={onConfirm} className="shrink-0 min-w-[7rem]">
          {isEdit ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </div>
  );
};

export default PosLineEntryBar;
