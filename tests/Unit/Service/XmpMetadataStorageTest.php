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


namespace OCA\Files_PhotoSpheres\Tests\Unit\Service;

use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Sabre\PhotosphereViewerPlugin;
use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCA\Files_PhotoSpheres\Service\XmpMetadataStorage;
use OCP\Files\File;
use OCP\FilesMetadata\IFilesMetadataManager;
use OCP\FilesMetadata\Model\IFilesMetadata;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class XmpMetadataStorageTest extends TestCase {
	private IXmpDataReader|MockObject $xmpDataReader;
	private IFilesMetadataManager|MockObject $filesMetadataManager;
	private XmpMetadataStorage $xmpMetadataStorage;

	protected function setUp(): void {
		parent::setUp();
		$this->xmpDataReader = $this->createMock(IXmpDataReader::class);
		$this->filesMetadataManager = $this->createMock(IFilesMetadataManager::class);
		$this->xmpMetadataStorage = new XmpMetadataStorage(
			$this->xmpDataReader,
			$this->filesMetadataManager,
			$this->createMock(LoggerInterface::class)
		);
	}

	public function testApplyToMetadata_ReturnsNullForNonJpegFiles() {
		$file = $this->createMock(File::class);
		$file->method('getMimetype')
			->willReturn('image/png');

		$this->xmpDataReader->expects($this->never())
			->method('readXmpDataFromFileObject');

		$result = $this->xmpMetadataStorage->applyToMetadata($file, $this->createMock(IFilesMetadata::class));

		$this->assertNull($result);
	}

	public function testApplyToMetadata_ReturnsNullAndLogsOnReadFailure() {
		$file = $this->jpegFile();
		$this->xmpDataReader->method('readXmpDataFromFileObject')
			->willThrowException(new \Exception('could not open file'));

		$metadata = $this->createMock(IFilesMetadata::class);
		$metadata->expects($this->never())
			->method('setArray');

		$result = $this->xmpMetadataStorage->applyToMetadata($file, $metadata);

		$this->assertNull($result);
	}

	public function testApplyToMetadata_StoresComputedValueForPhotosphere() {
		$file = $this->jpegFile();
		$xmpMeta = $this->xmpResultFor(true);
		$this->xmpDataReader->method('readXmpDataFromFileObject')
			->with($this->equalTo($file))
			->willReturn($xmpMeta);

		$metadata = $this->createMock(IFilesMetadata::class);
		$metadata->expects($this->once())
			->method('setArray')
			->with(
				$this->equalTo(PhotosphereViewerPlugin::METADATA_KEY),
				$this->equalTo($xmpMeta->toArray())
			);

		$result = $this->xmpMetadataStorage->applyToMetadata($file, $metadata);

		$this->assertSame($xmpMeta, $result);
	}

	public function testApplyToMetadata_StoresComputedValueForNonPhotosphereToo() {
		// Storing "not a photosphere" too (rather than leaving the key
		// unset) is what lets the frontend tell "known not to be a
		// photosphere" apart from "not computed yet" via the presence of
		// the DAV property alone.
		$file = $this->jpegFile();
		$xmpMeta = $this->xmpResultFor(false);
		$this->xmpDataReader->method('readXmpDataFromFileObject')
			->willReturn($xmpMeta);

		$metadata = $this->createMock(IFilesMetadata::class);
		$metadata->expects($this->once())
			->method('setArray')
			->with(
				$this->equalTo(PhotosphereViewerPlugin::METADATA_KEY),
				$this->equalTo($xmpMeta->toArray())
			);
		$metadata->expects($this->never())
			->method('unset');

		$this->xmpMetadataStorage->applyToMetadata($file, $metadata);
	}

	public function testComputeAndPersist_ReturnsNullForFileWithoutId() {
		$file = $this->jpegFile();
		$file->method('getId')
			->willReturn(null);

		$this->filesMetadataManager->expects($this->never())
			->method('getMetadata');

		$result = $this->xmpMetadataStorage->computeAndPersist($file);

		$this->assertNull($result);
	}

	public function testComputeAndPersist_FetchesGeneratesAndSaves() {
		$file = $this->jpegFile();
		$file->method('getId')
			->willReturn(42);
		$xmpMeta = $this->xmpResultFor(true);
		$this->xmpDataReader->method('readXmpDataFromFileObject')
			->willReturn($xmpMeta);

		$metadata = $this->createMock(IFilesMetadata::class);
		$metadata->method('setArray')
			->willReturn($metadata);
		$this->filesMetadataManager->expects($this->once())
			->method('getMetadata')
			->with(
				$this->equalTo(42),
				$this->equalTo(true) // generate = true: get-or-create
			)
			->willReturn($metadata);
		$this->filesMetadataManager->expects($this->once())
			->method('saveMetadata')
			->with($this->equalTo($metadata));

		$result = $this->xmpMetadataStorage->computeAndPersist($file);

		$this->assertSame($xmpMeta, $result);
	}

	public function testComputeAndPersist_DoesNotSaveOnReadFailure() {
		$file = $this->jpegFile();
		$file->method('getId')
			->willReturn(42);
		$this->xmpDataReader->method('readXmpDataFromFileObject')
			->willThrowException(new \Exception('could not open file'));

		$this->filesMetadataManager->method('getMetadata')
			->willReturn($this->createMock(IFilesMetadata::class));
		$this->filesMetadataManager->expects($this->never())
			->method('saveMetadata');

		$result = $this->xmpMetadataStorage->computeAndPersist($file);

		$this->assertNull($result);
	}

	private function jpegFile() : File|MockObject {
		$file = $this->createMock(File::class);
		$file->method('getMimetype')
			->willReturn('image/jpeg');
		$file->method('getName')
			->willReturn('photosphere.jpg');
		return $file;
	}

	private function xmpResultFor(bool $usePanoramaViewer) : XmpResultModel {
		$xmpResult = new XmpResultModel();
		$xmpResult->usePanoramaViewer = $usePanoramaViewer;
		return $xmpResult;
	}
}
