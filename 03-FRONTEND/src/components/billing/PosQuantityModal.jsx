import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';
import ResponsiveModal from '../ui/ResponsiveModal';

const PRESETS = [1, 2, 5, 10, 20, 50];

const PosQuantityModal = ({ open, product, mode = 'add', initialQuantity, onConfirm, onClose }) => {
  const [qty, setQty] = useState('1');
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open && product) {
      const start =
        initialQuantity != null
          ? String(initialQuantity)
          : isEdit && product.quantity != null
            ? String(product.quantity)
            : '1';
      setQty(start);
    }
  }, [open, product?.id, mode, initialQuantity]);

  if (!open || !product) return null;

  const maxStock = Number(product.availableForSale ?? product.exhibitionStock ?? 0);
  const parsed = parseFloat(String(qty).replace(',', '.'));
  const valid = !Number.isNaN(parsed) && parsed > 0 && parsed <= maxStock;
  const lineTotal = valid ? parsed * Number(product.salePrice || 0) : 0;

  const handleConfirm = () => {
    if (!valid) return;
    onConfirm(parseFloat(parsed.toFixed(4)));
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={open}
      onClose={onClose}
      icon={Scale}
      title={product.name}
      subtitle={`${product.barcode ? `Código ${product.barcode}` : 'Sin código — venta por cantidad'} · Stock piso: ${maxStock}`}
      initialSize="sm"
      sizeOptions={['sm', 'md']}
      panelClassName="pos-modal-panel"
      headerClassName="bg-slate-800 dark:bg-slate-900 text-white"
      resizable={false}
    >
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-950 px-4 py-3 border border-slate-200 dark:border-slate-850">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Precio unitario</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(product.salePrice)}</span>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
            <Scale size={14} />
            Cantidad a vender
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0.001"
            step="any"
            max={maxStock}
            autoFocus
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
              if (e.key === 'Escape') onClose();
            }}
            className="pos-qty-input w-full rounded-lg border-2 border-slate-350 bg-white dark:bg-slate-950 dark:border-slate-700 px-4 py-3 text-center text-3xl font-bold text-slate-900 dark:text-white outline-none focus:border-slate-500"
          />
        </label>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              disabled={n > maxStock}
              onClick={() => setQty(String(n))}
              className="min-w-[3rem] h-9 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-40 font-bold text-xs uppercase cursor-pointer"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setQty(String(maxStock))}
            className="h-9 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs uppercase cursor-pointer"
          >
            Máx ({maxStock})
          </button>
        </div>

        {parsed > maxStock && (
          <p className="text-center text-xs font-bold uppercase text-rose-700 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/60">
            La cantidad supera el stock en piso de venta ({maxStock}).
          </p>
        )}

        <div className="flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Subtotal línea</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{formatMoney(lineTotal)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg text-xs font-bold uppercase bg-slate-200 hover:bg-slate-300 text-black border border-slate-400 cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-650"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={handleConfirm}
            className="h-10 rounded-lg text-xs font-bold uppercase bg-slate-800 hover:bg-slate-900 text-white border border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer dark:bg-slate-200 dark:text-black dark:hover:bg-slate-100"
          >
            {isEdit ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default PosQuantityModal;
