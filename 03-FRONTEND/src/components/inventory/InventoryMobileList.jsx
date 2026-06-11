import { Package, Barcode, RefreshCw, Edit2, Trash2, History } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const InventoryMobileList = ({
  products,
  onToggleStatus,
  onOpenAdjust,
  onOpenKardex,
  onOpenEdit,
  onDeleteProduct,
  getStockBadge,
}) => (
  <ul className="inventory-mobile-list divide-y divide-[var(--app-border)] lg:hidden">
    {products.map((product) => (
      <li
        key={product.id}
        className={`p-4 space-y-3 ${!product.isActive ? 'opacity-65' : ''}`}
      >
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)]">
            <Package size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-[var(--app-text)]">{product.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[var(--app-text-muted)]">
              <Barcode size={10} />
              {product.barcode}
            </p>
            <span className="mt-2 inline-block rounded-full border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--app-text-soft)]">
              {product.category?.name || 'General'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Compra</p>
            <p className="font-bold text-[var(--app-text-soft)]">
              {formatMoney(product.purchasePrice)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Venta</p>
            <p className="font-bold text-[var(--app-text)]">
              {formatMoney(product.salePrice)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {getStockBadge(product.currentStock, product.minimumStock)}
          <button
            type="button"
            onClick={() => onToggleStatus(product)}
            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
              product.isActive ? 'bg-[var(--app-primary)]' : 'bg-[var(--app-text-muted)]/40'
            }`}
            aria-label={product.isActive ? 'Desactivar' : 'Activar'}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                product.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpenAdjust(product)}
            className="flex flex-1 min-w-[100px] items-center justify-center gap-1 rounded-lg border border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] px-3 py-2 text-[11px] font-bold text-[var(--app-primary)]"
          >
            <RefreshCw size={12} /> Ajustar
          </button>
          <button
            type="button"
            onClick={() => onOpenKardex(product)}
            className="rounded-lg border border-[var(--app-border)] p-2 text-[var(--app-text-muted)]"
            aria-label="Kardex"
          >
            <History size={16} />
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(product)}
            className="rounded-lg border border-[var(--app-border)] p-2 text-[var(--app-text-muted)]"
            aria-label="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteProduct(product.id, product.name)}
            className="rounded-lg border border-[var(--app-border)] p-2 text-[var(--app-danger)]"
            aria-label="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </li>
    ))}
  </ul>
);

export default InventoryMobileList;
