import { test, expect } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true
});

test('test', async ({ page }) => {
  console.log('Opening login page');
  await page.goto('http://localhost:4200/login');
  await page.waitForTimeout(1000);

  console.log('Logging in as EMS user');
  console.log('Click username input');
  await page.locator('input[name="username"]').click();
  await page.waitForTimeout(1000);

  console.log('Fill username: EMSF');
  await page.locator('input[name="username"]').fill('EMSF');
  await page.waitForTimeout(1000);

  console.log('Click password input');
  await page.locator('input[name="password"]').click();
  await page.waitForTimeout(1000);

  console.log('Fill password');
  await page.locator('input[name="password"]').fill('Ems1234@');
  await page.waitForTimeout(1000);

  console.log('Click Sign In');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(1000);

  console.log('Verify EMS Portal');
  await expect(page.getByText('EMS Portal')).toBeVisible();
  await page.waitForTimeout(1000);

  console.log('Logout EMS');
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForTimeout(1000);

  console.log('Logging in as Hospital user');
  console.log('Click username input');
  await page.locator('input[name="username"]').click();
  await page.waitForTimeout(1000);

  console.log('Fill username: Hospital');
  await page.locator('input[name="username"]').fill('Hospital');
  await page.waitForTimeout(1000);

  console.log('Click password input');
  await page.locator('input[name="password"]').click();
  await page.waitForTimeout(1000);

  console.log('Fill password');
  await page.locator('input[name="password"]').fill('Hospital123@');
  await page.waitForTimeout(1000);

  console.log('Click Sign In');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(1000);

  console.log('Verify Hospital Portal');
  await expect(page.getByText('Hospital Portal')).toBeVisible();
  await page.waitForTimeout(1000);

  console.log('Logout Hospital');
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForTimeout(1000);

  console.log('Logging in as Admin user');
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

  console.log('Verify Admin Panel');
  await expect(page.getByText('Admin Panel')).toBeVisible();
  await page.waitForTimeout(1000);
});
