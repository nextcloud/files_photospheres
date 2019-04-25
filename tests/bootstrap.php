<?php

use OCA\Files_PhotoSpheres\AppInfo;

if (!defined('PHPUNIT_RUN')) {
    define('PHPUNIT_RUN', 1);
}

require_once __DIR__.'/../../../lib/base.php';

// Fix for "Autoload path not allowed: .../tests/lib/testcase.php"
\OC::$loader->addValidRoot(OC::$SERVERROOT . '/tests');

// Fix for "Autoload path not allowed: .../files_photospheres/tests/testcase.php"
\OC_App::loadApp(AppInfo\Application::APP_NAME);

if(!class_exists('PHPUnit\Framework\TestCase')) {
    require_once('PHPUnit/Autoload.php');
}

OC_Hook::clear();
