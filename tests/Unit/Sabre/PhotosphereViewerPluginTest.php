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

use OC\Files\View;
use OCA\DAV\Connector\Sabre\Directory;
use OCA\DAV\Connector\Sabre\File;
use OCA\Files_PhotoSpheres\Sabre\PhotosphereViewerPlugin;
use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCP\Files\FileInfo;
use OCP\ICache;
use OCP\ICacheFactory;
use OCP\IL10N;
use OCP\IRequest;
use OCP\Share\IManager;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Sabre\DAV\ICollection;
use Sabre\DAV\INode;
use Sabre\DAV\PropFind;
use Sabre\DAV\Server;

class PhotosphereViewerPluginTest extends TestCase {
	private const META_PROP = '{http://nextcloud.org/ns}files-photospheres-xmp-metadata';

	private array $cacheArray;
	private ICacheFactory|MockObject $cacheFactory;

	protected function setUp(): void {
		$this->cacheArray = [];
		
		$cacheFake = $this->createMock(ICache::class);
		$cacheFake->expects($this->any())
			->method('get')
			->willReturnCallback(function ($key) {
				return $this->cacheArray[$key] ?? null;
			});
		$cacheFake->expects($this->any())
			->method('set')
			->willReturnCallback(function ($key, $value) {
				$this->cacheArray[$key] = $value;
			});

		$this->cacheFactory = $this->createMock(ICacheFactory::class);
		$this->cacheFactory->expects($this->any())
			->method('createLocal')
			->with(
				$this->equalTo(PhotosphereViewerPlugin::class)
			)
			->willReturn($cacheFake);
	}

	public function testInit() {
		$plugin = new PhotosphereViewerPlugin(
			$this->createMock(IXmpDataReader::class),
			$this->cacheFactory,
			$this->createMock(LoggerInterface::class)
		);
		$server = $this->createMock(Server::class);
		$server->expects($this->once())
			->method('on')
			->with(
				$this->equalTo('propFind'),
				$this->equalTo([$plugin, 'handleGetProperties'])
			);
		$plugin->initialize($server);
	}

	public function testHandleGetProperties_DoesNothingOnNonFileAndNonDirectory() {
		$logger = $this->createMock(LoggerInterface::class);
		$plugin = new PhotosphereViewerPlugin(
			$this->createMock(IXmpDataReader::class),
			$this->cacheFactory,
			$logger
		);
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->never())
			->method('getStatus')
			->with(
				$this->equalTo(self::META_PROP)
			)
			->willReturn(200);
		$propFind->expects($this->never())
			->method('getDepth')
			->willReturn(1);
		$propFind->expects($this->never())
			->method('handle');
		$logger->expects($this->once())
			->method('debug')
			->with(
				$this->equalTo('{node}: Not a file or directory or no XMP Metadata requested'),
				['node' => 'non-file-non-directory']
			);

