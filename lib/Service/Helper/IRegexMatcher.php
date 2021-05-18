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
 * @copyright Robin Windey 2019
 */

namespace OCA\Files_PhotoSpheres\Service\Helper;

interface IRegexMatcher {
	/**
	 * Regex match function
	 * @return int|bool
	 */
	public function preg_match(string $pattern, string $subject, array &$matches = null, int $flags = 0, int $offset = 0);
}
