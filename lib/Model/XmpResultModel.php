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
 */

namespace OCA\Files_PhotoSpheres\Model;

use Sabre\Xml\Writer;
use Sabre\Xml\XmlSerializable;

class XmpResultModel implements XmlSerializable {
	
	/** @var bool */
	public $usePanoramaViewer = false;

	/** @var bool */
	public $containsCroppingConfig = false;

	/** @var CroppingConfigModel */
	public $croppingConfig;

	public function __construct() {
		$this->croppingConfig = new CroppingConfigModel();
	}

	public function xmlSerialize(Writer $writer) {
		$writer->write([
			'usePanoramaViewer' => $this->usePanoramaViewer,
			'containsCroppingConfig' => $this->containsCroppingConfig,
			'croppingConfig' => [
				'fullWidth' => $this->croppingConfig->fullWidth,
				'fullHeight' => $this->croppingConfig->fullHeight,
				'croppedWidth' => $this->croppingConfig->croppedWidth,
				'croppedHeight' => $this->croppingConfig->croppedHeight,
				'croppedX' => $this->croppingConfig->croppedX,
				'croppedY' => $this->croppingConfig->croppedY,
				'poseHeading' => $this->croppingConfig->poseHeading,
				'posePitch' => $this->croppingConfig->posePitch,
				'poseRoll' => $this->croppingConfig->poseRoll
			]
		]);

	}
}
