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
             *  The iframe dom element that holds the viewer.
             */
            _frameId: 'photo-sphere-viewer-frame',
            _frameContainer: null,
       
            /*
             * Actionhandler for image-click
             */
            _actionHandler: function (filename, context){
                this.canShow(filename, context, function(canShowImage, xmpDataObject){
                   if (canShowImage){
                        this.showImage(filename, context, xmpDataObject);
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
             _showImage: function(fileObject, xmpDataObject){
                var imageUrl = OC.getRootPath() + '/remote.php/webdav' + fileObject.path + '/' + fileObject.name;
                
                var urlParams = {
                    url: imageUrl,
                    filename: fileObject.name
                };
                
                // Add xmpData to url-params, if we have some
                if (xmpDataObject){
                    urlParams = $.extend(urlParams, xmpDataObject);
                }

                this.showFrame(urlParams, false);
            },

            /*
             * Injects the iframe with the viewer into the current page. 
             * Suiteable for both the sharing option (based on a token) and the authenticated explorer view (filename).
             */
            showFrame: function(urlParams, isSharedViewer) {
                
                var appUrl = OC.generateUrl('apps/files_photospheres');

                this._frameContainer = $('<iframe id="'+ this._frameId +'" src="'+ appUrl + '?' + $.param(urlParams) +'" allowfullscreen="true"/>');
                $('#app-content').after(this._frameContainer);

                if(isSharedViewer) {
                    $('footer').addClass('hidden');

                } else {
                    // Provide controls to exit the viewer
                    FileList.setViewerMode(true);

                    var self = this;
                    var onKeyUp = function(e) {
                        if (e.keyCode == 27) {
                            self.hideFrame();
                        }
                    }

                    // Register on original document
                    $(window).keyup(onKeyUp);

                    if(!$('html').hasClass('ie8')) {
                        history.pushState({}, '', '#' + self._frameId);

                        $(window).one('popstate', function (e) {
                            self.hideFrame();
                        });
                    }

                    this._frameContainer.load('ready', function() {
                        // Register on iframe document
                        var frameBody = this.contentWindow.document;
                        $(frameBody).keyup(onKeyUp);
                    });
                }
            },

            /*
             *  Removes the injected iframe that contains the viewer.
             */
            hideFrame: function() {
                if(this._frameContainer != null && document.contains(this._frameContainer[0])) {
                    this._frameContainer.detach();
                    this._frameContainer = null;
                    FileList.setViewerMode(false);
                }
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
                            PhotosphereViewerFunctions.notify(['An error occured while trying to read xmp-data: ', serverResponse.message]);
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
                      PhotosphereViewerFunctions.notify(['An error occured while trying to read xmp-data: ', errorThrown]);      
                });
            },
            
            showImage: function (filename, context, xmpDataObject){
                var file = this._getImageFileObject(filename, context);
                if (!file){
                    PhotosphereViewerFunctions.notify(['Could not locate file']);
                    return;
                }
                this._showImage(file, xmpDataObject);
            }            
        };
        
        window.photoSphereViewerFileAction = photoSphereViewerFileAction;
         
    })(jQuery, OC, OCA, oc_requesttoken);

$(document).ready(function(){
    "use strict";

    // is the page visit from a shared file, or is this via the file explorer?
    var isSharedViewer = $('#isPublic').val();

    if(!isSharedViewer) { 
        window.photoSphereViewerFileAction.init();
    } else {
        var mimeType = $('#mimetype').val();
        var fileName = $('#filename').val();
        if(mimeType == 'image/jpeg' && window.photoSphereViewerFileAction.canShow(fileName)) {
            var sharingToken = $('#sharingToken').val();
            var imageUrl = OC.generateUrl('/s/{token}/download', {token: sharingToken});

            var urlParams = {
                url: imageUrl,
                filename: fileName
            };

            window.photoSphereViewerFileAction.showFrame(urlParams, true); 
        }
    }
});