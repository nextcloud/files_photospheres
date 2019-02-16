<?php
    /*
     * Javascript
     */
    $scripts = array(
        'D.min',
        'doT.min',
        'three.min',
        'uevent.min',
        'photo-sphere-viewer.min',
        'init'
    );
    script('photosphereviewer', $scripts);
    
    /*
     * CSS
     */
    $styles = array(
        'photo-sphere-viewer.min',
        'style'
    );
    style('photosphereviewer', $styles);
?>

<div id="app">
	<div id="app-content">
		<div id="app-content-wrapper">
                    
                    <!--This is the photosphere-container, used by the photo-sphere-viewer-JS-Lib -->
                    <div id="viewer"></div>
                    
		</div>
	</div>
</div>

