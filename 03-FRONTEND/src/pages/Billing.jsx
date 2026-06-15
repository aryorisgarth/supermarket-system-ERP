import React, { useEffect, useRef, useState } from 'react';
import ShoppingCart from '../components/billing/ShoppingCart';
import CheckoutPanel from '../components/billing/CheckoutPanel';
import ReceiptModal from '../components/billing/ReceiptModal';
import Badge from '../components/ui/Badge';
import CashRegisterOpenGate from '../components/CashRegisterOpenGate';
import PosLineEntryBar from '../components/billing/PosLineEntryBar';
import PosCategoryPicker from '../components/billing/PosCategoryPicker';
import PosQuickCodesPanel from '../components/billing/PosQuickCodesPanel';
import { useBilling } from '../hooks/useBilling';
import { ChevronDown, Layers, Tag } from 'lucide-react';

const Billing = () => {
  const [showQuickCodes, setShowQuickCodes] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const categoryMenuRef = useRef(null);

  const {
    
    cart, searchQuery, categories, selectedCategory, categoryProducts, loadingCategoryProducts, 
    showCategoryProductsModal, entryMode, entryQty, selectedLineId, lastAddedLineId,
    selectedCustomer, amountReceived, isMultiPayment, payments, couponCode, validatingCoupon,
    showReceipt, receiptData, showPrintButton, showQuickAccess, canApplyDiscount,
    subtotal, discountTotal, tax, total, taxRate, billingConfig, entryBarProduct,
    transferBank, transferRef, paymentAccounts,
    products,

    
    setSearchQuery, setEntryQty, setSelectedCustomer, setPayments, setPaymentMethod, setAmountReceived, 
    setCouponCode, setIsMultiPayment, setShowQuickAccess, setShowReceipt, setShowCategoryProductsModal,
    setTransferBank, setTransferRef,

    
    handleSearch, handleKeyDown, handleCategoryClick, selectCartLine, removeFromCart, handleSetLineDiscount,
    handleCancelCurrentPurchase, confirmEntry, clearEntry, handleValidateCoupon, handleCheckout,
    handlePrintReceipt, handleReprintTicket, handleEditSale, handleCancelSale,
    handleCategoryQuickAdd, handleCategoryQuantityEdit, getDynamicCountryLabel, paymentMethod
  } = useBilling();

  
  
  useEffect(() => {
    const handler = (e) => {
      
      const tag = document.activeElement?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.key === 'F6') {
        e.preventDefault();
        setShowQuickCodes((prev) => !prev);
        return;
      }

      
      if (!isTyping && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 9 && categories.length >= num) {
          e.preventDefault();
          handleCategoryClick(categories[num - 1]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [categories, handleCategoryClick]);

  
  useEffect(() => {
    if (!showCategoryMenu) return;
    const handleClickOutside = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryMenu]);

  const handleSelectFromMenu = (cat) => {
    setShowCategoryMenu(false);
    handleCategoryClick(cat);
  };

  const handleSelectPluCode = (code) => {
    setSearchQuery(code);
    setTimeout(() => {
      const input = document.getElementById('pos-search-input');
      if (input) { input.focus(); input.select(); }
    }, 60);
  };

  return (
    <CashRegisterOpenGate>
      <div className="pos-billing-page animate-fade-in no-print app-page-flex w-full min-w-0 overflow-hidden bg-[var(--app-bg)] font-sans">
        
        <div className="pos-toolbar shrink-0">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <input
              id="pos-search-input"
              type="text"
              placeholder="F2 • Escanear o buscar…"
              className="pos-search-input"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ flex: 1 }}
            />
            {}
            <button
              id="btn-plu-quick-codes"
              type="button"
              onClick={() => setShowQuickCodes((p) => !p)}
              title="Códigos PLU / Cortos (F6)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 14px',
                height: '38px',
                borderRadius: '8px',
                border: showQuickCodes
                  ? '1px solid var(--app-primary, #6366f1)'
                  : '1px solid var(--app-border, #2e3a4e)',
                background: showQuickCodes
                  ? 'var(--app-primary, #6366f1)'
                  : 'var(--app-surface, #1e2535)',
                color: showQuickCodes ? '#fff' : 'var(--app-text, #e2e8f0)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              <Tag size={15} />
              <span>PLU</span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  background: showQuickCodes ? 'rgba(255,255,255,0.25)' : 'var(--app-primary, #6366f1)',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  letterSpacing: '0.05em',
                }}
              >
                F6
              </span>
            </button>

            {}
            {showQuickAccess && categories.length > 0 && (
              <div ref={categoryMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  id="btn-category-menu"
                  type="button"
                  onClick={() => setShowCategoryMenu((p) => !p)}
                  title="Ver todas las categorías"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 14px',
                    height: '38px',
                    borderRadius: '8px',
                    border: showCategoryMenu
                      ? '1px solid var(--app-primary, #6366f1)'
                      : '1px solid var(--app-border, #2e3a4e)',
                    background: showCategoryMenu
                      ? 'var(--app-primary, #6366f1)'
                      : 'var(--app-surface, #1e2535)',
                    color: showCategoryMenu ? '#fff' : 'var(--app-text, #e2e8f0)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  <Layers size={15} />
                  <span>Categorías</span>
                  <ChevronDown
                    size={13}
                    style={{
                      transition: 'transform 0.2s',
                      transform: showCategoryMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {}
                {showCategoryMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      zIndex: 200,
                      minWidth: '220px',
                      background: 'var(--app-surface, #1e2535)',
                      border: '1px solid var(--app-primary, #6366f1)',
                      borderRadius: '10px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                      overflow: 'hidden',
                      animation: 'catmenu-drop 0.18s cubic-bezier(.16,1,.3,1)',
                    }}
                  >
                    {}
                    <div
                      style={{
                        padding: '8px 12px 6px',
                        borderBottom: '1px solid var(--app-border, #2e3a4e)',
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--app-primary, #6366f1)',
                      }}
                    >
                      Seleccionar Categoría
                    </div>

                    {}
                    <ul style={{ listStyle: 'none', margin: 0, padding: '4px 0', maxHeight: '250px', overflowY: 'auto' }}>
                      {categories.map((cat, idx) => {
                        const shortcut = idx < 9 ? idx + 1 : null;
                        const isActive = selectedCategory?.id === cat.id && showCategoryProductsModal;
                        return (
                          <li key={cat.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectFromMenu(cat)}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 14px',
                                background: isActive
                                  ? 'rgba(99,102,241,0.15)'
                                  : 'transparent',
                                border: 'none',
                                borderLeft: isActive
                                  ? '3px solid var(--app-primary, #6366f1)'
                                  : '3px solid transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.1s',
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              {}
                              {shortcut && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '5px',
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    flexShrink: 0,
                                    background: isActive
                                      ? 'var(--app-primary, #6366f1)'
                                      : 'rgba(99,102,241,0.2)',
                                    color: isActive ? '#fff' : 'var(--app-primary, #6366f1)',
                                    border: '1px solid rgba(99,102,241,0.35)',
                                  }}
                                >
                                  {shortcut}
                                </span>
                              )}
                              {}
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  color: isActive
                                    ? 'var(--app-primary, #6366f1)'
                                    : 'var(--app-text, #e2e8f0)',
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {cat.name}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    <style>{`
                      @keyframes catmenu-drop {
                        from { transform: translateY(-6px); opacity: 0; }
                        to   { transform: translateY(0);    opacity: 1; }
                      }
                    `}</style>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pos-shell min-h-0 flex-1 h-[calc(100vh-140px)]">
          <div className="pos-cart-panel flex min-h-0 flex-col overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] lg:rounded-2xl">
            <ShoppingCart
              cart={cart}
              selectedLineId={selectedLineId}
              lastAddedLineId={lastAddedLineId}
              onSelectLine={selectCartLine}
              onRemoveFromCart={removeFromCart}
              onSetLineDiscount={handleSetLineDiscount}
              onCancelPurchase={handleCancelCurrentPurchase}
              canApplyDiscount={canApplyDiscount}
              subtotal={subtotal}
              discountTotal={discountTotal}
              tax={tax}
              total={total}
            />
            <PosLineEntryBar
              mode={entryMode}
              product={entryBarProduct}
              quantity={entryQty}
              onQuantityChange={setEntryQty}
              onConfirm={confirmEntry}
              onClear={clearEntry}
            />
          </div>

          
          <div className="pos-checkout-panel flex min-h-0 flex-col overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] lg:rounded-2xl">
            <CheckoutPanel
              selectedCustomer={selectedCustomer}
              onCustomerSelect={setSelectedCustomer}
              subtotal={subtotal}
              discountTotal={discountTotal}
              tax={tax}
              total={total}
              taxRate={taxRate}
              isMultiPayment={isMultiPayment}
              onToggleMultiPayment={() => setIsMultiPayment(!isMultiPayment)}
              payments={payments}
              onAddPayment={(p) => setPayments([...payments, p])}
              onRemovePayment={(idx) => setPayments(payments.filter((_, i) => i !== idx))}
              onClearPayments={() => setPayments([])}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              amountReceived={amountReceived}
              onAmountReceivedChange={setAmountReceived}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
              onValidateAndAddCoupon={handleValidateCoupon}
              validatingCoupon={validatingCoupon}
              transferBank={transferBank}
              onTransferBankChange={setTransferBank}
              transferRef={transferRef}
              onTransferRefChange={setTransferRef}
              paymentAccounts={paymentAccounts}
              onCheckout={handleCheckout}
              cartLength={cart.length}
              showPrintButton={showPrintButton}
              onPrintReceipt={handlePrintReceipt}
              onReprintTicket={handleReprintTicket}
              onEditSale={handleEditSale}
              onCancelCurrentPurchase={handleCancelCurrentPurchase}
              onCancelSale={handleCancelSale}
              billingConfig={billingConfig}
            />
          </div>
        </div>

        <PosCategoryPicker
          open={showCategoryProductsModal}
          category={selectedCategory}
          products={categoryProducts}
          cart={cart}
          loading={loadingCategoryProducts}
          onClose={() => setShowCategoryProductsModal(false)}
          onQuickAdd={handleCategoryQuickAdd}
          onQuantityEdit={handleCategoryQuantityEdit}
        />

        {}
        <PosQuickCodesPanel
          open={showQuickCodes}
          products={products || []}
          onClose={() => setShowQuickCodes(false)}
          onSelectCode={handleSelectPluCode}
        />

        <ReceiptModal
          show={showReceipt}
          receiptData={receiptData}
          billingConfig={billingConfig}
          taxRate={taxRate}
          onClose={() => setShowReceipt(false)}
          onPrint={() => window.print()}
        />
      </div>
    </CashRegisterOpenGate>
  );
};

export default Billing;
