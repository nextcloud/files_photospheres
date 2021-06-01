<?php
	use OCA\Files_PhotoSpheres\AppInfo;

	$urlGenerator = $_['urlGenerator'];
	$version = $_['appVersion'];
	$nounceManager = $_['nounceManager'];
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
        <link rel="stylesheet" href="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'css/viewer.css')) ?>?v=<?php p($version) ?>"/>
        <link rel="stylesheet" href="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'css/photo-sphere-viewer.min.css')) ?>?v=<?php p($version) ?>"/>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/three.min.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/browser.min.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/photo-sphere-viewer.min.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/init.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/functions.js')) ?>?v=<?php p($version) ?>"></script>
    </head>
    <body id="body-public">
        <div id="viewer"></div>
    </body>
</html>
