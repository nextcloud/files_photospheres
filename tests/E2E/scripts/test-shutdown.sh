#!/bin/bash

# This script is only needed locally to cleanup the test data

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

. "$SCRIPT_DIR/vars.sh"

curl --fail-with-body -u $E2E_USER:$E2E_PASSWORD -X DELETE "${E2E_BASE_URL}/ppv-testfiles"
