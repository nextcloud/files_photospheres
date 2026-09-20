# CLAUDE.md — files_photospheres

Nextcloud app that detects Google PhotoSphere 360° images (and 360° videos) by their XMP
metadata and opens them in an embedded viewer instead of the normal image preview. Single
repo, no companion backend (unlike some other Nextcloud apps in this org) — everything
lives here: detection, caching, REST fallback, and the two viewer frontends.

## Critical constraints

- **The app cannot run or be tested standalone.** Both `phpunit.xml` and
  `phpunit.integration.xml` set `bootstrap="tests/bootstrap.php"`, which itself requires
  `<nextcloud>/tests/bootstrap.php` three directories up — so even the "unit" suite needs a
  full Nextcloud checkout with this app installed under `apps/files_photospheres` and
  enabled (`occ app:enable files_photospheres`). See `/nextcloud-dev-env`.
- **Built JS under `js/` is committed to git, not gitignored.** `webpack.js` only bundles
  `src/{fileAction,init,initIframe}.js` into `js/`; the Makefile's `appstore` target then
  **excludes `src/` entirely** from the release tarball. If you change a file under `src/`
  you must run `make npm-build`/`npm run build` and commit the resulting `js/*.js` — the
  appstore package ships whatever is already in `js/`, not what's in `src/`.
- **`js/functions.js` and `js/marzipano/`, `css/marzipano/` are hand-maintained / vendored,
  not build output.** They have no `src/` counterpart and webpack never touches them.
  Marzipano (the 360° video library) is not an npm dependency — update it by replacing
  the vendored files directly.
- **Target Nextcloud version comes from `appinfo/info.xml`** (`<nextcloud min-version
  max-version>`), currently **NC 35**. Verify Nextcloud/Sabre/DAV API usage against
  `stable35` of `nextcloud/server`, or `master` when that branch does not exist yet.
- The custom WebDAV property name `files-photospheres-xmp-metadata` (full property:
  `{http://nextcloud.org/ns}files-photospheres-xmp-metadata`) must stay identical across
  `lib/Sabre/PhotosphereViewerPlugin.php` (`PROPERTY_XMP_METADATA`), `src/init.js`
  (`registerDavProperty(...)`), and `src/fileAction.js` (`node.attributes[...]` lookup). See
  `/sync-metadata-contract`.

## Stack

PHP 8.2–8.5 (composer platform pin 8.4) · plain JS (ES modules via webpack, no
framework/Vue) · webpack 5 · phpunit 11 · php-cs-fixer via `nextcloud/coding-standard`.
No psalm, no eslint/stylelint config in this repo.

Namespace `OCA\Files_PhotoSpheres\`, PSR-4 from `lib/`. Frontend sources in `src/`, built
into `js/` by webpack (`make npm` / `npm run build`).

## Architecture

### Detection

```
XmpDataReader::readXmpDataFromFileObject(File)
  reads the first ~800KB of the file in 8KB chunks (lib/Service/Helper/XmpDataReader.php)
  looks for <x:xmpmeta> ... </x:xmpmeta>
  extracts GPano:UsePanoramaViewer / GPano:ProjectionType / GImage:Mime via RegexMatcher
    → XmpResultModel { usePanoramaViewer, containsCroppingConfig, croppingConfig }
