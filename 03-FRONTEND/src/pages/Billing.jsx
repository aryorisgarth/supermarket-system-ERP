import React from 'react';
import ShoppingCart from '../components/billing/ShoppingCart';
import CheckoutPanel from '../components/billing/CheckoutPanel';
import ReceiptModal from '../components/billing/ReceiptModal';
import Badge from '../components/ui/Badge';
import CashRegisterOpenGate from '../components/CashRegisterOpenGate';
import PosLineEntryBar from '../components/billing/PosLineEntryBar';
import PosCategoryPicker from '../components/billing/PosCategoryPicker';
import { useBilling } from '../hooks/useBilling';

const Billing = () => {
  const {
    // States & Derived
    cart, searchQuery, categories, selectedCategory, categoryProducts, loadingCategoryProducts, 
    showCategoryProductsModal, entryMode, entryQty, selectedLineId, lastAddedLineId,
    selectedCustomer, amountReceived, isMultiPayment, payments, couponCode, validatingCoupon,
    showReceipt, receiptData, showPrintButton, showQuickAccess, canApplyDiscount,
    subtotal, discountTotal, tax, total, taxRate, billingConfig, entryBarProduct,

    // Setters
    setSearchQuery, setEntryQty, setSelectedCustomer, setPayments, setPaymentMethod, setAmountReceived, 
    setCouponCode, setIsMultiPayment, setShowQuickAccess, setShowReceipt, setShowCategoryProductsModal,

    // Actions
    handleSearch, handleKeyDown, handleCategoryClick, selectCartLine, removeFromCart, handleSetLineDiscount,
    handleCancelCurrentPurchase, confirmEntry, clearEntry, handleValidateCoupon, handleCheckout,
    handlePrintReceipt, handleReprintTicket, handleEditSale, handleCancelSale,
    handleCategoryQuickAdd, handleCategoryQuantityEdit, getDynamicCountryLabel, paymentMethod
  } = useBilling();

  return (
    <CashRegisterOpenGate>
      <div className="pos-billing-page animate-fade-in no-print app-page-flex w-full min-w-0 overflow-hidden bg-[var(--app-bg)] font-sans">
        {/* Una sola franja fina: buscador + categorías → el ticket empieza enseguida abajo */}
        <div className="pos-toolbar shrink-0">
          <input
            id="pos-search-input"
            type="text"
            placeholder="F2 • Escanear o buscar…"
            className="pos-search-input"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {showQuickAccess && categories.length > 0 && (
            <div className="pos-categories-inline">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`pos-category-chip ${selectedCategory?.id === cat.id ? 'pos-category-chip--active' : ''}`}
                  title={cat.name}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pos-layout min-h-0 flex-1">
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

          {/* BLOQUE COBRO */}
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
