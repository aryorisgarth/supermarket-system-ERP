import { describe, expect, it } from 'vitest';
import {
  calculateMarginPercent,
  calculateMarkupPercent,
  suggestSalePriceFromCost,
  suggestSalePricesForPack,
} from './purchaseUnits';

describe('pricing policy helpers', () => {
  const pack = { label: 'CAJA', factor: 12 };

  it('calculates markup from cost for suggested sale price', () => {
    expect(suggestSalePriceFromCost(500 / 12, 20)).toBeCloseTo(50, 4);
  });

  it('separates markup and margin for Aceite Ideal numbers', () => {
    const cost = 68.9404;
    const sale = 100;
    const markup = calculateMarkupPercent(sale, cost);
    const margin = calculateMarginPercent(sale, cost);
    expect(markup).toBeCloseTo(45.05, 2);
    expect(margin).toBeCloseTo(31.06, 2);
  });

  it('AUTO recalculates from new pack cost even if product already has salePrice', () => {
    const product = {
      salePrice: 45,
      minMarginPercent: 20,
      pricingPolicy: 'AUTO_BY_MARGIN',
      uomConversions: [{ label: 'CAJA', salePrice: 540 }],
    };
    const result = suggestSalePricesForPack(product, pack, 500);
    expect(result.unitCost).toBeCloseTo(41.6666667, 4);
    expect(result.salePricePerUnit).toBeCloseTo(50, 4);
    expect(result.salePricePerPack).toBeCloseTo(600, 4);
    expect(result.fromMargin).toBe(true);
  });

  it('SUGGEST also recalculates preview from new cost', () => {
    const product = {
      salePrice: 45,
      minMarginPercent: 20,
      pricingPolicy: 'SUGGEST_ON_PURCHASE',
    };
    const result = suggestSalePricesForPack(product, pack, 500);
    expect(result.salePricePerUnit).toBeCloseTo(50, 4);
  });

  it('MANUAL keeps existing sale price when cost changes', () => {
    const product = {
      salePrice: 45,
      minMarginPercent: 20,
      pricingPolicy: 'MANUAL',
      uomConversions: [{ label: 'CAJA', salePrice: 540 }],
    };
    const result = suggestSalePricesForPack(product, pack, 500);
    expect(result.salePricePerUnit).toBe(45);
    expect(result.salePricePerPack).toBe(540);
    expect(result.fromMargin).toBe(false);
  });
});
