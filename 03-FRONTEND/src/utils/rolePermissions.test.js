import { describe, it, expect } from 'vitest';
import { getEffectivePermissions } from './rolePermissions';

describe('getEffectivePermissions', () => {
  it('usa solo permisos del backend cuando la sesión está sincronizada', () => {
    const user = {
      id: 12,
      role: { name: 'CAJERO' },
      permissions: ['SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE'],
      directPermissions: [],
    };
    expect(getEffectivePermissions(user)).toEqual([
      'SALE_CREATE',
      'CASH_OPEN',
      'CASH_CLOSE',
    ]);
  });

  it('no conserva permisos extra tras quitarlos en backend', () => {
    const user = {
      id: 12,
      role: { name: 'CAJERO' },
      permissions: ['SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE'],
      directPermissions: [],
    };
    expect(getEffectivePermissions(user)).not.toContain('REPORT_VIEW');
    expect(getEffectivePermissions(user)).not.toContain('USER_MANAGE');
  });

  it('no mezcla defaults hardcodeados con permisos del API', () => {
    const user = {
      id: 7,
      role: { name: 'BODEGUERO' },
      permissions: ['PURCHASE_RECEIVE', 'INVENTORY_VIEW'],
      directPermissions: [],
    };
    expect(getEffectivePermissions(user)).toEqual(['PURCHASE_RECEIVE', 'INVENTORY_VIEW']);
    expect(getEffectivePermissions(user)).not.toContain('QC_REGISTER');
  });

  it('usa defaults solo en fallback de token sin /auth/me', () => {
    const user = {
      id: 'kc-uuid',
      role: { name: 'CAJERO' },
      permissions: [],
    };
    expect(getEffectivePermissions(user)).toEqual([
      'SALE_CREATE',
      'CASH_OPEN',
      'CASH_CLOSE',
    ]);
  });
});
