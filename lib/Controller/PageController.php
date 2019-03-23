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

use OCA\Files_PhotoSpheres\AppInfo;
use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;

/**
 * class PageController
 *
 * @package OCA\Files_PhotoSpheres\Controller
 */
class PageController extends Controller {
	private $userId;

	public function __construct($AppName, IRequest $request, $UserId){
		parent::__construct($AppName, $request);
		$this->userId = $UserId;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		$response = new TemplateResponse(AppInfo\Application::APP_NAME, 'index');  // templates/index.php
                $this->setContentSecurityPolicy($response);  
                return $response;
        }
        
        /**
         * 
         * @param TemplateResponse $response
         */
        private function setContentSecurityPolicy($response){
                /*
                 * Fix: Nextcloud >= 15 does not allow
                 * the Javascript 'eval'-function, which
                 * is internally needed in 'doT.min.js'
                 */
                $csp = new ContentSecurityPolicy();
                $csp->allowEvalScript();
                $response->setContentSecurityPolicy($csp);
        }

}
