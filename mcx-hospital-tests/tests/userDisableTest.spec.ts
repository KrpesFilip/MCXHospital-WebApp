import { test, expect } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true
});

test('test', async ({ page }) => {
  console.log('Opening login page');
  await page.goto('http://localhost:4200/login');
  await page.waitForTimeout(1000);

  console.log('Click username input');
  await page.locator('input[name="username"]').click();
  await page.waitForTimeout(1000);

  console.log('Fill username: Indigo');
  await page.locator('input[name="username"]').fill('Indigo');
  await page.waitForTimeout(1000);

  console.log('Click password input');
  await page.locator('input[name="password"]').click();
  await page.waitForTimeout(1000);

  console.log('Fill password');
  await page.locator('input[name="password"]').fill('test');
  await page.waitForTimeout(1000);

  console.log('Click Sign In');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(1000);

  console.log('Verify disabled account message');
  await expect(page.locator('app-login-form')).toContainText(
    'Your account is disabled. Contact your system administrator'
  );
  await page.waitForTimeout(1000);
});