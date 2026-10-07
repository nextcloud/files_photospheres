<!--
 - Nextcloud - Files_PhotoSpheres
 -
 - This file is licensed under the Affero General Public License version 3 or
 - later. See the COPYING file.
 -
 - @author Robin Windey <ro.windey@gmail.com>
 - @copyright Robin Windey 2024
 -->
<template>
	<div ref="container" class="photosphere-viewer-container" />
</template>

<script>
import { Viewer } from '@photo-sphere-viewer/core'
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin'
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin'
import { StereoPlugin } from '@photo-sphere-viewer/stereo-plugin'
import '@photo-sphere-viewer/core/index.css'

export default {
	name: 'PhotoSphereViewer',

	props: {
		// The file object passed by the Nextcloud viewer
		currentFile: {
			type: Object,
			required: true,
		},
		// Whether this viewer is currently active/visible
		active: {
			type: Boolean,
			default: true,
		},
	},

	emits: ['loaded', 'error'],

	data() {
		return {
			viewer: null,
		}
	},

	computed: {
		/**
		 * Extract the XMP metadata object from the file's DAV attributes.
		 * The backend Sabre plugin serialises it as a JSON string in the
		 * {http://nextcloud.org/ns}files-photospheres-xmp-metadata property,
		 * which init.js registers so it is returned with every PROPFIND.
		 *
		 * @return {object|null}
		 */
		xmpMeta() {
			const rawValue = this.currentFile?.attributes?.['files-photospheres-xmp-metadata']
			if (typeof rawValue === 'string') {
				try {
					return JSON.parse(rawValue)
				} catch (e) {
					console.warn('files_photospheres: failed to parse XMP metadata JSON', e, rawValue)
					return null
				}
			}
			return rawValue ?? null
		},

		/**
		 * The direct download URL for the panorama image.
		 * The Nextcloud viewer passes the URL in `currentFile.source`.
		 *
		 * @return {string}
		 */
		imageUrl() {
			return this.currentFile?.source ?? ''
		},

		/**
		 * Human-readable caption shown inside the viewer.
		 *
		 * @return {string}
		 */
		caption() {
			return this.currentFile?.basename ?? this.currentFile?.name ?? ''
		},
	},

	watch: {
		active(newVal) {
			if (newVal) {
				this.$nextTick(() => this.initViewer())
			} else {
				this.destroyViewer()
			}
		},
	},

	mounted() {
		this.initViewer()
	},

	beforeUnmount() {
		this.destroyViewer()
	},

	methods: {
		/**
		 * Initialise the photo-sphere-viewer inside the container div.
		 */
		initViewer() {
			if (!this.$refs.container || !this.imageUrl) {
				return
			}

			// Build navbar – hide the download button when the file permissions
			// do not include download (NC permissions bit 16 = PERMISSION_SHARE
			// but we check the download header value set by the sharing controller)
			const hideDownload = (document.getElementById('hideDownload')?.value ?? '') === 'true'
			const navbarButtons = ['autorotate', 'zoom', 'move', 'description', 'caption', 'fullscreen', 'stereo', 'gyroscope']
			if (!hideDownload) {
				navbarButtons.splice(3, 0, 'download')
			}

			/** @type {import('@photo-sphere-viewer/core').ViewerConfig} */
			const config = {
				container: this.$refs.container,
				panorama: this.imageUrl,
				caption: this.caption,
				// Fix iframe / cross-origin cookie problem on Safari (#32)
				withCredentials: true,
				plugins: [
					GyroscopePlugin,
					StereoPlugin,
					AutorotatePlugin.withConfig({
						autostartOnIdle: false,
						autostartDelay: null,
					}),
				],
				navbar: navbarButtons,
			}

			// Apply cropping information from the XMP metadata when present
			if (this.xmpMeta?.containsCroppingConfig) {
				config.panoData = this.xmpMeta.croppingConfig
			}

			try {
				this.viewer = new Viewer(config)
				this.viewer.addEventListener('ready', () => {
					this.$emit('loaded')
				})
			} catch (err) {
				console.error('files_photospheres: failed to initialise PhotoSphereViewer', err)
				this.$emit('error', err)
			}
		},

		/**
		 * Cleanly tear down the viewer when the component is unmounted or
		 * hidden.
		 */
		destroyViewer() {
			if (this.viewer) {
				this.viewer.destroy()
				this.viewer = null
			}
		},
	},
}
</script>

<style>
/* Ensure the viewer fills the full space given by the Nextcloud viewer modal */
.photosphere-viewer-container {
	width: 100%;
	height: 100%;
}

/* Override photo-sphere-viewer's default container style so it adapts to the
   Nextcloud viewer modal dimensions rather than the viewport */
.photosphere-viewer-container .psv-container {
	width: 100% !important;
	height: 100% !important;
}
</style>
