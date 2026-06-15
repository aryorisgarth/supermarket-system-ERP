import { Scale, X } from 'lucide-react';
import Button from '../ui/Button';
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
  if (mode === 'idle') {
    return null;
  }

  if (!product) return null;

  const maxStock = Number(product.currentStock ?? 0);
  const parsed = parseFloat(String(quantity).replace(',', '.'));
  const valid = !Number.isNaN(parsed) && parsed > 0 && parsed <= maxStock;
  const isEdit = mode === 'edit';
  const linePreview = valid ? parsed * Number(product.salePrice || 0) : 0;

  const user = AuthService.getCurrentUser();
  const isCashier = user?.role?.name === 'CAJERO';

  return (
    <div className="pos-entry-bar pos-entry-bar--active border-t-2 border-slate-400 bg-slate-150 p-3 flex flex-wrap items-center gap-3">
      <div className="pos-entry-bar-product min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {isEdit ? 'Editar línea del ticket' : 'Producto a agregar'}
        </p>
        <p className="truncate text-base font-bold text-slate-900 uppercase sm:text-lg">{product.name}</p>
        <p className="mt-0.5 text-xs font-bold text-slate-500 sm:text-sm">
          {product.barcode ? `Cód. ${product.barcode}` : 'Sin código de barras'}
          {' · '}
          {formatMoney(product.salePrice)} / u
          {' · '}
          Stock {isCashier ? (maxStock > 0 ? 'Disponible' : 'Agotado') : maxStock}
        </p>
      </div>

      <div className="pos-entry-bar-qty flex flex-col gap-1">
        <label className="pos-entry-bar-qty-label flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600" htmlFor="pos-entry-qty">
          <Scale size={15} />
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
          className="pos-entry-bar-qty-input h-10 min-h-[2.5rem] w-24 text-center rounded-lg border-2 border-slate-300 bg-white text-slate-950 font-bold text-lg outline-none"
          autoFocus
        />
      </div>

      <div className="pos-entry-bar-actions flex items-center gap-2">
        <div className="hidden text-right sm:block pr-2">
          <p className="text-[10px] font-bold uppercase text-slate-650">Importe línea</p>
          <p className="text-lg font-bold tabular-nums text-slate-900">{formatMoney(linePreview)}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 h-10 px-4 rounded-lg text-xs font-bold uppercase bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 cursor-pointer"
        >
          <X size={15} className="inline mr-1" />
          Cancelar
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={onConfirm}
          className="shrink-0 min-w-[7rem] h-10 px-4 rounded-lg text-xs font-bold uppercase bg-slate-800 hover:bg-slate-900 text-white border border-slate-850 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isEdit ? 'Actualizar' : 'Agregar'}
        </button>
      </div>
    </div>
  );
};

export default PosLineEntryBar;
