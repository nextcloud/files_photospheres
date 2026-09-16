#!/usr/bin/env bash
#
# Bring up a Nextcloud instance with files_photospheres enabled, without Docker.
#
# Mirrors what .github/workflows/playwright.yml does in CI (server checkout +
# `occ maintenance:install` + PHP's built-in web server), so a failure here is a
# real failure and not an artefact of the harness.
#
# Everything is idempotent: re-running skips work that is already done.
#
#   ./.claude/scripts/setup-nextcloud-dev.sh            # setup (clone, install, enable)
#   ./.claude/scripts/setup-nextcloud-dev.sh serve      # start the web server
#
# NOTE on `serve`: it leaves a long-lived `php -S` running. The server is detached
# (setsid, fds redirected) and the port is reachable as soon as the command reports it,
# but tooling that waits on the whole process tree — an agent's shell tool, `time`, a
# pipeline — will not see the call return. Run `serve` as a background task, then poll
# `curl -sf http://localhost:$NC_PORT/status.php` or `status` to confirm it is up.
#   ./.claude/scripts/setup-nextcloud-dev.sh testdata   # upload tests/E2E test files
#   ./.claude/scripts/setup-nextcloud-dev.sh status     # where things are, what is up
#   ./.claude/scripts/setup-nextcloud-dev.sh stop       # stop the web server
#
# Knobs (all optional):
#   NC_ROOT=<repo>/../nc-dev/nextcloud   where nextcloud/server is checked out
#   NC_BRANCH=<auto>                 defaults to stable<max-version> from appinfo/info.xml
#   NC_PORT=8080
#   NC_ADMIN_USER=admin  NC_ADMIN_PASSWORD=admin
#   NC_WITH_VIEWER=0                 1 also installs nextcloud/viewer (needs npm build)

set -euo pipefail

APP_NAME=files_photospheres
APP_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Default to a sibling of the app checkout, so it does not depend on $HOME
# (which is often not the directory the repo lives in).
NC_ROOT="${NC_ROOT:-$(dirname "$APP_SRC")/nc-dev/nextcloud}"
NC_PORT="${NC_PORT:-8080}"
NC_ADMIN_USER="${NC_ADMIN_USER:-admin}"
NC_ADMIN_PASSWORD="${NC_ADMIN_PASSWORD:-admin}"
NC_WITH_VIEWER="${NC_WITH_VIEWER:-0}"
APP_DST="$NC_ROOT/apps/$APP_NAME"
PID_FILE="$NC_ROOT/.php-server.pid"
LOG_FILE="$NC_ROOT/.php-server.log"

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

# The branch to test against comes from the app's own manifest, never hardcoded.
detect_branch() {
	if [ -n "${NC_BRANCH:-}" ]; then echo "$NC_BRANCH"; return; fi
	local max
	max="$(sed -n 's/.*<nextcloud[^>]*max-version="\([0-9]\+\)".*/\1/p' "$APP_SRC/appinfo/info.xml" | head -1)"
	[ -n "$max" ] || die "could not read <nextcloud max-version> from appinfo/info.xml"
	if git ls-remote --exit-code --heads https://github.com/nextcloud/server "stable$max" >/dev/null 2>&1; then
		echo "stable$max"
	else
		warn "nextcloud/server has no stable$max branch yet; falling back to master"
		echo master
	fi
}

occ() { (cd "$NC_ROOT" && php occ "$@"); }

