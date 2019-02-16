/*
 * This scripts is included globally
 * for all requests to the Nextcloud-instance
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
                 if (this.canShow(filename)){
                    this.showImage(filename, context);
                }
                else if (typeof(this._oldActionHandler) === 'function'){
                    this._oldActionHandler(filename, context);
                } 
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
                var imageUrl = OC.getRootPath() + '/remote.php/webdav/' + fileObject.name;
                var appUrl = OC.generateUrl('apps/photosphereviewer');
                location.href = appUrl + "?url=" + imageUrl;
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
            
            canShow: function(filename){
                // Currently we identify a photosphere-image
                // by the 'PANO'-filename-prefix
                return filename.indexOf('PANO') === 0;
            },
            
            showImage: function (filename, context){
               var fileList = context.fileList;
               var files = fileList.files;
               for(var i = 0; i < files.length; i++){
                   var file = files[i];
                   if (file.name === filename){
                       this._showImage(file);
                   }
               }
            }            
        };
         
    })(jQuery, OC, OCA, oc_requesttoken);

$(document).ready(function(){
    "use strict";
    
    window.photoSphereViewerFileAction.init();
});