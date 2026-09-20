---
name: add-xmp-detection-rule
description: Add or change a detection rule in files_photospheres - a new GPano/GImage XMP tag, a new heuristic for deciding usePanoramaViewer, or new cropping-config fields - end to end across the reader, both consumption paths, and the frontend. Use when asked to support a new photosphere/VR180 metadata variant or fix a misdetection.
---

There is exactly one detector (`Service\Helper\IXmpDataReader` /
`XmpDataReader::readXmpDataFromFileObject`); both the fast (Sabre/DAV property) and slow
(REST) consumption paths call it, so a correct change here fixes both automatically. Don't
special-case a path — if you find yourself editing `PhotosphereViewerPlugin` or a
controller to add detection logic, stop and move it into the reader instead.

## 1. Extend the reader

`lib/Service/Helper/XmpDataReader.php`:

- New XMP tag to check → add a branch in `shouldUsePanoramaViewer()` (order matters: it
  checks `GPano:UsePanoramaViewer` first, then `GPano:ProjectionType`, then
  `GImage:Mime` as a VR180 fallback — a new heuristic usually slots in after the existing
  ones, as a fallback of last resort, not before them).
- New cropping-config field → add it to `CroppingConfigModel` (`lib/Model/`) first, then
  read it in `fillXmpData()` via `getXmpIntValue`/`getXmpFloatValue`/`getXmpStringValue`.
  Check whether photo-sphere-viewer.js's `panoData` object actually uses the new field
  (https://photo-sphere-viewer.js.org — Advanced Options → pano_data) before adding it;
  don't add fields the viewer ignores.
- All tag lookups go through `getXmpStringValue()`/`getXmpIntValue()`/`getXmpFloatValue()`,
  which in turn go through `IRegexMatcher` — never call `preg_match` directly in this
  class, or a test can no longer simulate a regex failure.
- Respect the existing bounds: only the first `MAX_BLOCK_COUNT * CHUNK_SIZE` (~800KB) of
  the file is read, and detection stops early once `XMP_END_TAG` is found. A tag that can
  legitimately appear after that point in a real file is out of scope without also
  reconsidering those constants — raising them has a real I/O cost on every file listing
  (the Sabre plugin runs this per file, per directory PROPFIND).

## 2. If it changes `XmpResultModel`'s shape

- Update `XmpResultModel::fromArray()` (used to deserialize from cache) alongside any new
  property — `PhotosphereViewerPlugin::getXmpMetadataCached()` falls back to `fromArray()`
  when the cache returns a raw array instead of an `XmpResultModel` instance (issue #137;
  see `PhotosphereViewerPluginTest::testReturnsXmpResultModel_IfRedisCacheReturnsArray`).
  Forgetting `fromArray()` means the field silently comes back `null`/missing after a
  cache round-trip even though direct reads work.
- Update `XmpResultModel::xmlSerialize()` to include the new field in the JSON it writes as
  the WebDAV property's text content.
- Then run `/sync-metadata-contract` — the frontend needs to read the new field too if it's
  meant to reach the viewer.

## 3. Tests

- `tests/Unit/Service/Helper/XmpDataReaderTest.php` — add a fixture pair under
  `tests/Testdata/` (`posN.jpg` that should be detected / `negN.jpg` that shouldn't) rather
  than inlining an XMP string; if the new field has an expected value, add `posN.json` and
  let the existing `dataProvider_Positive` JsonMapper comparison pick it up automatically.
- `tests/Unit/Model/XmpResultModelTest.php` / `CroppingConfigModelTest.php` — round-trip
  the new field through `fromArray()` and `xmlSerialize()`.
- `tests/Unit/Sabre/PhotosphereViewerPluginTest.php` — if you touched `fromArray()`, extend
  `testReturnsXmpResultModel_IfRedisCacheReturnsArray`'s cache-array fixture with the new
  field.

## 4. Finish

If the new rule changes which files are detected as photospheres in a way a user would
notice, add or extend a `tests/E2E/` fixture/spec and run `/e2e-verify`. Update the
README's detection-rules bullet list (the `GPano:UsePanoramaViewer` /
`GPano:ProjectionType` / `GImage:Mime` list under "Report an issue"), then run
`/preflight`.
