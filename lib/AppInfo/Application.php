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
use OCA\Files_PhotoSpheres\Listener\XmpMetadataListener;
use OCA\Files_PhotoSpheres\Service\Helper\IRegexMatcher;
use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCA\Files_PhotoSpheres\Service\Helper\RegexMatcher;
use OCA\Files_PhotoSpheres\Service\Helper\XmpDataReader;
use OCA\Files_PhotoSpheres\Service\IShareService;
use OCA\Files_PhotoSpheres\Service\IStorageService;
use OCA\Files_PhotoSpheres\Service\ShareService;
use OCA\Files_PhotoSpheres\Service\StorageService;
use OCA\Files_Sharing\Event\BeforeTemplateRenderedEvent;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\FilesMetadata\Event\MetadataLiveEvent;

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
		$context->registerServiceAlias(IRegexMatcher::class, RegexMatcher::class);
		$context->registerServiceAlias(IXmpDataReader::class, XmpDataReader::class);

		$context->registerEventListener(LoadAdditionalScriptsEvent::class, AddScriptsAndStylesListener::class);
		$context->registerEventListener(BeforeTemplateRenderedEvent::class, AddScriptsAndStylesListener::class);

		// Compute the XMP metadata ahead of time on upload/edit (see
		// XmpMetadataListener). This is a best-effort optimization: files
		// without pre-computed metadata are resolved on demand instead, see
		// UserfilesController::getXmpData() and
		// `occ files_photospheres:generate-metadata` for backfilling.
		$context->registerEventListener(MetadataLiveEvent::class, XmpMetadataListener::class);
	}

	/**
	 * @inheritdoc
	 */
	public function boot(IBootContext $context): void {
	}
}
