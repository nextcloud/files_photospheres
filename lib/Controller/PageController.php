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

use OC\Security\CSP\ContentSecurityPolicyNonceManager;
use OCA\Files_PhotoSpheres\AppInfo;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IURLGenerator;

/**
 * class PageController
 *
 * @package OCA\Files_PhotoSpheres\Controller
 */
class PageController extends Controller {

	public function __construct(
		private IURLGenerator $urlGenerator,
		private IAppManager $appManager,
		private ContentSecurityPolicyNonceManager $nonceManager,
	) {
	}

	/**
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function image() {
		return $this->showPage('image');
	}

	/**
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function video() {
		return $this->showPage('video');
	}

	private function showPage(string $type) {
		$params = [
			'urlGenerator' => $this->urlGenerator,
			'appVersion' => $this->appManager->getAppVersion(AppInfo\Application::APP_NAME),
			'nounceManager' => $this->nonceManager
		];
		switch ($type) {
			case 'image':
				$response = new TemplateResponse(AppInfo\Application::APP_NAME, 'viewer', $params, 'blank');  // templates/viewer.php
				break;
			case 'video':
				$response = new TemplateResponse(AppInfo\Application::APP_NAME, 'viewer_video', $params, 'blank');  // templates/viewer_video.php
				break;
			default: return null;
		}

		return $response;
	}
}
