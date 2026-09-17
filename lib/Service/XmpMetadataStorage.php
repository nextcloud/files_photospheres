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


namespace OCA\Files_PhotoSpheres\Service;

use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Sabre\PhotosphereViewerPlugin;
use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCP\Files\File;
use OCP\FilesMetadata\IFilesMetadataManager;
use OCP\FilesMetadata\Model\IFilesMetadata;
use Psr\Log\LoggerInterface;

/**
 * class XmpMetadataStorage
 *
 * Computes the XMP metadata of a jpeg file and writes it into the files
 * metadata store, so {@see PhotosphereViewerPlugin} can serve it from a
 * PROPFIND without reading the file itself.
 *
 * The metadata value is stored explicitly for both outcomes - "is a
 * photosphere" and "is not a photosphere" - rather than only storing an
 * entry for photospheres. This lets a missing entry mean "not computed yet"
 * (the frontend then falls back to an on-demand check, see
 * UserfilesController::getXmpData()) while a present entry, whichever way it
 * reads, means "already known, no on-demand check needed".
 *
 * @package OCA\Files_PhotoSpheres\Service;
 */
class XmpMetadataStorage {
	/** @var IXmpDataReader */
	private $xmpDataReader;

	/** @var IFilesMetadataManager */
	private $filesMetadataManager;

	/** @var LoggerInterface */
	private $logger;

	public function __construct(IXmpDataReader $xmpDataReader, IFilesMetadataManager $filesMetadataManager, LoggerInterface $logger) {
		$this->xmpDataReader = $xmpDataReader;
		$this->filesMetadataManager = $filesMetadataManager;
		$this->logger = $logger;
	}

	/**
	 * Computes the XMP metadata of $file and writes it into $metadata,
	 * without persisting anything. Used by callers which already hold an
	 * IFilesMetadata instance which gets persisted for them once they are
	 * done with it - namely {@see \OCA\Files_PhotoSpheres\Listener\XmpMetadataListener},
	 * whose files-metadata event is saved automatically by the event
	 * dispatcher once the listener returns.
	 *
	 * Every other caller should use {@see self::computeAndPersist()} instead.
	 *
	 * @return XmpResultModel|null null if $file is not a jpeg, or if it could
	 *                             not be read
	 */
	public function applyToMetadata(File $file, IFilesMetadata $metadata): ?XmpResultModel {
		if ($file->getMimetype() !== 'image/jpeg') {
			return null;
		}

		try {
			$xmpMeta = $this->xmpDataReader->readXmpDataFromFileObject($file);
		} catch (\Exception $e) {
			$this->logger->warning('Could not read XMP metadata of file {file}: {message}', [
				'file' => $file->getName(),
				'message' => $e->getMessage(),
				'exception' => $e
			]);
			return null;
		}

		$metadata->setArray(PhotosphereViewerPlugin::METADATA_KEY, $xmpMeta->toArray());

		return $xmpMeta;
	}

	/**
	 * Same as {@see self::applyToMetadata()}, but for callers which are not
	 * already holding an IFilesMetadata instance tied to an event: fetches
	 * (or creates) the file's metadata and explicitly persists it. Used by
	 * the on-demand fallback ({@see \OCA\Files_PhotoSpheres\Service\StorageService})
	 * and by the {@see \OCA\Files_PhotoSpheres\Command\GenerateMetadataCommand}
	 * backfill command.
	 *
	 * @return XmpResultModel|null null if $file is not a jpeg, if it could not
	 *                             be read, or if it has no file id
	 */
	public function computeAndPersist(File $file): ?XmpResultModel {
		$id = $file->getId();
		if ($id === null) {
			return null;
		}

		$metadata = $this->filesMetadataManager->getMetadata($id, true);
		$xmpMeta = $this->applyToMetadata($file, $metadata);
		if ($xmpMeta !== null) {
			$this->filesMetadataManager->saveMetadata($metadata);
		}

		return $xmpMeta;
	}
}
