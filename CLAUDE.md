# CLAUDE.md — files_photospheres

Nextcloud app that detects Google PhotoSphere images (via their XMP metadata) and renders
them in an iframe with [photo-sphere-viewer.js](https://photo-sphere-viewer.js.org/);
360° videos use [marzipano](https://www.marzipano.net/).

## Critical constraints

- **The app cannot run or be tested standalone.** PHP unit *and* integration tests boot
  Nextcloud via `tests/bootstrap.php`, which resolves
  `__DIR__ . '/../../../tests/bootstrap.php'` — it only works when the app's **real path**
  is `<nextcloud>/apps/files_photospheres`. A **symlink is not enough**: PHP resolves
  `__DIR__` through symlinks, so the relative hop lands outside the server checkout. Use a
  bind mount or a real checkout in place. See `/nextcloud-dev-env`.
- **`composer install` is required even just to enable the app.** `composer/autoload.php`
  requires `vendor/autoload.php`; without it `occ app:enable files_photospheres` dies with
  a `Failed opening required` error that looks like a Nextcloud bug but is not.
- **`js/` is committed build output, and not all of it is built.** `npm run build`
  (webpack) produces `js/fileAction.js`, `js/init.js`, `js/initIframe.js` and their chunks
  from `src/`. But `js/functions.js` and everything under `js/marzipano/` are
  **hand-maintained sources that no build step touches** — editing `src/` will never
  change them. After changing `src/`, rebuild *and commit* `js/`.
- **Target Nextcloud version comes from `appinfo/info.xml`** (`<nextcloud min/max>`),
  currently **NC 35**. Verify Nextcloud API usage against `stable35` of `nextcloud/server`.
  Note CI does *not* agree with that pin: `phpunit.yml` uses `server-versions: ['master']`
  and `playwright.yml` uses `NC_REF: master`, so CI exercises the app against Nextcloud
  master. A failure that reproduces only in CI is usually this gap.
- **No devcontainer and no docker-compose in this repo.** The executable spec for a working
  environment is `.github/workflows/playwright.yml` + `phpunit.yml`: a `nextcloud/server`
  checkout, `occ maintenance:install`, and PHP's built-in web server. `/nextcloud-dev-env`
  automates exactly that, no Docker required.

## Stack

PHP 8.2–8.5 (composer platform pin 8.4) · plain ES modules, **no Vue** · Node ^24 /
npm ^11 · webpack 5 · phpunit 11 · php-cs-fixer via `nextcloud/coding-standard` ·
Playwright for E2E.

Namespace `OCA\Files_PhotoSpheres\`, PSR-4 from `lib/`. Frontend sources in `src/`, built
into `js/` by webpack.

## Architecture

### The one contract that matters

Whether a file is a photosphere is decided by XMP metadata read **server-side** and handed
to the frontend. That value crosses the PHP↔JS boundary in one specific shape, and three
places must agree:

1. `lib/Sabre/PhotosphereViewerPlugin.php` answers the WebDAV property
   `{http://nextcloud.org/ns}files-photospheres-xmp-metadata`.
2. `lib/Model/XmpResultModel::xmlSerialize` writes it as a **JSON string in the element's
   text content** — deliberately *not* as XML sub-elements. NC33+'s WebDAV client reads
   `element.textContent`, which would concatenate child text nodes into garbage.
3. `src/fileAction.js::_getDavXmpMeta` reads
   `node.attributes['files-photospheres-xmp-metadata']` and `JSON.parse`s it.

`src/init.js` must register the property with `registerDavProperty('nc:files-photospheres-xmp-metadata')`
or the Files app never requests it and every file looks like a non-photosphere.

### Detection paths

There are **two**, and a change to detection usually has to be made in both:

| Context | How XMP data is fetched |
| --- | --- |
| Logged-in Files view | WebDAV property, served by `PhotosphereViewerPlugin` (above) |
| Public share (single file + directory share), legacy views | REST: `UserfilesController` / `SharefilesController` → `IStorageService` / `IShareService` |

```
Files list (logged in)                 Public share
  PROPFIND (files app)                   fetch /sharefiles/xmpdata/{token}
   └─ PhotosphereViewerPlugin             └─ SharefilesController
       └─ IXmpDataReader                      └─ ShareService  (token + permission checks)
                                                  └─ IXmpDataReader
                     ↓ both end in the same reader ↓
        lib/Service/Helper/XmpDataReader::readXmpDataFromFileObject
          reads ≤ 100 × 8 KiB from the file head, looks for <x:xmpmeta>…</x:xmpmeta>,
          fills XmpResultModel { usePanoramaViewer, containsCroppingConfig, croppingConfig }
                     ↓
        src/fileAction.js  registers the file action, opens an <iframe>
                     ↓
        templates/viewer.php  →  src/initIframe.js  (photo-sphere-viewer)
        templates/viewer_video.php → js/marzipano/* (360° video, hand-written)
```

### What counts as a photosphere

`XmpDataReader::shouldUsePanoramaViewer`, in order — first tag present wins:

1. `GPano:UsePanoramaViewer` explicitly `true`
2. else `GPano:ProjectionType` equals `equirectangular`
3. else `GImage:Mime` equals `image/jpeg` (the only reliable VR180 signal, see issue #1)

Cropping/pose data (`GPano:FullPanoWidthPixels`, `CroppedArea*`, `Pose*Degrees`) is only
read when the document contains `GPano:` at all, and lands in `CroppingConfigModel`, whose
field names are **the photo-sphere-viewer `panoData` option names** — they are a downstream
API, not free-form.

Only `image/jpeg` is considered; `PhotosphereViewerPlugin` skips every other mimetype.

### Caching

`PhotosphereViewerPlugin` caches per file id through `ICacheFactory::createLocal`. On a
PROPFIND with `Depth != 0` it warms the whole directory up front (`cacheDirectory`) so the
per-file lookups are hits. Without a distributed cache configured this is per-request only
and the reader runs for every file — which is why the README pushes APCu/Redis.

Cache entries survive as arrays when a real (Redis) backend is used, hence
`XmpResultModel::fromArray` — keep it in sync with `xmlSerialize` or Redis-backed
instances silently diverge from APCu-backed ones.

### The iframe

The viewer always runs in an iframe (`#photo-sphere-viewer-frame`) pointing at this app's
own page route, not in the Files app's DOM:

- `fileAction.js::showFrame` creates it and, on `load`, calls
  `frameWindow.photoSphereViewerRenderer.render(...)` (image) or
  `photoSphereVideoRenderer.render(...)` (video) — objects the iframe exposes on `window`.
- `templates/viewer.php` / `viewer_video.php` are rendered with the `blank` layout and must
  carry `nonce="<?php p($nounceManager->getNonce()) ?>"` on every `<script>` — Nextcloud's
  CSP blocks them otherwise, and the failure looks like "the viewer just doesn't start".
- Closing is a `postMessage('closePhotosphereViewer')` from inside the iframe, plus an ESC
  handler registered on *both* windows.

### Security-sensitive code

`ShareService::getXmpData` is reachable unauthenticated (`@PublicPage`) with only a share
token. It must keep doing all three checks before reading a file:

- `getShareByToken` (throws `ShareNotFound`),
- `PERMISSION_READ` on the share,
- `validateShare()` — node is readable *and* shareable.

For directory shares it resolves `$path` **inside** the share node via `$shareNode->get($path)`.
Never let a caller-supplied path escape the share root, and never widen these checks
without a test in `tests/Unit/Service/ShareServiceTest.php`.

## Commands

Run from the repo root. Note the Makefile's PHP test targets are **not** prefixed
(`make test`, `make unittest`, `make integrationtest`) and need a Nextcloud instance.

```bash
make build              # composer install --no-dev + npm ci + npm run build (strips dev deps)
npm run build           # webpack src/ -> js/  (production)
npm run watch           # webpack watch
make unittest           # phpunit -c phpunit.xml            (tests/Unit)
make integrationtest    # phpunit -c phpunit.integration.xml (tests/Integration)
make test               # both PHP suites
composer run lint       # php -l over every non-vendor .php file  (what CI runs)
composer run cs:check   # php-cs-fixer --dry-run --diff
composer run cs:fix     # apply the fixer
make coverage           # merged clover coverage.xml
make appstore           # release tarball (build/artifacts/appstore)
```

**`make lint` and `make lint-fix` are traps.** Both depend on the `composer:` target, which
runs `composer install --no-dev` — removing `nextcloud/coding-standard` (so the next line
dies with `php-cs-fixer: not found`) and phpunit (so a later `make test` cannot run). Use
the `composer run …` scripts above; CI does the same, and `.github/workflows/lint.yml` runs
only `composer run lint`. `make build` and `make appstore` strip dev dependencies for the
same reason. Whenever one of them has run, `composer install` restores what the test suites
need. As root, prefix composer with `COMPOSER_ALLOW_SUPERUSER=1` or its vendor binaries are
not found.

E2E (Playwright) lives in `tests/E2E/` and is run separately — see `/e2e-verify`.

There is no psalm and no JS test suite in this repo; `tests/Unit` and the Playwright suite
are the whole automated safety net.

## Testing conventions

- `tests/Unit/` mirrors `lib/` one-to-one. Collaborators are mocked through their
  interfaces — that is what `IRegexMatcher` and `IXmpDataReader` exist for (`RegexMatcher`
  is a one-line wrapper over `preg_match` purely so it can be mocked).
- `tests/Integration/AppTest.php` asserts the DI container actually resolves the registered
  aliases, for both lazy and eager bootstrap registration. Any new
  `registerServiceAlias` in `lib/AppInfo/Application.php` belongs in its data provider.
- Fixture images are `tests/Testdata/posN.jpg` (photospheres) with a matching `posN.json`
  of the expected `XmpResultModel`, plus `negN.jpg` and the `missing_*.jpg` malformed
  cases. Adding a detection rule means adding a fixture pair, not just an assertion.
- E2E specs are `tests/E2E/tests/*.spec.ts`, one per surface: `regular-fileview`,
  `single-fileshare`, `directory-share`. Test data is uploaded over WebDAV by
  `tests/E2E/scripts/test-setup.sh`, not by the specs.

## Conventions

- Newer classes use constructor property promotion (`PageController`), older ones assigned
  properties with `/** @var */` docblocks — match the file you are editing rather than
  converting it.
- Register every service alias in `lib/AppInfo/Application.php::register`.
- User-facing strings go through `t('files_photospheres', …)` in JS. Do not edit `l10n/` by
  hand — it is Transifex-managed (`.tx/config`).
- `js/fileAction.js` and `js/init.js` are listed in `.l10nignore`; if you add a new webpack
  entry that contains translatable strings, that list needs updating too.
- Branching follows Nextcloud server: `master` targets the next unreleased NC version,
  `stableNN` for released ones. Backports are automated (`.github/workflows/backport.yml`).

## Tooling in this repo

- `.mcp.json` provides a headless Playwright MCP server for driving the Nextcloud UI.
- `.claude/scripts/setup-nextcloud-dev.sh` brings up a full Nextcloud instance with this app
  enabled, with no Docker — used by `/nextcloud-dev-env`.
- `.claude/skills/` — task procedures (`/nextcloud-dev-env`, `/preflight`, `/e2e-verify`,
  `/add-xmp-metadata-field`, `/bump-nextcloud-version`).
- `.claude/agents/` — subagents for review, tracing the detection pipeline, test authoring,
  and checking Nextcloud upstream APIs.

## Known rough edges

Verified against `nextcloud/server` `stable35`, on an unmodified `master` working tree —
these are pre-existing, not something a change of yours introduced:

- `tests/Unit/Sabre/PhotosphereViewerPluginTest` has **3 errors**: `PhotosphereViewerPlugin`
  calls `$this->cache->get($id)` / `set($id, …)` (`lib/Sabre/PhotosphereViewerPlugin.php:143`)
  with the **int** file id, but `OCP\ICache::get()` is typed `string $key`. Under
  `declare(strict_types=1)` that is a `TypeError`, so it is a real bug, not just a strict
  mock. 54 of 57 unit tests pass; `tests/Integration` is green (5/5).
- `tests/E2E/tests/common.ts::goToPPVTestFiles` matches
  `getByRole('button', { name: /.*\sppv-testfiles.*/ })`. On NC 35 the button's accessible
  name is exactly `ppv-testfiles` with no leading whitespace, so the click times out and
  two of the three `regular-fileview` specs fail before they assert anything.
