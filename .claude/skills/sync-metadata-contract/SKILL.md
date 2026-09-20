---
name: sync-metadata-contract
description: Verify the WebDAV-property and JSON contract between files_photospheres' PHP detector and its JS consumers stays in sync - property name, XmpResultModel/CroppingConfigModel shape, and the REST response shape. Use whenever a change touches XmpResultModel, CroppingConfigModel, the Sabre plugin, or how the frontend reads metadata.
---

Unlike an app with a separate backend repo, this contract is cross-*language* but
single-repo: nothing enforces it at build time (PHP and JS are compiled independently), so
a mismatch only surfaces at runtime as a photosphere that silently fails to open. Walk all
four points below whenever either side changes.

## 1. The DAV property name

Must be byte-identical in three places:

| Where | Value |
| --- | --- |
| `lib/Sabre/PhotosphereViewerPlugin.php` | `private const PROPERTY_XMP_METADATA = '{http://nextcloud.org/ns}files-photospheres-xmp-metadata';` |
| `src/init.js` | `registerDavProperty('nc:files-photospheres-xmp-metadata')` |
| `src/fileAction.js` | `actualNode?.attributes?.['files-photospheres-xmp-metadata']` |

Note the three different spellings of the *same* property across the Clark-notation form
(`{namespace}localname`), the `nc:`-prefixed form the JS registration API expects, and the
bare local name the returned node's `attributes` map uses — this is normal (each API layer
has its own convention), but a typo in any one of them breaks detection silently rather
than throwing.

## 2. `XmpResultModel` / `CroppingConfigModel` shape

`lib/Model/XmpResultModel.php` and `CroppingConfigModel.php` are read by:

- `XmpResultModel::xmlSerialize()` — writes JSON as the DAV property's text content. Every
  public property must appear here, spelled exactly as the JS side expects (JS reads the
  DAV property value with `JSON.parse`, then does `Object.assign` / passes it straight
  through as `panoData` — see `src/fileAction.js`'s `_getDavXmpMeta` and `showFrame`).
- `XmpResultModel::fromArray()` — used when `ICache` returns a raw array instead of an
  `XmpResultModel` instance (a cross-version/cross-backend cache format issue, #137). Must
  stay in lockstep with the constructor's shape or a cache hit silently loses fields.
- The REST controllers' JSON response (`{data: <XmpResultModel serialized via
  JSONResponse>, success: true}` / `{message, success: false}`) — `JSONResponse`
  serializes public properties directly (not via `xmlSerialize()`), so this is a *third*
  serialization of the same model. `src/fileAction.js`'s `_xmpDataBackendRequest` consumes
  this shape, not the DAV-property JSON shape — check both call sites if you rename a
  field.

Cross-check: `CroppingConfigModel`'s field names must match what
photo-sphere-viewer.js's `pano_data` option expects
(https://photo-sphere-viewer.js.org, Advanced Options), since `showFrame()` in
`src/fileAction.js` passes `xmpResultModel.croppingConfig` straight through as `panoData`
with no renaming step.

## 3. Two independent JS entry points read metadata differently

- `src/fileAction.js`'s modern path (`_getDavXmpMeta`) reads the DAV property via
  `node.attributes[...]`: a JSON *string* (the WebDAV property's text content), which it
  parses itself with `JSON.parse`.
- `src/fileAction.js`'s legacy path (`_xmpDataBackendRequest`, feeding `canShow()`) reads
  the REST controllers' response via `fetch(...).then(r => r.json())` — `JSONResponse` on
  the PHP side already serializes to a JSON *body*, so `serverResponse.data` arrives as a
  JS object directly, with no extra `JSON.parse` step.

These are genuinely two different transports (WebDAV property text vs. HTTP JSON body)
that happen to carry the same model — if you change how one side encodes a field, check
both call sites rather than assuming the fix carries over.

## 4. Verifying

There's no automated cross-language check — verify by hand:

- `tests/Unit/Model/XmpResultModelTest.php` and `CroppingConfigModelTest.php` cover the PHP
  side's serialization round-trip.
- `tests/E2E/` is the only place that exercises the real DAV property end-to-end
  (`regular-fileview.spec.ts`, `single-fileshare.spec.ts`) and the real REST path
  (`directory-share.spec.ts`) — run `/e2e-verify` after any change here, it's the closest
  thing this app has to a contract test.
- If you cannot run the E2E suite, say so explicitly rather than reporting the contract as
  verified from reading the code alone.
