<?php

/**
 * Nextcloud - Files_PhotoSpheres
 *
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Robin Windey <ro.windey@gmail.com>
 *
 * @copyright Robin Windey 2021
 */

namespace OCA\Files_PhotoSpheres\Service\Helper;

class RegexMatcher implements IRegexMatcher {
	public function preg_match(string $pattern, string $subject, array &$matches = null, int $flags = 0, int $offset = 0) {
		return preg_match($pattern, $subject, $matches, $flags, $offset);
	}
}
