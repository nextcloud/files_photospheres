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

namespace OCA\Files_PhotoSpheres\Tests\Integration;

use OC\AppFramework\Bootstrap\Coordinator;
use OCA\Files_PhotoSpheres\AppInfo\Application;
use OCA\Files_PhotoSpheres\Service\IShareService;
use OCA\Files_PhotoSpheres\Service\IStorageService;
use OCA\Files_PhotoSpheres\Service\ShareService;
use OCA\Files_PhotoSpheres\Service\StorageService;
use OCP\App\IAppManager;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\AppFramework\IAppContainer;
use OCP\Files\Folder;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

class AppTest extends TestCase {
	/** @var IAppContainer */
	private $container;
	/** @var IAppManager */
	private $appManager;	

	public function setUp() : void {
		parent::setUp();
		$app = new App(Application::APP_NAME);
		$this->container = $app->getContainer();
		$this->appManager = $this->container->get(IAppManager::class);
	}

	public function testAppInstalled() {
		$this->assertTrue($this->appManager->isInstalled(Application::APP_NAME));
	}

	// TODO ::
	/**
	 * @dataProvider dataProvider_InterfaceToClassMappings
	 */
	/*public function testCanResolveClasses_AfterRegistration(string $interfaceName, string $className) {
		$this->runBootstrapRegistrations();
		$object = $this->container->get($interfaceName);
		$this->assertInstanceOf($className, $object);
	}

	public function dataProvider_InterfaceToClassMappings(){
		$arr = [
			[ IStorageService::class, StorageService::class ],
			[ IShareService::class, ShareService::class ]
		];
		return $arr;
	}

	private function runBootstrapRegistrations() {
		$bootstrapCoordinator = $this->container->get(Coordinator::class);
		
		// HACK:: reset registrations and simulate request start
		$reflectionClass = new ReflectionClass(Coordinator::class);
		$regContextProp = $reflectionClass->getProperty('registrationContext');
		$regContextProp->setAccessible(true);
		$regContextProp->setValue($bootstrapCoordinator, null);
		
		$bootstrapCoordinator->runRegistration();

		// Register some faked environment dependencies
		/** @var IRegistrationContext */
		/*$ctx = $this->container->get(IRegistrationContext::class);
		
		$ctx->registerService(Folder::class, function(){
			return $this->createMock(Folder::class);;
		});

	}*/
}
