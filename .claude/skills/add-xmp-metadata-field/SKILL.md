---
name: add-xmp-metadata-field
description: Add or change an XMP metadata field in files_photospheres end to end - reader, model, the PHP-to-JS payload, the viewer config, and fixtures. Use when asked to support a new GPano/GImage tag, change how a panorama is detected, or pass more metadata to the viewer.
---

Every XMP value the app understands travels the same route. Decide first **which kind** of
field you are adding, because they diverge immediately:

- **A detection rule** — "should this file open in the panorama viewer at all?" → it belongs
  in `XmpDataReader::shouldUsePanoramaViewer` and affects `usePanoramaViewer`.
- **A payload field** — extra data handed to photo-sphere-viewer for an image already
  recognised as a panorama → it belongs in `CroppingConfigModel` and `fillXmpData`.

## Detection rule

`lib/Service/Helper/XmpDataReader.php::shouldUsePanoramaViewer` is an ordered first-match
chain: `GPano:UsePanoramaViewer` → `GPano:ProjectionType` → `GImage:Mime`. Order is
load-bearing (the `GImage:Mime` case exists only as a VR180 fallback, issue #1), so add a
new rule at the position its specificity earns and say why in a comment.

Read values with `getXmpStringValue($xmlString, $key, $namespace)` — it already handles
XMP appearing either as an attribute or as a child element. Do not add a bespoke regex.

Widening detection has a cost: a false positive hijacks a normal JPEG away from the
viewer app. Every new rule needs both a `tests/Testdata/posN.jpg` that it accepts and
confidence that the existing `negN.jpg` files are still rejected.

## Payload field

### 1. Model

`lib/Model/CroppingConfigModel.php` — add the public property **and** the matching line in
`fromArray()`.

These field names are photo-sphere-viewer's `panoData` option names, not ours. Check the
viewer's docs for the exact spelling before inventing one; the whole `croppingConfig`
object is handed to the viewer verbatim.

### 2. Reader

`XmpDataReader::fillXmpData` — add one line using the typed helper:

```php
$model->croppingConfig->initialViewHeading = $this->getXmpFloatValue($xmlString, 'InitialViewHeadingDegrees');
```

`getXmpIntValue` / `getXmpFloatValue` / `getXmpStringValue` all return `null` when the tag
is absent, which is the correct "unset" for the viewer. Note `fillXmpData` only runs when
the document contains `GPano:` at all — a field in another namespace needs its own guard.

### 3. The PHP → JS payload

`lib/Model/XmpResultModel.php` has **two** places that list the fields and they must agree:

- `xmlSerialize()` — the JSON written into the WebDAV property's text content.
- `fromArray()` — used when a distributed cache (Redis) hands back an array instead of an
  object.

Miss `fromArray` and the field is silently `null` on Redis-backed instances while working
perfectly on APCu — a bug no test in this repo would catch.

Keep the JSON shape; do not switch to XML sub-elements. NC33+ reads `element.textContent`,
which would concatenate child text nodes into garbage (the comment in `xmlSerialize` says
so).

### 4. Frontend

Usually **nothing to do**: `src/fileAction.js::showFrame` passes `croppingConfig` wholesale
as `panoData` when `containsCroppingConfig` is true.

You do need frontend work when:

- the field is *not* a `panoData` option — then `showFrame` has to map it explicitly;
- the legacy/public-share URL-parameter path matters. That lives in **`js/functions.js`**
  (`getXmpDataFromUrlParams`), which is **hand-written and not produced by webpack** —
  editing `src/` will not change it.

After any `src/` change: `npm run build`, and commit the regenerated `js/`.

## Tests

- **`tests/Unit/Service/Helper/XmpDataReaderTest.php`** is fixture-driven. Add a real image
  to `tests/Testdata/` as `posN.jpg` (or `negN.jpg`) and register it in
  `dataProvider_Positive` / `dataProvider_Negative`.
- Alongside a positive fixture, `tests/Testdata/posN.json` holds the expected
  `CroppingConfigModel` and is mapped onto the model with `JsonMapper`, so **every existing
  `posN.json` needs the new key** — a missing key leaves the mapped model's property at its
  default and the `assertEquals` against the reader's output fails. This is the step that
  gets forgotten.
- `tests/Unit/Model/CroppingConfigModelTest.php` and `XmpResultModelTest.php` cover
  `fromArray` and the serialized shape — extend both.
- If you cannot produce a real image with the tag, the reader is also reachable through the
  `TestFile` helper in `XmpDataReaderTest.php`, which feeds it bytes directly.

## Finish

Run `/preflight`. If the change is visible in the viewer, also `/e2e-verify` — read
`panoData` back off `window.photoSphereViewer.config` in the iframe to prove the value
actually arrived, rather than eyeballing the panorama.
