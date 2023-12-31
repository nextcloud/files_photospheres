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
 * @copyright Robin Windey 2020
 */

namespace OCA\Files_PhotoSpheres\Tests\Unit\Service\Helper;

use OCA\Files_PhotoSpheres\Service\Helper\RegexMatcher;
use PHPUnit\Framework\TestCase;

class RegexMatcherTest extends TestCase {
	/** @var RegexMatcher */
	private $regexMatcher;

	public function setUp() : void {
		parent::setUp();
		$this->regexMatcher = new RegexMatcher();
	}
	
	public function testMatch() {
		$this->regexMatcher->preg_match('/(a)(b)*(c)/', 'ac', $matches);
		$this->assertTrue(count($matches) == 4);
	}
}
