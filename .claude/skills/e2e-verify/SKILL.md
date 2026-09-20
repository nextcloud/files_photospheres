---
name: e2e-verify
description: Run the existing Playwright E2E suite in tests/E2E against a real Nextcloud instance to confirm a files_photospheres change actually works - regular file view, single-file share, and directory share. Use when asked to verify a UI/UX change in the browser, or before claiming a change "works" beyond unit/integration tests.
allowed-tools: Bash, Read, Grep, Glob
---

Unit and integration tests (`/preflight`) prove the code is correct in isolation. This app
already ships a full Playwright suite in `tests/E2E/` — this skill is about running it (or
a targeted subset) against a real Nextcloud instance, not building browser automation from
scratch.

## 0. Precondition: a running Nextcloud instance with this app and `viewer` enabled

```bash
curl -sf http://localhost/status.php && echo REACHABLE || echo DOWN
```

**If DOWN**, there is no devcontainer in this repo — bring one up per `/nextcloud-dev-env`,
or mirror `.github/workflows/playwright.yml` (it also installs and builds the `nextcloud/viewer`
app alongside this one; `photosphereviewer-image`'s `order: -1` is only meaningful if the
default Files viewer is actually present to be overridden). If you have no way to stand up
an instance in this session (no docker, no existing checkout reachable), say so plainly —
"no reachable Nextcloud instance, e2e verification not run" — rather than skipping the
check silently or reporting unit tests as if they covered this.

## 1. Make sure the app under test is current

If you changed PHP: `occ app:enable files_photospheres` again after deploying the new code
(no build step needed for PHP). If you changed `src/*.js`: `npm run build` first — the app
serves `js/`, not `src/` (see `CLAUDE.md`'s critical constraints).

## 2. Set up test fixtures and run

```bash
cd tests/E2E
npm ci && npx playwright install chrome --with-deps
E2E_USER="<user>" E2E_PASSWORD="<pass>" E2E_BASE_URL="<http://host>" ./scripts/test-setup.sh
npx playwright test
```

`test-setup.sh` uploads `testdata/pano.jpg`, `non-pano.jpg`, and `360-video.mp4` over
WebDAV into a fresh `ppv-testfiles` folder for the target user (`vars.sh` defaults to
`admin`/`admin`/`http://localhost`). Run a single spec while iterating:

```bash
npx playwright test tests/regular-fileview.spec.ts
npx playwright test tests/single-fileshare.spec.ts
npx playwright test tests/directory-share.spec.ts
```

These three specs are exactly the three real scenarios in `CLAUDE.md`'s architecture
section (fast DAV-property path for the first two, slow REST path for the third) — pick
whichever one(s) the change actually touches rather than always running the full suite,
unless the change is broad (e.g. detection logic, the metadata contract) or you're doing a
final pre-PR check.

Playwright's own trace/report output (`playwright-report/`, `test-results/`) is useful for
debugging a failure — check it before re-running blind.

## 3. Clean up

```bash
E2E_USER="<user>" E2E_PASSWORD="<pass>" E2E_BASE_URL="<http://host>" ./scripts/test-shutdown.sh
```

Removes the `ppv-testfiles` folder. Skip this only if you're about to re-run the same suite
immediately after.

## 4. Manual driving, if a scenario isn't covered by an existing spec

For something the checked-in specs don't exercise (a new file action, a new setting), drive
it by hand against the same instance: log in, upload a fixture from `tests/E2E/testdata/`,
click it, and check the browser console for errors — a photosphere that "looks right" but
logged a JS error or a failed XHR is not a pass.

## Reporting

State plainly: which spec(s) ran, pass/fail, and — if step 0 came back DOWN — that e2e
verification did not run and why. Never report a change as browser-verified without having
actually run Playwright (or driven the browser manually) against a live instance this
session.
