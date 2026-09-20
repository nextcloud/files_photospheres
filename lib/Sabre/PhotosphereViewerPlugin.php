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

use OCA\DAV\Connector\Sabre\File;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCP\FilesMetadata\Exceptions\FilesMetadataNotFoundException;
use OCP\FilesMetadata\Exceptions\FilesMetadataTypeException;
use OCP\FilesMetadata\IFilesMetadataManager;
use Psr\Log\LoggerInterface;
use Sabre\DAV\IFile;
use Sabre\DAV\INode;
use Sabre\DAV\PropFind;
use Sabre\DAV\Server;
use Sabre\DAV\ServerPlugin;

/**
 * class PhotosphereViewerPlugin
 *
 * The metadata is, where available, computed ahead of time by
 * {@see \OCA\Files_PhotoSpheres\Listener\XmpMetadataListener} (on upload/edit)
 * or by an administrator via `occ files_photospheres:generate-metadata`, and
 * stored through {@see IFilesMetadataManager}. This plugin only ever reads
 * the already computed value: it never opens a file itself, so answering a
 * PROPFIND never costs any file I/O, no matter how many jpegs the directory
 * contains.
 *
 * Pre-generated metadata is optional, not required: for a file whose
 * metadata was never computed ahead of time, this plugin simply reports
 * "unknown" (no property value), and the frontend falls back to an
 * on-demand, single-file check instead (see
 * {@see \OCA\Files_PhotoSpheres\Controller\UserfilesController::getXmpData()}).
 *
 * @package OCA\Files_PhotoSpheres\Sabre;
 */
class PhotosphereViewerPlugin extends ServerPlugin {
	// Constants for init.js
	private const PROPERTY_XMP_METADATA = '{http://nextcloud.org/ns}files-photospheres-xmp-metadata';

	/**
	 * Key the XMP metadata is stored under in the files metadata store.
	 *
	 * Note there is no explicit registration step for this key (no
	 * migration/repair step calling IFilesMetadataManager::initMetadata()):
	 * that call is only mandatory for a key to be exposed through DAV's
	 * generic files-metadata property mechanism. This plugin serves its own,
	 * hardcoded DAV property directly (see handleGetProperties() below), so
	 * it does not need the key to be pre-registered; the files metadata
	 * store itself registers it lazily the first time a value is actually
	 * saved under it (see IFilesMetadataManager::saveMetadata()).
	 *
	 * @see \OCA\Files_PhotoSpheres\Listener\XmpMetadataListener
	 * @see \OCA\Files_PhotoSpheres\Service\XmpMetadataStorage
	 */
	public const METADATA_KEY = 'files_photospheres_xmp';

	private ?Server $server = null;
	private IFilesMetadataManager $filesMetadataManager;
	private LoggerInterface $logger;

	public function __construct(IFilesMetadataManager $filesMetadataManager, LoggerInterface $logger) {
		$this->filesMetadataManager = $filesMetadataManager;
		$this->logger = $logger;
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
		INode $node,
	) {
		if (!($node instanceof IFile) || is_null($propFind->getStatus(self::PROPERTY_XMP_METADATA))) {
			$this->logger->debug('{node}: Not a file or no XMP Metadata requested', ['node' => $node->getName()]);
			return;
		}

		$propFind->handle(self::PROPERTY_XMP_METADATA, function () use ($node) {
			return $node instanceof File ? $this->getXmpMetadata($node) : null;
		});
	}

	private function getXmpMetadata(File $file) : ?XmpResultModel {
		if ($file->getFileInfo()?->getMimetype() !== 'image/jpeg') {
			$this->logger->debug('Skipping file {file}: it\'s not a jpeg', ['file' => $file->getName()]);
			return null;
		}

		$id = $file->getId();

		if ($id === null) {
			$this->logger->warning('File {file} has no id', ['file' => $file->getName()]);
			return null;
		}

		try {
			/*
				Never generate here: generating would mean reading the file
				during a PROPFIND again, which is exactly what storing the
				metadata ahead of time avoids. A file without metadata yet
				(neither uploaded/edited nor covered by a metadata generating
				rescan since this version of the app was installed) is simply
				treated as "not a photosphere" until one of those happens.
			*/
			$metadata = $this->filesMetadataManager->getMetadata($id, false);
		} catch (FilesMetadataNotFoundException $e) {
			return null;
		}

		if (!$metadata->hasKey(self::METADATA_KEY)) {
			return null;
		}

		try {
			return XmpResultModel::fromArray($metadata->getArray(self::METADATA_KEY));
		} catch (FilesMetadataTypeException $e) {
			$this->logger->warning('Malformed XMP metadata for file {file}: {message}', [
				'file' => $file->getName(),
				'message' => $e->getMessage(),
				'exception' => $e
			]);
			return null;
		}
	}
}
