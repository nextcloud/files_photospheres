<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2023 Robin Windey <ro.windey@gmail.com>
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


namespace OCA\Files_PhotoSpheres\Tests\Unit\Sabre;

use OCA\DAV\Connector\Sabre\File;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Sabre\PhotosphereViewerPlugin;
use OCP\Files\FileInfo;
use OCP\FilesMetadata\Exceptions\FilesMetadataNotFoundException;
use OCP\FilesMetadata\Exceptions\FilesMetadataTypeException;
use OCP\FilesMetadata\IFilesMetadataManager;
use OCP\FilesMetadata\Model\IFilesMetadata;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Sabre\DAV\ICollection;
use Sabre\DAV\INode;
use Sabre\DAV\PropFind;
use Sabre\DAV\Server;

/**
 * Since the metadata is computed ahead of time by the XmpMetadataListener,
 * there is no directory pre-scan and no ad-hoc caching left to test here:
 * the plugin is a read-only lookup against IFilesMetadataManager.
 * See XmpMetadataListenerTest for the code which computes and stores the
 * metadata.
 */
class PhotosphereViewerPluginTest extends TestCase {
	private const META_PROP = '{http://nextcloud.org/ns}files-photospheres-xmp-metadata';

	private IFilesMetadataManager|MockObject $filesMetadataManager;
	private LoggerInterface|MockObject $logger;
	private PhotosphereViewerPlugin $plugin;

	protected function setUp(): void {
		parent::setUp();
		$this->filesMetadataManager = $this->createMock(IFilesMetadataManager::class);
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->plugin = new PhotosphereViewerPlugin($this->filesMetadataManager, $this->logger);
	}

	public function testInit() {
		$server = $this->createMock(Server::class);
		$server->expects($this->once())
			->method('on')
			->with(
				$this->equalTo('propFind'),
				$this->equalTo([$this->plugin, 'handleGetProperties'])
			);

		$this->plugin->initialize($server);
	}

	public function testHandleGetProperties_DoesNothingOnNonFile() {
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->never())
			->method('getStatus');
		$propFind->expects($this->never())
			->method('handle');
		$this->logger->expects($this->once())
			->method('debug')
			->with(
				$this->equalTo('{node}: Not a file or no XMP Metadata requested'),
				['node' => 'non-file-non-directory']
			);

