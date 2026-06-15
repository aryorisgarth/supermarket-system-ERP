import { useState } from 'react';
import Swal from 'sweetalert2';
import SaleService from '../services/SaleService';
import CouponService from '../services/CouponService';
import { normalizeProduct } from '../utils/normalizeProduct';
import { formatMoney } from '../utils/formatMoney';

const parseSaleError = (message, cart) => {
  if (typeof message !== 'string') return 'Error interno al registrar la venta.';
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

    const customerName = selectedCustomer ? selectedCustomer.fullName : 'Consumidor Final';

    const res = await Swal.fire({ 
      title: '¿Confirmar Factura?', 
      html: `<p>Cliente: <b>${customerName}</b><br/>Total: <b>${formatMoney(total)}</b></p>`,
      icon: 'question', 
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Sí, Registrar'
    });

    if (res.isConfirmed) {
      try {
        const mappedPayments = isMultiPayment
          ? payments.map((p) => ({
              method: p.method,
              amount: parseFloat(Number(p.amount).toFixed(4)),
              ...(p.method === 'COUPON' && p.couponCode ? { couponCode: p.couponCode } : {}),
            }))
          : [{
              method: paymentMethod,
              amount: parseFloat((paymentMethod === 'CASH' ? amountReceived : total).toFixed(4)),
            }];

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

        const cashPaid = mappedPayments.filter(p => p.method === 'CASH').reduce((s, p) => s + p.amount, 0);
        const change = totalPaid > total ? Math.min(cashPaid, totalPaid - total) : 0;

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
          paymentMethod: isMultiPayment
            ? `PAGO MIXTO (${payments.map(p => p.method === 'TRANSFER' && p.bank ? `TRANSF. ${p.bank}` : p.method === 'CASH' ? 'EFECTIVO' : p.method === 'CARD' ? 'TARJETA' : p.method).join(' + ')})`
            : paymentMethod === 'TRANSFER'
              ? `TRANSFERENCIA (${transferBank} - Ref: ${transferRef})`
              : ({
                  CASH: 'EFECTIVO',
                  CARD: 'TARJETA',
                  TRANSFER: 'TRANSFERENCIA',
                }[paymentMethod] || paymentMethod),
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
          error?.response?.data?.message || error?.message || 'Error interno al registrar la venta.',
          cart
        );
        Swal.fire({ icon: 'error', title: 'Error al registrar venta', text: message });
      }
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
          paymentMethod: sale.payments?.length > 1 ? 'PAGO MIXTO' : (sale.payments[0]?.paymentMethod === 'CASH' ? 'EFECTIVO' : 'TARJETA'),
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
    const { value: ref } = await promptSaleReference('Editar Venta');
    if (ref) {
      try {
        const sale = await findSaleByReference(ref);
        setCart(sale.lines.map(l => ({
          ...normalizeProduct(l.product),
          quantity: l.quantity,
          discountAmount: l.discountAmount || 0,
          extraData: l.extraData || ''
        })));
        setSelectedCustomer(sale.customer ? { id: sale.customer.id, fullName: sale.customer.fullName } : null);
        setPaymentMethod(sale.payments[0]?.paymentMethod || 'CASH');
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar.' });
      }
    }
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
    setTransferRef
  };
};
