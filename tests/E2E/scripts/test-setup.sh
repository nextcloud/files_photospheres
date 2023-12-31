#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

. "$SCRIPT_DIR/vars.sh"

curl --fail-with-body -u $E2E_USER:$E2E_PASSWORD -X MKCOL "${E2E_BASE_URL}/ppv-testfiles"
curl --fail-with-body -u $E2E_USER:$E2E_PASSWORD -T "${SCRIPT_DIR}/../testdata/pano.jpg" "${E2E_BASE_URL}/ppv-testfiles/pano.jpg"
curl --fail-with-body -u $E2E_USER:$E2E_PASSWORD -T "${SCRIPT_DIR}/../testdata/non-pano.jpg" "${E2E_BASE_URL}/ppv-testfiles/non-pano.jpg"
curl --fail-with-body -u $E2E_USER:$E2E_PASSWORD -T "${SCRIPT_DIR}/../testdata/360-video.mp4" "${E2E_BASE_URL}/ppv-testfiles/360-video.mp4"