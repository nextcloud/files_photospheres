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

    /**
     * Shows a (translated) notify message and hides it after 7s
     * @param {string|array} message(s) (could have a translation each)
     * @param {string} type of the notification (e.g. 'error'). If none provided it will be the default.
     * @returns {void}
     */
    notify: function (message, type) {
        var tmpMessage = '';
        if (typeof message === "string") {
            tmpMessage = t('files_photospheres', message);
        } else if (typeof message === "object" && message.length) {
            for (var i = 0; i < message.length; i++) {
                tmpMessage += t('files_photospheres', message[i]);
            }
        } else {
            throw "Function 'notify' needs a message argument";
        }

        if (!type){
            OC.Notification.showTemporary(tmpMessage);
        }
        else{
            OC.Notification.showTemporary(tmpMessage, {type: type})
        }
    },

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
        var $loadingPanel = $('#photo-sphere-viewer-loader');
        if (!$loadingPanel.length){
            $loadingPanel = $('<div id="photo-sphere-viewer-loader"></div>').addClass('icon-loading');
            $('#app-content').after($loadingPanel);
        }
        $loadingPanel.toggleClass('hidden', !show);
    },

    isWebGl2Supported: function() {
        try{
            var canvas = document.createElement('canvas');
            return !! (window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        }
        catch(e){
            console.log('Error when trying to check WebGL support. (files_photospheres)');
            console.log(e);
            return false;
        }
    }
}

