<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2020 Robin Windey <ro.windey@gmail.com>
 *
 * @author Robin Windey <ro.windey@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Files_PhotoSpheres\Tests\Unit\Listener;

use OCA\Files\Event\LoadAdditionalScriptsEvent;
use OCA\Files\Event\LoadSidebar;
use OCA\Files_PhotoSpheres\Listener\AddScriptsAndStylesListener;
use OCA\Files_Sharing\Event\BeforeTemplateRenderedEvent;
use OCP\EventDispatcher\Event;
use OCP\Share\IShare;
use OCP\Util;
use PHPUnit\Framework\Attributes\DataProvider;
use Test\TestCase;

class AddScriptsAndStylesListenerTest extends TestCase {
	protected function setUp(): void {
		parent::setUp();
		$this->resetStylesAndScripts();
	}

	#[DataProvider('dataProvider_InvalidEvents')]
	public function testHandleDoesNothing_OnInvalidEvent(Event $event) {
		$scriptCountBefore = count(Util::getScripts());
		$styleCountBefore = count(\OC_Util::$styles);

		$listener = new AddScriptsAndStylesListener();
		$listener->handle($event);

		$scriptCountAfter = count(Util::getScripts());
		$styleCountAfter = count(\OC_Util::$styles);

		$this->assertEquals($scriptCountBefore, $scriptCountAfter);
		$this->assertEquals($styleCountBefore, $styleCountAfter);
	}

	#[DataProvider('dataProvider_ValidEvents')]
	public function testAddsScriptAndStyles_OnValidEvent(callable $eventFactory) {
		$listener = new AddScriptsAndStylesListener();
		$listener->handle($eventFactory($this));

		$functionJsCnt = 0;
		$fileActionJsCnt = 0;
		$styleCssCnt = 0;

		$scripts = Util::getScripts();
		foreach ($scripts as $script) {
			if (strpos($script, 'js/functions') !== false) {
				$functionJsCnt++;
			}
			if (strpos($script, 'js/fileAction') !== false) {
				$fileActionJsCnt++;
			}
		}

		foreach (\OC_Util::$styles as $style) {
			if ($style === 'files_photospheres/css/style') {
				$styleCssCnt++;
			}
		}
		
		$this->assertEquals(1, $functionJsCnt);
		$this->assertEquals(1, $fileActionJsCnt);
		$this->assertEquals(1, $styleCssCnt);
	}

	public static function dataProvider_InvalidEvents() {
		return  [
			[ new LoadSidebar() ],
			[ new Event() ]
		];
	}

	public static function dataProvider_ValidEvents() {
		return  [
			[fn (self $testClass) => new LoadAdditionalScriptsEvent()],
			[fn (self $testClass) => new BeforeTemplateRenderedEvent($testClass->createMock(IShare::class)) ]
		];
	}

	private function resetStylesAndScripts() {
		$this->invokePrivate(Util::class, '$scripts', []);
		$this->invokePrivate(Util::class, '$scriptDeps', []);
		$this->invokePrivate(Util::class, '$sortedScriptDeps', []);
		\OC_Util::$styles = [];
	}
}
