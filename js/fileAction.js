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
         *  Photosphere mime-type
         */
        _photoShpereMimeType: 'image/jpeg',

        _isDirectoryShare: false,
        _sharingToken: '',

        /*
         * Actionhandler for image-click
         */
        _actionHandler: function (filename, context) {
            this.canShow(filename, context, function (canShowImage, xmpResultModel) {
                if (canShowImage) {
                    this.showImage(filename, context, xmpResultModel);
                } else if (typeof (this._oldActionHandler) === 'function') {
                    this._oldActionHandler(filename, context);
                }
            }.bind(this));
        },

        /*
         * Default action
         */
        _getAction: function () {
            return {
                actionHandler: this._actionHandler.bind(this),
                displayName: "View in PhotoSphereViewer",
                icon: "",
                mime: "image/jpeg",
                name: "view",
                permissions: 1,
                order: -1
            };
        },

        _getDirectorySharePathFromCurrentLocation: function () {
            var searchParams = new URLSearchParams(document.location.search);
            var path = searchParams.get('path');
            if (!path) {
                path = '/';
            }
            return path;
        },

        /*
         * Generates the url and jumps
         * to the photosphere app
         */
        _showImage: function (fileObject, xmpResultModel) {
            var imageUrl = '';
            if (!this._isDirectoryShare) {
                // "normal" user-view
                imageUrl = OC.getRootPath() +
                    '/remote.php/webdav' +
                    fileObject.path +
                    '/' +
                    fileObject.name;
            } else {
                // directory-share
                imageUrl = OC.getRootPath() +
                    '/index.php/s/' +
                    this._sharingToken +
                    '/download?path=' +
                    this._getDirectorySharePathFromCurrentLocation() +
                    '&files=' +
                    fileObject.name;
            }

            var urlParams = {
                url: imageUrl,
                filename: fileObject.name
            };

            // Add xmpData to url-params, if we have some
            if (xmpResultModel) {
                urlParams = $.extend(urlParams, xmpResultModel);
            }

            this.showFrame(imageUrl, fileObject.name, xmpResultModel, false);
        },

        /*
         * Injects the iframe with the viewer into the current page. 
         * Suiteable for both the sharing option (based on a token) and the authenticated explorer view (filename).
         * @param {string} imageUrl         - The url from which the panorama can be loaded 
         * @param {string} imageFileName    - The name of the image. Used as caption in the viewer.
         * @param {object} xmpResultModel   - The xmp-information, read from the server.
         * @param {bool} isSharedViewer     - True, if we are on single-fileshare 
         */
        showFrame: function (imageUrl, imageFileName, xmpResultModel, isSharedViewer) {

            var configObject = {
                panorama: imageUrl,
                caption: imageFileName
            };

            // Add xmpData (cropping-info) to viewer-params, if we have some
            if (xmpResultModel.containsCroppingConfig) {
                var extendObject = {
                    pano_data: xmpResultModel.croppingConfig
                };
                configObject = $.extend(configObject, extendObject);
            }

            var appUrl = OC.generateUrl('apps/files_photospheres');

            this._frameContainer = $('<iframe id="' + this._frameId + '" src="' + appUrl + '" allowfullscreen="true"/>');
            $('#app-content').after(this._frameContainer);

            this._frameContainer.on('load', function () {
                // Viewer is rendered via helper-class in the
                // iframe. After the frame has loaded, provide
                // appropriate config object for rendering the component.
                var frameWindow = this.contentWindow.window;
                frameWindow.photoSphereViewerRenderer.render(configObject);
            });

            if (isSharedViewer) {
                $('footer').addClass('hidden');

            } else {
                // Provide controls to exit the viewer
                FileList.setViewerMode(true);

                var self = this;
                var onKeyUp = function (e) {
                    if (e.keyCode == 27) {
                        self.hideFrame();
                    }
                }

                // Register on original document
                $(window).keyup(onKeyUp);

                if (!$('html').hasClass('ie8')) {
                    history.pushState({}, '', '#' + self._frameId);

                    $(window).one('popstate', function (e) {
                        self.hideFrame();
                    });
                }

                this._frameContainer.on('load', function () {
                    // Register on iframe document
                    var frameBody = this.contentWindow.document;
                    $(frameBody).keyup(onKeyUp);
                });
            }
        },

        /*
         *  Removes the injected iframe that contains the viewer.
         */
        hideFrame: function () {
            if (this._frameContainer != null && document.contains(this._frameContainer[0])) {
                this._frameContainer.detach();
                this._frameContainer = null;
                FileList.setViewerMode(false);
            }
        },

        _getImageFileObject: function (filename, context) {
            var fileList = context.fileList;
            var files = fileList.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.name === filename) {
                    return file;
                }
            }
            return null;
        },

        _xmpDataBackendRequest: function (url, callback) {
            $.get(url, function (serverResponse) {
                if (!serverResponse.success) {
                    if (serverResponse.message) {
                        PhotosphereViewerFunctions.notify(['An error occured while trying to read xmp-data: ', serverResponse.message]);
                    }
                    callback(false, null);
                    return;
                }
                if (serverResponse.data &&
                    typeof (serverResponse.data) === 'object' &&
                    serverResponse.data.containsGpanoData) {
                    // Its a photosphere but now
                    // check WebGL2 support in browser, otherwise
                    // the viewer can't be rendered
                    if (!PhotosphereViewerFunctions.isWebGl2Supported()) {
                        PhotosphereViewerFunctions.notify("Your browser doesn't support WebGL2. Please enable WebGL2 support in the browser settings.", "error");
                        callback(false, null);
                        return;
                    }
                    callback(true, serverResponse.data);
                    return;
                }
                callback(false, null);
            })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    PhotosphereViewerFunctions.notify(['An error occured while trying to read xmp-data: ', errorThrown]);
                });
        },

        /*
         * Initialize action callbacks. "Override" 
         * the action for image/jpeg
         */
        init: function (isDirectoryShare, sharingToken) {
            if (!OCA || !OCA.Files || !OCA.Files.fileActions) {
                return;
            }

            this._isDirectoryShare = isDirectoryShare;
            this._sharingToken = sharingToken;

            OCA.Files.fileActions.registerAction(this._getAction());
            OCA.Files.fileActions.setDefault('image/jpeg', 'view');

            OCA.Files.fileActions.on('registerAction', function (e) {
                if (e.action.mime === this._photoShpereMimeType &&
                    e.action.name &&
                    typeof (e.action.name) === "string" &&
                    e.action.name.toLowerCase() === 'view') {
                    // Store the registered action in case
                    // the image isn't a photosphere-image
                    this._oldActionHandler = e.action.actionHandler;
                    e.action.actionHandler = this._actionHandler.bind(this);
                }

            }.bind(this));
        },

        /*
         * Determines, if a file is a photosphere.
         * The file must be a normal user-file (normal login required).
         * @param {string} filename 
         * @param {object} context
         * @param {function} callback  
         */
        canShow: function (filename, context, callback) {
            // Trigger serverside function to
            // try to read xmp-data of the file
            var file = this._getImageFileObject(filename, context);
            if (!file) {
                callback(false, null);
                return;
            }

            var xmpBackendUrl;
            if (!this._isDirectoryShare) {
                // Normal user login-view
                xmpBackendUrl = OC.generateUrl('apps/files_photospheres') +
                    "/userfiles/xmpdata/" +
                    file.id;
            }
            else {
                // shared directory view
                xmpBackendUrl = OC.generateUrl('apps/files_photospheres') +
                    "/sharefiles/xmpdata/" +
                    this._sharingToken +
                    "?filename=" +
                    filename +
                    "&path=" +
                    this._getDirectorySharePathFromCurrentLocation();
            }

            this._xmpDataBackendRequest(xmpBackendUrl, callback);
        },

        /*
         * Determines, if a file is a photosphere.
         * The file must single-shared file.
         * @param {string} shareToken 
         * @param {function} callback  
         */
        canShowSingleFileShare: function (shareToken, callback) {
            var xmpBackendUrl = OC.generateUrl('apps/files_photospheres') +
                "/sharefiles/xmpdata/" +
                shareToken;

            this._xmpDataBackendRequest(xmpBackendUrl, callback);
        },

        showImage: function (filename, context, xmpResultModel) {
            var file = this._getImageFileObject(filename, context);
            if (!file) {
                PhotosphereViewerFunctions.notify(['Could not locate file']);
                return;
            }
            this._showImage(file, xmpResultModel);
        }
    };

    window.photoSphereViewerFileAction = photoSphereViewerFileAction;

})(jQuery, OC, OCA, oc_requesttoken);

