<?php
/**
 * Nextcloud - PhotoSphereViewer
 *
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Robin Windey <ro.windey@gmail.com>
 *
 * @copyright Robin Windey 2019
 */

namespace OCA\PhotoSphereViewer\AppInfo;

use OCP\AppFramework\App;
use OCP\Util;

/**
 * class Application
 *
 * @package OCA\PhotoSphereViewer\AppInfo
 */
class Application extends App {
    
	public function __construct(array $urlParams = []) {
		parent::__construct('photosphereviewer', $urlParams);
        }
        
        public function init(){
            $this->registerHooks();
        }

        private function registerHooks(){
            \OC::$server->getEventDispatcher()->addListener('OCA\Files::loadAdditionalScripts', $this->loadGlobalScripts());
        }
        
        private function loadGlobalScripts(){
            $appName = $this->getContainer()->query('AppName');
            Util::addScript($appName, 'fileAction');
        }
        
}


