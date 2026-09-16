---
name: nextcloud-dev-env
description: Bring up or repair a Nextcloud instance for files_photospheres so the PHP suites and the browser UI can actually run - no Docker needed. Use when tests fail to bootstrap, when no Nextcloud instance exists, or when asked how to run the app locally.
---

The app cannot run or be tested outside a Nextcloud installation. This repo has **no
devcontainer and no docker-compose**, but it does not need one: PHP's built-in web server
plus a SQLite install is exactly what `.github/workflows/playwright.yml` uses in CI.

## The one-liner

```bash
./.claude/scripts/setup-nextcloud-dev.sh          # clone, install, enable  (idempotent)
./.claude/scripts/setup-nextcloud-dev.sh serve    # start the web server
./.claude/scripts/setup-nextcloud-dev.sh testdata # upload tests/E2E/testdata
./.claude/scripts/setup-nextcloud-dev.sh status   # paths, URL, is it up
```

`serve` leaves a long-lived `php -S` running. It is fully detached and the port is live
almost immediately, but a tool that waits on the whole process tree will not see the call
return — **start it as a background task**, then confirm with
`curl -sf http://localhost:8080/status.php` or `… status`. Everything else returns
normally.

Defaults: server checkout at `../nc-dev/nextcloud` (sibling of this repo), SQLite,
`admin`/`admin`, `http://localhost:8080`. Override with `NC_ROOT`, `NC_PORT`,
`NC_ADMIN_USER`, `NC_ADMIN_PASSWORD`, `NC_BRANCH`.

The server branch is derived from `<nextcloud max-version>` in `appinfo/info.xml`
(`stable35` today), falling back to `master` when upstream has not cut it yet. Pass
`NC_BRANCH=master` to reproduce what CI actually runs — CI is pinned to master, not to the
manifest (see CLAUDE.md, "Critical constraints").

`NC_WITH_VIEWER=1` additionally clones and builds `nextcloud/viewer`. Only bother when you
need the *non*-photosphere fallback path (the "PPV should not show" E2E case) — the npm
build is slow.

## Why the script does what it does

Four things bite in this repo specifically, and all four produce errors that look like
something else:

1. **A symlinked app cannot run the PHP suites.** `tests/bootstrap.php` does
   `require_once __DIR__ . '/../../../tests/bootstrap.php'`, and PHP resolves `__DIR__`
   through symlinks — so from a symlink the three hops land outside the server checkout
   and you get `Failed opening required '…/tests/bootstrap.php'`. The app's *real* path
   must be `<nextcloud>/apps/files_photospheres`. The script bind-mounts it; without
   privileges to do so it falls back to a symlink and warns that `make test` will not
   bootstrap (the web UI still works, which is enough for `/e2e-verify`).

2. **`composer install` is needed before `occ app:enable`,** not just before tests.
   `composer/autoload.php` requires `vendor/autoload.php`, so enabling the app without it
   throws `Failed opening required '…/vendor/autoload.php'` from deep inside
   `AppManager->registerAutoloading()`.

3. **`maintenance:install` may not create `data/<user>/files` on disk.** When it doesn't,
   WebDAV `PUT`s return `2xx`, `occ files:scan` reports
   `User folder … exists in cache but not on disk`, and the Files list is simply empty —
   with no error anywhere near the upload. Fix is `mkdir -p <datadir>/<user>/files` then
   `occ files:scan <user>`; the script does this automatically.

4. **`php -S` needs `PHP_CLI_SERVER_WORKERS`.** The viewer runs in an `<iframe>` served by
   the same instance, so a single-worker built-in server can deadlock serving the frame
   while the parent request is still open. The script starts it with 8 workers.

## Driving the app by hand

```bash
cd ../nc-dev/nextcloud
php occ app:enable files_photospheres
php occ config:system:set loglevel --value 0 --type integer
tail -f data/nextcloud.log
```

The log is the fastest way to tell whether the server side is even involved: the Sabre
plugin logs `Cache miss for file <name>` and `Caching directory <dir> done` on every
PROPFIND. If those lines are absent, the DAV property was never requested — look at
`registerDavProperty` in `src/init.js` and whether `js/` was rebuilt, not at the reader.

Uploading a file for a quick check:

```bash
curl -u admin:admin -T some-pano.jpg \
  "http://localhost:8080/remote.php/dav/files/admin/ppv-testfiles/some-pano.jpg"
```

Reading back what the app reports for it:

```bash
curl -u admin:admin -X PROPFIND -H "Depth: 1" \
  --data '<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:nc="http://nextcloud.org/ns">
            <d:prop><nc:files-photospheres-xmp-metadata/></d:prop></d:propfind>' \
  "http://localhost:8080/remote.php/dav/files/admin/ppv-testfiles/"
```

That property's value is a **JSON string inside the element text** — see CLAUDE.md, "The
one contract that matters".

## After changing frontend sources

`js/` is committed build output. The server serves `js/`, never `src/`:

```bash
npm ci && npm run build    # or: npm run watch
```

Remember `js/functions.js` and `js/marzipano/*` are hand-written and untouched by webpack.

## Running the tests

```bash
cd ../nc-dev/nextcloud/apps/files_photospheres
make unittest        # tests/Unit
make integrationtest # tests/Integration, needs the DB
make test            # both
```

Run them from the path **inside** the server checkout. See `/preflight` for the full gate
and for the failures that are already red on `master`.
