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
use OCA\Files_PhotoSpheres\Controller\SharefilesController;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Service\IShareService;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class SharefilesControllerTest extends TestCase {

	/** @var IRequest|MockObject */
	private $request;
	/** @var IShareService|MockObject */
	private $shareService;
	/** @var SharefilesController|MockObject */
	private $controller;
	/** @var LoggerInterface|MockObject */
	private $logger;

	public function setUp() : void {
		parent::setUp();

		/** @var IRequest|MockObject */
		$this->request = $this->createMock(IRequest::class);
		/** @var IShareService|MockObject */
		$this->shareService = $this->createMock(IShareService::class);
		/** @var LoggerInterface|MockObject */
		$this->logger = $this->createMock(LoggerInterface::class);

		$this->controller = new SharefilesController(
			Application::APP_NAME,
			$this->request,
			$this->shareService,
			$this->logger
		);
	}

	public function testCallsShareServiceGetXmpData() {
		$shareToken = 'myToken';
		$path = '/user/files/mypath';
		$filename = 'myfile.pdf';
		$result = new XmpResultModel();

		$this->shareService->expects($this->once())
			->method('getXmpData')
			->with($shareToken, $filename, $path)
			->willReturn($result);

		/** @var JSONResponse */
		$controllerResult = $this->controller->getXmpData($shareToken, $filename, $path);
		$data = $controllerResult->getData();
		
		$this->assertEquals($result, $data['data']);
		$this->assertTrue($data['success']);
	}

	public function testExceptionCatched() {
		$ex = new Exception('someMessage');
		$this->shareService->expects($this->once())
			->method('getXmpData')
			->willThrowException($ex);
		
		/** @var JSONResponse */
		$controllerResult = $this->controller->getXmpData('token');
		$data = $controllerResult->getData();

		$this->assertEquals($ex->getMessage(), $data['message']);
		$this->assertFalse($data['success']);
	}

	public function testGetXmpDataSetsIncognitoMode() {
		$this->controller->getXmpData('token');

		$this->assertFalse(\OC_User::isIncognitoMode());
	}
}
