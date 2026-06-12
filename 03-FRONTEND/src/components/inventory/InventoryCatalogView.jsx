import React, { useState } from 'react';
import { Package, Tag, Building2, Barcode, Copy, Check, Info, AlertCircle, LayoutGrid, List, MapPin, Loader2 } from 'lucide-react';
import LocationService from '../../services/LocationService';
import { formatMoney } from '../../utils/formatMoney';

const InventoryCatalogView = ({ products, loading }) => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [viewMode, setViewMode] = useState('LIST');
  
  // Lazy loading state for product locations
  const [locationsMap, setLocationsMap] = useState({});
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 1500);
  };

  const toggleLocations = async (productId) => {
    const next = new Set(expandedProductIds);
    if (next.has(productId)) {
      next.delete(productId);
      setExpandedProductIds(next);
      return;
    }
    
    next.add(productId);
    setExpandedProductIds(next);
    
    if (!locationsMap[productId]) {
      setLoadingProductId(productId);
      try {
        const data = await LocationService.getProductLocations(productId);
        setLocationsMap(prev => ({ ...prev, [productId]: data || [] }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProductId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="ui-card overflow-hidden">
        <div className="flex flex-col items-center gap-2 py-20 text-[var(--app-text-muted)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-primary)]"></div>
          <p className="text-xs font-bold mt-2">Cargando catálogo comercial...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="ui-card overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-[var(--app-text-muted)]">
          <AlertCircle size={36} className="opacity-60" />
          <p className="text-xs font-bold">No se encontraron productos en el catálogo.</p>
        </div>
      </div>
    );
  }

  const renderListView = () => {
    return (
      <div className="ui-card overflow-hidden border border-[var(--app-border)] bg-[var(--app-surface)] rounded-3xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
                <th className="py-4 px-6">Producto</th>
                <th className="py-4 px-6">Descripción</th>
                <th className="py-4 px-6">Proveedor</th>
                <th className="py-4 px-6 text-right">Costo / Venta Base</th>
                <th className="py-4 px-6">Presentaciones y Códigos de Barras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]/60 text-xs">
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  className={`hover:bg-[var(--app-primary-soft)]/5 transition-colors duration-150 ${
                    !product.isActive ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/10' : ''
                  }`}
                >
                  
                  <td className="py-4 px-6">
                    <div className="font-black text-[var(--app-text)] text-sm mb-1">{product.name}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)] text-[9px] font-black uppercase tracking-wider border border-[var(--app-primary)]/10">
                        {product.category?.name || 'Sin Categoría'}
                      </span>
                      {product.brand && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 text-[9px] font-black uppercase tracking-wider border border-blue-100 dark:border-blue-900">
                          {product.brand.name}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-[var(--app-text-muted)] bg-[var(--app-bg-subtle)] px-2 py-0.5 rounded border border-[var(--app-border)]">
                        {product.barcode}
                      </span>
                    </div>
                  </td>

                  
                  <td className="py-4 px-6 max-w-[240px]">
                    <p className="text-[var(--app-text-soft)] italic line-clamp-2" title={product.description}>
                      {product.description || 'Sin descripción comercial.'}
                    </p>
                  </td>

                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--app-text-soft)]">
                      <Building2 size={13} className="text-[var(--app-text-muted)]" />
                      {product.supplier?.companyName || 'Sin Proveedor'}
                    </div>
                    <div className="text-[10px] text-[var(--app-text-muted)] mt-1 flex flex-col gap-1">
                      <span>Stock: <span className="font-bold text-[var(--app-text-soft)]">{product.currentStock} {product.uomBase || 'UN'}</span></span>
                      
                      {/* Collapsible locations for list view */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleLocations(product.id)}
                          className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[var(--app-primary)] hover:opacity-75 cursor-pointer mt-0.5"
                        >
                          <MapPin size={9} />
                          {expandedProductIds.has(product.id) ? 'Ocultar ubicaciones' : 'Ver ubicaciones'}
                        </button>
                        
                        {expandedProductIds.has(product.id) && (
                          <div className="mt-1.5 space-y-1 pl-2 border-l-2 border-[var(--app-primary)]/20 animate-fade-in max-w-[220px]">
                            {loadingProductId === product.id ? (
                              <span className="text-[8px] text-[var(--app-text-muted)] font-black">
                                <Loader2 className="animate-spin inline mr-1" size={8} /> Cargando...
                              </span>
                            ) : !locationsMap[product.id] || locationsMap[product.id].length === 0 ? (
                              <span className="text-[8px] text-[var(--app-text-muted)] font-black block italic">Sin existencias en ubicaciones</span>
                            ) : (
                              locationsMap[product.id].map(loc => (
                                <div key={loc.id} className="text-[8px] text-[var(--app-text-soft)] font-bold flex justify-between">
                                  <span>{loc.locationCode} ({loc.isPisoVenta ? 'Exh' : 'Bod'}):</span>
                                  <span className="font-black text-[var(--app-text)] pl-1.5">{loc.stock} u.</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  
                  <td className="py-4 px-6 text-right tabular-nums">
                    <div className="font-semibold text-[var(--app-text-muted)] text-[10px]">
                      Compra: <span className="font-bold text-[var(--app-text-soft)]">{formatMoney(product.purchasePrice)}</span>
                    </div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                      {formatMoney(product.salePrice)}
                    </div>
                  </td>

                  
                  <td className="py-4 px-6">
                    {product.uomConversions && product.uomConversions.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-w-[380px]">
                        {product.uomConversions.map((conv) => (
                          <div 
                            key={conv.id}
                            className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-[var(--app-bg-subtle)]/70 hover:bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-full transition-colors duration-150"
                          >
                            <span className="font-black text-[9px] uppercase text-[var(--app-primary)]">
                              {conv.label}
                            </span>
                            <span className="font-mono text-[9px] text-[var(--app-text-soft)]">
                              {conv.barcode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(conv.barcode)}
                              className={`p-1 rounded-full border transition-all cursor-pointer ${
                                copiedCode === conv.barcode
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                  : 'bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]'
                              }`}
                              title={`Copiar código: ${conv.barcode}`}
                            >
                              {copiedCode === conv.barcode ? <Check size={8} /> : <Copy size={8} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--app-text-muted)] italic">
                        Solo presentación base ({product.uomBase || 'UN'})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--app-surface)] p-4 rounded-2xl border border-[var(--app-border)] shadow-sm">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[var(--app-primary)]" />
          <p className="text-xs text-[var(--app-text-soft)] font-medium">
            Visualizando <span className="font-black text-[var(--app-text)]">{products.length}</span> productos comerciales en inventario.
          </p>
        </div>
        
        
        <div className="flex items-center gap-1 bg-[var(--app-bg-subtle)] p-1 rounded-xl border border-[var(--app-border)] self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('LIST')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'LIST'
                ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
            title="Vista de Lista"
          >
            <List size={12} />
            Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'GRID'
                ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
            title="Vista de Tarjetas"
          >
            <LayoutGrid size={12} />
            Tarjetas
          </button>
        </div>
      </div>

      
      {viewMode === 'LIST' ? renderListView() : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-[var(--app-surface)] rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-md hover:border-[var(--app-primary)]/30 transition-all duration-300 overflow-hidden flex flex-col ${
                !product.isActive ? 'opacity-75 bg-slate-50/50 dark:bg-slate-900/10' : ''
              }`}
            >
              
              <div className="p-5 border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)] text-[10px] font-black uppercase tracking-wider border border-[var(--app-primary)]/10">
                      <Tag size={10} /> {product.category?.name || 'Sin Categoría'}
                    </span>
                    {product.brand && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 text-[9px] font-black uppercase tracking-wider border border-blue-100 dark:border-blue-900">
                        {product.brand.name}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      product.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/25'
                    }`}
                  >
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <h3 className="text-base font-black text-[var(--app-text)] mt-3 leading-snug hover:text-[var(--app-primary)] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <Barcode size={12} className="text-[var(--app-text-muted)]" />
                  <span className="text-[11px] font-mono font-black text-[var(--app-text-soft)] bg-[var(--app-bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--app-border)]">
                    {product.barcode}
                  </span>
                </div>
              </div>

              
              <div className="p-5 flex-1 space-y-4">
                
                <div className="text-xs text-[var(--app-text-soft)] leading-relaxed italic bg-[var(--app-bg-subtle)]/40 p-3 rounded-2xl border border-[var(--app-border)]/50">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--app-text-muted)] not-italic mb-1">
                    Descripción Comercial:
                  </span>
                  {product.description || 'Sin descripción detallada disponible en el catálogo.'}
                </div>

                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
                      Proveedor
                    </span>
                    <span className="font-bold text-[var(--app-text)] flex items-center gap-1.5 truncate">
                      <Building2 size={13} className="text-[var(--app-text-muted)]" />
                      {product.supplier?.companyName || 'Sin Proveedor'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
                      Stock Físico
                    </span>
                    <span className="font-bold text-[var(--app-text)] block">
                      {product.currentStock} {product.uomBase || 'UN'}
                    </span>
                    
                    {/* Collapsible locations quick-trigger on Grid view */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleLocations(product.id)}
                        className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[var(--app-primary)] hover:opacity-75 cursor-pointer"
                      >
                        <MapPin size={9} />
                        {expandedProductIds.has(product.id) ? 'Ocultar stock' : 'Ver stock'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsed visual layout of store and warehouse zones */}
                {expandedProductIds.has(product.id) && (
                  <div className="bg-[var(--app-bg-subtle)]/50 p-3 rounded-2xl border border-[var(--app-border)] text-[10px] space-y-1.5 animate-fade-in">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">Distribución Física de Stock:</span>
                    {loadingProductId === product.id ? (
                      <div className="text-center py-2 text-[9px] text-[var(--app-text-muted)] font-black">
                        <Loader2 className="animate-spin inline mr-1" size={12} /> Cargando ubicaciones...
                      </div>
                    ) : !locationsMap[product.id] || locationsMap[product.id].length === 0 ? (
                      <div className="text-[9px] text-[var(--app-text-muted)] font-bold italic py-1">No hay existencias registradas en ubicaciones específicas.</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
                        {locationsMap[product.id].map(loc => (
                          <div key={loc.id} className="p-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl flex justify-between items-center text-[9px]">
                            <span className="font-black text-[var(--app-text)]">{loc.locationCode}</span>
                            <span className="text-[var(--app-text-muted)] font-bold">({loc.isPisoVenta ? 'Exh' : 'Bod'})</span>
                            <span className="font-black text-[var(--app-primary)]">{loc.stock} u</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--app-border)]/60">
                  <div className="bg-[var(--app-bg-subtle)]/40 p-3 rounded-2xl border border-[var(--app-border)]/50">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--app-text-muted)] mb-1">
                      Costo de Compra
                    </span>
                    <span className="text-sm font-bold text-[var(--app-text-soft)] tabular-nums">
                      {formatMoney(product.purchasePrice)}
                    </span>
                  </div>
                  <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                      Precio de Venta (Base)
                    </span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatMoney(product.salePrice)}
                    </span>
                  </div>
                </div>

                
                {product.uomConversions && product.uomConversions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[var(--app-border)]/60">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
                      Códigos y Presentaciones Disponibles
                    </span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {product.uomConversions.map((conv) => (
                        <div
                          key={conv.id}
                          className="flex items-center justify-between gap-2 p-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl text-xs hover:border-[var(--app-primary)]/20 transition-all duration-200"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-[10px] uppercase text-[var(--app-primary)]">
                                {conv.label}
                              </span>
                              <span className="text-[10px] text-[var(--app-text-muted)] font-semibold">
                                (factor: {conv.factor})
                              </span>
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {formatMoney(conv.salePrice)}
                              </span>
                            </div>
                            <p className="font-mono text-[10px] text-[var(--app-text-soft)] mt-0.5 truncate select-all">
                              {conv.barcode}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(conv.barcode)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              copiedCode === conv.barcode
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                : 'bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]'
                            }`}
                            title="Copiar código de barras"
                          >
                            {copiedCode === conv.barcode ? <Check size={11} /> : <Copy size={11} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryCatalogView;
