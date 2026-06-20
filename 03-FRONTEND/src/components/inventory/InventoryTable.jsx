import React, { useState } from 'react';
import { Package, Barcode, RefreshCw, Edit2, Trash2, Loader2, Inbox, History, MapPin } from 'lucide-react';
import InventoryMobileList from './InventoryMobileList';
import ProductLocationsSection from './ProductLocationsSection';
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
  const [expandedProductId, setExpandedProductId] = useState(null);

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
              <React.Fragment key={product.id}>
                <tr className={`hover:bg-gray-50 transition-colors ${!product.isActive ? 'bg-gray-50/50' : ''}`}>
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                        <Package size={20} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 line-clamp-2 max-w-[320px] whitespace-normal leading-snug text-sm" title={product.name}>
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            <Barcode size={12} />
                            {product.barcode}
                          </div>
                          {product.brand && (
                            <span className="text-[11px] text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-medium uppercase bg-white">
                              {product.brand.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-semibold uppercase tracking-wide">
                      {product.category?.name || 'General'}
                    </span>
                  </td>

                  <td className="text-right font-medium text-gray-600 tabular-nums text-sm">
                    {formatMoney(product.purchasePrice)}
                  </td>

                  <td className="text-right font-bold text-gray-900 tabular-nums text-[15px]">
                    {formatMoney(product.salePrice)}
                  </td>

                  <td className="text-center">
                    <button 
                      onClick={() => onToggleStatus(product)}
                      className={`mx-auto w-10 h-5.5 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer ${product.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transition-transform duration-300 ${product.isActive ? 'translate-x-4.5' : 'translate-x-0'}`} />
                    </button>
                  </td>

                  <td>
                    <div className="scale-90 origin-left">
                      {getStockBadge(product.currentStock, product.minimumStock)}
                    </div>
                  </td>

                  <td className="pr-6 text-center">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                        className={`p-2 rounded-lg transition-all cursor-pointer border ${
                          expandedProductId === product.id
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 border-gray-200'
                        }`}
                        title="Ubicaciones"
                      >
                        <MapPin size={16} strokeWidth={2} />
                      </button>

                      <button 
                        onClick={() => onOpenAdjust(product)}
                        className="p-2 bg-white text-gray-500 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-all cursor-pointer border border-gray-200"
                        title="Ajuste rápido"
                      >
                        <RefreshCw size={16} strokeWidth={2} />
                      </button>

                      <button 
                        onClick={() => onOpenKardex(product)}
                        className="p-2 bg-white text-gray-500 hover:bg-gray-50 hover:text-purple-600 rounded-lg transition-all cursor-pointer border border-gray-200"
                        title="Ver Kardex"
                      >
                        <History size={16} strokeWidth={2} />
                      </button>

                      <button 
                        onClick={() => onOpenEdit(product)}
                        className="p-2 bg-white text-gray-500 hover:bg-gray-50 hover:text-amber-500 rounded-lg transition-all cursor-pointer border border-gray-200"
                        title="Editar"
                      >
                        <Edit2 size={16} strokeWidth={2} />
                      </button>

                      <button 
                        onClick={() => onDeleteProduct(product.id, product.name)}
                        className="p-2 bg-white text-gray-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg transition-all cursor-pointer border border-gray-200"
                        title="Eliminar"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedProductId === product.id && (
                  <tr>
                    <td colSpan="7" className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="max-w-4xl mx-auto py-2">
                        <ProductLocationsSection 
                          product={product} 
                          onStockChanged={() => {}} 
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
