import { test, expect } from '@playwright/test';
import { loginAndSwitchToPPVTestFiles, frameId, baseUrl } from './common';

const playwright = require('playwright');

test.beforeEach(async ({ page }) => {
  await loginAndSwitchToPPVTestFiles(page);
  await removeDirectoryShare(page);
  const shareLink = await shareDirectory(page);
  await page.goto(shareLink);
});

test.afterEach(async ({ page }) => {
  await unshare(page);
});

async function removeDirectoryShare(page) {
  try {
    await page.getByLabel('Shared by link').click({ timeout: 2000 });
    await page.getByLabel('Actions for "Share link"').click();
    await page.getByRole('menuitem', { name: 'Unshare' }).click();
  }
  catch (e) {
    if (!(e instanceof playwright.errors.TimeoutError))
      throw e;
  }
}

async function unshare(page) {
  await page.goto(baseUrl);
  await page.getByLabel('Files', { exact: true }).click();
  await page.getByRole('button', { name: 'ppv-testfiles' }).click();
  await page.locator('.files-list__header-share-button').click();
  await page.getByLabel('Actions for "Share link"').click();
  await page.getByRole('menuitem', { name: 'Unshare' }).click();
}

async function shareDirectory(page) {
  await page.locator('.files-list__header-share-button').click();
  await page.getByLabel('Create a new share link').click();
  await page.waitForTimeout(1000);
  return await page.evaluate(async () => await navigator.clipboard.readText());
}

test('PPV should show on click on directory shared pano.jpg', async ({ page }) => {
  // Open pano
  await page.getByRole('row', { name: /.*"pano.jpg".*/ }).click();

  await page.locator(frameId).waitFor({ state: 'visible', timeout: 5000 });
  const ppvLocator = page.frameLocator(frameId);

  // Check autorotate and close buttons
  await ppvLocator.getByTitle('Automatic rotation').getByRole('img').click();
  await ppvLocator.getByRole('button', { name: 'Close' }).click();
});

test('PPV should not show on click on directory shared non-pano.jpg', async ({ page }) => {
  // Open image
  await page.getByRole('row', { name: /.*"non-pano.jpg".*/ }).click();

  // Assert PPV did not open
  let visible = true;
  try {
    await page.locator(frameId).waitFor({ state: 'visible', timeout: 1000 });
  } catch (e) {
    if (!(e instanceof playwright.errors.TimeoutError))
      throw e;
    visible = false;
  }

  expect(visible).toBe(false);
  
  // Assert regular viewer opened
  await page.getByRole('img', { name: 'non-pano.jpg' }).waitFor({ state: 'visible', timeout: 1000 });
});