import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, Copy, Search, Tag, X, Layers, Box } from 'lucide-react';

const PosQuickCodesPanel = ({ open, products = [], onClose, onSelectCode }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [groupBy, setGroupBy] = useState('category'); // 'category' | 'brand'
  const searchRef = useRef(null);

  const pluProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.barcode || p.isActive === false) return false;
      const barcodeStr = String(p.barcode).trim();
      const stripped = barcodeStr.replace(/^0+/, '');
      if (stripped.length < 12 && stripped.length > 0) return true;
      if (barcodeStr.length === 13 && barcodeStr.startsWith('20')) return true;
      return false;
    }).map(p => {
      const barcodeStr = String(p.barcode);
      if (barcodeStr.length === 13 && barcodeStr.startsWith('20')) {
        const extractedPlu = barcodeStr.substring(2, 7).replace(/^0+/, '');
        return { ...p, displayBarcode: extractedPlu };
      }
      return { ...p, displayBarcode: barcodeStr };
    });
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pluProducts;
    return pluProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.displayBarcode?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.brand?.name?.toLowerCase().includes(q)
    );
  }, [pluProducts, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      let key = 'Otros';
      if (groupBy === 'category') {
        key = p.category?.name || 'Sin Categoría';
      } else if (groupBy === 'brand') {
        key = p.brand?.name || 'Sin Marca';
      }
      
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupBy]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setCopiedId(null);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSelectCode = (product) => {
    navigator.clipboard.writeText(product.displayBarcode).catch(() => {});
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 1500);

    onSelectCode?.(product.displayBarcode);

    setTimeout(() => {
      const input = document.getElementById('pos-search-input');
      if (input) {
        input.focus();
        input.select();
      }
    }, 80);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col shadow-2xl w-[360px] max-w-[92vw] h-full bg-white border-l border-gray-300 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Panel de Códigos Cortos PLU"
      >
        <header className="px-4 pt-4 pb-3 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-primary" />
              <span className="text-[13px] font-black uppercase tracking-widest text-gray-900">
                Códigos PLU
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white tracking-wider">
                {pluProducts.length} (Memoria: {products?.length || 0})
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              title="Cerrar (Esc)"
              className="w-8 h-8 rounded-lg border border-gray-300 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
            Clic en el código → copia y envía al POS · Esc = cerrar
          </p>
        </header>

        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 bg-white">
          <Search size={16} strokeWidth={2.5} className="text-gray-400 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Filtrar por nombre, código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-gray-900 placeholder:text-gray-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={15} strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="flex bg-gray-100 p-1 border-b border-gray-200">
          <button
            onClick={() => setGroupBy('category')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              groupBy === 'category' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers size={14} />
            Categorías
          </button>
          <button
            onClick={() => setGroupBy('brand')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              groupBy === 'brand' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Box size={14} />
            Marcas
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-gray-300">
          {grouped.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <BookOpen size={32} className="mx-auto mb-2 opacity-80" />
              <p className="text-xs font-black uppercase tracking-wider">
                Sin resultados
              </p>
            </div>
          ) : (
            grouped.map(([groupName, items]) => (
              <div key={groupName}>
                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-primary px-1 pb-1.5 border-b border-gray-200 mb-2">
                  {groupName}
                </div>
                <div className="flex flex-col gap-1.5">
                  {items.map((product) => {
                    const copied = copiedId === product.id;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectCode(product)}
                        title={`Código: ${product.barcode} — Clic para enviar al POS`}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg border-2 text-left gap-2 transition-colors ${
                          copied 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 bg-white hover:border-primary hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-gray-900 flex-1 overflow-hidden text-ellipsis whitespace-nowrap uppercase">
                          {product.name}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-mono text-sm font-black px-2 py-0.5 rounded-md tracking-wider border ${
                              copied 
                                ? 'text-green-700 bg-green-100 border-green-300' 
                                : 'text-amber-700 bg-amber-50 border-amber-300'
                            }`}
                          >
                            {product.displayBarcode}
                          </span>
                          {copied ? (
                            <Check size={16} strokeWidth={3} className="text-green-700" />
                          ) : (
                            <Copy size={16} strokeWidth={2.5} className="text-gray-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-2.5 border-t border-gray-200 bg-gray-50 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">
          F6 = Abrir/Cerrar · Esc = Cerrar
        </div>
      </div>
    </div>
  );
};

export default PosQuickCodesPanel;
