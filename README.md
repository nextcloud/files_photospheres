# Nextcloud - Files_PhotoSpheres

Nextcloud app for viewing Google PhotoSphere 360° images (panorama-images). This app is based on 
the [photo-sphere-viewer.js](https://photo-sphere-viewer.js.org/) library.

**This version is tested for Nextcloud 16.**

## Features
* Interactive viewer to view PhotoSphere images in your Nextcloud instance
* When clicking on an image it automaticlly detects the presence of XMP-data tags (which are used in photospheres).

## Setup
### Install through the app store
The recommended way to install this app, is through the [Nextcloud app store](https://apps.nextcloud.com/apps/files_photospheres).

Open your Nextcloud instance -> Settings -> Apps -> Multimedia -> Photo Sphere Viewer -> Download and Enable.

### Install manually
You can manually install this app, by cloning the repository into your nextcloud installation:

    cd <your-nextcloud-installation>/apps/
    git clone https://github.com/nextcloud/files_photospheres.git
    chown www-data:www-data -R ./files_photospheres

### Usage
After installing the app you can view your PhotoSphere 360° images by clicking on the file in the Nextcloud file browser. Note that opening PhotoSpheres from the gallery is currently not supported.

## Caveats
* At least the "old" [Gallery-App](https://github.com/nextcloud/gallery) or the "new" [Viewer-App](https://github.com/nextcloud/viewer) must be enabled (you can also enable both).
* It is not possible to open the photosphere viewer from the Gallery. You must use the file browser.
* It is currently not possible to use the photosphere viewer in shared folders. You must share the photosphere individually to use this viewer.
