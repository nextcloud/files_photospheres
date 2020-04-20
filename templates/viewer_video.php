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
        <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui" />
        <style>@-ms-viewport { width: device-width; }</style>

        <link rel="stylesheet" href="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'css/marzipano/reset.css')) ?>?v=<?php p($version) ?>"/>
        <link rel="stylesheet" href="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'css/marzipano/style.css')) ?>?v=<?php p($version) ?>"/>
    </head>

    <body id="body-public">
    <div id="pano"></div>
        <div class="video-controls" id="video-controls">
        <div class="control-btn play" id="play-pause">
            <img class="play-icon" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'img/play.png')) ?>">
            <img class="pause-icon" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'img/pause.png')) ?>">
        </div>
        <div class="control-btn sound" id="mute">
            <img class="sound-on" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'img/sound-on.png')) ?>">
            <img class="sound-off" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'img/sound-off.png')) ?>">
        </div>
        <div class="time">
            <h5 class="initial-time" id="current-time-indicator"></h5>
            <div class="progress-wrapper" id="progress-background">
            <div class="progress-bar">
                <span class="progress-fill" id="progress-fill"></span>
            </div>
            </div>
            <h5 class="end-time" id="duration-indicator"></h5>
        </div>
        <div class="control-btn options" id="toggle-options">
            <img class="options icon" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'img/options.png')) ?>">
        </div>
        </div>
        <div class="options-modal">
        <label>Effect:
        <select id="effect">
            <option value="none">None</option>
            <option value="desaturate">Desaturate</option>
            <option value="saturate">Saturate</option>
            <option value="lighten">Lighten</option>
            <option value="darken">Darken</option>
            <option value="sepia">Sepia</option>
        </select>
        </label>
        </div>

        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/es5-shim.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/eventShim.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/requestAnimationFrame.js')) ?>?v=<?php p($version) ?>"></script>

        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/marzipano.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/VideoAsset.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/EventEmitter.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/EventEmitterProxy.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/NullVideoElementWrapper.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/CanvasHackVideoElementWrapper.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/loadVideoInSync.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/multiResVideo.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/colorEffects.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/interface.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/attribution.js')) ?>?v=<?php p($version) ?>"></script>
        <script nonce="<?php p($nounceManager->getNonce()) ?>" src="<?php p($urlGenerator->linkTo(AppInfo\Application::APP_NAME, 'js/marzipano/init.js')) ?>?v=<?php p($version) ?>"></script>
    </body>
</html>