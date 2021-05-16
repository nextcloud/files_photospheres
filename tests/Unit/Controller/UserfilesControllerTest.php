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
 * @copyright Robin Windey 2020
 */

namespace OCA\Files_PhotoSpheres\Tests\Unit\Controller;

use Exception;
use OCA\Files_PhotoSpheres\AppInfo\Application;
use OCA\Files_PhotoSpheres\Controller\UserfilesController;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Service\IStorageService;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class UserfilesControllerTest extends TestCase {

	/** @var IRequest|MockObject */
	private $request;
	/** @var IStorageService|MockObject */
	private $storageService;
	/** @var UserfilesController|MockObject */
	private $controller;
	/** @var LoggerInterface|MockObject */
	private $logger;


	public function setUp() : void {
		parent::setUp();

		/** @var IRequest|MockObject */
		$this->request = $this->createMock(IRequest::class);
		/** @var IStorageService|MockObject */
		$this->storageService = $this->createMock(IStorageService::class);
		/** @var LoggerInterface|MockObject */
		$this->logger = $this->createMock(LoggerInterface::class);

		$this->controller = new UserfilesController(
			Application::APP_NAME,
			$this->request,
			$this->storageService,
			$this->logger
		);
	}

	public function testCallsShareServiceGetXmpData() {
		$fileId = 42;
		$result = new XmpResultModel();

		$this->storageService->expects($this->once())
			->method('getXmpData')
			->with($fileId)
			->willReturn($result);

		/** @var JSONResponse */
		$controllerResult = $this->controller->getXmpData($fileId);
		$data = $controllerResult->getData();
		
		$this->assertEquals($result, $data['data']);
		$this->assertTrue($data['success']);
	}

	public function testExceptionCatched() {
		$ex = new Exception('someMessage');
		$this->storageService->expects($this->once())
			->method('getXmpData')
			->willThrowException($ex);
		
		/** @var JSONResponse */
		$controllerResult = $this->controller->getXmpData(1234);
		$data = $controllerResult->getData();

		$this->assertEquals($ex->getMessage(), $data['message']);
		$this->assertFalse($data['success']);
	}
}
