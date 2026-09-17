<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2026 Robin Windey <ro.windey@gmail.com>
 *
 *  @license GNU AGPL version 3 or any later version
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
 */


namespace OCA\Files_PhotoSpheres\Listener;

use OCA\Files_PhotoSpheres\Sabre\PhotosphereViewerPlugin;
use OCA\Files_PhotoSpheres\Service\XmpMetadataStorage;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Files\File;
use OCP\FilesMetadata\Event\MetadataLiveEvent;

/**
 * class XmpMetadataListener
 *
 * Computes the XMP metadata of jpeg files ahead of time, on upload and edit,
 * and stores it through the files metadata API, so that
 * {@see PhotosphereViewerPlugin} can serve it from every PROPFIND without ever
 * reading a file itself.
 *
 * This is a best-effort optimization, not a requirement: a file whose
 * metadata was never computed this way (e.g. because it already existed
 * before this feature was added, or was never touched since) is simply
 * treated by the plugin as "unknown", and the frontend falls back to an
 * on-demand check on click (see UserfilesController::getXmpData()). An
 * administrator can also backfill metadata for existing files in bulk via
 * `occ files_photospheres:generate-metadata`
 * (see {@see \OCA\Files_PhotoSpheres\Command\GenerateMetadataCommand}).
 *
 * Reading the metadata (at most 800kb of the file, see
 * {@see \OCA\Files_PhotoSpheres\Service\Helper\XmpDataReader}) is cheap enough
 * to be done inline here, so there's no need to defer it to a background job
 * via {@see MetadataLiveEvent::requestBackgroundJob()}.
 *
 * @package OCA\Files_PhotoSpheres\Listener;
 *
 * @template-implements IEventListener<Event>
 */
class XmpMetadataListener implements IEventListener {
	/** @var XmpMetadataStorage */
	private $xmpMetadataStorage;

	public function __construct(XmpMetadataStorage $xmpMetadataStorage) {
		$this->xmpMetadataStorage = $xmpMetadataStorage;
	}

	public function handle(Event $event): void {
		if (!($event instanceof MetadataLiveEvent)) {
			return;
		}

		$node = $event->getNode();
		if (!($node instanceof File)) {
			return;
		}

		$this->xmpMetadataStorage->applyToMetadata($node, $event->getMetadata());
	}
}
