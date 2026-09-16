---
name: preflight
description: Run the files_photospheres quality gate (lint, PHP unit + integration tests, frontend build, E2E) and fix what it reports. Use before committing, before opening a PR, or when asked whether the change is ready.
allowed-tools: Bash, Read, Edit, Grep, Glob
---

The repo's gate, cheapest first. Stop at the first failure, fix it, restart from that step.

## 1. Lint (no Nextcloud needed)

**Do not use `make lint`.** Its `lint:` target depends on `composer:`, which runs
`composer install --no-dev --prefer-dist` — that deletes `nextcloud/coding-standard`, so
the very next line fails with `sh: 1: php-cs-fixer: not found`, *and* it deletes phpunit,
so `make test` afterwards cannot run either. `make lint-fix` has the same dependency. CI
never hits this because `.github/workflows/lint.yml` only runs `composer run lint`.

Call the composer scripts directly instead:

```bash
composer run lint       # php -l over every non-vendor .php file  (what CI runs)
composer run cs:check   # php-cs-fixer --dry-run --diff
composer run cs:fix     # apply the fixer
```

As root, prefix with `COMPOSER_ALLOW_SUPERUSER=1` or composer disables plugins and the
vendor binaries are not found.

If you did run `make lint`, restore the dev dependencies before step 3:

```bash
composer install        # with dev deps
```

Formatting-only failures: `composer run cs:fix`. Do not hand-edit what the fixer owns.

`.php-cs-fixer.dist.php` excludes `build`, `l10n`, `src` and `vendor` — so **`src/*.js` is
not linted by anything in this repo**. There is no eslint and no psalm here; treat JS
review as a manual step rather than assuming a tool caught it.

## 2. Frontend build, if you touched `src/`

```bash
npm ci && npm run build
```

`js/` is committed build output and the server serves `js/`, never `src/`. A change to
`src/` that is not rebuilt *and committed* is a no-op in every other step below — this is
the single most common way a change appears to "not work".

Check `git status` afterwards: the rebuilt bundles and their `.map` files are part of the
change. Note `js/functions.js` and `js/marzipano/*` are hand-written and will not appear.

## 3. PHP tests (Nextcloud required)

```bash
cd ../nc-dev/nextcloud/apps/files_photospheres   # the bind-mounted path, not the repo
make test                                        # unittest + integrationtest
```

If this fails with a **bootstrap** error rather than an assertion, the environment is
wrong, not the code:

- `Failed opening required '…/tests/bootstrap.php'` → you are running from a path whose
  real location is not `<nextcloud>/apps/files_photospheres` (a symlink does this).
- `Failed opening required '…/vendor/autoload.php'` → `composer install` was never run.

See `/nextcloud-dev-env` if no instance exists.

### Already-red on master

Verified against `stable35` on an unmodified tree:

- `make unittest` → `Tests: 57, Assertions: 223, Errors: 3` — **54 of 57 pass**. All three
  errors are `PhotosphereViewerPluginTest`, from `ICache::get()`/`set()` being called with
  the int file id at `lib/Sabre/PhotosphereViewerPlugin.php:143` while `OCP\ICache` types
  the key as `string`.
- `make integrationtest` → `Tests: 5, Assertions: 5` — green, with one PHPUnit deprecation
  for `AppTest`'s doc-comment `@group DB` (attributes are the supported form from PHPUnit
  12).

If you see exactly those 3 errors, you have not broken anything — but say so explicitly
rather than calling the suite green.

## 4. E2E (only if you touched anything user-visible)

See `/e2e-verify`. Running the full suite needs an instance plus test data:

```bash
./.claude/scripts/setup-nextcloud-dev.sh serve      # background it
./.claude/scripts/setup-nextcloud-dev.sh testdata
cd tests/E2E && npm ci && npx playwright test
```

`playwright.config.ts` pins the project to branded **Google Chrome** (`channel: 'chrome'`),
not bundled Chromium — deliberately, because Chromium lacks the codecs the 360-video spec
needs. Without Chrome installed, the whole suite errors at launch. `/e2e-verify` covers how
to run the image specs against Chromium anyway, and what that costs you.

`tests/E2E/tests/common.ts::goToPPVTestFiles` is already broken against NC 35 (its
`/.*\sppv-testfiles.*/` regex requires leading whitespace the button name does not have),
so two `regular-fileview` specs fail before asserting. Pre-existing — do not attribute it
to your change, and do not "fix" it silently as part of an unrelated PR.

## 5. Cross-cutting checks the tools do not make

- **Did detection change?** There are two paths — the WebDAV property
  (`PhotosphereViewerPlugin`) and the REST controllers used by public shares. A change to
  `XmpDataReader` hits both; a change above it usually hits only one. Confirm which, and
  cover the other.
- **Did the PHP↔JS payload shape change?** `XmpResultModel::xmlSerialize`,
  `XmpResultModel::fromArray` (the Redis-cached path) and
  `src/fileAction.js::_getDavXmpMeta` must agree. Changing one and not the others fails
  only on some cache backends, which no test here will catch.
- **New DI alias?** Add it to `Application::register` *and* to `AppTest`'s
  `dataProvider_InterfaceToClassMappings`.
- **New detection rule?** Add a `tests/Testdata/posN.jpg` + `posN.json` fixture pair, not
  just an assertion.
- **New user-facing string?** `t('files_photospheres', …)`; leave `l10n/` alone.

## Reporting

State which steps ran, which passed, and — explicitly — which could not run and why. A
missing Nextcloud instance or a missing Chrome channel is a legitimate "not run"; it is
never a silent pass. Distinguish the 3 known-red unit tests from anything new.