$(document).ready(function () {

    "use strict";
    // is the page visit from a shared file, or is this via the file explorer?
    var isSharedViewer = $('#isPublic').val();
    // Are we dealing with a shared directory or a single file?
    var isDirectoryShare = $('#dir').val();
    var sharingToken = $('#sharingToken').val();

    if (!isSharedViewer || isDirectoryShare) {
        // Normal user-view or directory-share
        isDirectoryShare = isDirectoryShare ? true : false;

        if (isDirectoryShare) {
            /*
             *  FIXME ::
             *  If we're dealing with a directory-share
             *  we have to defer the initialization, because
             *  the OCA.Files.fileActions object gets overwritten by the file-
             *  sharing app in a defered executed function
             *  (see file_sharing/js/public.js at Line 47).
             *  We need this object, especially the
             *  function "OCA.Files.fileActions.on('registerAction' ...".
             *  Unfortunately this events aren't merged into the new
             *  object.
             */
            _.defer(function () {
                window.photoSphereViewerFileAction.init(isDirectoryShare, sharingToken);
            });
        }
        else {
            window.photoSphereViewerFileAction.init(isDirectoryShare, sharingToken);
        }

    } else {
        // single file-share
        var mimeType = $('#mimetype').val();
        var fileName = $('#filename').val();

        if (mimeType === window.photoSphereViewerFileAction._photoShpereMimeType) {
            $('#files-public-content').hide();
            window.photoSphereViewerFileAction.canShowSingleFileShare(sharingToken, function (canShowImage, xmpResultModel) {
                if (canShowImage) {
                    var imageUrl = OC.generateUrl('/s/{token}/download', { token: sharingToken });
                    window.photoSphereViewerFileAction.showFrame(imageUrl, fileName, xmpResultModel, true);
                }
                else {
                    $('#files-public-content').show();
                }
            });
        }
    }
});
