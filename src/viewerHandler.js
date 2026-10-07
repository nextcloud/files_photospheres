/**
 * Nextcloud - Files_PhotoSpheres
 *
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Robin Windey <ro.windey@gmail.com>
 *
 * @copyright Robin Windey 2024
 *
 * Registers the PhotoSphereViewer Vue component as a handler with the
 * Nextcloud Viewer app (OCA.Viewer).  The canHandleFile callback checks
 * whether the file's XMP metadata – provided by the Sabre back-end plugin
 * via the DAV property registered in init.js – indicates that the image is a
 * photosphere.
 */

import PhotoSphereViewerComponent from './components/PhotoSphereViewer.vue'

/**
 * Extract the XMP metadata object from a Nextcloud file Node's attributes.
 *
 * @param {object} file File Node passed by OCA.Viewer
 * @return {object|null}
 */
function getDavXmpMeta(file) {
	const rawValue = file?.attributes?.['files-photospheres-xmp-metadata']
	if (typeof rawValue === 'string') {
		try {
			return JSON.parse(rawValue)
		} catch (e) {
			console.warn('files_photospheres: failed to parse XMP metadata JSON', e, rawValue)
			return null
		}
	}
	return rawValue ?? null
}

document.addEventListener('DOMContentLoaded', function() {
	if (!window.OCA?.Viewer) {
		console.debug('files_photospheres: OCA.Viewer not available, skipping viewer handler registration')
		return
	}

	window.OCA.Viewer.registerHandler({
		id: 'photosphere',
		mimes: ['image/jpeg'],
		// No grouping – "next / previous" navigation between photospheres is
		// not implemented yet (see issue #11).  Setting group to null means
		// photospheres are shown individually without siblings.
		group: null,
		component: PhotoSphereViewerComponent,
		/**
		 * Only handle JPEG files that carry photosphere XMP metadata
		 * (usePanoramaViewer === true).  Regular JPEG images will fall
		 * through to the default Nextcloud image viewer.
		 *
		 * @param {object} file File Node
		 * @return {boolean}
		 */
		canHandleFile(file) {
			const meta = getDavXmpMeta(file)
			return !!(meta && (meta.usePanoramaViewer === true || meta.usePanoramaViewer === 1))
		},
	})

	console.debug('files_photospheres: registered PhotoSphere viewer handler with OCA.Viewer')
})
