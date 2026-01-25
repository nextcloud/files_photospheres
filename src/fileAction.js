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
import { registerFileAction, FileAction, DefaultType, Permission } from '@nextcloud/files'

(function ($, OC, OCA) {

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
        _frameShowing: false,

        /*
         *  Photosphere mime-type
         */
        _photoShpereMimeType: 'image/jpeg',

        _isDirectoryShare: false,
        _sharingToken: '',
        _isSharedSingleFileViewer: false,

        _onClose: null,

        // FIXME :: showImage is called multiple times because of the
        // route-call in the actionhandler. This is a workaround to prevent
        // the close handler from being registered multiple times.
        // #143
        _showImageCalled: false,

        /**
         * Actionhandler for image-click
         * @param {Object} context - The action context
         * @param {Node[]} context.nodes - The nodes (files) to act upon
         * @param {View} context.view - The files view
         * @param {Folder} context.folder - The current folder
         * @returns {Promise<boolean | null>} Promise resolving to null if action was executed successfully
         */
        _actionHandler: async function({ nodes, view, folder }) {
            const node = nodes[0];
            const dir = folder.path;
            const fileName = node.path.replace(/^.*[\\/]/, '');
            const xmpResultModel = this._getDavXmpMeta(node);

            this._showImage(node, view, dir, fileName, xmpResultModel);
            return null;
        },

        _legacyActionHandlerImage: function (fileName, context) {
            PhotosphereViewerFunctions.showLoader(true);
            // TODO :: add xmp-data to server request at
            // OCA.Sharing.PublicApp.fileList.filesClient?
            // This would make the ad-hoc ajax backend-request obsolete
            this.canShow(fileName, context, function (canShowImage, xmpResultModel) {
                if (canShowImage) {
                    // It's a photosphere image, show it
                    this._showImageLegacy(fileName, context, xmpResultModel);
                } else if (typeof (this._oldActionHandler) === 'function') {
                    // It's a normal image, call the default handler
                    PhotosphereViewerFunctions.showLoader(false);
                    this._oldActionHandler(fileName, context);
                } else {
                    // If there is no default handler trigger download
                    PhotosphereViewerFunctions.showLoader(false);
                    const fileObject = this._getFileObject(fileName, context);
                    window.location = this._getFileUrl(fileObject);
                }
            }.bind(this));
        },

        /**
         * Actionhandler for video-click
         * @param {Object} context - The action context
         * @param {Node[]} context.nodes - The nodes (files) to act upon
         * @param {View} context.view - The files view
         * @param {Folder} context.folder - The current folder
         * @returns {Promise<boolean | null>} Promise resolving to null if action was executed successfully
         */
        _actionHandlerVideo: async function({ nodes, view, folder }){
            const node = nodes[0];
            const fileName = node.path.replace(/^.*[\\/]/, '');
            const fileUrl = node.encodedSource;
            this.showFrame(fileUrl, fileName, null, 'video');
            return null;
        },

        /*
         * Photosphere Viewer action for jpeg-images
         */
        _getAction: function () {
            return {
                id: "photosphereviewer-image",
                exec: this._actionHandler.bind(this),
                displayName: (context) => "View in PhotoSphereViewer",
                iconSvgInline: (context) => "",
                order: -1,  // Make sure we get a higher priority than the viewer app
                default: DefaultType.DEFAULT,
                enabled: ({ nodes }) => {
                    const enabled = nodes.every(node => {
                        const meta = this._getDavXmpMeta(node);
                        return (node.permissions & Permission.READ) !== 0
                            && node.mime === this._photoShpereMimeType
                            && meta
                            && meta.usePanoramaViewer === 1;
                    });

                    // Notify user if we would show a Photosphere but WebGL/WebGL2 is not supported
                    if (enabled && !PhotosphereViewerFunctions.isWebGl2Supported()) {
                        PhotosphereViewerFunctions.notify("Your browser doesn't support WebGL/WebGL2. Please enable WebGL/WebGL2 support in the browser settings.", "error");
                        return false;
                    }

                    return enabled;
                },
            };
        },

        _getVideoAction: function() {
            return {
                id: "photosphereviewer-video",
                exec: this._actionHandlerVideo.bind(this),
                displayName: (context) => "View in 360° viewer",
                iconSvgInline: (context) => "",
                order: 1000,
                enabled: ({ nodes }) => nodes.every(node => (
                    node.permissions & Permission.READ) !== 0 && 
                    node.mime === 'video/mp4')
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

        _getFileUrl(fileObject){
            var file = encodeURIComponent(fileObject.name);
            if (!this._isDirectoryShare) {
                // "normal" user-view
                var path = fileObject.path;
                if (path == '/'){
                    path = '';
                }
                return `${OC.getRootPath()}/remote.php/webdav${path}/${file}`;
            } 
            // directory-share
            var path = encodeURIComponent(this._getDirectorySharePathFromCurrentLocation());
            return `${OC.getRootPath()}/index.php/s/${this._sharingToken}/download?path=${path}&files=${file}`;
        },

        /*
         * Returns the xmp-metadata from the node (delivered by backend)
         */
        _getDavXmpMeta: function (node) {
            return node.attributes['files-photospheres-xmp-metadata'];
        },

        /*
         * Generates the url and jumps
         * to the photosphere app
         */
        _showImage: function (node, view, dir, fileName, xmpResultModel) {
            if (this._showImageCalled) {
                return;
            }

            this._showImageCalled = true;

            var imageUrl = node.encodedSource;
            var urlParams = {
                url: imageUrl,
                filename: fileName
            };

            // Add xmpData to url-params, if we have some
            if (xmpResultModel) {
                urlParams = $.extend(urlParams, xmpResultModel);
            }

            this.showFrame(imageUrl, fileName, xmpResultModel, 'image');

            // Push to history (new API)
            const oldRoute = [
                window.OCP.Files.Router.name,
                window.OCP.Files.Router.params,
                window.OCP.Files.Router.query,
                true,
            ];
            this._onClose = () => window.OCP.Files.Router.goToRoute(...oldRoute);
            window.OCP.Files.Router.goToRoute(
                null,
                { view: view.id, fileid: node.fileid },
                { dir, openfile: true },
                true,
            );
        },

        _showImageLegacy: function (fileName, context, xmpResultModel) {
            const fileObject = this._getFileObject(fileName, context);
            var imageUrl = this._getFileUrl(fileObject);
            var urlParams = {
                url: imageUrl,
                filename: fileName
            };

            // Add xmpData to url-params, if we have some
            if (xmpResultModel) {
                urlParams = $.extend(urlParams, xmpResultModel);
            }

            this.showFrame(imageUrl, fileName, xmpResultModel, 'image');

            // Push to history legacy
            const oldQuery = location.search.replace(/^\?/, '');
	        this._onClose = () => OC.Util.History.pushState(oldQuery);
            const fileid = context.fileInfoModel.get('id');
            const params = OC.Util.History.parseUrlQuery();
            const dir = params.dir;
            delete params.dir;
            delete params.fileid;
            params.openfile = fileid;
            const query = 'dir=' + encodePath(dir) + '&' + OC.buildQueryString(params);
            OC.Util.History.pushState(query);
        },

        _listenForCloseMessage: function (msg) {
            if (msg.data === 'closePhotosphereViewer') {
                this._closeAndRemoveListener();
            }
        },

        _closeAndRemoveListener: function () {
            // History back will remove the custom url state
            // and trigger the hideFrame function
            //history.back();
            this.hideFrame();
            window.removeEventListener("message", this._listenForCloseMessage, false);
        },

        /**
         * Injects the iframe with the viewer into the current page.
         * Suiteable for both the sharing option (based on a token) and the authenticated explorer view (filename).
         * @param {string} imageUrl         - The url from which the panorama can be loaded
         * @param {string} fileName    - The name of the image. Used as caption in the viewer.
         * @param {object} xmpResultModel   - The xmp-information, read from the server.
         * @param {string} frameType        - image or video
         */
        showFrame: function (imageUrl, fileName, xmpResultModel, frameType) {
            var self = this;
            var appUrl = '';
            var configObject;

            switch(frameType){
                case 'image':
                    appUrl = OC.generateUrl('apps/files_photospheres');
                    configObject = {
                        panorama: imageUrl,
                        caption: fileName
                    };
                    break;
                case 'video':
                    appUrl = OC.generateUrl('apps/files_photospheres/video');
                    configObject = {
                        url: imageUrl,
                        caption: fileName
                    };
                    break;
            }

            // Add xmpData (cropping-info) to image-viewer-params, if we have some
            if (frameType == 'image' && xmpResultModel && xmpResultModel.containsCroppingConfig) {
                var extendObject = {
                    panoData: xmpResultModel.croppingConfig
                };
                configObject = $.extend(configObject, extendObject);
            }

            this._frameContainer = $(`<iframe id="${this._frameId}" src="${appUrl}" allowfullscreen="true"/>`);
            $('body').after(this._frameContainer);

            const hideDownload = $('#hideDownload').val() === 'true';
            const hideCloseButton = self._isSharedSingleFileViewer;

            this._frameContainer.on('load', function () {
                // Viewer is rendered via helper-class in the
                // iframe. After the frame has loaded, provide
                // appropriate config object for rendering the component.
                var frameWindow = this.contentWindow.window;

                switch(frameType){
                    case 'image':
                        frameWindow.photoSphereViewerRenderer.render(configObject, hideDownload, hideCloseButton);
                        break;
                    case 'video':
                        frameWindow.photoSphereVideoRenderer.render(configObject);
                        break;
                }

                // Register ESC listener on iframe
                frameWindow.addEventListener("keyup", self._onKeyUp.bind(self));

                $('body').addClass('showing-photo-sphere-viewer-frame');
                PhotosphereViewerFunctions.showLoader(false);

                self._frameShowing = true;
            });
        },

        /*
         *  Removes the injected iframe that contains the viewer.
         */
        hideFrame: function () {
            if (this._frameContainer != null && document.contains(this._frameContainer[0])) {
                this._frameContainer.detach();
                this._frameContainer = null;
                $('body').removeClass('showing-photo-sphere-viewer-frame');
                $("#close-photosphere-viewer").remove();
                if (typeof (this._onClose) === 'function') {
                    this._onClose();
                    this._onClose = null;
                }
            }
            this._frameShowing = false;
            this._showImageCalled = false;
        },

        _getFileObject: function (filename, context) {
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
                    else{
                        PhotosphereViewerFunctions.notify('An unknown error occured while trying to read xmp-data.');
                    }
                    PhotosphereViewerFunctions.showLoader(false);
                    callback(false, null);
                    return;
                }
                if (serverResponse.data &&
                    typeof (serverResponse.data) === 'object' &&
                    serverResponse.data.usePanoramaViewer) {
                    // Its a photosphere but now
                    // check WebGL2 support in browser, otherwise
                    // the viewer can't be rendered
                    if (!PhotosphereViewerFunctions.isWebGl2Supported()) {
                        PhotosphereViewerFunctions.notify("Your browser doesn't support WebGL/WebGL2. Please enable WebGL/WebGL2 support in the browser settings.", "error");
                        PhotosphereViewerFunctions.showLoader(false);
                        return;
                    }
                    callback(true, serverResponse.data);
                    return;
                }
                callback(false, null);
            })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    PhotosphereViewerFunctions.notify(['An error occured while trying to read xmp-data: ', errorThrown]);
                    PhotosphereViewerFunctions.showLoader(false);
                });
        },

        _registerLegacyActions: function () {
            if (!(OCA?.Files?.fileActions)) {
                return;
            }
            /*
             * Try to store the original actionhandler for the
             * image in case it isn't a photosphere. Depending on the
             * order in which the NC apps are loaded it could be that:
             *   1. the action is already registered before ours
             *   2. the action will be registered after ours
             */
            const currActions = OCA.Files.fileActions.getActions(this._photoShpereMimeType, 'file', OC.PERMISSION_READ);
            if (currActions && currActions.view) {
                // This is case (1)
                this._oldActionHandler = currActions.view.action;
            }

            // Legacy register action
            OCA.Files.fileActions.registerAction({
                name: 'view',
                displayName: "View in PhotoSphereViewer",
                mime: this._photoShpereMimeType,
                permissions: OC.PERMISSION_READ,
                actionHandler: this._legacyActionHandlerImage.bind(this),
            })

            OCA.Files.fileActions.setDefault(this._photoShpereMimeType, 'view');

            // Register listener after our registration
            OCA.Files.fileActions.on('registerAction', function (e) {
                if (e.action.mime === this._photoShpereMimeType &&
                    e.action.name &&
                    typeof (e.action.name) === "string" &&
                    e.action.name.toLowerCase() === 'view') {
                    // Override but store the registered action
                    // which was registered after ours. This is
                    // case (2)
                    this._oldActionHandler = e.action.actionHandler;
                    e.action.actionHandler = this._actionHandler.bind(this);
                }

            }.bind(this));
        },

        _onKeyUp: function (e) {
            if (e.keyCode == 27) {
                this.hideFrame();
            }
        },

        /*
         * Initialize action callbacks. "Override"
         * the action for image/jpeg
         */
        init: function (isDirectoryShare, sharingToken, isSharedSingleFileViewer) {
            this._isDirectoryShare = isDirectoryShare;
            this._sharingToken = sharingToken;
            this._isSharedSingleFileViewer = isSharedSingleFileViewer;

            registerFileAction(new FileAction(this._getAction()));      // PhotoSphere image click (default for image/jpeg with appropriate xmp-data)
            registerFileAction(new FileAction(this._getVideoAction())); // Open 360 video via contextmenu
            this._registerLegacyActions();                              // Register legacy actions (e.g. for directory share)

            // Register the "close" function for non-single-file shares only
            if (this._isSharedSingleFileViewer) {
                $('footer').addClass('hidden');
            } else {
                var self = this;

                // Listen for close-button click (button lives inside the iframe)
                window.addEventListener("message", self._listenForCloseMessage.bind(self), false);

                // Register ESC listener on original document
                window.addEventListener("keyup", self._onKeyUp.bind(self));

                // Register history back listener
                OC.Util.History.addOnPopStateHandler(function (e) {
                    if (self._frameShowing) {
                        self.hideFrame();
                    }
                });
            }
        },

        /**
         * Determines, if a file is a photosphere.
         * The file must be a normal user-file (normal login required).
         * @param {string} filename
         * @param {object} context
         * @param {function} callback
         */
        canShow: function (fileName, context, callback) {
            // Trigger serverside function to
            // try to read xmp-data of the file
            var file = this._getFileObject(fileName, context);
            if (!file) {
                callback(false, null);
                return;
            }

            if (!this._isDirectoryShare) {
                // For regular user login-view the backend
                // should deliver the xmp-data already. This
                // method should not be called anymore.
                console.error("canShow() should not be called for regular user login-view.");
                callback(false, null);
                return;
            }

            // shared directory view
            var xmpBackendUrl = OC.generateUrl('apps/files_photospheres') +
                "/sharefiles/xmpdata/" +
                this._sharingToken +
                "?filename=" +
                encodeURIComponent(fileName) +
                "&path=" +
                encodeURIComponent(this._getDirectorySharePathFromCurrentLocation());

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
        }
    };

    window.photoSphereViewerFileAction = photoSphereViewerFileAction;

})(jQuery, OC, OCA);

