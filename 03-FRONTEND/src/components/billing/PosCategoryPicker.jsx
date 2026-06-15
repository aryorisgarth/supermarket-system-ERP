import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Hash, Inbox, Layers, Search, X } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;
const LONG_PRESS_MS = 550;


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
  const [copiedCode, setCopiedCode] = useState(null);
  const longPressRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSearch('');
      setFlashId(null);
      setCopiedCode(null);
      setTimeout(() => searchRef.current?.focus(), 120);
    }
  }, [open, category?.id]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

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
    window.setTimeout(() => setFlashId(null), 300);
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

  const handleCopyPlu = (e, product) => {
    e.stopPropagation();
    if (!product.barcode) return;
    navigator.clipboard.writeText(product.barcode).catch(() => {});
    setCopiedCode(product.id);
    setTimeout(() => setCopiedCode(null), 1500);

    
    const input = document.getElementById('pos-search-input');
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      ).set;
      nativeInputValueSetter?.call(input, product.barcode);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => { input.focus(); input.select(); }, 60);
    }
  };

  const isPlu = (code) => code && code.length <= 6;

  if (!open) return null;

  return (
    <div
      className="pos-catpanel-backdrop fixed inset-0 z-40 flex items-stretch justify-end"
      style={{ background: 'transparent', pointerEvents: 'none' }}
    >
      <div
        className="pos-catpanel flex flex-col shadow-2xl"
        style={{
          pointerEvents: 'auto',
          width: '540px',
          maxWidth: '90vw',
          height: '100%',
          background: 'var(--app-surface, #1e2535)',
          borderLeft: '2px solid var(--app-primary, #6366f1)',
          animation: 'catpanel-slide-in 0.22s cubic-bezier(.16,1,.3,1)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Productos: ${category?.name}`}
      >
        {}
        <header
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--app-border, #2e3a4e)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), transparent)',
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Layers size={18} style={{ color: 'var(--app-primary, #6366f1)' }} />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--app-text, #e2e8f0)',
                }}
              >
                {category?.name}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: 'var(--app-primary, #6366f1)',
                  color: '#fff',
                }}
              >
                {filtered.length} productos
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
            Toque = +1 · Mantener = Cantidad · Clic en Código = Copiar y buscar
          </p>
        </header>

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderBottom: '1px solid var(--app-border, #2e3a4e)',
            background: 'var(--app-surface-alt, #161d2c)',
          }}
        >
          <Search size={14} style={{ color: 'var(--app-text-muted, #94a3b8)', flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Filtrar por nombre o código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', padding: 0 }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {}
        <div
          className="catpanel-list"
          style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--app-text-muted, #94a3b8)' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '3px solid var(--app-border)', borderTopColor: 'var(--app-primary)', animation: 'spin 0.7s linear infinite', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Cargando productos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--app-text-muted, #94a3b8)' }}>
              <Inbox size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Sin productos en esta categoría</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {filtered.map((product) => {
                const out = product.currentStock <= 0;
                const inactive = product.isActive === false;
                const disabled = out || inactive;
                const inCart = cartQtyById.get(product.id);
                const flashing = flashId === product.id;
                const copied = copiedCode === product.id;
                const hasPlu = !!product.barcode;
                const isShortCode = isPlu(product.barcode);

                return (
                  <div
                    key={product.id}
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      border: flashing
                        ? '2px solid var(--app-primary, #6366f1)'
                        : inCart
                          ? '2px solid rgba(99,102,241,0.7)'
                          : '1px solid var(--app-border, #2e3a4e)',
                      background: flashing
                        ? 'rgba(99,102,241,0.2)'
                        : inCart
                          ? 'rgba(99,102,241,0.1)'
                          : 'var(--app-bg, #111827)',
                      opacity: disabled ? 0.5 : 1,
                      overflow: 'hidden',
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '110px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                    onClick={() => !disabled && handleRowClick(product)}
                    onPointerDown={() => !disabled && startLongPress(product)}
                    onPointerUp={clearLongPress}
                    onPointerLeave={clearLongPress}
                    onPointerCancel={clearLongPress}
                    className="product-grid-item"
                  >
                    {}
                    {inCart != null && inCart > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          zIndex: 2,
                          display: 'inline-flex',
                          height: '18px',
                          minWidth: '18px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          background: 'var(--app-primary, #6366f1)',
                          color: '#fff',
                          padding: '0 4px',
                          fontSize: '9px',
                          fontWeight: 900,
                        }}
                      >
                        {inCart}
                      </span>
                    )}

                    {}
                    {hasPlu && (
                      <button
                        type="button"
                        onClick={(e) => !disabled && handleCopyPlu(e, product)}
                        title="Clic para copiar y enviar al buscador"
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: `1px solid ${copied ? '#22c55e' : isShortCode ? '#f59e0b' : 'var(--app-border)'}`,
                          background: copied
                            ? 'rgba(34,197,94,0.2)'
                            : isShortCode
                              ? 'rgba(245,158,11,0.15)'
                              : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          fontSize: '8px',
                          fontWeight: 950,
                          color: copied ? '#22c55e' : isShortCode ? '#f59e0b' : 'var(--app-text-muted)',
                        }}
                      >
                        {product.barcode}
                      </button>
                    )}

                    {}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px 8px 6px' }}>
                      <p
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: 'var(--app-text, #e2e8f0)',
                          margin: '0 0 4px 0',
                          lineHeight: '1.2',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {product.name}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: 900,
                            color: '#10b981',
                          }}
                        >
                          {money(product.salePrice)}
                        </span>

                        {out && (
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#ef4444' }}>
                            SIN STOCK
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
          Toque = +1 al carrito · Mantener = editar cantidad · PLU = copiar código
        </div>
      </div>

      <style>{`
        @keyframes catpanel-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .catpanel-list::-webkit-scrollbar { width: 5px; }
        .catpanel-list::-webkit-scrollbar-track { background: transparent; }
        .catpanel-list::-webkit-scrollbar-thumb { background: var(--app-border, #2e3a4e); border-radius: 4px; }
        .product-grid-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99,102,241,0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default PosCategoryPicker;
