<?php

require_once __DIR__ . '/../../../tests/bootstrap.php';

// Fix for "Autoload path not allowed: .../tests/lib/testcase.php"
\OC::$loader->addValidRoot(OC::$SERVERROOT . '/tests');

if (!class_exists('PHPUnit\Framework\TestCase')) {
	require_once('PHPUnit/Autoload.php');
}

// Fix for "Autoload path not allowed: .../files_photospheres/tests/testcase.php"
\OC_App::loadApp('files_photospheres');

OC_Hook::clear();
