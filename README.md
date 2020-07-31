# Nextcloud - Files_PhotoSpheres

![PHPUnit](https://github.com/nextcloud/files_photospheres/workflows/PHPUnit/badge.svg)
[![codecov](https://codecov.io/gh/nextcloud/files_photospheres/branch/master/graph/badge.svg)](https://codecov.io/gh/nextcloud/files_photospheres)
![Lint](https://github.com/nextcloud/files_photospheres/workflows/Lint/badge.svg)
[![Generic badge](https://img.shields.io/github/v/release/nextcloud/files_photospheres)](https://github.com/nextcloud/files_photospheres/releases)
[![Generic badge](https://img.shields.io/badge/Nextcloud-19-orange)](https://github.com/nextcloud/server)


Nextcloud app for viewing Google PhotoSphere 360° images (panorama-images). This app is based on 
the [photo-sphere-viewer.js](https://photo-sphere-viewer.js.org/) library. For 
360° videos the library [marzipano](https://www.marzipano.net/) is used.

**This version is tested for Nextcloud 19.**

## Features
* Interactive viewer to view PhotoSphere images in your Nextcloud instance
* When clicking on an image it automaticlly detects the presence of XMP-data tags (which are used in photospheres).
* Compatible with the "normal" user-view, single-file share and directory share.
* Seamless integration with other file-viewer apps.
* Supports viewing of 360° videos in "normal" user-view via context menu. 

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
* It is not possible to open the photosphere viewer from the Gallery. You must use the file browser.
* `WebGL`-support must be activated in your browser.
* 360° videos can not be shown in shared views. It is only possible to open them by context menu 
therefore the `files_rightclick` app has to be installed (see https://github.com/nextcloud/files_rightclick).

## Report an issue
I rely on all kind of feedback so feel free to open an issue if you encounter any problems with this app but please pay attention to the following points:
* If there is a problem with some images which aren't opened in this app but rather in the regular image viewer, please provide them via downloadlink if possible. Otherwise debugging and error-checking becomes quite hard. Please also check if the image you provide has correct XMP-metadata for being detected as photosphere image (like specified [here](https://developers.google.com/streetview/spherical-metadata#gpano_parameter_reference)). The image is only detected as photosphere if the XMP-metadata has the flag `GPano:UsePanoramaViewer` set explicitly to `true` or if `GPano:ProjectionType` is set to `equirectangular`. You can check these metadata information either with tools like [`exiftool`](https://exiftool.org/) or manually by opening the image with your favorite texteditor and scrolling throw the first few bytes. 
* In the frontend this app is only an integration of different external components like [photo-sphere-viewer.js](https://photo-sphere-viewer.js.org/) and [marzipano](https://www.marzipano.net/). Therefore problems regarding these libraries cannot be fixed in this app.

Thanks for your support :smiley: