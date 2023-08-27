#!/bin/bash
export E2E_USER=${E2E_USER:-admin}
export E2E_PASSWORD=${E2E_PASSWORD:-admin}
export E2E_BASE_URL="${E2E_BASE_URL:-"http://localhost/nextcloud"}/remote.php/dav/files/$E2E_USER"