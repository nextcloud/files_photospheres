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

class PhotoSphereViewerRenderer {
    render(configObject) {
        const defaults = {
            container: document.querySelector('#viewer'),
            useXmpData: false,
            // Fix iframe problem on Safari #32
            withCredentials: true,
            plugins: [
                PhotoSphereViewer.GyroscopePlugin,
                PhotoSphereViewer.StereoPlugin,
                [PhotoSphereViewer.AutorotatePlugin, {
                    autostartOnIdle: false,
                    autostartDelay: null,
                }],
            ]
        };

        // Merge with defaults
        Object.assign(configObject, defaults);

        // Add close button to iframe
        var closeBtn = '<button id="close-photosphere-viewer" class="icon-close" title="Close"></button>';
        document.querySelector('#viewer').insertAdjacentHTML('beforeend', closeBtn);

        document.querySelector('#close-photosphere-viewer').onclick = function () {
            window.top.postMessage('closePhotosphereViewer', '*');
        };

        const viewer = new PhotoSphereViewer.Viewer(configObject);
        window.photoSphereViewer = viewer;
    }
}

// Expose the renderer for the viewer to our parent
window.photoSphereViewerRenderer = new PhotoSphereViewerRenderer();
