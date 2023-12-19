export async function loginAndSwitchToPPVTestFiles(page) {
    // Do the login and navigate to the folder where the test files have been uploaded
    await page.goto(baseUrl + '/index.php/login');
    await page.locator('#user').click();
    await page.locator('#user').fill(process.env.E2E_USER ?? 'admin');
    await page.locator('#user').press('Tab');
    await page.locator('#password').fill(process.env.E2E_PASSWORD ?? 'admin');
    await page.locator('#password').press('Enter');
    await page.getByRole('link', { name: 'Files' }).click();
    await page.getByRole('link', { name: 'ppv-testfiles' }).click();
};

export const frameId = '#photo-sphere-viewer-frame';

export const baseUrl = process.env.E2E_BASE_URL ? process.env.E2E_BASE_URL : 'http://localhost';