<?php

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
 * A model for the "pano_data"-config JS-object
 * for photosphere-viewer.js (see https://photo-sphere-viewer.js.org/index.html
 * -> Advanced Options -> pano_data)
 */

namespace OCA\Files_PhotoSpheres\Model;

class CroppingConfigModel {
	/*
		This is the structure in JS:
		full_width: 6000,
		full_height: 3000,
		cropped_width: 4000,
		cropped_height: 2000,
		cropped_x: 1000,
		cropped_y: 500
	*/

	/** @var int */
	public $full_width;

	/** @var int */
	public $full_height;

	/** @var int */
	public $cropped_width;

	/** @var int */
	public $cropped_height;

	/** @var int */
	public $cropped_x;

	/** @var int */
	public $cropped_y;
}