```

`RegexMatcher` (`Service\Helper\IRegexMatcher`) is a one-method wrapper around
`preg_match`, purely so tests can simulate a regex engine failure — the same
wrap-the-untestable-global pattern you'd use for any PHP builtin call in a service.

`CroppingConfigModel` mirrors the `pano_data` object photo-sphere-viewer.js expects
(`fullWidth`, `fullHeight`, `croppedWidth/Height`, `croppedX/Y`, `poseHeading/Pitch/Roll`).

### Two consumption paths — one detector

**Fast path (default): the Sabre WebDAV property.** `lib/Sabre/PhotosphereViewerPlugin.php`
is registered via `appinfo/info.xml`'s `<sabre><plugins>` and hooks Sabre's `propFind`
event directly. For every `image/jpeg` file whose PROPFIND requests
`{http://nextcloud.org/ns}files-photospheres-xmp-metadata`, it runs the detector and
returns an `XmpResultModel`, caching the result per file id in `ICache` (local cache,
`IStorageService`/`IShareService` not involved). A depth != 0 PROPFIND on a directory
pre-warms the cache for every jpeg child before Sabre asks per-file, so directory listings
in the regular Files view stay fast. This covers: regular logged-in Files view and
single-file public shares.

**Slow path (fallback): REST endpoints.** Only reached where the DAV property isn't wired
up in the frontend — currently shared **directory** listings, which still use the legacy
`OCA.Files.fileActions` API:
- `UserfilesController::getXmpData` → `Service\StorageService` (`$userFolder->getById`) —
  `GET /userfiles/xmpdata/{fileId}`
- `SharefilesController::getXmpData` → `Service\ShareService` (share-token lookup,
  permission check, single-file vs. directory-share node resolution) —
  `GET /sharefiles/xmpdata/{shareToken}`

Both controllers funnel into the same `IXmpDataReader` — there's only one detector
implementation, so a change to detection logic never needs to be duplicated (contrast: no
"local vs. remote backend" split like some other apps in this org).

### `XmpResultModel` XML serialization

`XmpResultModel implements XmlSerializable`, but `xmlSerialize()` deliberately writes a
JSON string as the property's **text content** instead of XML sub-elements — a comment in
the code explains why: the NC33+ WebDAV client reads `element.textContent`, which would
otherwise concatenate all child text nodes into garbage. Do not "fix" this into idiomatic
XML sub-elements without re-checking the JS consumer.

### Frontend (`src/` → `js/` via webpack)

- **`src/init.js`**: calls `registerDavProperty('nc:files-photospheres-xmp-metadata')` from
  `@nextcloud/files/dav`, so the property above rides along with normal node listings. Runs
  as an **init script** (`Util::addInitScript`).
- **`src/fileAction.js`**: registers file actions via `registerFileAction` from
  `@nextcloud/files` — `image/jpeg` (id `photosphereviewer-image`, `order: -1` to win over
  the default Files/Viewer click handler) and `video/mp4` (id `photosphereviewer-video`,
  context-menu only). Reads XMP metadata from `node.attributes['files-photospheres-xmp-metadata']`
  where available (the DAV-property fast path). For directory shares, where the sharing app
  overwrites `OCA.Files.fileActions` after this script runs (see the FIXME referencing
  issue #143), it falls back to registering a **legacy** `OCA.Files.fileActions` action and
  fetching metadata ad hoc via `canShow()` → the REST endpoints above.
- **`js/functions.js`** (hand-maintained, not built from `src/`): stateless helpers — URL
  param parsing, the loading spinner, WebGL2 support detection.
- **`lib/Listener/AddScriptsAndStylesListener.php`** loads all of this on
  `LoadAdditionalScriptsEvent` (Files app) and `BeforeTemplateRenderedEvent`
  (Files_Sharing). Script registration order matters: this app's scripts must load after
  the Files/Viewer apps' own JS so its click handler takes priority.
- **`PageController`** serves two blank-layout routes, `/` and `/video`
  (`templates/viewer.php` / `templates/viewer_video.php`), which `fileAction.js` opens in an
  injected `<iframe>` and configures post-load via `frameWindow.photoSphereViewerRenderer.render(...)`
  / `photoSphereVideoRenderer.render(...)` (defined in `src/initIframe.js`, the viewer's own
  init script, loaded inside the iframe template).

### Two viewer libraries

- Images: `@photo-sphere-viewer/*` (core + autorotate/gyroscope/stereo plugins), an npm
  dependency; its CSS is copied into `css/photo-sphere-viewer.css` by the `copy-viewer-css`
  npm script (runs before `build`/`dev`/`watch`).
- 360° video: `marzipano`, vendored under `js/marzipano/` and `css/marzipano/` (see
  Critical constraints above).

### HTTP routes (`appinfo/routes.php`)

| Verb | URL | Controller |
| --- | --- | --- |
| GET | `/` | `PageController::image` |
| GET | `/video` | `PageController::video` |
| GET | `/userfiles/xmpdata/{fileId}` | `UserfilesController::getXmpData` |
| GET | `/sharefiles/xmpdata/{shareToken}` | `SharefilesController::getXmpData` |

## Commands

Run from the repo root, inside a Nextcloud checkout (`<nextcloud>/apps/files_photospheres`)
for anything PHP.

```bash
make build                # composer install --no-dev + npm ci && npm run build
make npm                  # npm ci && npm run build (frontend only)
make test                 # phpunit -c phpunit.xml + phpunit -c phpunit.integration.xml
make unittest             # phpunit -c phpunit.xml           (tests/Unit)
make integrationtest      # phpunit -c phpunit.integration.xml (tests/Integration, @group DB)
make coverage             # both suites with Xdebug coverage, merged via phpcov
make lint                 # composer run lint (php -l) + composer run cs:check (php-cs-fixer --dry-run)
make lint-fix             # composer run cs:fix
make appstore             # release tarball (build/artifacts/appstore), excludes src/, tests/, composer.*
```

Frontend-only, from the repo root:

```bash
npm run dev               # one-off dev build
npm run watch             # rsbuild-less webpack --watch
```

E2E (from `tests/E2E/`, against a **live** Nextcloud instance — see `/e2e-verify`):

```bash
npm ci && npx playwright install chrome --with-deps
E2E_USER=... E2E_PASSWORD=... E2E_BASE_URL=... ./scripts/test-setup.sh
npx playwright test
E2E_USER=... E2E_PASSWORD=... E2E_BASE_URL=... ./scripts/test-shutdown.sh
```

Before committing, `make lint` and `make unittest` must be clean (see `/preflight` for the
full gate, including when integration/E2E can legitimately be skipped).

## Testing conventions

- `tests/Unit/` mirrors `lib/` one-to-one. Most tests extend plain
  `PHPUnit\Framework\TestCase` (not Nextcloud's `Test\TestCase`) and mock collaborators
  through their interfaces (`IRegexMatcher`, `IXmpDataReader`, `IShareService`,
  `IStorageService`). Where a mock can't express real behaviour, the repo writes a small
  concrete test double implementing the interface directly (see `TestFile` in
  `XmpDataReaderTest.php`, `NonFileNonDirectory` in `PhotosphereViewerPluginTest.php`)
  rather than over-configuring a mock.
- `tests/Integration/AppTest.php` is `@group DB`, extends Nextcloud's own `Test\TestCase`,
  and boots a real app container to check DI registration (service aliases resolve after
  both lazy and eager bootstrap coordination).
- `tests/Testdata/*.jpg` are real fixture images with/without GPano XMP metadata;
  `pos*.json` sidecars hold the expected `CroppingConfigModel` values, mapped with
  `netresearch/jsonmapper` in tests.
- `tests/E2E/` is a separate Playwright package (own `package.json`) that drives a real
  Nextcloud + this app + the `viewer` app over HTTP — the only place the three real user
  scenarios (regular view, single-file share, directory share) are exercised end-to-end.
- Use `#[DataProvider('methodName')]` (PHPUnit attribute, not the old docblock annotation)
  for table-driven tests.

## Conventions

- All user-facing strings go through `IL10N::t` (PHP) or the JS `t()` global. Do not edit
  `l10n/` by hand — it is Transifex-managed (`.tx/config`).
- Register every service alias in `lib/AppInfo/Application.php::register`.
- Branching follows Nextcloud server: `master` targets the next unreleased NC version,
  `stableNN` for released ones. Backports are automated
  (`.github/workflows/backport.yml`).
- Bumping the Nextcloud target version is a two-step, two-commit process — see
  `/bump-nextcloud-version`.

## Tooling in this repo

- `.claude/skills/` — task procedures (`/preflight`, `/nextcloud-dev-env`, `/e2e-verify`,
  `/add-xmp-detection-rule`, `/sync-metadata-contract`, `/bump-nextcloud-version`).
- `.claude/agents/` — subagents for review, XMP/viewer pipeline tracing, checking Nextcloud
  upstream APIs, and PHPUnit test authoring.
