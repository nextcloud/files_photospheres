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
		This is the structure in JS (see TextureLoader.js line 243):

		{
			fullWidth,
			fullHeight,
			croppedWidth,
			croppedHeight,
			croppedX,
			croppedY,
			poseHeading,
			posePitch,
			poseRoll
		}
	*/

	/** @var int|null */
	public $fullWidth;

	/** @var int|null */
	public $fullHeight;

	/** @var int|null */
	public $croppedWidth;

	/** @var int|null */
	public $croppedHeight;

	/** @var int|null */
	public $croppedX;

	/** @var int|null */
	public $croppedY;

	/** @var float|null */
	public $poseHeading;

	/** @var float|null */
	public $posePitch;

	/** @var float|null */
	public $poseRoll;

	public static function fromArray(array $data) {
		$croppingConfig = new CroppingConfigModel();
		$croppingConfig->fullWidth = $data['fullWidth'];
		$croppingConfig->fullHeight = $data['fullHeight'];
		$croppingConfig->croppedWidth = $data['croppedWidth'];
		$croppingConfig->croppedHeight = $data['croppedHeight'];
		$croppingConfig->croppedX = $data['croppedX'];
		$croppingConfig->croppedY = $data['croppedY'];
		$croppingConfig->poseHeading = $data['poseHeading'];
		$croppingConfig->posePitch = $data['posePitch'];
		$croppingConfig->poseRoll = $data['poseRoll'];
		return $croppingConfig;
	}
}
