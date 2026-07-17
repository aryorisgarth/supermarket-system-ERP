import React, { useEffect, useRef, useState } from 'react';
import ShoppingCart from '../components/billing/ShoppingCart';
import CheckoutPanel from '../components/billing/CheckoutPanel';
import ReceiptModal from '../components/billing/ReceiptModal';
import Badge from '../components/ui/Badge';
import CashRegisterOpenGate from '../components/CashRegisterOpenGate';
import PosLineEntryBar from '../components/billing/PosLineEntryBar';
import PosCategoryPicker from '../components/billing/PosCategoryPicker';
import PosQuickCodesPanel from '../components/billing/PosQuickCodesPanel';
import StripePaymentModal from '../components/billing/StripePaymentModal';
import { useBilling } from '../hooks/useBilling';
import { ChevronDown, Layers, Tag } from 'lucide-react';
import { formatMoney } from '../utils/formatMoney';

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
    stripeClientSecret, showStripeModal,
    products,

    
    setSearchQuery, setEntryQty, setSelectedCustomer, setPayments, setPaymentMethod, setAmountReceived, 
    setCouponCode, setIsMultiPayment, setShowQuickAccess, setShowReceipt, setShowCategoryProductsModal,
    setTransferBank, setTransferRef, setShowStripeModal,

    
    handleSearch, handleKeyDown, handleCategoryClick, selectCartLine, removeFromCart, handleSetLineDiscount,
    handleCancelCurrentPurchase, confirmEntry, clearEntry, handleValidateCoupon, handleCheckout,
    handlePrintReceipt, handleReprintTicket, handleEditSale, handleCancelSale,
    handleCategoryQuickAdd, handleCategoryQuantityEdit, getDynamicCountryLabel, paymentMethod,
    handleStripePaymentSuccess
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
          <div className="pos-toolbar-actions">
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
            <button
              id="btn-plu-quick-codes"
              type="button"
              onClick={() => setShowQuickCodes((p) => !p)}
              title="Códigos PLU / Cortos (F6)"
              className={`pos-toolbar-btn${showQuickCodes ? ' is-active' : ''}`}
            >
              <Tag size={15} />
              <span>PLU</span>
              <span className="pos-toolbar-btn__kbd">F6</span>
            </button>

            {showQuickAccess && categories.length > 0 && (
              <div ref={categoryMenuRef} className="pos-category-menu-wrap">
                <button
                  id="btn-category-menu"
                  type="button"
                  onClick={() => setShowCategoryMenu((p) => !p)}
                  title="Ver todas las categorías"
                  className={`pos-toolbar-btn${showCategoryMenu ? ' is-active' : ''}`}
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

                {showCategoryMenu && (
                  <div className="pos-category-menu">
                    <div className="pos-category-menu__header">Seleccionar categoría</div>
                    <ul className="pos-category-menu__list">
                      {categories.map((cat, idx) => {
                        const shortcut = idx < 9 ? idx + 1 : null;
                        const isActive = selectedCategory?.id === cat.id && showCategoryProductsModal;
                        return (
                          <li key={cat.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectFromMenu(cat)}
                              className={`pos-category-menu__item${isActive ? ' is-active' : ''}`}
                            >
                              {shortcut && <span className="pos-category-menu__shortcut">{shortcut}</span>}
                              <span className="pos-category-menu__label">{cat.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
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

        <StripePaymentModal
          show={showStripeModal}
          onClose={() => setShowStripeModal(false)}
          clientSecret={stripeClientSecret}
          onPaymentSuccess={handleStripePaymentSuccess}
          total={total}
          formatMoney={formatMoney}
        />
      </div>
    </CashRegisterOpenGate>
  );
};

export default Billing;
