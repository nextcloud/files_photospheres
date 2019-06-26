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

use \OCA\Files_PhotoSpheres\Service\IShareService;
use OCP\AppFramework\Controller;
use OCP\IRequest;
use OCP\AppFramework\Http\JSONResponse;

/**
 * class SharefilesController
 *
 * @package OCA\Files_PhotoSpheres\Controller;
 */
class SharefilesController extends Controller {

    /**
     * @var IShareService
     */
    private $shareService;

    public function __construct($appName, IRequest $request, IShareService $shareService) {

        parent::__construct($appName, $request);

        $this->shareService = $shareService;
    }

    /**
     * @PublicPage
     * @NoCSRFRequired
     * 
     * @param string $shareToken the token of the public share
     * @return \OCP\AppFramework\Http\JSONResponse
     */
    public function getXmpData($shareToken): JSONResponse {
        \OC_User::setIncognitoMode(true);

        try {
            $xmpData = $this->shareService->getXmpData($shareToken);
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
