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


namespace OCA\Files_PhotoSpheres\Tests\Unit\Listener;

use OCA\Files_PhotoSpheres\Listener\XmpMetadataListener;
use OCA\Files_PhotoSpheres\Service\XmpMetadataStorage;
use OCP\EventDispatcher\Event;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\FilesMetadata\Event\MetadataLiveEvent;
use OCP\FilesMetadata\Model\IFilesMetadata;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class XmpMetadataListenerTest extends TestCase {
	private XmpMetadataStorage|MockObject $xmpMetadataStorage;
	private XmpMetadataListener $listener;

	protected function setUp(): void {
		parent::setUp();
		$this->xmpMetadataStorage = $this->createMock(XmpMetadataStorage::class);
		$this->listener = new XmpMetadataListener($this->xmpMetadataStorage);
	}

	public function testIgnoresUnrelatedEvents() {
		$this->xmpMetadataStorage->expects($this->never())
			->method('applyToMetadata');

		$this->listener->handle($this->createMock(Event::class));
	}

	public function testIgnoresFolders() {
		$this->xmpMetadataStorage->expects($this->never())
			->method('applyToMetadata');

		$this->listener->handle(new MetadataLiveEvent($this->createMock(Folder::class), $this->createMock(IFilesMetadata::class)));
	}

	public function testDelegatesToXmpMetadataStorage() {
		$node = $this->createMock(File::class);
		$metadata = $this->createMock(IFilesMetadata::class);

		$this->xmpMetadataStorage->expects($this->once())
			->method('applyToMetadata')
			->with(
				$this->equalTo($node),
				$this->equalTo($metadata)
			);

		$this->listener->handle(new MetadataLiveEvent($node, $metadata));
	}
}
