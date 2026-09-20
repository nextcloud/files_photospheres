---
name: preflight
description: Run the full files_photospheres quality gate (lint, PHP unit + integration tests) and fix what it reports. Use before committing, before opening a PR, or when asked whether the change is ready.
allowed-tools: Bash, Read, Edit, Grep, Glob
---

The repo's own gate, in the cheapest-first order. Stop at the first failure, fix it, then
restart from that step.

## 1. Lint (no Nextcloud needed)

```bash
make lint
```

Runs `composer run lint` (`php -l` syntax check on every `.php` file outside `vendor/`) and
`composer run cs:check` (`php-cs-fixer --dry-run --diff`, via `nextcloud/coding-standard`).
Formatting-only failures: `make lint-fix`. Do not hand-edit what the fixer owns. There is no
psalm or eslint/stylelint in this repo — don't invent a step for them.

## 2. PHP tests (Nextcloud required)

```bash
make unittest
make integrationtest
```

Both `phpunit.xml` and `phpunit.integration.xml` set `bootstrap="tests/bootstrap.php"`,
which requires `<nextcloud>/tests/bootstrap.php` — **even the unit suite needs a real
Nextcloud checkout**, this app installed under `apps/files_photospheres`, and
`occ app:enable files_photospheres` already run. If either fails with a bootstrap or
autoload error rather than an assertion, the environment is wrong, not the code. See
`/nextcloud-dev-env` if no environment exists yet.

`integrationtest` additionally needs the app actually enabled in a running instance
(`@group DB`, boots the real DI container) — a syntactically valid but unenabled app fails
`AppTest::testAppInstalled` specifically, which is diagnostic: that one test failing alone
means "app not enabled", not "code is broken".

## 3. Frontend build sanity (if `src/*.js` changed)

```bash
npm ci && npm run build
```

`make appstore`'s tarball excludes `src/` — if you changed `src/fileAction.js`,
`src/init.js`, or `src/initIframe.js`, the corresponding `js/*.js` output must be rebuilt
and committed, or the release ships stale code. Diff `js/` after the build to confirm it
actually changed; `git status` should show the same set of `js/*.js` files you'd expect
from the `src/` files you touched. Do not hand-edit `js/*.js` — it's generated (except
`js/functions.js` and `js/marzipano/`, which are hand-maintained and have no `src/`
counterpart; edit those directly).

## 4. Cross-cutting checks the tools do not make

- Did the change touch the DAV property name, `XmpResultModel`/`CroppingConfigModel`
  shape, or how the frontend reads `node.attributes[...]`? Run `/sync-metadata-contract`.
- Did it touch XMP detection (`XmpDataReader`, `RegexMatcher`)? Confirm both consumption
  paths still behave correctly — the Sabre plugin (fast path) and the two REST controllers
  (slow path) share `IXmpDataReader`, so a unit test on the reader covers both, but a
  behavioural change to *when* metadata is requested (e.g. new file-action `enabled()`
  logic) needs a `tests/E2E/` case, since that's the only place the three real view
  contexts (regular, single-file share, directory share) are exercised together.
- New user-facing string? It must go through `IL10N::t` (PHP) or `t()` (JS), and `l10n/`
  stays untouched.

## Reporting

State which steps ran, which passed, and — explicitly — which could not run and why
(a missing Nextcloud instance is a legitimate "not run", never a silent pass). E2E
(`/e2e-verify`) is a separate, heavier step — mention whether it's warranted for this
change, but don't treat its absence as a preflight failure.
