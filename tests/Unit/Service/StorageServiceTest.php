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

namespace OCA\Files_PhotoSpheres\Tests\Unit\Service;

use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Service\StorageService;
use OCA\Files_PhotoSpheres\Service\XmpMetadataStorage;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\Node;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class StorageServiceTest extends TestCase {

	/** @var Folder|MockObject */
	private $folder;
	/** @var XmpMetadataStorage|MockObject */
	private $xmpMetadataStorage;
	/** @var StorageService */
	private $storageService;

	public function setUp() : void {
		parent::setUp();
		$this->folder = $this->createMock(Folder::class);
		$this->xmpMetadataStorage = $this->createMock(XmpMetadataStorage::class);
		$this->storageService = new StorageService($this->folder, $this->xmpMetadataStorage);
	}

	public function testThrowsOnFileNotFound() {
		$fileId = 42;
		$this->folder->expects($this->once())
			->method('getById')
			->with($fileId)
			->willReturn([]);
		$this->xmpMetadataStorage->expects($this->never())
			->method('computeAndPersist');

		$thrown = false;
		try {
			$this->storageService->getXmpData($fileId);
		} catch (\Exception $ex) {
			$this->assertStringContainsString('Could not locate', $ex->getMessage());
			$thrown = true;
		}

		$this->assertTrue($thrown);
	}

	public function testThrowsWhenNodeIsNotAFile() {
		$fileId = 42;
		$this->folder->expects($this->once())
			->method('getById')
			->with($fileId)
			->willReturn([$this->createMock(Node::class)]);
		$this->xmpMetadataStorage->expects($this->never())
			->method('computeAndPersist');

		$thrown = false;
		try {
			$this->storageService->getXmpData($fileId);
		} catch (\Exception $ex) {
			$this->assertStringContainsString('is not a file', $ex->getMessage());
			$thrown = true;
		}

		$this->assertTrue($thrown);
	}

	public function testDelegatesToXmpMetadataStorage_AndReturnsComputedValue() {
		$fileId = 42;
		$nodeMock = $this->createMock(File::class);
		$this->folder->expects($this->once())
			->method('getById')
			->with($fileId)
			->willReturn([$nodeMock]);
		$xmpMeta = new XmpResultModel();
		$xmpMeta->usePanoramaViewer = true;
		$this->xmpMetadataStorage->expects($this->once())
			->method('computeAndPersist')
			->with($this->equalTo($nodeMock))
			->willReturn($xmpMeta);

		$result = $this->storageService->getXmpData($fileId);

		$this->assertSame($xmpMeta, $result);
	}

	public function testReturnsNegativeResult_WhenComputationYieldsNothing() {
		// e.g. not a jpeg, or reading failed (already logged by
		// XmpMetadataStorage) - report "not a photosphere" instead of
		// erroring out.
		$fileId = 42;
		$nodeMock = $this->createMock(File::class);
		$this->folder->method('getById')
			->willReturn([$nodeMock]);
		$this->xmpMetadataStorage->method('computeAndPersist')
			->willReturn(null);

		$result = $this->storageService->getXmpData($fileId);

		$this->assertInstanceOf(XmpResultModel::class, $result);
		$this->assertFalse($result->usePanoramaViewer);
	}
}
