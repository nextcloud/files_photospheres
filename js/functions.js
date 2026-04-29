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
 * Collection of various functions
 */

var PhotosphereViewerFunctions = {

    /*
     * Parses the xmp-data from the url-string-object
     * into an valid JSON-object
     * @param {URLSearchParams} urlSearchParams
     * @returns {object} JSON object
     */
    getXmpDataFromUrlParams: function (urlSearchParams) {
        var xmpData = {};

        var fullWidth = urlSearchParams.get('fullWidth');
        if (fullWidth) {
            xmpData.full_width = fullWidth;
        }

        var fullHeight = urlSearchParams.get('fullHeight');
        if (fullHeight) {
            xmpData.full_height = fullHeight;
        }

        var croppedWidth = urlSearchParams.get('croppedWidth');
        if (croppedWidth) {
            xmpData.cropped_width = croppedWidth;
        }

        var croppedHeight = urlSearchParams.get('croppedHeight');
        if (croppedHeight) {
            xmpData.cropped_height = croppedHeight;
        }

        var croppedX = urlSearchParams.get('croppedX');
        if (croppedX) {
            xmpData.cropped_x = croppedX;
        }

        var croppedY = urlSearchParams.get('croppedY');
        if (croppedY) {
            xmpData.cropped_y = croppedY;
        }

        return xmpData;
    },

    isEmpty: function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },

    showLoader: function(show) {
        var loadingPanel = document.getElementById('photo-sphere-viewer-loader');
        if (!loadingPanel){
            loadingPanel = document.createElement('div');
            loadingPanel.id = 'photo-sphere-viewer-loader';
            loadingPanel.classList.add('icon-loading');
            document.getElementById('app-content')?.after(loadingPanel);
        }
        loadingPanel.classList.toggle('hidden', !show);
    },

    isWebGl2Supported: function() {
        try{
            var canvas = document.createElement('canvas');
            return !! (window.WebGL2RenderingContext && canvas.getContext('webgl2') || window.WebGLRenderingContext && canvas.getContext('webgl'));
        }
        catch(e){
            console.log('Error when trying to check WebGL support. (files_photospheres)');
            console.log(e);
            return false;
        }
    }
}

