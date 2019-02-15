<?php

namespace OCA\PhotoSphereViewer\AppInfo;

use OCP\AppFramework\App;
use OCP\Util;

class Application extends App {
    
	public function __construct(array $urlParams = []) {
		parent::__construct('photosphereviewer', $urlParams);
        }
        
        public function registerHooks(){
            \OC::$server->getEventDispatcher()->addListener('OCA\Files::loadAdditionalScripts', $this->loadGlobalScripts());
        }
        
        private function loadGlobalScripts(){
            $appName = $this->getContainer()->query('AppName');
            Util::addScript($appName, 'fileAction');
        }
        
}


