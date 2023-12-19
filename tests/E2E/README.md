# End to End Tests

E2E testsuite implemented with [Playwright](https://playwright.dev/).

- [End to End Tests](#end-to-end-tests)
  - [Running the E2E tests](#running-the-e2e-tests)

## Running the E2E tests

To be able to run E2E tests, you will have to have a running Nextcloud instance with at least one user where you know the credentials. Also the `files_photospheres` app needs to be installed and enabled.

1. Change into the directory `/tests/E2E`
2. Run `npm ci && npx playwright install chrome --with-deps` to install dependencies
3. Run `E2E_USER="<NC_USER>" E2E_PASSWORD="<NC_PASS>" E2E_BASE_URL="<NC_INSTANCE_URL>" ./scripts/test-setup.sh` to upload the testdata
4. Execute the tests with `npx playwright test`
5. Use `E2E_USER="<NC_USER>" E2E_PASSWORD="<NC_PASS>" E2E_BASE_URL="<NC_INSTANCE_URL>" ./scripts/test-shutdown.sh` to cleanup the testdata

> Also have a look at [playwright.yml](./../../.github/workflows/playwright.yml)