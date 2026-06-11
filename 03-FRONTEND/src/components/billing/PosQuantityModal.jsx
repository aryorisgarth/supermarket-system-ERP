import { useEffect, useState } from 'react';
import { Scale, X } from 'lucide-react';
import Button from '../ui/Button';
import { formatMoney } from '../../utils/formatMoney';

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

  const maxStock = Number(product.currentStock ?? 0);
  const parsed = parseFloat(String(qty).replace(',', '.'));
  const valid = !Number.isNaN(parsed) && parsed > 0 && parsed <= maxStock;
  const lineTotal = valid ? parsed * Number(product.salePrice || 0) : 0;

  const handleConfirm = () => {
    if (!valid) return;
    onConfirm(parseFloat(parsed.toFixed(4)));
    onClose();
  };

  return (
    <div className="pos-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pos-qty-title">
      <div className="pos-modal-panel">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--app-border)] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-primary)]">Cantidad</p>
            <h2 id="pos-qty-title" className="truncate text-lg font-black text-[var(--app-text)]">
              {product.name}
            </h2>
            <p className="mt-1 text-xs font-semibold text-[var(--app-text-muted)]">
              {product.barcode ? `Código ${product.barcode}` : 'Sin código — venta por cantidad'}
              {' · '}
              Stock: {maxStock}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)]"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between rounded-xl bg-[var(--app-bg-subtle)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--app-text-soft)]">Precio unitario</span>
            <span className="text-lg font-black text-[var(--app-text)]">{formatMoney(product.salePrice)}</span>
          </div>

          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
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
              className="pos-qty-input w-full rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-4 text-center text-3xl font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                disabled={n > maxStock}
                onClick={() => setQty(String(n))}
                className="min-w-[3rem] rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-bold text-[var(--app-text)] transition hover:border-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] disabled:opacity-40"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQty(String(maxStock))}
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-bold text-[var(--app-text-muted)] hover:border-[var(--app-primary)]"
            >
              Máx ({maxStock})
            </button>
          </div>

          {parsed > maxStock && (
            <p className="text-center text-xs font-bold text-[var(--app-danger)]">
              La cantidad supera el stock disponible ({maxStock}).
            </p>
          )}

          <div className="flex items-center justify-between rounded-xl border border-[var(--app-primary)]/25 bg-[var(--app-primary-soft)] px-4 py-3">
            <span className="text-sm font-bold text-[var(--app-primary)]">Subtotal línea</span>
            <span className="text-xl font-black text-[var(--app-primary-strong)]">{formatMoney(lineTotal)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" disabled={!valid} onClick={handleConfirm}>
              {isEdit ? 'Guardar cantidad' : 'Agregar al carrito'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosQuantityModal;
