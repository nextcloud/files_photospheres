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
 * @copyright Robin Windey 2019
 */

namespace OCA\Files_PhotoSpheres\Service;

use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCP\Files\File;
use OCP\Files\Folder;

/**
 * class StorageService
 *
 * @package OCA\Files_PhotoSpheres\Service;
 */
class StorageService implements IStorageService {

	/**
	 *
	 * @var Folder
	 */
	private $userFolder;

	/**
	 *
	 * @var XmpMetadataStorage
	 */
	private $xmpMetadataStorage;

	/**
	 * Constructor
	 *
	 * @param Folder $userFolder
	 * @param XmpMetadataStorage $xmpMetadataStorage
	 */
	public function __construct(Folder $userFolder, XmpMetadataStorage $xmpMetadataStorage) {
		$this->userFolder = $userFolder;
		$this->xmpMetadataStorage = $xmpMetadataStorage;
	}

	/**
	 * Used both by the (legacy) ajax endpoint and, more importantly these
	 * days, by the frontend's on-demand fallback for files whose metadata
	 * wasn't pre-generated yet (see fileAction.js). The result is persisted
	 * through the files metadata store as a side effect, so that the next
	 * PROPFIND - and the next click - can be served from there instead of
	 * needing another on-demand read.
	 *
	 * @param int $fileId
	 * @return XmpResultModel
	 */
	public function getXmpData($fileId) : XmpResultModel {
		$arrFiles = $this->userFolder->getById($fileId);
		if (!isset($arrFiles[0])) {
			throw new \Exception('Could not locate node linked to ID: ' . $fileId);
		}

		$file = $arrFiles[0];
		if (!($file instanceof File)) {
			throw new \Exception('Node linked to ID ' . $fileId . ' is not a file');
		}

		// A null result (not a jpeg, or the file could not be read - already
		// logged by XmpMetadataStorage) is reported to the caller as "not a
		// photosphere" rather than an error, so the frontend can silently
		// fall back to the regular image viewer.
		return $this->xmpMetadataStorage->computeAndPersist($file) ?? new XmpResultModel();
	}
}
