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
use PHPUnit\Framework\TestCase;

class AddScriptsAndStylesListenerTest extends TestCase {
    /**
     * @dataProvider dataProvider_InvalidEvents
     */
    public function testHandleDoesNothing_OnInvalidEvent(Event $event){
        $scriptCountBefore = count(\OC_Util::$scripts);
        $styleCountBefore = count(\OC_Util::$styles);

        $listener = new AddScriptsAndStylesListener();
        $listener->handle($event);

        $scriptCountAfter = count(\OC_Util::$scripts);
        $styleCountAfter = count(\OC_Util::$styles);

        $this->assertEquals($scriptCountBefore, $scriptCountAfter);
        $this->assertEquals($styleCountBefore, $styleCountAfter);
    }

    /**
     * @dataProvider dataProvider_ValidEvents
     */
    public function testAddsScriptAndStyles_OnValidEvent(Event $event){
        \OC_Util::$scripts = [];
        \OC_Util::$styles = [];

        $listener = new AddScriptsAndStylesListener();
        $listener->handle($event);

        $scriptCountAfter = count(\OC_Util::$scripts);
        $styleCountAfter = count(\OC_Util::$styles);

        $this->assertEquals(3, $scriptCountAfter);
        $this->assertEquals(1, $styleCountAfter);
    }

    public function dataProvider_InvalidEvents() {
        return  [
            [ new LoadSidebar() ],
            [ new Event() ]
        ];
    }

    public function dataProvider_ValidEvents() {
        /** @var IShare */
        $shareMock = $this->createMock(IShare::class);
        return  [
            [ new LoadAdditionalScriptsEvent() ],
            [ new BeforeTemplateRenderedEvent($shareMock) ]
        ];
    }
}
