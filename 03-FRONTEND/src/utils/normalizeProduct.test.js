import { describe, it, expect } from 'vitest';
import { normalizeProduct } from './normalizeProduct';

describe('normalizeProduct', () => {
  it('mapea camelCase del API', () => {
    const p = normalizeProduct({ id: 1, name: 'Arroz', barcode: '750001', salePrice: 10 });
    expect(p.name).toBe('Arroz');
    expect(p.barcode).toBe('750001');
  });

  it('mapea snake_case y alias en español', () => {
    const p = normalizeProduct({
      id: 2,
      product_name: 'Frijol',
      codigo_barras: '999888',
      sale_price: 5.5,
    });
    expect(p.name).toBe('Frijol');
    expect(p.barcode).toBe('999888');
    expect(p.salePrice).toBe(5.5);
  });
});
