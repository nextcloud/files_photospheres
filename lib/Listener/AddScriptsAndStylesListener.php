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

namespace OCA\Files_PhotoSpheres\Listener;

use OCA\Files\Event\LoadAdditionalScriptsEvent;
use OCA\Files_PhotoSpheres\AppInfo\Application;
use OCA\Files_Sharing\Event\BeforeTemplateRenderedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

class AddScriptsAndStylesListener implements IEventListener {
	public function handle(Event $event) : void {
		if (!$event instanceof LoadAdditionalScriptsEvent && !$event instanceof BeforeTemplateRenderedEvent) {
			return;
		}

		Util::addInitScript(Application::APP_NAME, 'init');

		// Add our JS after the viewer JS to make sure we register
		// our file click handlers later than the viewer app
		Util::addScript(Application::APP_NAME, 'functions', 'viewer');
		Util::addScript(Application::APP_NAME, 'fileAction', 'viewer');
		Util::addStyle(Application::APP_NAME, 'style');
	}
}
