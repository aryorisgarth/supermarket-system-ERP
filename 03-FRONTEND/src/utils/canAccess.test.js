import { describe, it, expect } from 'vitest';
import { canAccess } from './canAccess';

describe('canAccess', () => {
  it('permite acceso solo por rol cuando no hay permisos requeridos', () => {
    const user = { role: { name: 'CAJERO' }, permissions: [] };
    expect(canAccess({ user, roles: ['CAJERO'] })).toBe(true);
    expect(canAccess({ user, roles: ['BODEGUERO'] })).toBe(false);
  });

  it('bloquea si falta el permiso aunque el rol coincida', () => {
    const user = {
      id: 2,
      role: { name: 'SUPERVISOR' },
      permissions: ['SALE_CREATE', 'REPORT_VIEW'],
      directPermissions: [],
    };
    expect(
      canAccess({
        user,
        roles: ['SUPERVISOR'],
        permissions: ['USER_MANAGE'],
        allowPermissionOverride: false,
      })
    ).toBe(false);
  });

  it('permite permisos adicionales aunque el rol no esté en la lista', () => {
    const user = {
      id: 3,
      role: { name: 'CAJERO' },
      permissions: ['SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE', 'REPORT_VIEW'],
      directPermissions: ['REPORT_VIEW'],
    };
    expect(
      canAccess({
        user,
        roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONSULTOR'],
        permissions: ['REPORT_VIEW'],
        allowPermissionOverride: true,
      })
    ).toBe(true);
  });

  it('sin override sigue exigiendo el rol', () => {
    const user = {
      id: 4,
      role: { name: 'CAJERO' },
      permissions: ['REPORT_VIEW'],
      directPermissions: ['REPORT_VIEW'],
    };
    expect(
      canAccess({
        user,
        roles: ['CONSULTOR'],
        permissions: ['REPORT_VIEW'],
        allowPermissionOverride: false,
      })
    ).toBe(false);
  });

  it('no muestra módulos de supervisor al cajero aunque tenga CASH_CLOSE del rol', () => {
    const user = {
      id: 5,
      role: { name: 'CAJERO' },
      permissions: ['SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE'],
      directPermissions: [],
    };
    expect(
      canAccess({
        user,
        roles: ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'],
        permissions: ['CASH_CLOSE'],
        allowPermissionOverride: false,
      })
    ).toBe(false);
    expect(
      canAccess({
        user,
        roles: ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'],
        permissions: ['CASH_OPEN', 'CASH_MOVE', 'CASH_CLOSE'],
        allowPermissionOverride: false,
      })
    ).toBe(false);
  });

  it('permite control de cajas al cajero solo si CASH_CLOSE es permiso adicional', () => {
    const user = {
      id: 6,
      role: { name: 'CAJERO' },
      permissions: ['SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE'],
      directPermissions: ['CASH_CLOSE'],
    };
    expect(
      canAccess({
        user,
        roles: ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'],
        permissions: ['CASH_CLOSE'],
        allowPermissionOverride: true,
      })
    ).toBe(true);
  });
});
