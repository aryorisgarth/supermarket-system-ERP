export const PURCHASE_ORDER_STATUS = {
  DRAFT: 'DRAFT',
  ORDERED: 'ORDERED',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  RECEIVED: 'RECEIVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
};

export const PURCHASE_STATUS_LABELS = {
  DRAFT: 'Borrador',
  ORDERED: 'Ordenada',
  PARTIALLY_RECEIVED: 'Parcial',
  RECEIVED: 'Recibida',
  CLOSED: 'Cerrada incompleta',
  CANCELLED: 'Cancelada',
};

export const PURCHASE_STATUS_TONES = {
  DRAFT: 'neutral',
  ORDERED: 'blue',
  PARTIALLY_RECEIVED: 'amber',
  RECEIVED: 'green',
  CLOSED: 'neutral',
  CANCELLED: 'red',
};

export const RECEIVABLE_STATUSES = ['ORDERED', 'PARTIALLY_RECEIVED'];

export const RECEIPT_LINE_EXTRA = {
  batchCode: '',
  expirationDate: '',
  quantityRejected: '',
  warehouseZone: '',
  qcNotes: '',
};

export function buildReceiptLinesFromOrder(order, { pendingOnly = false } = {}) {
  const lines = (order?.items || []).map((item) => {
    const alreadyRejected = Number(item.quantityRejected || 0);
    const pending = Math.max(
      0,
      Number(item.quantityOrdered || 0) - Number(item.quantityReceived || 0) - alreadyRejected
    );
    return {
      itemId: item.id,
      productId: item.product?.id,
      barcode: item.product?.barcode || '',
      productName: item.product?.name || 'Producto',
      ordered: Number(item.quantityOrdered || 0),
      alreadyReceived: Number(item.quantityReceived || 0),
      alreadyRejected,
      pending,
      quantityReceived: pending,
      quantityInPacks: Number(item.quantityInPacks || item.quantityOrdered || 0),
      packLabel: item.packLabel || 'UN',
      unitsPerPack: Number(item.unitsPerPack || 1),
      unitCost: Number(item.unitCost || 0),
      requiresBatch: !!item.product?.requiresBatch,
      requiresExpiration: !!item.product?.requiresExpiration,
      ...RECEIPT_LINE_EXTRA,
      batchCode: '',
    };
  });

  return pendingOnly ? lines.filter((line) => line.pending > 0) : lines;
}

export function updateReceiptLine(lines, itemId, field, value) {
  return lines.map((row) => {
    if (row.itemId !== itemId) return row;
    if (field === 'quantityReceived') {
      const max = Math.max(0, row.pending - Number(row.quantityRejected || 0));
      const qty = Math.min(Math.max(0, Number(value || 0)), max);
      return { ...row, quantityReceived: qty };
    }
    if (field === 'quantityRejected') {
      const max = Math.max(0, row.pending - Number(row.quantityReceived || 0));
      const qty = Math.min(Math.max(0, Number(value || 0)), max);
      return { ...row, quantityRejected: qty };
    }
    return { ...row, [field]: value };
  });
}

export function matchReceiptLineByProduct(lines, product) {
  if (!product) return null;
  const byId = lines.find((line) => line.productId === product.id);
  if (byId) return byId;
  return lines.find((line) => line.barcode && line.barcode === product.barcode) || null;
}

export function calcReceiptTotal(lines) {
  return lines.reduce((sum, line) => sum + Number(line.quantityReceived || 0) * Number(line.unitCost || 0), 0);
}

export function buildReceiptPayload(lines, receiptNotes = '') {
  const items = lines
    .filter((line) => Number(line.quantityReceived) > 0 || Number(line.quantityRejected) > 0)
    .map((line) => ({
      itemId: line.itemId,
      quantityReceived: Number(line.quantityReceived || 0),
      quantityRejected: line.quantityRejected ? Number(line.quantityRejected) : undefined,
      batchCode: line.batchCode?.trim() || undefined,
      expirationDate: line.expirationDate || undefined,
      warehouseZone: line.warehouseZone?.trim() || undefined,
      qcNotes: line.qcNotes?.trim() || undefined,
    }));

  return {
    notes: receiptNotes?.trim() || undefined,
    items,
  };
}

export function validateReceiptPayload(items, lines) {
  if (!items.length) {
    return { valid: false, message: 'Ingresa al menos una cantidad aceptada o rechazada.' };
  }
  for (const item of items) {
    const orig = (lines || []).find((l) => l.itemId === item.itemId);
    if (orig && Number(item.quantityReceived) > 0) {
      if (orig.requiresBatch && !item.batchCode) {
        return { valid: false, message: `El código de lote es obligatorio para el producto: ${orig.productName}.` };
      }
      if (orig.requiresExpiration && !item.expirationDate) {
        return { valid: false, message: `La fecha de vencimiento es obligatoria para el producto: ${orig.productName}.` };
      }
    }
  }
  const missingExpiry = items.some((line) => line.batchCode && !line.expirationDate && Number(line.quantityReceived) > 0);
  if (missingExpiry) {
    return { valid: false, message: 'Si registras un lote, debes indicar la fecha de vencimiento.' };
  }
  return { valid: true };
}