cmd_setup() {
	local branch; branch="$(detect_branch)"

	if [ ! -d "$NC_ROOT/.git" ]; then
		log "cloning nextcloud/server@$branch into $NC_ROOT (a few minutes)"
		mkdir -p "$(dirname "$NC_ROOT")"
		git clone --depth 1 --branch "$branch" --recurse-submodules --shallow-submodules \
			https://github.com/nextcloud/server.git "$NC_ROOT"
	else
		log "reusing existing server checkout at $NC_ROOT ($(cd "$NC_ROOT" && git rev-parse --abbrev-ref HEAD))"
	fi

	# The app must be reachable at <nextcloud>/apps/files_photospheres by its REAL path:
	# tests/bootstrap.php hops '../../../tests/bootstrap.php' and PHP resolves __DIR__
	# through symlinks, so a symlinked app cannot run the PHP suites.
	mount_app

	# composer/autoload.php requires vendor/autoload.php — without it even
	# `occ app:enable` fails, long before any test runs.
	if [ ! -f "$APP_SRC/vendor/autoload.php" ]; then
		log "composer install (with dev deps, needed for phpunit)"
		(cd "$APP_SRC" && COMPOSER_ALLOW_SUPERUSER=1 composer install --no-interaction)
	fi

	if [ ! -f "$NC_ROOT/config/config.php" ] || ! occ status >/dev/null 2>&1; then
		log "installing Nextcloud (sqlite, $NC_ADMIN_USER/$NC_ADMIN_PASSWORD)"
		mkdir -p "$NC_ROOT/data"
		(cd "$NC_ROOT" && php occ maintenance:install \
			--database=sqlite --database-name=nextcloud \
			--admin-user="$NC_ADMIN_USER" --admin-pass="$NC_ADMIN_PASSWORD")
	else
		log "Nextcloud already installed"
	fi

	# maintenance:install registers the user's home in the file cache but does not always
	# create it on disk. WebDAV PUTs then return 2xx while the bytes go nowhere and the
	# Files list stays empty — the confusing failure this guards against.
	local datadir; datadir="$(occ config:system:get datadirectory)"
	if [ ! -d "$datadir/$NC_ADMIN_USER/files" ]; then
		log "creating missing user home $datadir/$NC_ADMIN_USER/files and rescanning"
		mkdir -p "$datadir/$NC_ADMIN_USER/files"
		occ files:scan "$NC_ADMIN_USER" >/dev/null
	fi

	log "enabling $APP_NAME"
	occ app:enable "$APP_NAME" >/dev/null

	occ config:system:set trusted_domains 1 --value="localhost:$NC_PORT" >/dev/null
	occ config:system:set trusted_domains 2 --value="127.0.0.1:$NC_PORT" >/dev/null
	occ config:system:set overwrite.cli.url --value="http://localhost:$NC_PORT" >/dev/null
	occ config:system:set loglevel --value=0 --type=integer >/dev/null

	if [ "$NC_WITH_VIEWER" = "1" ]; then install_viewer "$branch"; fi

	log "setup done"
	cmd_status
}

mount_app() {
	# Already correctly in place?
	if [ -d "$APP_DST/appinfo" ] && [ "$(cd "$APP_DST" && pwd -P)" = "$APP_SRC" ]; then
		log "app already bind-mounted at $APP_DST"; return
	fi
	if [ -d "$APP_DST" ] && mountpoint -q "$APP_DST" 2>/dev/null; then
		log "app already mounted at $APP_DST"; return
	fi

	mkdir -p "$NC_ROOT/apps"
	if [ -L "$APP_DST" ]; then rm -f "$APP_DST"; fi
	mkdir -p "$APP_DST"

	if mount --bind "$APP_SRC" "$APP_DST" 2>/dev/null; then
		log "bind-mounted $APP_SRC -> $APP_DST (edits are live, PHP suites work)"
	else
		rmdir "$APP_DST" 2>/dev/null || true
		ln -sfn "$APP_SRC" "$APP_DST"
		warn "no permission to bind-mount; fell back to a symlink."
		warn "The web UI and E2E tests work, but 'make test' will NOT bootstrap:"
		warn "tests/bootstrap.php resolves __DIR__ through the symlink and misses the server."
		warn "Run the PHP suites with a bind mount (as root) or a real checkout under apps/."
	fi
}

install_viewer() {
	local branch="$1" dir="$NC_ROOT/apps/viewer"
	# The Files app falls back to nextcloud/viewer for non-photosphere images; without it
	# the 'PPV should not show' E2E assertion has nothing to fall back to.
	if [ ! -d "$dir/.git" ]; then
		log "cloning nextcloud/viewer@$branch"
		git clone --depth 1 --branch "$branch" https://github.com/nextcloud/viewer.git "$dir" \
			|| git clone --depth 1 https://github.com/nextcloud/viewer.git "$dir"
	fi
	if [ ! -d "$dir/js" ]; then
		log "building viewer (npm ci && npm run build — slow)"
		(cd "$dir" && npm ci && npm run build)
	fi
	occ app:enable viewer >/dev/null
}

