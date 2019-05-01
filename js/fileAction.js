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
 * Injected via the OCA\Files::loadAdditionalScripts-callback.
 * Used to hook into the actionhandler for images.
 */
(function ($, OC, OCA, oc_requesttoken) {
	"use strict";
	var photoSphereViewerFileAction = {
            /*
             * Holds the "old" action for an
             * image-click (e.g. gallery)
             */
            _oldActionHandler: null,
       
            /*
             * Actionhandler for image-click
             */
            _actionHandler: function (filename, context){
                this.canShow(filename, context, function(canShowImage, xmpDataObject){
                   if (canShowImage){
                        this.showImage(filename, context);
                    }
                    else if (typeof(this._oldActionHandler) === 'function'){
                        this._oldActionHandler(filename, context);
                    }  
                }.bind(this));
                 
            },
            
            /*
             * Default action
             */
            _getAction: function(){
                return {
                    actionHandler : this._actionHandler,
                    displayName : "View in PhotoSphereViewer",
                    icon : "",
                    mime : "image/jpeg",
                    name : "View",
                    permissions : 1,
                    order: -1
                };
            },
            
            /*
             * Generates the url and jumps
             * to the photosphere app
             */
             _showImage: function(fileObject){
                var imageUrl = OC.getRootPath() + '/remote.php/webdav' + fileObject.path + '/' + fileObject.name;
                var appUrl = OC.generateUrl('apps/files_photospheres');
                var urlParams = {
                    url: imageUrl,
                    filename: fileObject.name
                };
                location.href = appUrl + '?' + $.param(urlParams);
            },
            
            _getImageFileObject: function(filename, context){
               var fileList = context.fileList;
               var files = fileList.files;
               for(var i = 0; i < files.length; i++){
                   var file = files[i];
                   if (file.name === filename){
                       return file;
                   }
               } 
               return null;
            },
            
            /*
             * Initialize action callbacks. "Override" 
             * the action for image/jpeg
             */
            init: function(){
                if (!OCA || !OCA.Files || !OCA.Files.fileActions){
                    return;
                }
                
                OCA.Files.fileActions.registerAction(this._getAction());
    
                OCA.Files.fileActions.on('registerAction', function (e){
                    if (e.action.mime === 'image/jpeg' && e.action.name === 'View'){
                        // Store the registered action in case
                        // the image isn't a photosphere-image
                        this._oldActionHandler = e.action.actionHandler;
                        e.action.actionHandler = this._actionHandler.bind(this);
                    }

                }.bind(this));
            },
            
            canShow: function(filename, context, callback){
                // Trigger serverside function to
                // try to read xmp-data of the file
                var file = this._getImageFileObject(filename, context);
                if (!file){
                    callback(false, null);
                    return;
                }
                
                var xmpBackendUrl = OC.generateUrl('apps/files_photospheres') + "/files/xmpdata/" + file.id;
                $.get(xmpBackendUrl, function(serverResponse){
                    if (!serverResponse.success){
                        if (serverResponse.message){
                            OC.Notification.show(t('files_photospheres', 'An error occured while trying to read xmp-data: ' + serverResponse.message));
                        }
                        callback(false, null);
                        return;
                    }
                    if (serverResponse.data && typeof(serverResponse.data) === 'object'){
                        callback(true, serverResponse.data);
                        return;
                    }
                    callback(false, null);
                })
                .fail(function( jqXHR, textStatus, errorThrown ) {
                      OC.Notification.show(t('files_photospheres', 'An error occured while trying to read xmp-data: ' + textStatus));      
                });
            },
            
            showImage: function (filename, context){
                var file = this._getImageFileObject(filename, context);
                if (!file){
                    OC.Notification.show(t('files_photospheres', 'Could not locate file'));
                    return;
                }
                this._showImage(file);
            }            
        };
        
        window.photoSphereViewerFileAction = photoSphereViewerFileAction;
         
    })(jQuery, OC, OCA, oc_requesttoken);

$(document).ready(function(){
    "use strict";
    
    window.photoSphereViewerFileAction.init();
});