import { test, expect } from '@playwright/test';

test.describe('Pantalla de login', () => {
  test('muestra formulario de acceso', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByPlaceholder('admin@supermarket.local')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
  });

  test('redirige o muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('admin@supermarket.local').fill('noexiste@test.com');
    await page.getByPlaceholder('••••••••••••').fill('wrong-password');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/login/);
  });
});
