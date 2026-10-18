import { test, expect } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true
});
test.setTimeout(120000);

test('test', async ({ page }) => {
  console.log('Opening login page');
  await page.goto('http://localhost:4200/login');
  await page.waitForTimeout(1000);

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

  console.log('Click + New Case');
  await page.getByRole('button', { name: '+ New Case' }).click();
  await page.waitForTimeout(1000);

  console.log('Click patient name input');
  await page.getByRole('textbox', { name: 'Enter patient name' }).click();
  await page.waitForTimeout(1000);

  console.log('Fill patient name: Jogn');
  await page.getByRole('textbox', { name: 'Enter patient name' }).fill('Jogn');
  await page.waitForTimeout(1000);

  console.log('Set birth year slider');
  await page.getByRole('slider').fill('1992');
  await page.waitForTimeout(1000);

  console.log('Click Next');
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.waitForTimeout(1000);

  console.log('Select symptom: Chest pain');
  await page.getByRole('button', { name: '+ Chest pain' }).click();
  await page.waitForTimeout(1000);

  console.log('Click description field');
  await page.getByRole('textbox', { name: 'Describe the patient\'s' }).click();
  await page.waitForTimeout(1000);

  console.log('Fill description');
  await page.getByRole('textbox', { name: 'Describe the patient\'s' }).fill('Heavy breathing');
  await page.waitForTimeout(1000);

  console.log('Click Next');
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.waitForTimeout(1000);

  console.log('Select heart rate range');
  await page.getByRole('button', { name: 'High 100-120 bpm' }).click();
  await page.waitForTimeout(1000);

  console.log('Set heart rate slider');
  await page.getByRole('slider').nth(1).fill('100');
  await page.waitForTimeout(1000);

  console.log('Create case');
  await page.getByRole('button', { name: 'Create Case' }).click();
  await page.waitForTimeout(1000);

  console.log('Verify case details page');
  await expect(page.locator('h3')).toBeVisible();
  await page.waitForTimeout(1000);

  console.log('Click Update');
  await page.getByRole('button', { name: 'Update' }).click();
  await page.waitForTimeout(1000);

  console.log('Click Next');
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.waitForTimeout(1000);

  console.log('Click Next again');
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.waitForTimeout(1000);

  console.log('Set temperature slider');
  await page.getByRole('slider').nth(2).fill('38');
  await page.waitForTimeout(1000);

  console.log('Update case');
  await page.getByRole('button', { name: 'Update Case' }).click();
  await page.waitForTimeout(1000);

  console.log('Verify updated temperature');
  await expect(page.getByRole('main')).toContainText('38°C');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'End Case' }).click();
  await page.locator('app-end-case-modal').getByRole('button', { name: 'End Case' }).click();
});