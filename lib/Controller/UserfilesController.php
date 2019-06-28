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

namespace OCA\Files_PhotoSpheres\Controller;

use OCA\Files_PhotoSpheres\Service\IStorageService;
use OCP\AppFramework\Controller;
use OCP\IRequest;
use OCP\AppFramework\Http\JSONResponse;

/**
 * class UserfilesController
 *
 * @package OCA\Files_PhotoSpheres\Controller;
 */
class UserfilesController extends Controller {

    /**
     *
     * @var int
     */
    private $userId;

    /**
     * @var IStorageService
     */
    private $storageService;

    public function __construct(
    $AppName, IRequest $request, IStorageService $storageService, $UserId) {

        parent::__construct($AppName, $request);

        $this->userId = $UserId;
        $this->storageService = $storageService;
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     * @param int $fileId The fileId of the file from which the xmp-data shall be loaded
     * @return \OCP\AppFramework\Http\JSONResponse
     */
    public function getXmpData($fileId): JSONResponse {
        try {
            $xmpData = $this->storageService->getXmpData($fileId);
            return new JSONResponse(
                    [
                'data' => $xmpData,
                'success' => true
            ]);
        } catch (\Exception $e) {
            return new JSONResponse(
                    [
                'message' => $e->getMessage(),
                'success' => false
            ]);
        }
    }
}