cmd_serve() {
	if curl -sf "http://localhost:$NC_PORT/status.php" >/dev/null 2>&1; then
		log "already serving on http://localhost:$NC_PORT"; return
	fi
	# PHP's built-in server is single-worker by default. This app loads its viewer in an
	# <iframe>, so the parent page and the iframe are in flight at the same time and a
	# single worker deadlocks. PHP_CLI_SERVER_WORKERS is not optional here.
	log "starting php -S on port $NC_PORT (8 workers)"
	# Detach fully — new session, all three fds redirected. Without </dev/null and setsid
	# the server keeps the calling shell's pipes open and an agent's tool call hangs
	# waiting for output that never ends.
	( cd "$NC_ROOT" && PHP_CLI_SERVER_WORKERS=8 \
		setsid php -S "0.0.0.0:$NC_PORT" >"$LOG_FILE" 2>&1 </dev/null &
	  echo $! >"$PID_FILE" )
	local i=0
	until curl -sf "http://localhost:$NC_PORT/status.php" >/dev/null 2>&1; do
		i=$((i+1)); [ "$i" -gt 60 ] && die "server did not come up; see $LOG_FILE"
		sleep 1
	done
	log "up: http://localhost:$NC_PORT  ($NC_ADMIN_USER/$NC_ADMIN_PASSWORD)"
}

cmd_stop() {
	[ -f "$PID_FILE" ] || { log "no pid file, nothing to stop"; return; }
	kill "$(cat "$PID_FILE")" 2>/dev/null || true
	rm -f "$PID_FILE"
	log "stopped"
}

cmd_testdata() {
	curl -sf "http://localhost:$NC_PORT/status.php" >/dev/null 2>&1 \
		|| die "nothing serving on port $NC_PORT — run '$0 serve' first"
	# test-setup.sh starts with MKCOL, which returns 405 when /ppv-testfiles already
	# exists; combined with its `set -e` that makes a second run fail. Tear down first
	# so this stays re-runnable.
	log "uploading tests/E2E/testdata over WebDAV"
	(cd "$APP_SRC/tests/E2E/scripts" && \
		export E2E_USER="$NC_ADMIN_USER" E2E_PASSWORD="$NC_ADMIN_PASSWORD" \
			E2E_BASE_URL="http://localhost:$NC_PORT" && \
		./test-shutdown.sh >/dev/null 2>&1 || true
		./test-setup.sh >/dev/null 2>&1)
	log "uploaded pano.jpg, non-pano.jpg, 360-video.mp4 to /ppv-testfiles"
}

cmd_status() {
	echo "  app source   : $APP_SRC"
	echo "  server root  : $NC_ROOT"
	echo "  app mounted  : $APP_DST $( [ -d "$APP_DST/appinfo" ] && echo '(ok)' || echo '(MISSING)')"
	echo "  url          : http://localhost:$NC_PORT   login: $NC_ADMIN_USER/$NC_ADMIN_PASSWORD"
	if curl -sf "http://localhost:$NC_PORT/status.php" >/dev/null 2>&1; then
		echo "  serving      : yes — $(curl -s "http://localhost:$NC_PORT/status.php")"
	else
		echo "  serving      : no  — run '$0 serve'"
	fi
	echo "  nextcloud log: $(occ config:system:get datadirectory 2>/dev/null || echo '?')/nextcloud.log"
	echo "  run tests    : cd $APP_DST && make test"
}

case "${1:-setup}" in
	setup)    cmd_setup ;;
	serve)    cmd_serve ;;
	stop)     cmd_stop ;;
	testdata) cmd_testdata ;;
	status)   cmd_status ;;
	*)        die "unknown command '${1}' (setup|serve|stop|testdata|status)" ;;
esac
