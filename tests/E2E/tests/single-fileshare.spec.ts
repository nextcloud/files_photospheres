import { test, expect } from '@playwright/test';
import { loginAndSwitchToPPVTestFiles, frameId, baseUrl, goToFilesApp } from './common';

const playwright = require('playwright');

let fileName = '';

test.beforeEach(async ({ page }) => {
  await loginAndSwitchToPPVTestFiles(page);
});

test.afterEach(async ({ page }) => {
  await unshare(page);
});

async function openSharingPage(page) { 
  await page.locator("[data-cy-files-list-row-name='" + fileName + "'] .files-list__row-mtime").click();
  await page.getByRole('tab', { name: 'Sharing' }).click();
}

async function removeExistingSingleFileShare(page) {
  try{
    await page.getByRole('button', { name: 'Actions for "Share link"' }).click({ timeout: 2000});
    await page.getByRole('menuitem', { name: 'Unshare' }).click();
  }
  catch(e) {
    if (!(e instanceof playwright.errors.TimeoutError))
      throw e;
  }
}

async function unshare(page) {
  await page.goto(baseUrl);
  await goToFilesApp(page);
  await page.getByRole('button', { name: 'ppv-testfiles' }).click();
  await page.locator("[data-cy-files-list-row-name='" + fileName + "'] .files-list__row-mtime").click();
  await page.getByRole('tab', { name: 'Sharing' }).click();
  await page.getByRole('button', { name: 'Actions for "Share link"' }).click();
  await page.getByRole('menuitem', { name: 'Unshare' }).click();
}

async function navigateToSingleFileShare(page) {
  await openSharingPage(page);
  await removeExistingSingleFileShare(page);
  await page.getByRole('button', { name: 'Create a new share link' }).click();
  await page.waitForTimeout(1000);
  const shareLink = await page.evaluate(async () => await navigator.clipboard.readText());
  await page.goto(shareLink);
}

test('PPV should show directly (single file share for pano.jpg)', async ({ page }) => {
  fileName = 'pano.jpg';

  await navigateToSingleFileShare(page);

  await page.locator(frameId).waitFor({ state: 'visible', timeout: 5000 });
  const ppvLocator = page.frameLocator(frameId);

  // Check autorotate button
  await ppvLocator.getByTitle('Automatic rotation').getByRole('img').click();

  // Close button should not be visible on single file share
  expect(ppvLocator.getByRole('button', { name: 'Close' })).not.toBeVisible();
});

test('PPV should not show (single file share for non-pano.jpg)', async ({ page }) => {
  fileName = 'non-pano.jpg';

  await navigateToSingleFileShare(page);

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
});