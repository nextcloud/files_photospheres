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

namespace OCA\Files_PhotoSpheres\AppInfo;

use OCA\Files\Event\LoadAdditionalScriptsEvent;
use OCA\Files_PhotoSpheres\Listener\AddScriptsAndStylesListener;
use OCP\AppFramework\App;
use OCA\Files_PhotoSpheres\Service\IStorageService;
use OCA\Files_PhotoSpheres\Service\StorageService;
use OCA\Files_PhotoSpheres\Service\IShareService;
use OCA\Files_PhotoSpheres\Service\ShareService;
use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCA\Files_PhotoSpheres\Service\Helper\XmpDataReader;
use OCA\Files_Sharing\Event\BeforeTemplateRenderedEvent;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;

/**
 * class Application
 *
 * @package OCA\Files_PhotoSpheres\AppInfo
 */
class Application extends App implements IBootstrap {
	public const APP_NAME = 'files_photospheres';

	public function __construct(array $urlParams = []) {
		parent::__construct(self::APP_NAME, $urlParams);
	}

	/**
	 * @inheritdoc
	 */
	public function register(IRegistrationContext $context): void {
		$context->registerServiceAlias(IStorageService::class, StorageService::class);
		$context->registerServiceAlias(IShareService::class, ShareService::class);
		$context->registerServiceAlias(IXmpDataReader::class, XmpDataReader::class);

		$context->registerEventListener(LoadAdditionalScriptsEvent::class, AddScriptsAndStylesListener::class);
		$context->registerEventListener(BeforeTemplateRenderedEvent::class, AddScriptsAndStylesListener::class);
	}

	/**
	 * @inheritdoc
	 */
	public function boot(IBootContext $context): void {

	}
}
