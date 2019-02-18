<?php
/**
 * Nextcloud - PhotoSphereViewer
 *
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Robin Windey <ro.windey@gmail.com>
 *
 * @copyright Robin Windey 2019
 */

namespace OCA\PhotoSphereViewer\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;

/**
 * class PageController
 *
 * @package OCA\PhotoSphereViewer\Controller
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
		$response = new TemplateResponse('photosphereviewer', 'index');  // templates/index.php
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
