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
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;

/**
 * class PageController
 *
 * @package OCA\Files_PhotoSpheres\Controller
 */
class PageController extends Controller {
	
	/** @var IURLGenerator */
	private $urlGenerator;
	/** @var IAppManager */
	private $appManager;

	public function __construct($AppName, IRequest $request, IURLGenerator $urlGenerator, IAppManager $appManager) {
		parent::__construct($AppName, $request);
		$this->urlGenerator = $urlGenerator;
		$this->appManager = $appManager;
	}

	/**
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function image() {
		return $this->showPage("image");
	}

	/**
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function video() {
		return $this->showPage("video");
	}

	private function showPage(string $type) {
		$params = [
			'urlGenerator' => $this->urlGenerator,
			'appVersion' => $this->appManager->getAppVersion(AppInfo\Application::APP_NAME),
			'nounceManager' => \OC::$server->getContentSecurityPolicyNonceManager()
		];
		switch ($type) {
			case "image":
				$response = new TemplateResponse(AppInfo\Application::APP_NAME, 'viewer', $params, 'blank');  // templates/viewer.php
				$this->setContentSecurityPolicy($response);
				break;
			case "video":
				$response = new TemplateResponse(AppInfo\Application::APP_NAME, 'viewer_video', $params, 'blank');  // templates/viewer_video.php
				break;
			default: return null;
		}
		
		return $response;
	}
		
	/**
	 *
	 * @param TemplateResponse $response
	 */
	private function setContentSecurityPolicy($response) {
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