		$node = new NonFileNonDirectory();
		$plugin->handleGetProperties($propFind, $node);
	}

	public function testHandleGetProperties_DoesNothingOnXmpMetaNotRequested() {
		$logger = $this->createMock(LoggerInterface::class);
		$plugin = new PhotosphereViewerPlugin(
			$this->createMock(IXmpDataReader::class),
			$this->cacheFactory,
			$logger
		);
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->once())
			->method('getStatus')
			->with(
				$this->equalTo(self::META_PROP)
			)
			->willReturn(null);
		$propFind->expects($this->never())
			->method('getDepth')
			->willReturn(1);
		$propFind->expects($this->never())
			->method('handle');
		$logger->expects($this->once())
			->method('debug')
			->with(
				$this->equalTo('{node}: Not a file or directory or no XMP Metadata requested'),
				['node' => 'testDirectory']
			);
		$view = $this->createMock(View::class);
		$info = $this->createMock(FileInfo::class);
		$info->expects($this->once())
			->method('getName')
			->willReturn('testDirectory');
		$node = new Directory($view, $info);

		$plugin->handleGetProperties($propFind, $node);
	}

	public function testHandleGetProperties_RegistersXmpMetaForSingleFile() {
		$logger = $this->createMock(LoggerInterface::class);
		$xmpReader = $this->createMock(IXmpDataReader::class);
		$plugin = new PhotosphereViewerPlugin(
			$xmpReader,
			$this->cacheFactory,
			$logger
		);
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->once())
			->method('getStatus')
			->with(
				$this->equalTo(self::META_PROP)
			)
			->willReturn(200);
		$propFind->expects($this->never())
			->method('getDepth')
			->willReturn(1);
		$propFindHandleFunction = null;
		$propFind->expects($this->once())
			->method('handle')
			->with(
				$this->equalTo(self::META_PROP),
				$this->callback(function ($propFindHandleFunctionCall) use (&$propFindHandleFunction) {
					$propFindHandleFunction = $propFindHandleFunctionCall;
					return true;
				})
			);

		$view = $this->createMock(View::class);
		$ocFile = $this->createMock(\OC\Files\Node\File::class);
		$ocFile->expects($this->exactly(2))
			->method('getId')
			->willReturn('42');
		$ocFile->expects($this->exactly(2))
			->method('getMimetype')
			->willReturn('image/jpeg');
		$manager = $this->createMock(IManager::class);
		$request = $this->createMock(IRequest::class);
		$l10n = $this->createMock(IL10N::class);

		$node = new File($view, $ocFile, $manager, $request, $l10n);

		$plugin->handleGetProperties($propFind, $node);

		$this->assertNotNull($propFindHandleFunction);
		$this->assertIsCallable($propFindHandleFunction);

		$xmpReader->expects($this->once()) // We call 2 times, but it should only be called once (cache)
			->method('readXmpDataFromFileObject')
			->with(
				$this->equalTo($ocFile)
			);

		// This should be called by the propFind->handle() call
		// and should read the XMP data. We use the same node
		// twice, since we're lazy :-)
		$propFindHandleFunction($node);

		// Second call should be cached
		$propFindHandleFunction($node);
	}

	public function testHandleGetProperties_SkipsNonJpgSingleFile() {
		$logger = $this->createMock(LoggerInterface::class);
		$xmpReader = $this->createMock(IXmpDataReader::class);
		$plugin = new PhotosphereViewerPlugin(
			$xmpReader,
			$this->cacheFactory,
			$logger
		);
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->once())
			->method('getStatus')
			->with(
				$this->equalTo(self::META_PROP)
			)
			->willReturn(200);
		$propFind->expects($this->never())
			->method('getDepth')
			->willReturn(1);
		$propFindHandleFunction = null;
		$propFind->expects($this->once())
			->method('handle')
			->with(
				$this->equalTo(self::META_PROP),
				$this->callback(function ($propFindHandleFunctionCall) use (&$propFindHandleFunction) {
					$propFindHandleFunction = $propFindHandleFunctionCall;
					return true;
				})
			);

		$view = $this->createMock(View::class);
		$ocFile = $this->createMock(\OC\Files\Node\File::class);
		$ocFile->expects($this->once())
			->method('getId')
			->willReturn('42');
		$ocFile->expects($this->once())
			->method('getName')
			->willReturn('myTestfile42');
		$ocFile->expects($this->once())
			->method('getMimetype')
			->willReturn('application/xml'); // This should be skipped, XMP reader should not be called
		$manager = $this->createMock(IManager::class);
		$request = $this->createMock(IRequest::class);
		$l10n = $this->createMock(IL10N::class);

		$node = new File($view, $ocFile, $manager, $request, $l10n);

		$plugin->handleGetProperties($propFind, $node);

		$this->assertNotNull($propFindHandleFunction);
		$this->assertIsCallable($propFindHandleFunction);

		$xmpReader->expects($this->never())
			->method('readXmpDataFromFileObject')
			->with(
				$this->equalTo($ocFile)
			);
		$logger->expects($this->once())
			->method('debug')
			->with(
				$this->equalTo('Skipping file {file}: it\'s not a jpeg'),
				['file' => 'myTestfile42']
			);

		$propFindHandleFunction($node);
	}

	public function testHandleGetProperties_SkipsAndLogsWarningOnFileWithoutId() {
		$logger = $this->createMock(LoggerInterface::class);
		$xmpReader = $this->createMock(IXmpDataReader::class);
		$plugin = new PhotosphereViewerPlugin(
			$xmpReader,
			$this->cacheFactory,
			$logger
		);
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->once())
			->method('getStatus')
			->with(
				$this->equalTo(self::META_PROP)
			)
			->willReturn(200);
		$propFind->expects($this->never())
			->method('getDepth')
			->willReturn(1);
		$propFindHandleFunction = null;
		$propFind->expects($this->once())
			->method('handle')
			->with(
				$this->equalTo(self::META_PROP),
				$this->callback(function ($propFindHandleFunctionCall) use (&$propFindHandleFunction) {
					$propFindHandleFunction = $propFindHandleFunctionCall;
					return true;
				})
			);

		$view = $this->createMock(View::class);
		$ocFile = $this->createMock(\OC\Files\Node\File::class);
		$ocFile->expects($this->once())
			->method('getId')
			->willReturn(null);
		$ocFile->expects($this->once())
			->method('getName')
			->willReturn('myTestfile42');

		$manager = $this->createMock(IManager::class);
		$request = $this->createMock(IRequest::class);
		$l10n = $this->createMock(IL10N::class);

		$node = new File($view, $ocFile, $manager, $request, $l10n);

		$plugin->handleGetProperties($propFind, $node);

		$this->assertNotNull($propFindHandleFunction);
		$this->assertIsCallable($propFindHandleFunction);

		$xmpReader->expects($this->never())
			->method('readXmpDataFromFileObject')
			->with(
				$this->equalTo($ocFile)
			);
		$logger->expects($this->once())
			->method('warning')
			->with(
				$this->equalTo('File {file} has no id'),
				['file' => 'myTestfile42']
			);
		
		$propFindHandleFunction($node);
	}

	public function testHandleGetProperties_CreatesDirectoryCache() {
		$logger = $this->createMock(LoggerInterface::class);
		$xmpReader = $this->createMock(IXmpDataReader::class);
		$plugin = new PhotosphereViewerPlugin(
			$xmpReader,
			$this->cacheFactory,
			$logger
		);
		$propFind = $this->createMock(PropFind::class);
		$propFind->expects($this->atLeastOnce())
			->method('getStatus')
			->with(
				$this->equalTo(self::META_PROP)
			)
			->willReturn(200);
		$propFind->expects($this->atLeastOnce())
			->method('getDepth')
			->willReturn(1);

		$jpgInfo = $this->createMock(FileInfo::class);
		$jpgInfo->expects($this->atLeastOnce())
			->method('getMimetype')
			->willReturn('image/jpeg');
		$file1 = $this->createMock(File::class);
		$file1->expects($this->atLeastOnce())
			->method('getId')
			->willReturn('42');
		$file1->expects($this->atLeastOnce())
			->method('getFileInfo')
			->willReturn($jpgInfo);
		$file2 = $this->createMock(File::class);
		$file2->expects($this->atLeastOnce())
			->method('getId')
			->willReturn('43');
		$file2->expects($this->atLeastOnce())
			->method('getFileInfo')
			->willReturn($jpgInfo);
		$dir1 = $this->createMock(Directory::class);

		$node = $this->createMock(ICollection::class);
		$node->expects($this->once())
			->method('getChildren')
			->willReturn([$file1, $file2, $dir1]);

		$xmpReader->expects($this->exactly(2))
			->method('readXmpDataFromFileObject');

		$plugin->handleGetProperties($propFind, $node);
	}
}

class NonFileNonDirectory implements INode {
	public function delete() {

	}

	public function getName() {
		return "non-file-non-directory";
	}

	public function setName($name) {

	}

	public function getLastModified() {
		return null;
	}
}
