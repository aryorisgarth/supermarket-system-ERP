import React from 'react';
import { Package, Barcode, RefreshCw, Edit2, Trash2, Loader2, Inbox, History } from 'lucide-react';
import InventoryMobileList from './InventoryMobileList';
import { formatMoney } from '../../utils/formatMoney';

const InventoryTable = ({
  products,
  loading,
  onToggleStatus,
  onOpenAdjust,
  onOpenKardex,
  onOpenEdit,
  onDeleteProduct,
  getStockBadge
}) => {
  if (loading) {
    return (
      <div className="ui-card overflow-hidden">
        <div className="flex flex-col items-center gap-2 py-20 text-[var(--app-text-muted)]">
          <Loader2 size={36} className="animate-spin text-[var(--app-primary)]" />
          <p className="text-xs font-bold">Cargando catálogo de bodega...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="ui-card overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-[var(--app-text-muted)]">
          <Inbox size={36} className="opacity-60" />
          <p className="text-xs font-bold">No se encontraron productos en el inventario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-card overflow-hidden p-0 border-[var(--app-border)] shadow-enterprise-lg">
      <InventoryMobileList
        products={products}
        onToggleStatus={onToggleStatus}
        onOpenAdjust={onOpenAdjust}
        onOpenKardex={onOpenKardex}
        onOpenEdit={onOpenEdit}
        onDeleteProduct={onDeleteProduct}
        getStockBadge={getStockBadge}
      />

      <div className="table-scroll hidden lg:block overflow-x-auto">
        <table className="ui-table w-full min-w-[960px]">
          <thead>
            <tr>
              <th className="pl-6">Producto / Catálogo</th>
              <th>Categoría</th>
              <th className="text-right">Costo</th>
              <th className="text-right">Precio Venta</th>
              <th className="text-center">Estado</th>
              <th>Disponibilidad</th>
              <th className="pr-6 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {products.map((product) => (
              <tr key={product.id} className={`group hover:bg-[var(--app-bg-subtle)]/50 transition-all ${!product.isActive ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-[var(--app-surface-raised)] shadow-sm rounded-xl flex items-center justify-center text-[var(--app-primary)] border border-[var(--app-border)] shrink-0 group-hover:scale-110 transition-all duration-300">
                      <Package size={18} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[var(--app-text)] line-clamp-2 max-w-[320px] whitespace-normal leading-snug group-hover:text-[var(--app-primary)] transition-colors text-sm" title={product.name}>
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Barcode size={10} className="text-[var(--app-text-muted)]" />
                        <span className="text-[10px] text-[var(--app-text-muted)] font-black font-mono tracking-tighter uppercase tabular-nums bg-[var(--app-bg-subtle)] px-1.5 py-0.5 rounded-md border border-[var(--app-border)]">
                          {product.barcode}
                        </span>
                        {product.brand && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 px-1.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900 font-bold uppercase tracking-wider">
                            {product.brand.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="inline-flex px-2.5 py-1 rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)] text-[10px] font-black uppercase tracking-wider border border-[var(--app-primary)]/10">
                    {product.category?.name || 'General'}
                  </span>
                </td>

                <td className="text-right font-bold text-[var(--app-text-soft)] tabular-nums">
                  {formatMoney(product.purchasePrice)}
                </td>

                <td className="text-right font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatMoney(product.salePrice)}
                </td>

                <td className="text-center">
                  <button 
                    onClick={() => onToggleStatus(product)}
                    className={`mx-auto w-10 h-5.5 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer ${product.isActive ? 'bg-[var(--app-success)]' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`bg-white w-3.5 h-3.5 rounded-full shadow-lg transition-transform duration-300 ${product.isActive ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </td>

                <td>
                  <div className="scale-90 origin-left">
                    {getStockBadge(product.currentStock, product.minimumStock)}
                  </div>
                </td>

                <td className="pr-6 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => onOpenAdjust(product)}
                      className="p-2 text-[var(--app-text-muted)] bg-[var(--app-bg-subtle)] hover:bg-[var(--app-primary)] hover:text-white hover:border-transparent rounded-xl transition-all border border-[var(--app-border)] cursor-pointer"
                      title="Ajuste rápido"
                      aria-label="Ajuste rápido"
                    >
                      <RefreshCw size={14} strokeWidth={2.5} />
                    </button>

                    <button 
                      onClick={() => onOpenKardex(product)}
                      className="p-2 text-[var(--app-text-muted)] bg-[var(--app-bg-subtle)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)] hover:border-[var(--app-primary)]/20 rounded-xl transition-all border border-[var(--app-border)] cursor-pointer"
                      title="Ver Kardex"
                      aria-label="Ver Kardex"
                    >
                      <History size={14} strokeWidth={2.5} />
                    </button>

                    <button 
                      onClick={() => onOpenEdit(product)}
                      className="p-2 text-[var(--app-text-muted)] bg-[var(--app-bg-subtle)] hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/20 rounded-xl transition-all border border-[var(--app-border)] cursor-pointer"
                      title="Editar"
                      aria-label="Editar producto"
                    >
                      <Edit2 size={14} strokeWidth={2.5} />
                    </button>

                    <button 
                      onClick={() => onDeleteProduct(product.id, product.name)}
                      className="p-2 text-[var(--app-text-muted)] bg-[var(--app-bg-subtle)] hover:bg-[var(--app-danger)] hover:text-white hover:border-transparent rounded-xl transition-all border border-[var(--app-border)] cursor-pointer"
                      title="Eliminar"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
