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
     * Shows a (translated) notify message and hides it after 5s
     * @param {string|array} message(s) (could have a translation each)
     * @returns {void}
     */
    notify: function (message) {
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

        var notifyRow = OC.Notification.show(tmpMessage);
        setTimeout(function () {
            OC.Notification.hide(notifyRow);
        }, 5000);
    },

    /*
     * Parses the xmp-data from the url-string-object
     * into an valid JSON-object
     * @param {URLSearchParams} urlSearchParams
     * @returns {object} JSON object
     */
    getXmpDataFromUrlParams: function (urlSearchParams) {
        var xmpData = {};

        var fullWidth = urlSearchParams.get('full_width');
        if (fullWidth) {
            xmpData.full_width = fullWidth;
        }

        var fullHeight = urlSearchParams.get('full_height');
        if (fullHeight) {
            xmpData.full_height = fullHeight;
        }

        var croppedWidth = urlSearchParams.get('cropped_width');
        if (croppedWidth) {
            xmpData.cropped_width = croppedWidth;
        }

        var croppedHeight = urlSearchParams.get('cropped_height');
        if (croppedHeight) {
            xmpData.cropped_height = croppedHeight;
        }

        var croppedX = urlSearchParams.get('cropped_x');
        if (croppedX) {
            xmpData.cropped_x = croppedX;
        }

        var croppedY = urlSearchParams.get('cropped_y');
        if (croppedY) {
            xmpData.cropped_y = croppedY;
        }

        if (Object.keys(xmpData).length === 0) {
            return null;
        }

        return xmpData;
    },

    isEmpty: function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}

