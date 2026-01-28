import { test, expect, Page } from '@playwright/test';
import { loginAndSwitchToPPVTestFiles, frameId, baseUrl, goToFilesApp, goToPPVTestFiles } from './common';

const playwright = require('playwright');

let shareLink: string;
let shareId: number;
let consoleErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  captureConsoleErrors(page);
  await loginAndSwitchToPPVTestFiles(page);
  const { link, id } = await shareDirectory(page);
  shareLink = link;
  shareId = id;
  await page.goto(shareLink);
});

test.afterEach(async ({ page }) => {
  try {
    await unshare(page, shareId);
  }
  finally {
    if (consoleErrors.length > 0) {
      console.error('Console errors during the test:\n' + consoleErrors.join('\n'));
    }
    consoleErrors = [];
  }
});

function captureConsoleErrors(page: Page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
}

async function getRequestToken(page: Page): Promise<string> {
  return await page.evaluate(() => {
    return document.head.dataset.requesttoken;
  }) as string;
}

async function unshare(page: Page, shareId: number) {
  await page.goto(baseUrl);
  await goToFilesApp(page);
  const requesttoken = await getRequestToken(page);

  await page.evaluate(async ({baseUrl, requesttoken, shareId}) => {
    const response = await fetch(baseUrl + '/ocs/v2.php/apps/files_sharing/api/v1/shares/' + shareId, {
      method: 'DELETE',
      headers: {
        'requesttoken': requesttoken,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
  }, {baseUrl, requesttoken, shareId});
}

async function shareDirectory(page: Page): Promise<{link: string, id: number}> {
  const requesttoken = await getRequestToken(page);

  const result = await page.evaluate(async ({baseUrl, requesttoken}) => {
    const response = await fetch(baseUrl + '/ocs/v2.php/apps/files_sharing/api/v1/shares', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'requesttoken': requesttoken,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        path: '/ppv-testfiles',
        shareType: 3,
        expireDate: '',
        attributes: "[]"
      })
    });

    if (!response.ok) {
      const err = `shareDirectory error - HTTP ${response.status}: ${await response.text()}`;
      console.error(err);
      throw new Error(err);
    }

    return await response.json();
  }, {baseUrl, requesttoken});

  const url = result.ocs.data.url;
  const id = result.ocs.data.id;
  return { link: url, id };
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