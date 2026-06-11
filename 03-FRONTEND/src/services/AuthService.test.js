import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthService from './AuthService';


vi.mock('./api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isAuthenticated devuelve false sin token', () => {
    expect(AuthService.isAuthenticated()).toBe(false);
  });

  it('getCurrentUser devuelve null sin usuario guardado', () => {
    expect(AuthService.getCurrentUser()).toBeNull();
  });

  it('logout elimina token y usuario', async () => {
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify({ id: 1, role: { name: 'CAJERO' } }));

    await AuthService.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(AuthService.isAuthenticated()).toBe(false);
  });

  it('getCurrentUser parsea el usuario almacenado', () => {
    const user = { id: 2, fullName: 'Admin', role: { name: 'ADMIN_INGENIERO' } };
    localStorage.setItem('user', JSON.stringify(user));

    expect(AuthService.getCurrentUser()).toEqual(user);
  });
});
