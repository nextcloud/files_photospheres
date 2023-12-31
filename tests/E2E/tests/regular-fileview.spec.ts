import { test, expect } from '@playwright/test';
import { loginAndSwitchToPPVTestFiles, frameId } from './common';

const playwright = require('playwright');

test.beforeEach(async ({ page }) => {
  await loginAndSwitchToPPVTestFiles(page);
});

test('PPV should show', async ({ page }) => {
  const ppvTestDirUrl = page.url();
  const panoLink = page.getByRole('link', { name: 'pano .jpg', exact: true });
  const panoRow = page.locator('tr', { has: panoLink });
  const panoFileId = await panoRow.getAttribute('data-cy-files-list-row-fileid');

  expect(ppvTestDirUrl).not.toContain('/' + panoFileId + '?');

  // Open 1st time
  await panoLink.click();
  await page.locator(frameId).waitFor({ state: 'visible' });

  expect(page.url()).toContain('/' + panoFileId + '?');

  // Close by button click
  const ppvLocator = page.frameLocator(frameId);
  await ppvLocator.getByRole('button', { name: 'Close' }).click();

  // Assert PPV closed and url restored
  await page.locator(frameId).waitFor({ state: 'hidden' });
  expect(page.url()).toBe(ppvTestDirUrl);

  // Open 2nd time
  await panoLink.click();
  await page.locator(frameId).waitFor({ state: 'visible' });

  // Move the image
  const ppvCanvasBoundingBox = await page.frameLocator('#photo-sphere-viewer-frame').locator('canvas').boundingBox() ?? { x: 0, y: 0, width: 0, height: 0 };
  const centerX = ppvCanvasBoundingBox.x + ppvCanvasBoundingBox.width / 2;
  const centerY = ppvCanvasBoundingBox.y + ppvCanvasBoundingBox.height / 2;
  await page.mouse.move(centerX, centerY, { steps: 5 });
  await page.mouse.down();
  await page.mouse.move(0, centerY, { steps: 5 });
  await page.mouse.up();
  
  // Close by pressing escape
  await page.keyboard.press('Escape');

  // Assert PPV closed and url restored
  await page.locator(frameId).waitFor({ state: 'hidden' });
  expect(page.url()).toBe(ppvTestDirUrl);
});

test('PPV should not show', async ({ page }) => {
  await page.getByRole('link', { name: 'non-pano .jpg', exact: true }).click();
  
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

test('360 video should show on context menu click', async ({ page }) => {
  // Note :: this test needs to run on Chrome because Chromium lacks support for 360 video codecs
  await page.getByRole('row', { name: 'Select the row for 360-video' }).getByLabel('Actions').click();
  await page.getByRole('menuitem', { name: 'View in 360° viewer' }).click();

  await expect(page.frameLocator('#photo-sphere-viewer-frame').locator('#pano div').nth(1)).toBeVisible({ timeout: 1000 });
  await page.frameLocator('#photo-sphere-viewer-frame').locator('#play-pause').click();
  await page.waitForTimeout(1000);
  
  // Close
  await page.frameLocator('#photo-sphere-viewer-frame').locator('#pano div').nth(1).press('Escape');
  await expect(page.frameLocator('#photo-sphere-viewer-frame').locator('#pano div').nth(1)).toBeHidden({ timeout: 1000 });
});