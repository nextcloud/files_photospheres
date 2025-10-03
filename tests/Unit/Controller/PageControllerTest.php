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
use OCP\IRequest;
use OCP\IURLGenerator;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class PageControllerTest extends TestCase {

	/** @var IRequest|MockObject */
	private $request;
	/** @var IURLGenerator|MockObject */
	private $urlGenerator;
	/** @var IAppManager|MockObject */
	private $appManager;
	/** @var PageController */
	private $controller;

	public function setUp() : void {
		parent::setUp();

		/** @var IRequest|MockObject */
		$this->request = $this->getMockBuilder(IRequest::class)->getMock();
		/** @var IURLGenerator|MockObject */
		$this->urlGenerator = $this->getMockBuilder(IURLGenerator::class)->getMock();
		/** @var IAppManager|MockObject */
		$this->appManager = $this->createMock(IAppManager::class);

		$this->controller = new PageController(
			AppInfo\Application::APP_NAME,
			$this->request,
			$this->urlGenerator,
			$this->appManager
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

		$csp = $result->getContentSecurityPolicy();
		$cspString = $csp->buildPolicy();
		$this->assertStringContainsString('unsafe-eval', $cspString);

		/** @var array */
		$params = $result->getParams();
		$this->assertEquals($this->urlGenerator, $params['urlGenerator']);
		$this->assertEquals($appVersion, $params['appVersion']);
		$this->assertTrue($params['nounceManager'] instanceof ContentSecurityPolicyNonceManager);
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

		$csp = $result->getContentSecurityPolicy();
		$cspString = $csp->buildPolicy();
		$this->assertStringNotContainsString('unsafe-eval', $cspString);

		/** @var array */
		$params = $result->getParams();
		$this->assertEquals($this->urlGenerator, $params['urlGenerator']);
		$this->assertEquals($appVersion, $params['appVersion']);
		$this->assertTrue($params['nounceManager'] instanceof ContentSecurityPolicyNonceManager);
	}

	public function testReturnsNullOnInvalidPage() {
		$showPageMethod = new ReflectionMethod(PageController::class, 'showPage');
		$showPageMethod->setAccessible(true);
		$response = $showPageMethod->invoke($this->controller, 'someInvalidPage');
		$this->assertNull($response);
	}
}
