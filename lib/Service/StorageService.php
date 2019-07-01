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

use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use \OCP\Files\Folder;

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
     * @var IXmpDataReader
     */
    private $xmpDataReader;

    /**
     * Constructor 
     * 
     * @param Folder $userFolder
     * @param IXmpDataReader $xmpDataReader
     */
    public function __construct(Folder $userFolder, IXmpDataReader $xmpDataReader) {
        $this->userFolder = $userFolder;
        $this->xmpDataReader = $xmpDataReader;
    }

    /**
     * 
     * @param int $fileId
     * @return array
     */
    public function getXmpData($fileId) : array {
        $arrFiles = $this->userFolder->getById($fileId);
        if (!isset($arrFiles[0])) {
            throw new \Exception('Could not locate node linked to ID: ' . $fileId);
        }

        $file = $arrFiles[0];

        return $this->xmpDataReader->readXmpDataFromFileObject($file);
    }
}
