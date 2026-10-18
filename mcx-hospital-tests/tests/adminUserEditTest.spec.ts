import { test, expect } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true
});

test('test', async ({ page }) => {
  console.log('Opening login page');
  await page.goto('http://localhost:4200/login');
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

  console.log('Open edit user modal');
  await page.locator('tr:nth-child(9) > td:nth-child(6) > .icon-btn').click();
  await page.waitForTimeout(1000);

  console.log('Change role to Hospital Staff');
  await page.getByRole('button', { name: 'Hospital Staff' }).click();
  await page.waitForTimeout(1000);

  console.log('Click username field');
  await page.getByRole('textbox').nth(1).click();
  await page.waitForTimeout(1000);

  console.log('Fill username: EMSF1');
  await page.getByRole('textbox').nth(1).fill('EMSF1');
  await page.waitForTimeout(1000);

  console.log('Save changes');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(1000);

  console.log('Verify updated username');
  await expect(page.getByRole('cell', { name: 'EMSF1' })).toBeVisible();
  await page.waitForTimeout(1000);

  console.log('Verify updated role');
  await expect(page.getByText('HOSPITAL').nth(5)).toBeVisible();
  await page.waitForTimeout(1000);

  console.log('Disable user');
  await page.locator('tr:nth-child(9) > td:nth-child(7) > .status-btn').click();
  await page.waitForTimeout(1000);

  console.log('Confirm disable');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(1000);

  console.log('Verify user is disabled');
  await expect(
    page.getByRole('button', { name: 'DISABLED' }).nth(2)
  ).toBeVisible();
  await page.waitForTimeout(1000);

  console.log('Open edit user modal again');
  await page.locator('tr:nth-child(9) > td:nth-child(6) > .icon-btn').click();
  await page.waitForTimeout(1000);

  console.log('Click username field');
  await page.getByRole('textbox').nth(1).click();
  await page.waitForTimeout(1000);

  console.log('Restore username: EMSF');
  await page.getByRole('textbox').nth(1).fill('EMSF');
  await page.waitForTimeout(1000);

  console.log('Change role to EMS Personnel');
  await page.getByRole('button', { name: 'EMS Personnel' }).click();
  await page.waitForTimeout(1000);

  console.log('Save changes');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(1000);

  console.log('Enable user');
  await page.getByRole('button', { name: 'DISABLED' }).nth(2).click();
  await page.waitForTimeout(1000);

  console.log('Confirm enable');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(1000);
});
