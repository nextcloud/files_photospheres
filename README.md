# Photo Sphere Viewer

Nextcloud app for viewing Google PhotoSphere 360° images. This app is based on 
the [photo-sphere-viewer.js](https://photo-sphere-viewer.js.org/) library.

**This version is for Nextcloud 14.**

## Features
* Interactive view of PhotoSphere images
* Fully compatiple with other existing image-viewer apps (e.g. gallery-app)

## How to use
### Install
Install the app by simply downloading it from the store. You can also install it by cloning this repository into your nextcloud installation to a directory called *photosphereviewer*, e.g.

    /var/www/html/nextcloud/apps/photosphereviewer 

### Usage
After installing the app you can view your Google PhotoSphere 360° images just by clicking on the file.

## Caveats
* Currently it's only possible to identify photosphere-images by the file prefix. So if you want the image to be opened in the photosphere-viewer, you will have to give the prefix "PANO" to the filename (e.g. PANO_myImage.jpg).