// document ready
jQuery(function () {

    "use strict";
    
    // Regular user view or shared view?
    var sharingToken = $('#sharingToken').val();
    if (!sharingToken) {
        console.log("Init regular user view");
        window.photoSphereViewerFileAction.init(false, null, false);
        return;
    }

    // Are we dealing with a shared directory or a single file?
    var isDirectoryShare = $.find('.files-filestable').length > 0 ? true : false;;
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
        console.log("Init directory share view");
        window.photoSphereViewerFileAction.init(isDirectoryShare, sharingToken, false);
    } else {
        // single file-share
        var mimeType = $('#mimetype').val();
        var fileName = $('#filename').val();

        if (mimeType === window.photoSphereViewerFileAction._photoShpereMimeType) {
            PhotosphereViewerFunctions.showLoader(true);
            console.log("Init single file share view");
            window.photoSphereViewerFileAction.init(false, null, true);
            $('#files-public-content').hide();
            window.photoSphereViewerFileAction.canShowSingleFileShare(sharingToken, function (canShowImage, xmpResultModel) {
                if (canShowImage) {
                    var imageUrl = OC.generateUrl('/s/{token}/download', { token: sharingToken });
                    window.photoSphereViewerFileAction.showFrame(imageUrl, fileName, xmpResultModel, 'image');
                }
                else {
                    $('#files-public-content').show();
                    PhotosphereViewerFunctions.showLoader(false);
                }
            });
        }
    }
});