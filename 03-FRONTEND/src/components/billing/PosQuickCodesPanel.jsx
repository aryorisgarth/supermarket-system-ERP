import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, Copy, Search, Tag, X } from 'lucide-react';


const PosQuickCodesPanel = ({ open, products = [], onClose, onSelectCode }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const searchRef = useRef(null);

  
  const pluProducts = useMemo(() => {
    return products.filter(
      (p) => p.barcode && p.isActive !== false && p.barcode.length <= 12
    );
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pluProducts;
    return pluProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q)
    );
  }, [pluProducts, search]);

  
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      const cat = p.categoryName || 'Sin Categoría';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

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
    
    navigator.clipboard.writeText(product.barcode).catch(() => {});
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 1500);

    
    onSelectCode?.(product.barcode);

    
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
      className="pqcp-backdrop fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="pqcp-panel flex flex-col shadow-2xl"
        style={{
          width: '360px',
          maxWidth: '92vw',
          height: '100%',
          background: 'var(--app-surface, #1e2535)',
          borderLeft: '1px solid var(--app-border, #2e3a4e)',
          animation: 'pqcp-slide-in 0.22s cubic-bezier(.16,1,.3,1)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Panel de Códigos Cortos PLU"
      >
        {}
        <header
          style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid var(--app-border, #2e3a4e)',
            background: 'var(--app-surface-alt, #161d2c)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Tag size={18} style={{ color: 'var(--app-primary, #6366f1)' }} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--app-text, #e2e8f0)',
                }}
              >
                Códigos PLU
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '20px',
                  background: 'var(--app-primary, #6366f1)',
                  color: '#fff',
                  letterSpacing: '0.05em',
                }}
              >
                {pluProducts.length}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              title="Cerrar (Esc)"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                border: '1px solid var(--app-border, #2e3a4e)',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--app-text-muted, #94a3b8)',
              }}
            >
              <X size={16} />
            </button>
          </div>
          <p
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--app-text-muted, #94a3b8)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Clic en el código → copia y envía al POS · Esc = cerrar
          </p>
        </header>

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderBottom: '1px solid var(--app-border, #2e3a4e)',
            background: 'var(--app-surface-alt, #161d2c)',
          }}
        >
          <Search size={14} style={{ color: 'var(--app-text-muted, #94a3b8)', flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Filtrar por nombre, código o categoría…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--app-text, #e2e8f0)',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted, #94a3b8)', padding: 0 }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {}
        <div className="pqcp-list" style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {grouped.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--app-text-muted, #94a3b8)' }}>
              <BookOpen size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Sin resultados
              </p>
            </div>
          ) : (
            grouped.map(([category, items]) => (
              <div key={category}>
                {}
                <div
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--app-primary, #6366f1)',
                    padding: '0 4px 6px',
                    borderBottom: '1px solid var(--app-border, #2e3a4e)',
                    marginBottom: '6px',
                  }}
                >
                  {category}
                </div>
                {}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {items.map((product) => {
                    const copied = copiedId === product.id;
                    const isShort = product.barcode.length <= 6;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectCode(product)}
                        title={`Código: ${product.barcode} — Clic para enviar al POS`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: copied
                            ? '1px solid #22c55e'
                            : '1px solid var(--app-border, #2e3a4e)',
                          background: copied
                            ? 'rgba(34,197,94,0.12)'
                            : 'var(--app-bg, #111827)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'left',
                          gap: '10px',
                        }}
                        onMouseEnter={(e) => {
                          if (!copied) {
                            e.currentTarget.style.background = 'var(--app-surface-alt, #161d2c)';
                            e.currentTarget.style.borderColor = 'var(--app-primary, #6366f1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!copied) {
                            e.currentTarget.style.background = 'var(--app-bg, #111827)';
                            e.currentTarget.style.borderColor = 'var(--app-border, #2e3a4e)';
                          }
                        }}
                      >
                        {}
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--app-text, #e2e8f0)',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                          }}
                        >
                          {product.name}
                        </span>

                        {}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: isShort ? '15px' : '12px',
                              fontWeight: 900,
                              color: copied ? '#22c55e' : '#f59e0b',
                              background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)',
                              padding: isShort ? '3px 9px' : '3px 7px',
                              borderRadius: '6px',
                              letterSpacing: '0.05em',
                              border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                            }}
                          >
                            {product.barcode}
                          </span>
                          {copied ? (
                            <Check size={14} style={{ color: '#22c55e' }} />
                          ) : (
                            <Copy size={12} style={{ color: 'var(--app-text-muted, #94a3b8)' }} />
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

        {}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--app-border, #2e3a4e)',
            background: 'var(--app-surface-alt, #161d2c)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--app-text-muted, #94a3b8)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            textAlign: 'center',
          }}
        >
          F6 = Abrir/Cerrar · Esc = Cerrar
        </div>
      </div>

      <style>{`
        @keyframes pqcp-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .pqcp-list::-webkit-scrollbar { width: 5px; }
        .pqcp-list::-webkit-scrollbar-track { background: transparent; }
        .pqcp-list::-webkit-scrollbar-thumb { background: var(--app-border, #2e3a4e); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default PosQuickCodesPanel;
