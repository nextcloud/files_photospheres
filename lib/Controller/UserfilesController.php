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
use Psr\Log\LoggerInterface;

/**
 * class UserfilesController
 *
 * @package OCA\Files_PhotoSpheres\Controller;
 */
class UserfilesController extends Controller {

	/** @var IStorageService */
	private $storageService;

	/** @var LoggerInterface */
	private $logger;

	public function __construct($AppName, IRequest $request, IStorageService $storageService, LoggerInterface $logger) {
		parent::__construct($AppName, $request);

		$this->storageService = $storageService;
		$this->logger = $logger;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @param int $fileId The fileId of the file from which the xmp-data shall be loaded
	 * @return \OCP\AppFramework\Http\JSONResponse
	 */
	public function getXmpData($fileId): JSONResponse {
		try {
			$this->logger->info("Reading XMP data for file id $fileId");
			$xmpData = $this->storageService->getXmpData($fileId);
			return new JSONResponse(
					[
						'data' => $xmpData,
						'success' => true
					]);
		} catch (\Exception $e) {
			$this->logger->error($e->getMessage(), ['exception' => $e]);
			return new JSONResponse(
					[
						'message' => $e->getMessage(),
						'success' => false
					]);
		}
	}
}
