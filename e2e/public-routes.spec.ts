import { expect, test } from '@playwright/test';

import { ROUTES } from '../apps/client/shared/constants';

test.describe('public routes', () => {
  test('the landing page renders', async ({ page }) => {
    await page.goto(ROUTES.landing);

    await expect(page).toHaveTitle(/gnomevpn/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('the auth page renders a sign-in form', async ({ page }) => {
    await page.goto(ROUTES.auth);

    await expect(page.getByRole('textbox').first()).toBeVisible();
  });

  test('the privacy policy is reachable without auth', async ({ page }) => {
    const response = await page.goto(ROUTES.privacy);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/privacy policy|политика конфиденциальности/i);
  });

  test('the terms of service are reachable without auth', async ({ page }) => {
    const response = await page.goto(ROUTES.terms);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/terms of service|публичная оферта/i);
  });

  test('the personal data consent is reachable without auth', async ({ page }) => {
    const response = await page.goto(ROUTES.consent);

    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /consent to personal data processing|согласие на обработку персональных данных/i
    );
  });

  test('the password reset page is reachable without auth', async ({ page }) => {
    const response = await page.goto(ROUTES.resetPassword);

    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('the telegram sign-in page is reachable without auth', async ({ page }) => {
    const response = await page.goto(ROUTES.telegramSignIn);

    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('the server status page renders without the API behind it', async ({ page }) => {
    const response = await page.goto(ROUTES.status);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/server status|статус серверов/i);
    await expect(page.getByRole('button', { name: /check connection|проверить подключение/i })).toBeVisible();
  });

  test('an unknown route renders the not-found page', async ({ page }) => {
    await page.goto('/definitely-not-a-real-route');

    await expect(page.locator('body')).toBeVisible();
  });

  test('the account page redirects an anonymous visitor to auth', async ({ page }) => {
    await page.goto(ROUTES.account);

    await page.waitForURL(/\/auth/, { timeout: 15_000 });

    expect(page.url()).toContain('/auth');
  });
});
