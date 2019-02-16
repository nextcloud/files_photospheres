<?php

namespace OCA\PhotoSphereViewer\AppInfo;

use OCP\AppFramework\App;
use OCP\Util;

class Application extends App {
    
	public function __construct(array $urlParams = []) {
		parent::__construct('photosphereviewer', $urlParams);
        }
        
        public function init(){
            $this->registerHooks();
           // $this->initMenue();
        }
        
        private function initMenue(){
            /**
            * Menu entry
            */
            $c = $this->getContainer();
            $c->query('OCP\INavigationManager')
              ->add(
                     function () use ($c, $appName) {
                             $urlGenerator = $c->query('OCP\IURLGenerator');
                             //$l10n = $c->query('OCP\IL10N');

                             return [
                                     'id'    => $appName,

                                     // Sorting weight for the navigation. The higher the number, the higher
                                     // will it be listed in the navigation
                                     'order' => 3,

                                     // The route that will be shown on startup when called from within the GUI
                                     // Public links are using another route, see appinfo/routes.php
                                     //'href'  => $urlGenerator->linkToRoute($appName . '.page.index'),

                                     // The icon that will be shown in the navigation
                                     // This file needs to exist in img/
                                     'icon'  => $urlGenerator->imagePath($appName, 'app.svg'),

                                     // The title of the application. This will be used in the
                                     // navigation or on the settings page
                                     //'name'  => $l10n->t('PhotoSphereViewer')
                             ];
                     }
             );
        }

        private function registerHooks(){
            \OC::$server->getEventDispatcher()->addListener('OCA\Files::loadAdditionalScripts', $this->loadGlobalScripts());
            //\OC::$server->getEventDispatcher()->addListener('OCA\Files_Sharing::loadAdditionalScripts', $this->loadGlobalScripts());
        }
        
        private function loadGlobalScripts(){
            $appName = $this->getContainer()->query('AppName');
            Util::addScript($appName, 'fileAction');
        }
        
}


