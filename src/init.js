/**
 * Nextcloud - Files_PhotoSpheres
 *
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Robin Windey <ro.windey@gmail.com>
 *
 * @copyright Robin Windey 2023
 *
 * Init script for the app
 */
import { registerDavProperty } from '@nextcloud/files/dav'

registerDavProperty('nc:files-photospheres-xmp-metadata');