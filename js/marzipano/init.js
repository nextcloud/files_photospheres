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
 * 
 * Initializes the video-component with a given 360° video
 */

'use strict';

class PhotoSphereVideoRenderer {
    render(configObject) {
        threeSixtyVideo.play(configObject.url, function(err){
            console.log(err);
            if (!err){
                attribution(configObject.caption, '', '', 'topleft');
            }
        });
    }
}

// Expose the renderer for the viewer to our parent
window.photoSphereVideoRenderer = new PhotoSphereVideoRenderer();

