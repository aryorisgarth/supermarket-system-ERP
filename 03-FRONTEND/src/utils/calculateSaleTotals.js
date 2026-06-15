const MONEY_SCALE = 4;

const roundMoney = (value) => {
  const factor = 10 ** MONEY_SCALE;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
};


export const calculateSaleTotals = (cart, defaultTaxRate = 15) => {
  let netSubtotal = 0;
  let tax = 0;
  let grossSubtotal = 0;
  let discountTotal = 0;

  for (const item of cart) {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.salePrice || 0);
    const discount = Number(item.discountAmount ?? item.discount ?? 0);
    const itemTaxRate = Number(item.taxCategory?.percentage ?? defaultTaxRate);

    grossSubtotal += unitPrice * quantity;
    discountTotal += discount;

    const lineTotal = roundMoney(unitPrice * quantity - discount);
    const lineNet = roundMoney(lineTotal / (1 + itemTaxRate / 100));
    const lineTax = roundMoney(lineTotal - lineNet);

    netSubtotal = roundMoney(netSubtotal + lineNet);
    tax = roundMoney(tax + lineTax);
  }

  return {
    subtotal: roundMoney(grossSubtotal),
    discountTotal: roundMoney(discountTotal),
    taxableSubtotal: roundMoney(Math.max(0, grossSubtotal - discountTotal)),
    netSubtotal,
    tax,
    total: roundMoney(netSubtotal + tax),
  };
};

export default calculateSaleTotals;
