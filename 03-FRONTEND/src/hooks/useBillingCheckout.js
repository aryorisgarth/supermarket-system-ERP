import { useState } from 'react';
import Swal from 'sweetalert2';
import SaleService from '../services/SaleService';
import CouponService from '../services/CouponService';
import { formatMoney } from '../utils/formatMoney';
import PaymentService from '../services/PaymentService';

const extractApiError = (error) => {
  if (typeof error === 'string' && error.trim()) return error.trim();
  return error?.response?.data?.message
    || error?.response?.data?.detail
    || error?.message
    || null;
};

const encodeTransferReference = (bank, ref) => {
  const bankLabel = String(bank || '').trim();
  const reference = String(ref || '').trim();
  if (bankLabel && reference) return `${bankLabel}|${reference}`;
  return reference || bankLabel || undefined;
};

const parseTransferReference = (reference, bank) => {
  const raw = String(reference || '').trim();
  if (raw.includes('|')) {
    const [parsedBank, ...rest] = raw.split('|');
    return { bank: parsedBank || bank || '', reference: rest.join('|') };
  }
  return { bank: bank || '', reference: raw };
};

const parseSaleError = (message, cart) => {
  if (typeof message !== 'string' || !message.trim()) return 'Error interno al registrar la venta.';
  if (message === 'Total paid is less than the invoice amount') {
    return 'El monto del pago es menor al total de la factura. Verifique el total o use pago mixto.';
  }
  if (message.startsWith('Error al procesar cobro/facturación:')) return message;
  const inactiveMatch = message.match(/^Product is not active: (\d+)$/);
  if (inactiveMatch) {
    const id = Number(inactiveMatch[1]);
    const inCart = cart.find((i) => Number(i.id) === id);
    const label = inCart?.name ? `"${inCart.name}"` : `ID ${id}`;
    return `El producto ${label} está deshabilitado en inventario. Quítelo del ticket o actívelo nuevamente.`;
  }
  if (message.startsWith('El producto no está activo:')) return message;
  if (message.startsWith('Venta bloqueada por caducidad:')) return message;
  const expiredBatch = message.match(/^Batch is expired: (.+)$/);
  if (expiredBatch) {
    return `Venta bloqueada por caducidad: el lote ${expiredBatch[1]} está vencido. Retire el producto del ticket por seguridad sanitaria.`;
  }
  if (message.startsWith('Insufficient quantity in batch')) {
    return 'El lote seleccionado no tiene existencia suficiente. Elija otro lote o reduzca la cantidad.';
  }
  if (message.startsWith('Insufficient stock for product')) {
    return 'No hay existencias suficientes para uno de los productos del ticket.';
  }
  return message;
};