		$node = new NonFileNonDirectory();
		$this->plugin->handleGetProperties($propFind, $node);
	}

	public function testHandleGetProperties_DoesNothingOnDirectory() {
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->never())
			->method('getStatus');
		$propFind->expects($this->never())
			->method('handle');

		$node = $this->createMock(ICollection::class);
		$node->expects($this->once())
			->method('getName')
			->willReturn('testDirectory');

		$this->plugin->handleGetProperties($propFind, $node);
	}

	public function testHandleGetProperties_DoesNothingOnXmpMetaNotRequested() {
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->once())
			->method('getStatus')
			->with(
				$this->equalTo(self::META_PROP)
			)
			->willReturn(null);
		$propFind->expects($this->never())
			->method('handle');

		$node = $this->createMock(File::class);
		$node->expects($this->once())
			->method('getName')
			->willReturn('testFile.jpg');

		$this->plugin->handleGetProperties($propFind, $node);
	}

	public function testHandleGetProperties_SkipsNonJpgFile() {
		$fileInfo = $this->createMock(FileInfo::class);
		$fileInfo->expects($this->once())
			->method('getMimetype')
			->willReturn('application/xml');
		$node = $this->createMock(File::class);
		$node->method('getFileInfo')
			->willReturn($fileInfo);
		$node->method('getName')
			->willReturn('myTestfile42');

		$handler = $this->registerAndCapture($node);

		$this->filesMetadataManager->expects($this->never())
			->method('getMetadata');
		$this->logger->expects($this->once())
			->method('debug')
			->with(
				$this->equalTo('Skipping file {file}: it\'s not a jpeg'),
				['file' => 'myTestfile42']
			);

		$this->assertNull($handler());
	}

	public function testHandleGetProperties_SkipsAndLogsWarningOnFileWithoutId() {
		$node = $this->createJpegNode(null);
		$node->method('getName')
			->willReturn('myTestfile42');

		$handler = $this->registerAndCapture($node);

		$this->filesMetadataManager->expects($this->never())
			->method('getMetadata');
		$this->logger->expects($this->once())
			->method('warning')
			->with(
				$this->equalTo('File {file} has no id'),
				['file' => 'myTestfile42']
			);

		$this->assertNull($handler());
	}

	public function testHandleGetProperties_ReturnsNullIfNoMetadataStoredYet() {
		$node = $this->createJpegNode(42);
		$handler = $this->registerAndCapture($node);

		$this->filesMetadataManager->expects($this->once())
			->method('getMetadata')
			->with(
				$this->equalTo(42),
				$this->equalTo(false) // Never generate on-the-fly, that would read the file again
			)
			->willThrowException(new FilesMetadataNotFoundException());

		$this->assertNull($handler());
	}

	public function testHandleGetProperties_ReturnsNullIfMetadataDoesNotContainOurKey() {
		$node = $this->createJpegNode(42);
		$handler = $this->registerAndCapture($node);

		$metadata = $this->createMock(IFilesMetadata::class);
		$metadata->expects($this->once())
			->method('hasKey')
			->with(
				$this->equalTo(PhotosphereViewerPlugin::METADATA_KEY)
			)
			->willReturn(false);
		$metadata->expects($this->never())
			->method('getArray');
		$this->filesMetadataManager->method('getMetadata')
			->willReturn($metadata);

		$this->assertNull($handler());
	}

	public function testHandleGetProperties_ReturnsStoredMetadata() {
		$node = $this->createJpegNode(42);
		$handler = $this->registerAndCapture($node);

		$metadata = $this->createMock(IFilesMetadata::class);
		$metadata->method('hasKey')
			->with(
				$this->equalTo(PhotosphereViewerPlugin::METADATA_KEY)
			)
			->willReturn(true);
		$metadata->method('getArray')
			->with(
				$this->equalTo(PhotosphereViewerPlugin::METADATA_KEY)
			)
			->willReturn([
				'usePanoramaViewer' => true,
				'containsCroppingConfig' => true,
				'croppingConfig' => [
					'fullWidth' => 1,
					'fullHeight' => 2,
					'croppedWidth' => 3,
					'croppedHeight' => 4,
					'croppedX' => 5,
					'croppedY' => 6,
					'poseHeading' => 7,
					'posePitch' => 8,
					'poseRoll' => 9,
				]
			]);
		$this->filesMetadataManager->method('getMetadata')
			->willReturn($metadata);

		$result = $handler();

		$this->assertInstanceOf(XmpResultModel::class, $result);
		$this->assertTrue($result->usePanoramaViewer);
		$this->assertTrue($result->containsCroppingConfig);
		$this->assertEquals(1, $result->croppingConfig->fullWidth);
		$this->assertEquals(9, $result->croppingConfig->poseRoll);
	}

	public function testHandleGetProperties_ReturnsNullOnMalformedMetadata() {
		$node = $this->createJpegNode(42);
		$node->method('getName')
			->willReturn('myTestfile42');
		$handler = $this->registerAndCapture($node);

		$metadata = $this->createMock(IFilesMetadata::class);
		$metadata->method('hasKey')
			->willReturn(true);
		$metadata->method('getArray')
			->willThrowException(new FilesMetadataTypeException('not an array'));
		$this->filesMetadataManager->method('getMetadata')
			->willReturn($metadata);

		$this->logger->expects($this->once())
			->method('warning')
			->with(
				$this->equalTo('Malformed XMP metadata for file {file}: {message}'),
				$this->anything()
			);

		$this->assertNull($handler());
	}

	/**
	 * Registers the plugin for the given node and returns the closure it
	 * handed to PropFind::handle(), so that the caller can invoke it
	 * directly. The node is captured at registration time, so it has to be
	 * fully set up before calling this.
	 */
	private function registerAndCapture(INode $node) : callable {
		$propFind = $this->createMock(PropFind::class);
		$propFind->method('getStatus')
			->with(
				$this->equalTo(self::META_PROP)
			)
			->willReturn(200);
		$handler = null;
		$propFind->expects($this->once())
			->method('handle')
			->with(
				$this->equalTo(self::META_PROP),
				$this->callback(function ($callback) use (&$handler) {
					$handler = $callback;
					return true;
				})
			);

		$this->plugin->handleGetProperties($propFind, $node);

		$this->assertIsCallable($handler);
		return $handler;
	}

	private function createJpegNode(?int $id) : File|MockObject {
		$fileInfo = $this->createMock(FileInfo::class);
		$fileInfo->method('getMimetype')
			->willReturn('image/jpeg');
		$node = $this->createMock(File::class);
		$node->method('getFileInfo')
			->willReturn($fileInfo);
		$node->method('getId')
			->willReturn($id);
		return $node;
	}
}

class NonFileNonDirectory implements INode {
	public function delete() {

	}

	public function getName() {
		return 'non-file-non-directory';
	}

	public function setName($name) {

	}

	public function getLastModified() {
		return null;
	}
}
