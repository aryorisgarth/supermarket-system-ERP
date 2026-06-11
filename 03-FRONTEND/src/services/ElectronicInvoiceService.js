import api from './api';
import SaleService from './SaleService';

/** Construye el modelo de vista para el modal a partir de la FE y la venta. */
export const buildInvoiceView = (ei, sale) => {
  const cuf = ei.fiscalUuid || '';
  const verificationUrl = `${window.location.origin}/verify?cuf=${encodeURIComponent(cuf)}`;
  const lines = (sale?.details || sale?.lines || []).map((d, i) => {
    const qty = Number(d.quantity ?? 0);
    const unitPrice = Number(d.unitPrice ?? d.price ?? 0);
    const discount = Number(d.discountAmount ?? d.discount ?? 0);
    const taxRate = Number(d.taxApplied ?? d.taxRate ?? 0);
    const subtotal = Number(d.subtotal ?? qty * unitPrice - discount);
    const taxAmount = subtotal * taxRate / 100;
    return {
      lineNumber: i + 1,
      productCode: d.product?.barcode || d.barcode || '—',
      productName: d.product?.name || d.productName || d.name || 'Producto',
      quantity: qty,
      unit: 'UND',
      unitPrice,
      discount,
      taxRate,
      taxAmount,
      lineTotal: subtotal + taxAmount,
    };
  });

  return {
    id: ei.id,
    saleId: ei.saleId,
    invoiceNumber: ei.invoiceNumber || sale?.invoiceNumber || '—',
    authorizationNumber: ei.authorizationNumber || '—',
    controlCode: cuf.slice(-10),
    cuf,
    verificationUrl,
    issuedAt: ei.authorizedAt || ei.createdAt,
    environment: ei.countryCode === 'NI' ? 'TEST' : ei.countryCode,
    status: ei.status,
    emitter: {
      name: 'Supermercado Demo S.A.',
      ruc: ei.issuerTaxId || '—',
      address: 'Managua, Nicaragua',
      phone: '+505 2222-3333',
      economicActivity: 'Comercio al por mayor y menor',
    },
    receiver: {
      name: sale?.customer?.fullName || sale?.customerName || 'CONSUMIDOR FINAL',
      identification: ei.receiverTaxId || 'CF',
      address: sale?.customer?.address || '—',
      phone: sale?.customer?.phone || '—',
    },
    lines,
    subtotal: Number(sale?.subtotal ?? 0),
    totalTax: Number(sale?.totalTax ?? sale?.taxAmount ?? 0),
    totalDiscount: lines.reduce((s, l) => s + l.discount, 0),
    totalAmount: Number(sale?.totalAmount ?? 0),
    payments: (sale?.payments || []).map(p => ({
      method: p.paymentMethod || p.method,
      amount: Number(p.amount ?? 0),
      currency: 'NIO',
    })),
  };
};

const ElectronicInvoiceService = {
  issue: async (saleId) => {
    const res = await api.post(`/billing/electronic-invoices/sale/${saleId}/issue`);
    return res.data;
  },

  bySale: async (saleId) => {
    const res = await api.get(`/billing/electronic-invoices/sale/${saleId}`);
    return res.data;
  },

  /** Emite/recupera FE y carga la venta para el visor completo. */
  issueWithSale: async (saleId) => {
    const ei = await ElectronicInvoiceService.issue(saleId);
    let sale = null;
    try { sale = await SaleService.getById(saleId); } catch (_) { /* opcional */ }
    return buildInvoiceView(ei, sale);
  },

  bySaleWithDetails: async (saleId) => {
    const ei = await ElectronicInvoiceService.bySale(saleId);
    let sale = null;
    try { sale = await SaleService.getById(saleId); } catch (_) { /* opcional */ }
    return buildInvoiceView(ei, sale);
  },

  verify: async (cuf) => {
    const res = await api.get('/billing/electronic-invoices/verify', { params: { cuf } });
    return res.data;
  },

  getPage: async (params = {}) => {
    const res = await api.get('/billing/electronic-invoices', { params });
    return res.data;
  },

  getAll: async (params = {}) => ElectronicInvoiceService.getPage(params),
};

export default ElectronicInvoiceService;
