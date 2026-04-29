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

namespace OCA\Files_PhotoSpheres\Tests\Unit\Controller;

use OC\Security\CSP\ContentSecurityPolicyNonceManager;
use OCA\Files_PhotoSpheres\AppInfo;
use OCA\Files_PhotoSpheres\Controller\PageController;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IURLGenerator;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class PageControllerTest extends TestCase {

	/** @var IURLGenerator|MockObject */
	private $urlGenerator;
	/** @var IAppManager|MockObject */
	private $appManager;
	/** @var ContentSecurityPolicyNonceManager|MockObject */
	private $nonceManager;
	/** @var PageController */
	private $controller;

	public function setUp() : void {
		parent::setUp();

		/** @var IURLGenerator|MockObject */
		$this->urlGenerator = $this->getMockBuilder(IURLGenerator::class)->getMock();
		/** @var IAppManager|MockObject */
		$this->appManager = $this->createMock(IAppManager::class);
		/** @var ContentSecurityPolicyNonceManager|MockObject */
		$this->nonceManager = $this->createMock(ContentSecurityPolicyNonceManager::class);

		$this->controller = new PageController(
			$this->urlGenerator,
			$this->appManager,
			$this->nonceManager
		);
	}

	public function testShowsImageView() {
		$appVersion = '19.0.1';
		$this->appManager->expects($this->once())
			->method('getAppVersion')
			->willReturn($appVersion);

		$result = $this->controller->image();

		$this->assertTrue($result instanceof TemplateResponse);
		$this->assertEquals('viewer', $result->getTemplateName());
		$this->assertEquals('blank', $result->getRenderAs());

		/** @var array */
		$params = $result->getParams();
		$this->assertEquals($this->urlGenerator, $params['urlGenerator']);
		$this->assertEquals($appVersion, $params['appVersion']);
		$this->assertEquals($this->nonceManager, $params['nounceManager']);
	}

	public function testShowsVideoView() {
		$appVersion = '19.0.1';
		$this->appManager->expects($this->once())
			->method('getAppVersion')
			->willReturn($appVersion);

		$result = $this->controller->video();

		$this->assertTrue($result instanceof TemplateResponse);
		$this->assertEquals('viewer_video', $result->getTemplateName());
		$this->assertEquals('blank', $result->getRenderAs());

		/** @var array */
		$params = $result->getParams();
		$this->assertEquals($this->urlGenerator, $params['urlGenerator']);
		$this->assertEquals($appVersion, $params['appVersion']);
		$this->assertEquals($this->nonceManager, $params['nounceManager']);
	}

	public function testReturnsNullOnInvalidPage() {
		$showPageMethod = new ReflectionMethod(PageController::class, 'showPage');
		$showPageMethod->setAccessible(true);
		$response = $showPageMethod->invoke($this->controller, 'someInvalidPage');
		$this->assertNull($response);
	}
}
