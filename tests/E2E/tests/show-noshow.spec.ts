import { test, expect } from '@playwright/test';

const frameId = '#photo-sphere-viewer-frame';

test.beforeEach(async ({ page }) => {
  // Do the login and navigate to the folder where the test files have been uploaded
  await page.goto(process.env.E2E_BASE_URL ? process.env.E2E_BASE_URL + '/index.php/login' : 'http://localhost/nextcloud/index.php/login');
  await page.locator('#user').click();
  await page.locator('#user').fill(process.env.E2E_USER ?? 'admin');
  await page.locator('#user').press('Tab');
  await page.locator('#password').fill(process.env.E2E_PASSWORD ?? 'admin');
  await page.locator('#password').press('Enter');
  await page.getByRole('link', { name: 'Files' }).click();
  await page.getByRole('link', { name: 'Not favorited ppv-testfiles Share Actions' }).click();
});

test('PPV should show', async ({ page }) => {
  await page.getByRole('link', { name: 'Not favorited pano .jpg Share Actions' }).click();
  
  // Assert PPV opend
  await page.locator(frameId).waitFor({ state: 'visible' });
  const ppvLocator = page.frameLocator(frameId);

  // Check autorotate and close buttons
  await ppvLocator.getByTitle('Automatic rotation').getByRole('img').click();
  await ppvLocator.getByRole('button', { name: 'Close' }).click();
});

test('PPV should not show', async ({ page }) => {
  await page.getByRole('link', { name: 'Not favorited non-pano .jpg Share Actions' }).click();
  
  // Assert PPV did not open
  let visible = true;
  try {
    await page.locator(frameId).waitFor({ state: 'visible', timeout: 1000 });
  } catch (e) {
    if (e.name !== 'TimeoutError')
      throw e;
    visible = false;
  }

  expect(visible).toBe(false);
});