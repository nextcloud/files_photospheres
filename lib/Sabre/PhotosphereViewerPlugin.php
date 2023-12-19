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


namespace OCA\Files_PhotoSpheres\Sabre;

use \Sabre\DAV\INode;
use OCA\DAV\Connector\Sabre\File;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCP\ICache;
use OCP\ICacheFactory;
use Psr\Log\LoggerInterface;
use Sabre\DAV\ICollection;
use Sabre\DAV\IFile;
use Sabre\DAV\PropFind;
use Sabre\DAV\Server;
use Sabre\DAV\ServerPlugin;

/**
 * class PhotosphereViewerPlugin
 *
 * @package OCA\Files_PhotoSpheres\Sabre;
 */
class PhotosphereViewerPlugin extends ServerPlugin {
	// Constants for init.js
	private const PROPERTY_XMP_METADATA = '{http://nextcloud.org/ns}files-photospheres-xmp-metadata';

	private ?Server $server = null;
	private IXmpDataReader $xmpDataReader;
	private ICache $cache;
	private LoggerInterface $logger;
	//private array $xmpMetadataCache = []; // fileId => xmpMetadata
	
	public function __construct(IXmpDataReader $xmpDataReader, ICacheFactory $cacheFactory, LoggerInterface $logger) {
		$this->xmpDataReader = $xmpDataReader;
		$this->logger = $logger;
		$this->cache = $cacheFactory->createLocal(get_class($this));
	}

	/**
	 * This initializes the plugin.
	 *
	 * This function is called by Sabre\DAV\Server, after
	 * addPlugin is called.
	 *
	 * This method should set up the required event subscriptions.
	 *
	 * @param \Sabre\DAV\Server $server
	 * @return void
	 */
	public function initialize(Server $server) {
		$this->server = $server;
		$this->server->on('propFind', [$this, 'handleGetProperties']);
		$this->logger->debug(get_class($this) . ' initialized');
	}

	/**
	 * Adds photosphere flag and XMP metadata to the properties of a file.
	 *
	 * @param PropFind $propFind
	 * @param \Sabre\DAV\INode $node
	 * @return void
	 */
	public function handleGetProperties(
		PropFind $propFind,
		INode $node
	) {
		if ((!($node instanceof IFile) && !($node instanceof ICollection)) ||
			is_null($propFind->getStatus(self::PROPERTY_XMP_METADATA))) {
			$this->logger->debug('{node}: Not a file or directory or no XMP Metadata requested', ['node' => $node->getName()]);
			return;
		}

		// We try to create a cache for the whole directory
		// so that individual file XMP metadata requests are faster
		if (($node instanceof ICollection) && $propFind->getDepth() !== 0) {
			$this->cacheDirectory($node);
		}

		$propFind->handle(self::PROPERTY_XMP_METADATA, function () use ($node) {
			return $this->handleGetXmpMetadata($node);
		});
	}

	private function handleGetXmpMetadata(INode $node) : ?XmpResultModel {
		// Cache should be already filled here because the meta request
		// for the whole directory should have been done before
		return $node instanceof File ? $this->getXmpMetadataCached($node) : null;
	}

	private function cacheDirectory(ICollection $directory): void {
		$this->logger->debug('Start caching directory {dir}', ['dir' => $directory->getName()]);
		$start = hrtime(true);
		
		$children = $directory->getChildren();

		foreach ($children as $child) {
			if ($child instanceof File) {
				$this->getXmpMetadataCached($child);
			}
		}
		
		$end = hrtime(true);
		$eta = $end - $start;
		$elapsedMs = $eta / 1e+6;
		$this->logger->debug('Caching directory {dir} done. It took {ms}ms', ['dir' => $directory->getName(), 'ms' => $elapsedMs]);
	}

	private function getXmpMetadataCached(File $file) : ?XmpResultModel {
		$id = $file?->getId();
		
		if ($id === null) {
			$this->logger->warning('File {file} has no id', ['file' => $file->getName()]);
			return null;
		}

		if ($file->getFileInfo()?->getMimetype() !== 'image/jpeg') {
			$this->logger->debug('Skipping file {file}: it\'s not a jpeg', ['file' => $file->getName()]);
			return null;
		}

		$cachedXmpMeta = $this->cache->get($id);

		if ($cachedXmpMeta !== null) {
			$this->logger->debug('Cache hit for file {file}', ['file' => $file->getName()]);
			return $cachedXmpMeta;
		}

		$this->logger->debug('Cache miss for file {file}', ['file' => $file->getName()]);
		$xmpMeta = $this->xmpDataReader->readXmpDataFromFileObject($file->getNode());
		$this->cache->set($id, $xmpMeta);

		return $xmpMeta;
	}
}
