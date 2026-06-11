import { describe, it, expect } from 'vitest';
import { getDefaultPathForRole, getLoginSuccessMessage } from './authRoutes';

describe('authRoutes', () => {
  it('envía al cajero a su panel de turno', () => {
    expect(getDefaultPathForRole('CAJERO')).toBe('/cajero');
  });

  it('mensaje de login para cajero', () => {
    expect(getLoginSuccessMessage('CAJERO')).toContain('turno');
  });

  it('mensaje de login para consultor', () => {
    expect(getLoginSuccessMessage('CONSULTOR')).toContain('consulta');
  });

  it('mensaje de login para supervisor', () => {
    expect(getLoginSuccessMessage('SUPERVISOR')).toContain('supervision');
  });
});