export const useBillingCheckout = ({
  cart,
  setCart,
  total,
  subtotal,
  discountTotal,
  tax,
  taxRate,
  loadProducts,
  clearEntry,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountReceived, setAmountReceived] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isMultiPayment, setIsMultiPayment] = useState(false);
  const [payments, setPayments] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showPrintButton, setShowPrintButton] = useState(false);
  const [transferBank, setTransferBank] = useState('BAC');
  const [transferRef, setTransferRef] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeChargeAmount, setStripeChargeAmount] = useState(0);
  const [pendingCheckout, setPendingCheckout] = useState(null);

  const describePaymentMethod = (payment) => {
    if (payment.method === 'TRANSFER') {
      const { bank, reference } = parseTransferReference(payment.reference, payment.bank);
      const bankLabel = bank ? ` ${bank}` : '';
      const refLabel = reference ? ` (Ref: ${reference})` : '';
      return `TRANSF.${bankLabel}${refLabel}`;
    }
    return ({
      CASH: 'EFECTIVO',
      CARD: 'TARJETA',
      TRANSFER: 'TRANSFERENCIA',
      COUPON: payment.couponCode ? `CUPON ${payment.couponCode}` : 'CUPON',
      POINTS: 'PUNTOS',
    }[payment.method] || payment.method);
  };

  const buildMappedPayments = () => {
    if (isMultiPayment) {
      return payments.map((payment) => ({
        method: payment.method,
        amount: parseFloat(Number(payment.amount || 0).toFixed(4)),
        ...(payment.method === 'TRANSFER'
          ? { reference: encodeTransferReference(payment.bank, payment.reference) }
          : payment.reference ? { reference: payment.reference } : {}),
        ...(payment.method === 'COUPON' && payment.couponCode ? { couponCode: payment.couponCode } : {}),
      }));
    }

    if (paymentMethod === 'CASH') {
      return [{
        method: 'CASH',
        amount: parseFloat(Number(amountReceived || 0).toFixed(4)),
      }];
    }

    if (paymentMethod === 'TRANSFER') {
      return [{
        method: 'TRANSFER',
        amount: parseFloat(Number(total || 0).toFixed(4)),
        reference: encodeTransferReference(transferBank, transferRef),
      }];
    }

    return [{
      method: paymentMethod,
      amount: parseFloat(Number(total || 0).toFixed(4)),
    }];
  };

  const startStripeCheckout = async (chargeAmount, checkoutContext) => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
    if (!publishableKey || publishableKey.includes('...') || !publishableKey.startsWith('pk_')) {
      Swal.fire({
        icon: 'warning',
        title: 'Stripe no configurado',
        html: 'Falta <code>VITE_STRIPE_PUBLIC_KEY</code> (pk_test_...) en el frontend.<br/>Sin esa clave el cobro con tarjeta falla con "Invalid request".',
      });
      return false;
    }

    try {
      Swal.fire({ title: 'Preparando pago...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const { clientSecret } = await PaymentService.createPaymentIntent(chargeAmount);
      setPendingCheckout(checkoutContext);
      setStripeChargeAmount(chargeAmount);
      setStripeClientSecret(clientSecret);
      Swal.close();
      setShowStripeModal(true);
      return true;
    } catch (error) {
      const msg = extractApiError(error) || 'No se pudo inicializar el pago con Stripe';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
      return false;
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || total <= 0) return;
    setValidatingCoupon(true);
    try {
      const c = await CouponService.getByCode(couponCode);
      const pending = total - payments.reduce((s, p) => s + p.amount, 0);
      if (pending <= 0) return;
      const amt = Math.min(Number(c.remainingBalance), pending);
      setPayments([...payments, { method: 'COUPON', amount: parseFloat(amt.toFixed(4)), couponCode: c.code }]);
      setCouponCode('');
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'No Válido' });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const inactiveLines = cart.filter((item) => item.isActive === false);
    if (inactiveLines.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Productos inactivos en el ticket',
        html: `<p>Retire del carrito los productos deshabilitados antes de cobrar:</p><ul style="text-align:left;margin:0.75rem 0 0 1rem">${inactiveLines.map((p) => `<li><b>${p.name}</b></li>`).join('')}</ul>`,
      });
      return;
    }

    const totalPaid = isMultiPayment ? payments.reduce((s, p) => s + p.amount, 0) : (paymentMethod === 'CASH' ? amountReceived : total);
    
    if (!isMultiPayment && paymentMethod === 'CASH' && amountReceived < total) {
      Swal.fire({ icon: 'warning', title: 'Monto Insuficiente' });
      return;
    }
    if (isMultiPayment && totalPaid < total) {
      Swal.fire({ icon: 'warning', title: 'Cobro Incompleto' });
      return;
    }

    if (isMultiPayment && totalPaid > total) {
      const hasCashPayment = payments.some((p) => p.method === 'CASH');
      if (!hasCashPayment) {
        Swal.fire({
          icon: 'warning',
          title: 'Pago mixto inválido',
          text: 'Si el total pagado supera la factura, debe haber al menos un pago en efectivo para calcular el vuelto.',
        });
        return;
      }
    }

    if (!isMultiPayment && paymentMethod === 'TRANSFER' && !transferRef?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Referencia requerida',
        text: 'Ingrese el número de referencia de la transferencia antes de cobrar.',
      });
      return;
    }

    const customerName = selectedCustomer ? selectedCustomer.fullName : 'Consumidor Final';
    const mappedPayments = buildMappedPayments();
    const cardChargeAmount = mappedPayments
      .filter((payment) => payment.method === 'CARD')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    if (cardChargeAmount > 0) {
      await startStripeCheckout(cardChargeAmount, { customerName, mappedPayments });
      return;
    }

    const res = await Swal.fire({ 
      title: '¿Confirmar Factura?', 
      html: `<p>Cliente: <b>${customerName}</b><br/>Total: <b>${formatMoney(total)}</b></p>`,
      icon: 'question', 
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Sí, Registrar'
    });

    if (res.isConfirmed) {
      await processCheckoutLogic(customerName, mappedPayments);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntent) => {
    setShowStripeModal(false);

    const checkoutContext = pendingCheckout || {
      customerName: selectedCustomer ? selectedCustomer.fullName : 'Consumidor Final',
      mappedPayments: [{
        method: 'CARD',
        amount: parseFloat(Number(total || 0).toFixed(4)),
      }],
    };

    const mappedPayments = checkoutContext.mappedPayments.map((payment) => (
      payment.method === 'CARD'
        ? { ...payment, reference: paymentIntent.id }
        : payment
    ));

    setPendingCheckout(null);
    setStripeClientSecret(null);
    setStripeChargeAmount(0);

    await processCheckoutLogic(checkoutContext.customerName, mappedPayments);
  };

  const handleStripeModalClose = () => {
    setShowStripeModal(false);
    setStripeClientSecret(null);
    setStripeChargeAmount(0);
    setPendingCheckout(null);
  };

  const processCheckoutLogic = async (customerName, mappedPayments) => {
      try {
        const totalPaid = mappedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const cashPaid = mappedPayments
          .filter((payment) => payment.method === 'CASH')
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const change = totalPaid > total ? Math.min(cashPaid, totalPaid - total) : 0;
        const paymentSummary = isMultiPayment
          ? `PAGO MIXTO (${mappedPayments.map(describePaymentMethod).join(' + ')})`
          : paymentMethod === 'TRANSFER'
            ? describePaymentMethod(mappedPayments[0] || { method: 'TRANSFER', bank: transferBank, reference: transferRef })
            : describePaymentMethod(mappedPayments[0] || { method: paymentMethod });

        const saleData = {
          customerId: selectedCustomer?.id || null,
          payments: mappedPayments,
          lines: cart.map(i => ({ 
            productId: parseInt(i.id), 
            quantity: parseFloat(i.quantity.toFixed(4)), 
            unitPrice: parseFloat(i.salePrice.toFixed(4)), 
            taxApplied: parseFloat((i.taxCategory?.percentage || taxRate).toFixed(4)),
            discountAmount: parseFloat(Number(i.discountAmount ?? i.discount ?? 0).toFixed(4)),
            uomConversionId: i.uomConversionId || null,
          }))
        };

        const sale = await SaleService.create(saleData);

        setReceiptData({
          saleId: sale.id,
          invoiceNumber: sale.invoiceNumber,
          date: new Date().toISOString(),
          customerName,
          customerTaxId: selectedCustomer ? (selectedCustomer.documentId || 'CF') : 'CF',
          items: [...cart],
          subtotal,
          discountTotal,
          tax,
          total,
          paymentMethod: paymentSummary,
          payments: mappedPayments.map((payment) => ({
            label: describePaymentMethod(payment),
            amount: Number(payment.amount || 0),
            method: payment.method,
            reference: payment.reference,
          })),
          amountReceived: totalPaid,
          change,
          pointsEarned: sale.pointsEarned || 0,
          pointsRedeemed: sale.pointsRedeemed || 0,
          customerPoints: sale.customerPoints || 0,
          hasCustomer: !!selectedCustomer
        });

        setShowReceipt(true);
        setCart([]);
        setSelectedCustomer(null);
        setAmountReceived(0);
        setPayments([]);
        setIsMultiPayment(false);
        setCouponCode('');
        setTransferBank('BAC');
        setTransferRef('');
        clearEntry();
        setShowPrintButton(true);
        loadProducts();
      } catch (error) {
        console.error('Error al registrar venta:', error);
        const message = parseSaleError(
          extractApiError(error) || 'Error interno al registrar la venta.',
          cart
        );
        Swal.fire({ icon: 'error', title: 'Error al registrar venta', text: message });
      }
  };

  const findSaleByReference = async (reference) => {
    const clean = String(reference || '').trim();
    if (!clean) throw new Error('Ref vacía');
    return /^\d+$/.test(clean) ? SaleService.getById(clean) : SaleService.getByInvoiceNumber(clean);
  };

  const promptSaleReference = (title) => Swal.fire({
    title, input: 'text', inputPlaceholder: 'ID o Factura...', showCancelButton: true
  });

  const handleReprintTicket = async () => {
    const { value: ref } = await promptSaleReference('Reimprimir Ticket');
    if (ref) {
      try {
        const sale = await findSaleByReference(ref);
        const salePayments = (sale.payments || []).map((payment) => ({
          label: describePaymentMethod({
            method: payment.paymentMethod,
            amount: payment.amount,
            reference: payment.reference,
            couponCode: payment.couponCode,
          }),
          amount: Number(payment.amount || 0),
          method: payment.paymentMethod,
          reference: payment.reference,
        }));
        setReceiptData({
          saleId: sale.id,
          invoiceNumber: sale.invoiceNumber,
          date: new Date(sale.createdAt).toLocaleString(),
          customerName: sale.customer?.fullName || 'Consumidor Final',
          customerTaxId: sale.customer?.taxId || 'CF',
          items: sale.lines.map(l => ({
            ...l.product,
            quantity: l.quantity,
            salePrice: l.unitPrice,
            barcode: l.product?.barcode,
            discountAmount: l.discountAmount || 0
          })),
          subtotal: sale.lines?.reduce((sum, l) => sum + Number(l.unitPrice || 0) * Number(l.quantity || 0), 0) || sale.subtotal,
          discountTotal: sale.lines?.reduce((sum, l) => sum + Number(l.discountAmount || 0), 0) || 0,
          tax: sale.totalTax,
          total: sale.totalAmount,
          paymentMethod: salePayments.length > 1
            ? `PAGO MIXTO (${salePayments.map((p) => p.label).join(' + ')})`
            : (salePayments[0]?.label || 'EFECTIVO'),
          payments: salePayments,
          amountReceived: sale.payments?.reduce((s, p) => s + p.amount, 0),
          change: sale.changeAmount,
          pointsEarned: sale.pointsEarned || 0,
          pointsRedeemed: sale.pointsRedeemed || 0,
          customerPoints: sale.customer ? (sale.customer.points || 0) : 0,
          hasCustomer: !!sale.customer
        });
        setShowReceipt(true);
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Venta no encontrada.' });
      }
    }
  };

  const handleEditSale = async () => {
    await Swal.fire({
      icon: 'info',
      title: 'Edición deshabilitada',
      text: 'La edición de ventas ya cobradas fue desactivada para evitar duplicados y descuadres. Use anulación o devolución y luego registre una nueva venta.',
    });
  };

  const handleCancelSale = async () => {
    const { value: ref } = await promptSaleReference('Anular Venta');
    if (ref) {
      try {
        const sale = await findSaleByReference(ref);
        const res = await Swal.fire({ title: '¿Confirmar Anulación?', icon: 'warning', showCancelButton: true });
        if (res.isConfirmed) {
          await SaleService.cancel(sale.id);
          Swal.fire({ icon: 'success', title: 'Anulada' });
        }
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Fallo al anular.' });
      }
    }
  };

  const cancelCheckoutState = () => {
    setSelectedCustomer(null);
    setAmountReceived(0);
    setPayments([]);
    setIsMultiPayment(false);
    setCouponCode('');
    setTransferBank('BAC');
    setTransferRef('');
  };

  return {
    paymentMethod,
    setPaymentMethod,
    amountReceived,
    setAmountReceived,
    selectedCustomer,
    setSelectedCustomer,
    isMultiPayment,
    setIsMultiPayment,
    payments,
    setPayments,
    couponCode,
    setCouponCode,
    validatingCoupon,
    showReceipt,
    setShowReceipt,
    receiptData,
    setReceiptData,
    showPrintButton,
    setShowPrintButton,
    handleValidateCoupon,
    handleCheckout,
    handleReprintTicket,
    handleEditSale,
    handleCancelSale,
    cancelCheckoutState,
    transferBank,
    setTransferBank,
    transferRef,
    setTransferRef,
    stripeClientSecret,
    showStripeModal,
    setShowStripeModal,
    stripeChargeAmount,
    handleStripeModalClose,
    handleStripePaymentSuccess
  };
};
