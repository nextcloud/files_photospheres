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

	public static function fromArray(array $data) {
		$xmpResult = new XmpResultModel();
		$xmpResult->usePanoramaViewer = (bool)($data['usePanoramaViewer'] ?? false);
		$xmpResult->containsCroppingConfig = (bool)($data['containsCroppingConfig'] ?? false);
		$croppingConfig = $data['croppingConfig'] ?? [];
		$xmpResult->croppingConfig = CroppingConfigModel::fromArray(is_array($croppingConfig) ? $croppingConfig : []);
		return $xmpResult;
	}

	/**
	 * Representation used both for the DAV property value and for the
	 * value stored through the files metadata API
	 * (see \OCA\Files_PhotoSpheres\Listener\XmpMetadataListener).
	 */
	public function toArray(): array {
		return [
			'usePanoramaViewer' => $this->usePanoramaViewer,
			'containsCroppingConfig' => $this->containsCroppingConfig,
			'croppingConfig' => $this->croppingConfig->toArray()
		];
	}

	public function xmlSerialize(Writer $writer) {
		// Serialize as JSON text content instead of XML sub-elements.
		// NC33+ WebDAV client reads element.textContent which would concatenate
		// all child text nodes into garbage when using XML sub-elements.
		$json = json_encode($this->toArray());
		$writer->write($json !== false ? $json : '{}');
	}
}
