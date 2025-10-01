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
use OCP\AppFramework\IAppContainer;
use OCP\Files\Folder;
use PHPUnit\Framework\Attributes\DataProvider;
use Test\TestCase;

/**
 * @group DB
 */
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

	#[DataProvider('dataProvider_InterfaceToClassMappings')]
	public function testCanResolveClasses_AfterRegistration(string $interfaceName, string $className, bool $lazyInit) {
		$this->runBootstrapRegistrations($lazyInit);
		$object = $this->container->get($interfaceName);
		$this->assertInstanceOf($className, $object);
	}

	public static function dataProvider_InterfaceToClassMappings() {
		$arr = [
			[ IStorageService::class, StorageService::class, true ],
			[ IShareService::class, ShareService::class, true ],
			[ IStorageService::class, StorageService::class, false ],
			[ IShareService::class, ShareService::class, false ]
		];
		return $arr;
	}

	private function runBootstrapRegistrations(bool $lazyInit) {
		/** @var Coordinator */
		$bootstrapCoordinator = $this->container->get(Coordinator::class);

		$this->invokePrivate($bootstrapCoordinator, 'registrationContext', [null]);

		// Run registrations which build the DI container
		if ($lazyInit) {
			$bootstrapCoordinator->runLazyRegistration(Application::APP_NAME);
		} else {
			$bootstrapCoordinator->runInitialRegistration();
		}

		// TODO :: use NC20 compliant method for registering fakes in app-container (IRegistrationContext does not exist for tests)
		// Register some faked environment dependencies
		$this->container->registerService(Folder::class, function (IAppContainer $container) {
			return $this->createMock(Folder::class);
		});
	}
}
