$(document).ready(function(){
    
    if (typeof(URLSearchParams) !== 'function'){
        console.error('URLSearchParams is not available (PhotosphereViewer)');
        return;
    }
    
    var searchParams = new URLSearchParams(location.search);
    var urlParam = searchParams.get('url');
    if (!urlParam){
        console.error('No URL for PhotosphereViewer provided');
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