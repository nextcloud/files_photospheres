---
name: e2e-verify
description: Drive a real Nextcloud instance through the browser via the Playwright MCP server to confirm a files_photospheres change actually works - bring up the instance, log in, open a panorama, a 360 video, or a public share, and check the viewer really renders. Use when asked to verify a UI change in the browser, or before claiming a change "works" beyond the PHP tests.
allowed-tools: Bash, Read, Grep, Glob, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_fill_form, mcp__playwright__browser_press_key, mcp__playwright__browser_wait_for, mcp__playwright__browser_evaluate, mcp__playwright__browser_console_messages, mcp__playwright__browser_network_requests, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_close
---

The PHP suites prove the reader and the services are correct in isolation. They prove
nothing about the part that actually matters to a user: that clicking a JPEG opens an
iframe and a WebGL panorama appears in it. That path crosses PHP → WebDAV → webpack bundle
→ iframe → photo-sphere-viewer, and every one of those seams has broken before.

This skill drives it for real, with the `.mcp.json` Playwright MCP server.

## 0. Get an instance up

```bash
curl -sf http://localhost:8080/status.php && echo REACHABLE || echo DOWN
```

If DOWN:

```bash
./.claude/scripts/setup-nextcloud-dev.sh            # clone + install + enable (idempotent)
./.claude/scripts/setup-nextcloud-dev.sh serve      # run this as a BACKGROUND task
./.claude/scripts/setup-nextcloud-dev.sh testdata   # pano.jpg, non-pano.jpg, 360-video.mp4
```

No Docker required — see `/nextcloud-dev-env` for what each step guards against. `serve`
holds a server process, so background it and then poll `status.php`; waiting on it in the
foreground will look like a hang.

**If you changed `src/`, run `npm run build` first.** The browser loads `js/`, never `src/`.
Verifying an unbuilt change tells you nothing and will read as a false negative.

## 1. Log in

1. `browser_navigate` → `http://localhost:8080/index.php/login`
2. `browser_snapshot` for refs, then fill `#user` / `#password` (`admin` / `admin`) and
   submit.
3. Confirm you land on Files. A login form still on screen means the instance or the
   credentials are wrong — report that as an environment problem, not an app failure.

## 2. Drive the scenario the change touches

Go straight to the test folder: `http://localhost:8080/index.php/apps/files/files?dir=/ppv-testfiles`.

Rows are addressable by `[data-cy-files-list-row-name="pano.jpg"]`. Wait for that
attribute to exist before clicking — the Files list renders asynchronously and clicking
too early silently does nothing.

| Change | Scenario |
| --- | --- |
| Detection / `XmpDataReader` / DAV property | Click `pano.jpg` → viewer opens. Click `non-pano.jpg` → viewer must **not** open. |
| Cropping / pose (`CroppingConfigModel`) | Open `pano.jpg`, then read `panoData` off the viewer (below). |
| Video path (`js/marzipano/*`, `viewer_video.php`) | Row actions menu on `360-video.mp4` → "View in 360° viewer". |
| Share paths (`ShareService`, controllers) | Create a share link in the Sharing tab, open it in a new page. Directory shares and single-file shares take **different** code paths — check the one you changed. |
| Close/ESC/history behaviour | Open, close by the in-iframe Close button *and* by ESC; the URL must return to the directory URL. |

### What "it rendered" actually means

The iframe appearing is not enough — it appears before the texture loads.

1. `#photo-sphere-viewer-frame` visible (the viewer iframe exists), then
2. inside it, `.psv-container` present (photo-sphere-viewer mounted), then
3. `.psv-loader-container` **hidden** (the panorama finished decoding).

Do not wait on `.psv-loader` alone as your first check: before the viewer mounts, that
element does not exist, and Playwright treats a missing element as "hidden" — so the wait
passes instantly while the screen still says *Loading…*. Wait for `.psv-container` to
appear first. A 7 MB panorama takes tens of seconds under software WebGL; allow ~90 s.

A screenshot after step 3 should show the panorama plus the photo-sphere-viewer navbar and
the filename as a caption.

### Reading viewer state directly

More reliable than pixels when you are checking metadata rather than looks —
`browser_evaluate` inside the iframe:

```js
() => ({
  panoData: window.photoSphereViewer?.config?.panoData,
  caption:  window.photoSphereViewer?.config?.caption,
})
```

`window.photoSphereViewer` is set by `src/initIframe.js`; `window.photoSphereViewerRenderer`
is what the parent calls into. If the parent's own `window.photoSphereViewerFileAction`
exists but the iframe's renderer does not, the break is in the template/CSP, not in
detection.

## 3. Check for silent breakage

`browser_console_messages` after each significant step. Two things you can ignore:

- `Automatic fallback to software WebGL has been deprecated … --enable-unsafe-swiftshader` —
  expected in headless containers with no GPU. The viewer still renders; the flag only
  silences the warning. If Chromium ever drops the fallback, this becomes a real failure
  and the viewer will refuse to start.
- `GL Driver Message … GPU stall due to ReadPixels` — software rasteriser noise.

Anything else — a Vue warning, a failed XHR, a `files_photospheres: failed to parse XMP
metadata JSON` — is a real finding. That last one specifically means
`XmpResultModel::xmlSerialize` and `_getDavXmpMeta` have drifted apart.

`browser_network_requests` is the quickest way to tell detection from delivery: look for
the `PROPFIND` on the directory (should be `207`) and the `GET` of the image itself.

## 4. When the viewer does not open

In order — each step rules out one seam:

1. `data/nextcloud.log` in the server root: does it show `Cache miss for file pano.jpg`?
   No → the DAV property was never requested → `registerDavProperty` in `src/init.js`, or
   `js/` was not rebuilt.
2. Is the file actually there? An empty Files list usually means the user home was not
   created on disk — `/nextcloud-dev-env`, gotcha 3.
3. Is the mimetype `image/jpeg`? `PhotosphereViewerPlugin` skips everything else outright.
4. Does the image really carry the tags? `XmpDataReader` only reads the first ~800 KB, and
   wants `GPano:UsePanoramaViewer=true`, or `GPano:ProjectionType=equirectangular`, or
   `GImage:Mime=image/jpeg`.

## The repo's own suite

`tests/E2E/` is the maintained regression suite and is worth running when the change is
broad:

```bash
cd tests/E2E && npm ci && npx playwright test
```

Two environment facts to expect:

- `playwright.config.ts` pins `channel: 'chrome'` (branded Chrome), because Chromium lacks
  the codecs the 360-video spec needs. Without Chrome the suite errors at launch. You can
  point the image specs at a Chromium build with a throwaway config that sets
  `launchOptions.executablePath`, but the video spec is then expected to fail — say so
  rather than reporting it as a regression.
- If Playwright reports `Executable doesn't exist at …chromium_headless_shell-<n>`, the
  bundled browser revision does not match what is installed; either `npx playwright install
  chromium` or point `executablePath` at the browser already on the machine.

`tests/E2E/tests/common.ts::goToPPVTestFiles` is currently broken against NC 35 (see
`/preflight`). Navigate by URL (`?dir=/ppv-testfiles`) instead of going through it.

## Reporting

Say which scenario was driven, what was observed, and call out the console/network check
explicitly rather than "looked fine". If no instance could be brought up, say that e2e
verification did not run and why — never substitute the PHP suites for it.
