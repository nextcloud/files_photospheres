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

use OCA\Files_PhotoSpheres\Service\IShareService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use Psr\Log\LoggerInterface;

/**
 * class SharefilesController
 *
 * @package OCA\Files_PhotoSpheres\Controller;
 */
class SharefilesController extends Controller {

	/** @var IShareService */
	private $shareService;

	/** @var LoggerInterface */
	private $logger;

	public function __construct($appName, IRequest $request, IShareService $shareService, LoggerInterface $logger) {
		parent::__construct($appName, $request);

		$this->shareService = $shareService;
		$this->logger = $logger;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $shareToken the token of the public share
	 * @param string $filename the filename (if we're dealing with a directory share)
	 * @param string $path the directory path, where the file is stored in (if we're dealing with a directory share)
	 * @return \OCP\AppFramework\Http\JSONResponse
	 */
	public function getXmpData($shareToken, $filename = '', $path = ''): JSONResponse {
		try {
			$this->logger->info("Reading XMP data for shared file with token $shareToken, filename: $filename, path: $path");
			$xmpData = $this->shareService->getXmpData($shareToken, $filename, $path);
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
