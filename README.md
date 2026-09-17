# Nextcloud - Files_PhotoSpheres

![PHPUnit](https://github.com/nextcloud/files_photospheres/workflows/PHPUnit/badge.svg)
[![codecov](https://codecov.io/gh/nextcloud/files_photospheres/branch/master/graph/badge.svg)](https://codecov.io/gh/nextcloud/files_photospheres)
![Lint](https://github.com/nextcloud/files_photospheres/workflows/Lint/badge.svg)
[![Generic badge](https://img.shields.io/github/v/release/nextcloud/files_photospheres)](https://github.com/nextcloud/files_photospheres/releases)
[![Generic badge](https://img.shields.io/badge/Nextcloud-35-orange)](https://github.com/nextcloud/server)


Nextcloud app for viewing Google PhotoSphere 360° images (panorama-images). This app is based on 
the [photo-sphere-viewer.js](https://photo-sphere-viewer.js.org/) library. For 
360° videos the library [marzipano](https://www.marzipano.net/) is used.

## Table of contents

- [Nextcloud - Files\_PhotoSpheres](#nextcloud---files_photospheres)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Setup](#setup)
    - [Install through the app store](#install-through-the-app-store)
    - [Install manually](#install-manually)
    - [Usage](#usage)
    - [Metadata generation](#metadata-generation)
  - [Caveats](#caveats)
  - [Report an issue](#report-an-issue)

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

### Metadata generation
Whether an image is a photosphere is recognized by scanning the first bytes of a jpeg file for XMP metadata. This happens once, ahead of time, when the file is uploaded or edited - not while browsing a directory - and the result is stored using Nextcloud's [files metadata](https://docs.nextcloud.com/server/latest/developer_manual/digging_deeper/files_metadata.html) API, so opening a directory never reads its jpegs on the server, no matter how many of them it contains.

This pre-generated metadata is an optional optimization, not a requirement: for a file whose metadata hasn't been generated yet - typically because it already existed before this version of the app was installed, and hasn't been edited since - the check is instead performed on demand the first time you click on it, showing a brief loading indicator while the server reads that one file. The result is then stored for next time, so this only ever happens once per file.

To avoid that one-time delay for existing files altogether, an administrator can pre-generate metadata for some or all users in bulk ahead of time:

    # A specific user
    occ files_photospheres:generate-metadata alice

    # Several users at once
    occ files_photospheres:generate-metadata alice bob

    # Every user who has logged in at least once
    occ files_photospheres:generate-metadata --all

This command is entirely optional and can be run at any time, e.g. once after installing or updating the app, or periodically via a cron job.

## Caveats
* It is not possible to open the photosphere viewer from the Gallery. You must use the file browser.
* `WebGL`-support must be activated in your browser.
* 360° videos can not be shown in shared views. It is only possible to open them by context menu 
therefore the `files_rightclick` app has to be installed (see https://github.com/nextcloud/files_rightclick).

## Report an issue
I rely on all kind of feedback so feel free to open an issue if you encounter any problems with this app but please pay attention to the following points:
* If there is a problem with some images which aren't opened in this app but rather in the regular image viewer, please provide them via downloadlink if possible. Otherwise debugging and error-checking becomes quite hard. Please also check if the image you provide has correct XMP-metadata for being detected as photosphere image (like specified [here](https://developers.google.com/streetview/spherical-metadata#gpano_parameter_reference)). The image is only detected as photosphere if the XMP-metadata contains the following data:
    * `GPano:UsePanoramaViewer` is set explicitly to `true` *or*
    * `GPano:ProjectionType` is set to `equirectangular` *or*
    * `GImage:Mime` is set to `image/jpeg` (this is currently the only reliable way to detect Google VR180 images, see https://github.com/nextcloud/files_photospheres/issues/1)
    
   You can check these metadata information either with tools like [`exiftool`](https://exiftool.org/) or manually by opening the image with your favorite texteditor and scrolling throw the first few bytes. 
* In the frontend this app is only an integration of different external components like [photo-sphere-viewer.js](https://photo-sphere-viewer.js.org/) and [marzipano](https://www.marzipano.net/). Therefore problems regarding these libraries cannot be fixed in this app.

Thanks for your support :smiley:
