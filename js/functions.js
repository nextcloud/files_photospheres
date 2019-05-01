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
    notify: function(message){
        var tmpMessage = '';
        if (typeof message === "string"){
            tmpMessage = t('files_photospheres', message);
        }
        else if (typeof message === "object" && message.length){
            for (var i = 0; i < message.length; i++) {
                tmpMessage += t('files_photospheres', message[i]);
            }
        }
        else{
            throw "Function 'notify' needs a message argument";
        }

        var notifyRow = OC.Notification.show(tmpMessage);
        setTimeout(function(){
            OC.Notification.hide(notifyRow);
        }, 5000);
    }
}

