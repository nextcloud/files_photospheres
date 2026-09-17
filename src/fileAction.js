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
import { registerFileAction, getFileActions, DefaultType, Permission, ActionContextSingle } from '@nextcloud/files'
import { showError } from '@nextcloud/dialogs'

(function (OC, OCA) {

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

        /*
         *  Id of the registered image-click action (see _getAction()).
         *  Used to exclude ourselves when looking for a fallback action.
         */
        _imageActionId: 'photosphereviewer-image',

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
         * Actionhandler for image-click.
         *
         * Pre-generated metadata is optional: if the DAV property wasn't
         * returned for this node (undetermined - the backend hasn't computed
         * it yet, see XmpMetadataListener), we ask the server on demand,
         * showing a loading spinner while we wait. Once we know either way,
         * we either show the photosphere or fall back to whatever action
         * would otherwise have handled this file (e.g. the regular image
         * viewer).
         * @param {ActionContextSingle} actionContextSingle The action context
         * @returns {Promise<boolean|null>}
         */
        _actionHandler: async function(actionContextSingle) {
            const node = actionContextSingle.nodes[0];
            const view = actionContextSingle.view;
            const dir = actionContextSingle.folder.path;
            const fileName = node.path.replace(/^.*[\\/]/, '');

            let xmpResultModel = this._getDavXmpMeta(node);

            if (xmpResultModel === null || xmpResultModel === undefined) {
                PhotosphereViewerFunctions.showLoader(true);
                xmpResultModel = await this._requestXmpDataForUserfile(node.fileid);
                PhotosphereViewerFunctions.showLoader(false);
            }

            if (!xmpResultModel || !(xmpResultModel.usePanoramaViewer === true || xmpResultModel.usePanoramaViewer === 1)) {
                // Not a photosphere (or we failed to determine it) - let
                // whichever action would otherwise be responsible for this
                // file handle the click instead.
                return await this._execFallbackAction(actionContextSingle);
            }

            if (!PhotosphereViewerFunctions.isWebGl2Supported()) {
                showError(t('files_photospheres', "Your browser doesn't support WebGL/WebGL2. Please enable WebGL/WebGL2 support in the browser settings."));
                return false;
            }

            this._showImage(node, view, dir, fileName, xmpResultModel);
            return true;
        },

        /**
         * Requests the xmp-metadata of a regular (non-shared) file from the
         * backend. Used when the DAV property wasn't pre-generated for this
         * file yet (see _actionHandler). The backend persists the result for
         * next time as a side effect (see StorageService::getXmpData()).
         * @param {number} fileId
         * @returns {Promise<object|null>}
         */
        _requestXmpDataForUserfile: function (fileId) {
            const url = OC.generateUrl('apps/files_photospheres') + '/userfiles/xmpdata/' + fileId;
            return new Promise((resolve) => {
                this._xmpDataBackendRequest(url, (canShowImage, xmpResultModel) => resolve(canShowImage ? xmpResultModel : null));
            });
        },

        /**
         * Finds the file action which would have been the default action for
         * this context had our own action not claimed it, and executes it.
         * Mirrors the selection @nextcloud/files' own file list uses
         * (enabled, non-download, default action with the lowest order).
         * @param {ActionContextSingle} actionContextSingle The action context
         * @returns {Promise<boolean|null>}
         */
        _execFallbackAction: async function (actionContextSingle) {
            const fallbackAction = getFileActions()
                .filter(action => action.id !== this._imageActionId
                    && action.id !== 'download'
                    && !!action.default
                    && (action.enabled === undefined || action.enabled(actionContextSingle)))
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

            if (fallbackAction) {
                return await fallbackAction.exec(actionContextSingle);
            }

            // No other action wants this file either. This mirrors what
            // @nextcloud/files' own file list does when it finds no default
            // action at all: open the details panel instead of doing
            // nothing.
            window.OCP.Files.Router.goToRoute(
                null,
                window.OCP.Files.Router.params,
                { ...window.OCP.Files.Router.query, openfile: undefined, opendetails: '' },
                true,
            );
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
         * Actionhandler for image-click
          * @param {ActionContextSingle} actionContextSingle The action context
         */
        _actionHandlerVideo: function(actionContextSingle){
            const node = actionContextSingle.nodes[0];
            const fileName = node.path.replace(/^.*[\\/]/, '');
            const fileUrl = node.encodedSource;
            this.showFrame(fileUrl, fileName, null, 'video');
        },

        /**
         * Photosphere Viewer action for jpeg-images
         * @returns {Object} The action data
         */
        _getAction: function () {
            return {
                id: this._imageActionId,
                exec: this._actionHandler.bind(this),
                displayName: () => "View in PhotoSphereViewer",
                iconSvgInline: () => "",
                order: -1,  // Make sure we get a higher priority than the viewer app
                default: DefaultType.DEFAULT,
                enabled: (actionContext) => {
                    /** @var INode[] */
                    const nodeArray = actionContext?.nodes || [];
                    return nodeArray.every(node => {
                        if ((node.permissions & Permission.READ) === 0 || node.mime !== this._photoShpereMimeType) {
                            return false;
                        }

                        const meta = this._getDavXmpMeta(node);

                        // Pre-generated metadata is optional: a node whose
                        // metadata was never computed ahead of time (no DAV
                        // property value) is claimed here too, and resolved
                        // on demand by _actionHandler. Only metadata which
                        // explicitly says "not a photosphere" rules the
                        // action out already, avoiding an unnecessary
                        // roundtrip on click for files we already know
                        // about.
                        return meta === null || meta === undefined
                            || meta.usePanoramaViewer === true || meta.usePanoramaViewer === 1;
                    });
                },
            };
        },

        _getVideoAction: function() {
            return {
                id: "photosphereviewer-video",
                exec: this._actionHandlerVideo.bind(this),
                displayName: () => "View in 360° viewer",
                iconSvgInline: () => "",
                order: 1000,
                enabled: (context) => {
                    // In Nextcloud 33+, context is {nodes: [...], view: ..., folder: ...}
                    const nodeArray = context?.nodes || (Array.isArray(context) ? context : [context]);
                    return nodeArray.every(node => (
                        node.permissions & Permission.READ) !== 0 && 
                        node.mime === 'video/mp4');
                }
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
         * Returns the xmp-metadata from the node (delivered by backend).
         * In NC33+, WebDAV property values are returned as text content (JSON string).
         */
        _getDavXmpMeta: function (node) {
            const actualNode = node?.nodes?.[0] || node;
            // The DAV property is: {http://nextcloud.org/ns}files-photospheres-xmp-metadata
            const rawValue = actualNode?.attributes?.['files-photospheres-xmp-metadata'];
            if (typeof rawValue === 'string') {
                try {
                    return JSON.parse(rawValue);
                } catch (e) {
                    console.warn('files_photospheres: failed to parse XMP metadata JSON', e, rawValue);
                    return null;
                }
            }
            return rawValue;
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
                urlParams = Object.assign(urlParams, xmpResultModel);
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
                urlParams = Object.assign(urlParams, xmpResultModel);
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
                configObject = Object.assign(configObject, extendObject);
            }

            this._frameContainer = document.createElement('iframe');
            this._frameContainer.id = this._frameId;
            this._frameContainer.src = appUrl;
            this._frameContainer.allowFullscreen = true;
            document.body.after(this._frameContainer);

            const hideDownload = (document.getElementById('hideDownload')?.value ?? '') === 'true';
            const hideCloseButton = self._isSharedSingleFileViewer;

            this._frameContainer.addEventListener('load', function () {
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

                document.body.classList.add('showing-photo-sphere-viewer-frame');
                PhotosphereViewerFunctions.showLoader(false);

                self._frameShowing = true;
            });
        },

        /*
         *  Removes the injected iframe that contains the viewer.
         */
        hideFrame: function () {
            if (this._frameContainer != null && document.contains(this._frameContainer)) {
                this._frameContainer.remove();
                this._frameContainer = null;
                document.body.classList.remove('showing-photo-sphere-viewer-frame');
                document.getElementById('close-photosphere-viewer')?.remove();
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
            fetch(url)
                .then(r => r.json())
                .then(function (serverResponse) {
                    if (!serverResponse.success) {
                        if (serverResponse.message) {
                            showError(t('files_photospheres', 'An error occured while trying to read xmp-data: ') + serverResponse.message);
                        }
                        else{
                            showError(t('files_photospheres', 'An unknown error occured while trying to read xmp-data.'));
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
                            showError(t('files_photospheres', "Your browser doesn't support WebGL/WebGL2. Please enable WebGL/WebGL2 support in the browser settings."));
                            PhotosphereViewerFunctions.showLoader(false);
                            callback(false, null);
                            return;
                        }
                        callback(true, serverResponse.data);
                        return;
                    }
                    callback(false, null);
                })
                .catch(function (error) {
                    showError(t('files_photospheres', 'An error occured while trying to read xmp-data: ') + error);
                    PhotosphereViewerFunctions.showLoader(false);
                    callback(false, null);
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

            registerFileAction(this._getAction());      // PhotoSphere image click (default for image/jpeg with appropriate xmp-data)
            registerFileAction(this._getVideoAction()); // Open 360 video via contextmenu
            this._registerLegacyActions();                              // Register legacy actions (e.g. for directory share)

            // Register the "close" function for non-single-file shares only
            if (this._isSharedSingleFileViewer) {
                document.querySelector('footer')?.classList.add('hidden');
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

})(OC, OCA);

// document ready
document.addEventListener('DOMContentLoaded', function () {

    "use strict";
    
    // Regular user view or shared view?
    var sharingToken = document.getElementById('sharingToken')?.value;
    if (!sharingToken) {
        window.photoSphereViewerFileAction.init(false, null, false);
        return;
    }

    // Are we dealing with a shared directory or a single file?
    var isDirectoryShare = document.querySelectorAll('.files-filestable').length > 0;
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
        window.photoSphereViewerFileAction.init(isDirectoryShare, sharingToken, false);
    } else {
        // single file-share
        var mimeType = document.getElementById('mimetype')?.value;
        var fileName = document.getElementById('filename')?.value;

        if (mimeType === window.photoSphereViewerFileAction._photoShpereMimeType) {
            PhotosphereViewerFunctions.showLoader(true);
            window.photoSphereViewerFileAction.init(false, null, true);
            document.getElementById('files-public-content').style.display = 'none';
            window.photoSphereViewerFileAction.canShowSingleFileShare(sharingToken, function (canShowImage, xmpResultModel) {
                if (canShowImage) {
                    var imageUrl = OC.generateUrl('/s/{token}/download', { token: sharingToken });
                    window.photoSphereViewerFileAction.showFrame(imageUrl, fileName, xmpResultModel, 'image');
                }
                else {
                    document.getElementById('files-public-content').style.display = '';
                    PhotosphereViewerFunctions.showLoader(false);
                }
            });
        }
    }
});