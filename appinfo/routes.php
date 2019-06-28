<?php

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\Files_PhotoSpheres\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
return [
    'routes' => [
        // Controllers
        ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
        ['name' => 'userfiles#get_xmp_data', 'url' => '/userfiles/xmpdata/{fileId}', 'verb' => 'GET'],
        ['name' => 'sharefiles#get_xmp_data', 'url' => '/sharefiles/xmpdata/{shareToken}', 'verb' => 'GET'],
    ]
];
