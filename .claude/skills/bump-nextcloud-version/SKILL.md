---
name: bump-nextcloud-version
description: Create the next stableNN branch and bump master to the next Nextcloud dev version, once nextcloud/server has cut its own stableNN branch. Use only when explicitly asked to prepare files_photospheres for a new Nextcloud major version.
disable-model-invocation: true
---

Only run this when Nextcloud has actually cut a new `stableNN` branch on
`nextcloud/server` for the version this app's `master` currently targets. Verify with
`git ls-remote https://github.com/nextcloud/server stableNN` before doing anything — if it
doesn't exist yet, there is nothing to do.

This is **two separate changes**, each its own commit (each has historically also been its
own PR): first branch and pin `stableNN`, then bump `master` to `NN+1`. Reference commits
for recent cycles, read with `git show <hash>` if anything below is unclear — they are the
ground truth this skill was written from:

- `789fde2` — `master` → NC35 (`appinfo/info.xml` version + nextcloud only; no README badge
  change was needed that cycle because the badge already read 35 from an earlier partial
  edit — check the badge's actual current value before assuming it needs touching)
- `c3020cd` (#173) — `master` → NC34, bundled with dependency/refactor work; the pure
  version-bump part is only `appinfo/info.xml` + the README badge
- `ea6341f` (#165) — `master` → NC33
- Diff between `origin/master` and `origin/stableNN` at any point after a branch cut shows
  the stableNN-side pin: `git diff $(git merge-base origin/master origin/stableNN) origin/stableNN -- .github/workflows appinfo/info.xml README.md`

## 0. Preconditions

- `appinfo/info.xml`'s `<nextcloud min-version max-version="NN"/>` — min and max are
  always the same single value — is the version `master` currently develops against. Call
  it `NN`; the new branch is `stableNN`, the new master target is `NN+1`.
- `stableNN` does not already exist in this repo: `git ls-remote origin stableNN` returns
  nothing.

## 1. Create and pin `stableNN`

```bash
git fetch origin master
git checkout -b stableNN origin/master
```

On `stableNN` only, change every `server-versions: ['master']` reference to the new
branch, and the Playwright workflow's `NC_REF`:

| File | Change |
| --- | --- |
| `.github/workflows/phpunit.yml` | all three `server-versions: ['master']` matrix entries (the sqlite/php-matrix job, the mysql job, the pgsql job) → `['stableNN']` |
| `.github/workflows/coverage.yml` | `server-versions: ['master']` → `['stableNN']` |
| `.github/workflows/playwright.yml` | `NC_REF: master` → `NC_REF: stableNN` |

`appinfo/info.xml` normally needs **no change** on `stableNN` — master's `<nextcloud>`
version already reads `NN` (it was set by the *previous* bump cycle's step 2), so the new
branch inherits the correct value at cut time. Only touch it if that assumption doesn't
hold — e.g. the branch is being cut before the previous cycle's master bump ever landed.

There is no `composer.json`/`composer.lock` change needed here (unlike apps that pin
`nextcloud/ocp` — this app has no such dependency) and no psalm config to update (this repo
doesn't run psalm).

Commit message pattern: `NC{NN} compat: pin CI workflows to stable{NN}`.

### Also check, opportunistically — not every cycle

Nextcloud's supported PHP range shifts with each major version. If the new NC target drops
or adds a supported PHP version (check `nextcloud/server`'s own `composer.json` on
`stableNN`), update together, in the **same** commit as step 2 below (bumping master),
since that's a `master`-only concern until the next stableNN cut:

- `.github/workflows/phpunit.yml`, `coverage.yml`, `lint.yml`'s `php-versions` matrices
- `composer.json`'s `config.platform.php`
- `appinfo/info.xml`'s `<php min-version max-version>`

## 2. Bump `master` to `NN+1`

Switch back to `master` (not `stableNN`) for this part:

- `appinfo/info.xml` — bump `<version>` (`1.NN.0` → `1.(NN+1).0`) and
  `<nextcloud min-version max-version="NN+1"/>`.
- `README.md` — the Nextcloud version badge
  (`img.shields.io/badge/Nextcloud-NN-orange`) → `NN+1`.
- Leave CI matrices and `NC_REF` alone here — `master` keeps tracking `'master'` /
  `NC_REF: master`, since `NN+1` isn't released yet.

Commit message pattern: `master is now NC{NN+1}`.

## 3. Verify

- Run `/preflight` on both branches. `stableNN` needs a Nextcloud checkout actually on
  `stableNN` (not `master`) — see `/nextcloud-dev-env`.
- Push `stableNN` and check its first CI run actually resolves the pinned matrices (read
  the Actions run, not just the YAML — a typo'd branch name in the matrix fails silently
  as "branch not found" deep in a checkout step).
- `backport.yml`, `dependabot-approve.yml`, `build.yml`, `build_release.yml`,
  `linx-fix.yml`, `lint.yml` need **no branch-specific edits** — they are generic and start
  working against `stableNN` (e.g. for backports) as soon as it exists. `lint.yml` in
  particular checks out whichever branch triggered it and has no `server-versions` matrix
  at all (it only runs `composer run lint`, no Nextcloud checkout).
- `tests/E2E/` needs no change — `playwright.yml`'s `NC_REF` (step 1) is what actually
  controls which server version the E2E job checks out; the test specs themselves are
  version-agnostic.

This app has no companion backend repo — the whole cycle is contained here.
