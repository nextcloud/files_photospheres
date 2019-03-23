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
 * Initializes the viewer-component with a given photospere-image
 */
$(document).ready(function(){
    
    if (typeof(URLSearchParams) !== 'function'){
        console.error('URLSearchParams is not available (Files_PhotoSpheres)');
        return;
    }
    
    var searchParams = new URLSearchParams(location.search);
    var urlParam = searchParams.get('url');
    if (!urlParam){
        console.error('No URL for Files_PhotoSpheres provided');
        return;
    }
    
    var configObject = {
        container: 'viewer',
        time_anim: false,
        panorama: urlParam
    };
    
    var captionParam = searchParams.get('filename');
    if (captionParam){
        configObject.caption = captionParam;
    }
    
    var viewer = new PhotoSphereViewer(configObject);
    
    window.photoSphereViewer = viewer;
});