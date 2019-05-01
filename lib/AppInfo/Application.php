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

use OCP\AppFramework\App;
use OCA\Files_PhotoSpheres\Service\IStorageService;
use OCA\Files_PhotoSpheres\Service\StorageService;

/**
 * class Application
 *
 * @package OCA\Files_PhotoSpheres\AppInfo
 */
class Application extends App {
    
        const APP_NAME = 'files_photospheres';
        
	public function __construct(array $urlParams = []) {
		parent::__construct(self::APP_NAME, $urlParams);
                $this->init();
        }
        
        private function init(){
            $this->registerHooks();
            $this->registerServices();
        }

        private function registerHooks(){
            $eventDispatcher = \OC::$server->getEventDispatcher();
            
            $eventDispatcher->addListener('OCA\Files::loadAdditionalScripts', function() {
              script(self::APP_NAME, 'fileAction'); 
              script(self::APP_NAME, 'functions');
              style(self::APP_NAME, 'style');
            });

            $eventDispatcher->addListener('OCA\Files_Sharing::loadAdditionalScripts', function() {
              Util::addScript(self::APP_NAME, 'fileAction'); 
              Util::addScript(self::APP_NAME, 'functions'); 
              Util::addStyle(self::APP_NAME, 'style');
            });
        }  
        
        private function registerServices(){
            $container = $this->getContainer();

            $container->registerService(IStorageService::class, function($c) {
                return new StorageService($c->query('ServerContainer')->getUserFolder());
            });

        }
}


