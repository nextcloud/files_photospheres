---
name: bump-nextcloud-version
description: Cut the next stableNN branch and bump master to the next Nextcloud major version for files_photospheres, once nextcloud/server has cut its own stableNN. Use only when explicitly asked to prepare the app for a new Nextcloud major version.
disable-model-invocation: true
---

Only run this when `nextcloud/server` has actually cut a `stableNN` branch for the version
this app's `master` currently targets:

```bash
git ls-remote --heads https://github.com/nextcloud/server stableNN
```

Nothing to do if it does not exist yet.

This is **two separate changes**, historically two PRs. Reference commits: `c3020cd`
(`master is now NC34`), `ea6341f` (NC33), `b36c122` (`Prep NC32`).

## 0. Preconditions

`appinfo/info.xml`'s `<nextcloud min-version max-version="NN"/>` — min and max are always
the same value — is what `master` currently develops against. Call it `NN`; the new branch
is `stableNN`, the new master target is `NN+1`.

Check the branch does not already exist here: `git ls-remote --heads origin stableNN`.

## 1. Cut and pin `stableNN`

```bash
git fetch origin master
git checkout -b stableNN origin/master
```

On `stableNN` **only**, repoint CI from Nextcloud master to the released branch. That is
the entire difference between a stable branch and master in this repo — verified with
`git diff origin/stable34 origin/master -- .github`, which is exactly 5 lines across
3 files:

| File | Change |
| --- | --- |
| `.github/workflows/phpunit.yml` | all **three** `server-versions: ['master']` entries (sqlite, mysql, pgsql jobs) → `['stableNN']` |
| `.github/workflows/coverage.yml` | `server-versions: ['master']` → `['stableNN']` |
| `.github/workflows/playwright.yml` | `NC_REF: master` → `NC_REF: stableNN` |

`appinfo/info.xml` needs **no change** here: master's `<nextcloud>` already reads `NN`
(set by the previous cycle's step 2), so the new branch inherits the right value. Only
touch it if that assumption does not hold.

There is no `nextcloud/ocp` dependency in this repo, so `composer.json` and `composer.lock`
are untouched — unlike sibling Nextcloud apps, do not go looking for a `dev-stableNN` pin.

Commit message pattern: `Prep NC{NN}` / `NC{NN} compat: pin CI to stable{NN}`.

## 2. Bump `master` to `NN+1`

Back on `master`:

- `appinfo/info.xml` — `<version>` `1.NN.0` → `1.(NN+1).0`, and
  `<nextcloud min-version="NN+1" max-version="NN+1"/>`.
- `README.md` — the badge `img.shields.io/badge/Nextcloud-NN-orange` → `NN+1`.
- Leave the CI workflows alone: `master` keeps tracking Nextcloud `master`, since `NN+1` is
  not released yet.

Commit message pattern: `master is now NC{NN+1}`.

### Expect real work beyond the version strings

These bumps are not rename-only. `c3020cd` also had to fix a changed function signature,
adapt the Playwright specs to the new Files UI, and update `@nextcloud/files`. Budget for:

- **`@nextcloud/files` API drift.** `src/fileAction.js` uses `registerFileAction`,
  `DefaultType`, `Permission`, `ActionContextSingle`, and `src/init.js` uses
  `registerDavProperty` — all of which have changed shape across releases. The file already
  carries NC33+ branches (`_getDavXmpMeta` parsing a JSON string, `context?.nodes` fallbacks).
- **Files UI selectors in `tests/E2E/`.** `data-cy-files-list-row-*` attributes and
  accessible names move between versions; `common.ts` has been touched in most cycles.
- **PHP version range.** If Nextcloud's supported PHP range shifts (check
  `nextcloud/server`'s `composer.json` on `stableNN`), update together and in the same
  commit: `appinfo/info.xml`'s `<php min-version max-version>`, `composer.json`'s
  `config.platform.php`, and the `php-versions` matrices in `lint.yml` / `phpunit.yml`.

## 3. Verify

- Run `/preflight` on **both** branches. `stableNN` needs a server checkout actually on
  `stableNN`: `NC_BRANCH=stableNN ./.claude/scripts/setup-nextcloud-dev.sh` (the script
  otherwise derives the branch from `info.xml`, which is what you want on `master`).
- Run `/e2e-verify` on the `master` branch against the new server version — that is where
  Files UI drift shows up, and the PHP suites will not catch it.
- Push `stableNN` and read its first Actions run, not just the YAML: a typo'd branch name
  fails deep inside a checkout step rather than as an obvious config error.
- `backport.yml`, `build.yml`, `build_release.yml`, `lint.yml`, `linx-fix.yml` and
  `dependabot-approve.yml` need no branch-specific edits — they are generic and start
  working against `stableNN` as soon as it exists.
