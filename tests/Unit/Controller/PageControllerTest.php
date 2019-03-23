<?php

namespace OCA\Files_PhotoSpheres\Tests\Unit\Controller;

use OCA\Files_PhotoSpheres\AppInfo;
use PHPUnit_Framework_TestCase;
use OCP\AppFramework\Http\TemplateResponse;
use OCA\Files_PhotoSpheres\Controller\PageController;


class PageControllerTest extends PHPUnit_Framework_TestCase {
	private $controller;
	private $userId = 'john';

	public function setUp() {
		$request = $this->getMockBuilder('OCP\IRequest')->getMock();

		$this->controller = new PageController(
                    AppInfo\Application::APP_NAME, $request, $this->userId
		);
	}

	public function testIndex() {
		$result = $this->controller->index();

		$this->assertEquals('index', $result->getTemplateName());
		$this->assertTrue($result instanceof TemplateResponse);
	}

}
