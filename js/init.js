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
    
    var viewer = new PhotoSphereViewer({
        container: 'viewer',
        time_anim: false,
        panorama: urlParam
    });
    
});