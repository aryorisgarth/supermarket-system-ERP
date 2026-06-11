import { useEffect, useMemo, useRef, useState } from 'react';
import { Inbox, Layers, Search, X } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const LONG_PRESS_MS = 550;

/**
 * Catálogo rápido para cajero: un toque = +1 al ticket. Sin stock ni botones de confirmar.
 * Mantener pulsado = cantidad personalizada (barra inferior del POS).
 */
const PosCategoryPicker = ({
  open,
  category,
  products,
  cart = [],
  loading,
  onClose,
  onQuickAdd,
  onQuantityEdit,
}) => {
  const [search, setSearch] = useState('');
  const [flashId, setFlashId] = useState(null);
  const longPressRef = useRef(null);
  const longPressFiredRef = useRef(false);

  useEffect(() => {
    if (open) {
      setSearch('');
      setFlashId(null);
    }
  }, [open, category?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const cartQtyById = useMemo(() => {
    const map = new Map();
    cart.forEach((line) => map.set(line.id, line.quantity));
    return map;
  }, [cart]);

  const clearLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const flashRow = (productId) => {
    setFlashId(productId);
    window.setTimeout(() => setFlashId(null), 280);
  };

  const handleQuickAdd = (product) => {
    if (product.isActive === false || product.currentStock <= 0) return;
    onQuickAdd(product);
    flashRow(product.id);
  };

  const startLongPress = (product) => {
    longPressFiredRef.current = false;
    clearLongPress();
    longPressRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      if (product.isActive === false || product.currentStock <= 0) return;
      onQuantityEdit?.(product);
    }, LONG_PRESS_MS);
  };

  const handleRowClick = (product) => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    handleQuickAdd(product);
  };

  if (!open) return null;

  return (
    <div className="pos-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="pos-category-picker pos-category-picker--fast"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pos-category-picker-header">
          <div className="flex min-w-0 items-center gap-2">
            <Layers size={20} className="shrink-0 text-[var(--app-primary)]" />
            <div className="min-w-0">
              <h2 className="truncate text-base font-black text-[var(--app-text)]">{category?.name}</h2>
              <p className="text-[11px] font-semibold text-[var(--app-text-muted)]">
                Toque = +1 · Mantener = cantidad · Esc = cerrar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pos-category-close"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        <div className="pos-category-picker-search">
          <Search size={16} className="shrink-0 text-[var(--app-text-muted)]" />
          <input
            type="text"
            placeholder="Filtrar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
            autoFocus
          />
        </div>

        <div className="pos-category-picker-table-wrap pos-scroll">
          {loading ? (
            <p className="p-6 text-center text-sm font-bold text-[var(--app-text-muted)]">Cargando…</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-[var(--app-text-muted)]">
              <Inbox size={36} />
              <p className="text-sm font-bold">Sin productos</p>
            </div>
          ) : (
            <ul className="pos-catalog-quick-list">
              {filtered.map((product) => {
                const out = product.currentStock <= 0;
                const inactive = product.isActive === false;
                const disabled = out || inactive;
                const inTicket = cartQtyById.get(product.id);
                const flashing = flashId === product.id;

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      className={`pos-catalog-quick-item ${disabled ? 'pos-catalog-quick-item--out' : ''} ${
                        flashing ? 'pos-catalog-quick-item--flash' : ''
                      } ${inTicket ? 'pos-catalog-quick-item--in-ticket' : ''}`}
                      onClick={() => handleRowClick(product)}
                      onPointerDown={() => !disabled && startLongPress(product)}
                      onPointerUp={clearLongPress}
                      onPointerLeave={clearLongPress}
                      onPointerCancel={clearLongPress}
                    >
                      <span className="pos-catalog-quick-name">{product.name}</span>
                      <span className="pos-catalog-quick-price">{money(product.salePrice)}</span>
                      {inTicket != null && inTicket > 0 && (
                        <span className="pos-catalog-quick-ticket">{inTicket}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosCategoryPicker;
