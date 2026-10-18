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

  console.log('Fill username: Admin');
  await page.locator('input[name="username"]').fill('Admin');
  await page.waitForTimeout(1000);

  console.log('Click password input');
  await page.locator('input[name="password"]').click();
  await page.waitForTimeout(1000);

  console.log('Fill password');
  await page.locator('input[name="password"]').fill('Admin123@');
  await page.waitForTimeout(1000);

  console.log('Click Sign In');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(1000);

  console.log('Verify Edit button is visible');
  await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible();
  await page.waitForTimeout(1000);

  console.log('Open Case Management tab');
  await page.getByText('📄Case Management').click();
  await page.waitForTimeout(1000);

  console.log('Verify View button in case table');
  await expect(page.getByRole('cell', { name: 'View' }).first()).toBeVisible();
  await page.waitForTimeout(1000);
});