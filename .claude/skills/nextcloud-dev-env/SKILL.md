---
name: nextcloud-dev-env
description: Bring up or repair a Nextcloud environment for files_photospheres so PHP unit and integration tests can run, and drive the app manually (WebDAV, occ). Use when tests fail to bootstrap, when no Nextcloud instance exists, or when asked how to run the app locally.
---

The app cannot run or be tested outside a Nextcloud installation — there is no
devcontainer in this repo, so set one up by hand or mirror CI.

## Option 1 — clone into an existing Nextcloud checkout

```bash
cd /var/www/<nextcloud>/apps
git clone https://github.com/nextcloud/files_photospheres.git files_photospheres
cd files_photospheres
composer install                 # dev deps too — needed for phpunit, php-cs-fixer
npm ci && npm run build           # populates js/ from src/ (skip if you already have a
                                   # built js/ checked out and aren't touching src/)
php ../../occ app:enable files_photospheres
```

Pick the Nextcloud branch to match `appinfo/info.xml`'s `<nextcloud max-version>`
(`stable<NN>` on `nextcloud/server`, or `master` if that branch doesn't exist upstream yet).

## Option 2 — mirror CI

`.github/workflows/phpunit.yml`, `coverage.yml`, and `playwright.yml` are the executable
spec for a working environment: a full `nextcloud/server` checkout (with submodules) at the
target branch, this app checked out under `apps/files_photospheres`, PHP with
`mbstring, iconv, fileinfo, intl, sqlite/mysql/pgsql, pdo_*, gd, zip`, `occ
maintenance:install` against sqlite/mysql/pgsql, then `occ app:enable files_photospheres`
and `php -S localhost:8080 &`. When an environment question isn't answered here, read those
files rather than guessing.

## Driving the app

```bash
php occ app:enable files_photospheres
php occ config:system:set loglevel --value 0 --type integer
```

Detection is synchronous (no background job, unlike apps that queue work) — a PROPFIND or
a call to either REST endpoint runs `XmpDataReader` inline and returns immediately.
"Nothing happened" on a click almost always means the frontend didn't get the DAV property
or fell through to a code path that never calls the reader — trace it with
`/xmp-pipeline-explorer` rather than assuming the PHP side is broken.

To exercise the WebDAV property directly (bypassing the frontend entirely):

```bash
curl -u admin:admin -X PROPFIND "http://localhost:8080/remote.php/dav/files/admin/somefile.jpg" \
  -H "Content-Type: application/xml" \
  --data '<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:nc="http://nextcloud.org/ns"><d:prop><nc:files-photospheres-xmp-metadata/></d:prop></d:propfind>'
```

A 207 response with the property missing or empty for a known-photosphere JPEG means the
Sabre plugin isn't registered or isn't matching — check `appinfo/info.xml`'s
`<sabre><plugins>` entry and that the app is actually enabled.

To exercise the REST endpoints (the slow/directory-share path):

```bash
curl -u admin:admin "http://localhost:8080/index.php/apps/files_photospheres/userfiles/xmpdata/<fileId>"
```

The UI itself can only be driven over real HTTP — see `/e2e-verify` for the Playwright
suite that already exists in `tests/E2E/`.
