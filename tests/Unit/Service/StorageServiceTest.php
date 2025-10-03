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
use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCA\Files_PhotoSpheres\Service\StorageService;
use OCP\Files\File;
use OCP\Files\Folder;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class StorageServiceTest extends TestCase {

	/** @var Folder|MockObject */
	private $folder;
	/** @var IXmpDataReader|MockObject */
	private $xmpDataReader;
	/** @var StorageService */
	private $storageService;

	public function setUp() : void {
		parent::setUp();
		$this->folder = $this->createMock(Folder::class);
		$this->xmpDataReader = $this->createMock(IXmpDataReader::class);
		$this->storageService = new StorageService($this->folder, $this->xmpDataReader);
	}

	public function testThrowsOnFileNotFound() {
		$fileId = 42;
		$this->folder->expects($this->once())
			->method('getById')
			->with($fileId)
			->willReturn([]);
		$this->xmpDataReader->expects($this->never())
			->method('readXmpDataFromFileObject');

		$thrown = false;
		try {
			$this->storageService->getXmpData($fileId);
		} catch (\Exception $ex) {
			$this->assertStringContainsString('Could not locate', $ex->getMessage());
			$thrown = true;
		}

		$this->assertTrue($thrown);
	}

	public function testCallsXmpDataReader_OnValidFile() {
		$fileId = 42;
		$nodeMock = $this->createMock(File::class);
		$this->folder->expects($this->once())
			->method('getById')
			->with($fileId)
			->willReturn([$nodeMock]);
		$this->xmpDataReader->expects($this->once())
			->method('readXmpDataFromFileObject')
			->with($nodeMock)
			->willReturn(new XmpResultModel());

		$this->storageService->getXmpData($fileId);
	}
}
