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
    <div className="pos-entry-bar pos-entry-bar--active border-t border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)] p-4 flex flex-wrap items-center gap-4 relative z-50 transition-all duration-300 transform translate-y-0">
      {/* Subtle top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

      <div className="pos-entry-bar-product min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex h-2 w-2 rounded-full ${isEdit ? 'bg-amber-500' : 'bg-indigo-500'} shadow-sm animate-pulse`}></span>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {isEdit ? 'Editar línea del ticket' : 'Producto en curso'}
          </p>
        </div>
        <p className="truncate text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{product.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
            {product.barcode ? `Cód. ${product.barcode}` : 'Sin código'}
          </span>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">•</span>
          <span className="text-[12px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
            {formatMoney(product.salePrice)} / u
          </span>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">•</span>
          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${isCashier ? (maxStock > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30') : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            Stock: {isCashier ? (maxStock > 0 ? 'Disponible' : 'Agotado') : maxStock}
          </span>
        </div>
      </div>

      <div className="pos-entry-bar-qty flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <label className="pos-entry-bar-qty-label flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400" htmlFor="pos-entry-qty">
          <Scale size={13} className="text-indigo-500" />
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
          className="pos-entry-bar-qty-input h-10 w-28 text-center rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 text-indigo-950 dark:text-white font-black text-xl outline-none shadow-sm transition-all"
          autoFocus
        />
      </div>

      <div className="pos-entry-bar-actions flex items-center gap-3">
        <div className="hidden text-right sm:flex sm:flex-col sm:justify-center pr-4 border-r border-slate-200 dark:border-slate-700/60 h-12">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Importe línea</p>
          <p className="text-[22px] font-black tabular-nums text-slate-900 dark:text-white leading-none mt-0.5 tracking-tight">{formatMoney(linePreview)}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 flex items-center justify-center h-12 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 cursor-pointer shadow-sm transition-colors active:scale-95"
        >
          <X size={16} className="mr-1.5 text-slate-500" />
          Cancelar
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={onConfirm}
          className="shrink-0 flex items-center justify-center min-w-[8rem] h-12 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 disabled:active:scale-100"
        >
          {isEdit ? 'Actualizar' : 'Agregar (Enter)'}
        </button>
      </div>
    </div>
  );
};

export default PosLineEntryBar;
