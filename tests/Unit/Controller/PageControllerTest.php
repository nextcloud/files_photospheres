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

use OCA\Files_PhotoSpheres\AppInfo;
use PHPUnit\Framework\TestCase;
use OCP\AppFramework\Http\TemplateResponse;
use OCA\Files_PhotoSpheres\Controller\PageController;


class PageControllerTest extends TestCase {

	/** @var PageController */
	private $controller;

	public function setUp() {
		$request = $this->getMockBuilder('OCP\IRequest')->getMock();
		$urlGenerator = $this->getMockBuilder('OCP\IURLGenerator')->getMock();

		$this->controller = new PageController(
                    AppInfo\Application::APP_NAME, $request, $urlGenerator
		);
	}

	public function testImage() {
		$result = $this->controller->image();

		$this->assertEquals('image', $result->getTemplateName());
		$this->assertTrue($result instanceof TemplateResponse);
	}

	public function testVideo() {
			$result = $this->controller->video();

			$this->assertEquals('video', $result->getTemplateName());
			$this->assertTrue($result instanceof TemplateResponse);
	}
}
