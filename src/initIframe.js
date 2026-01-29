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
 * Initializes the viewer-component with a given photospere-image-configuration
 */

import { Viewer, ViewerConfig } from '@photo-sphere-viewer/core';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { StereoPlugin } from '@photo-sphere-viewer/stereo-plugin';

class PhotoSphereViewerRenderer {
    /**
     * 
     * @param {ViewerConfig} configObject 
     * @param {boolean} hideDownload 
     * @param {boolean} hideCloseButton 
     */
    render(configObject, hideDownload, hideCloseButton) {
        const navbarButtons = [
            'autorotate',
            'zoom',
            'move',
            'download',
            'description',
            'caption',
            'fullscreen',
            'stereo',
            'gyroscope'
        ];

        if (hideDownload) {
            navbarButtons.splice(navbarButtons.indexOf('download'), 1)
        }

        /** @var ViewerConfig */
        const defaults = {
            container: document.querySelector('#viewer'),
            // Fix iframe problem on Safari #32
            withCredentials: true,
            plugins: [
                GyroscopePlugin,
                StereoPlugin,
                AutorotatePlugin.withConfig({
                    autostartOnIdle: false,
                    autostartDelay: null,
                }),
            ],
            navbar: navbarButtons
        };

        // Merge with defaults
        Object.assign(configObject, defaults);

        if (!hideCloseButton) {
            // Add close button to iframe
            var closeBtn = '<button id="close-photosphere-viewer" class="icon-close" title="Close"></button>';
            document.querySelector('#viewer').insertAdjacentHTML('beforeend', closeBtn);

            document.querySelector('#close-photosphere-viewer').onclick = function () {
                window.top.postMessage('closePhotosphereViewer', '*');
            };
        }

        const viewer = new Viewer(configObject);
        window.photoSphereViewer = viewer;
    }
}

// Expose the renderer for the viewer to our parent
window.photoSphereViewerRenderer = new PhotoSphereViewerRenderer();
