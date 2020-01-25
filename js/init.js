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
            container: 'viewer',
            time_anim: false,
            usexmpdata: false,
            // Fix iframe problem on Safari #32
            with_credentials: true
        };

        // Merge with defaults
        Object.assign(configObject, defaults);

        const viewer = new PhotoSphereViewer(configObject);
        window.photoSphereViewer = viewer;
    }
}

// Expose the renderer for the viewer to our parent
window.photoSphereViewerRenderer = new PhotoSphereViewerRenderer();
