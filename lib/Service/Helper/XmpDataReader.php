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

namespace OCA\Files_PhotoSpheres\Service\Helper;

use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use Psr\Log\LoggerInterface;

/*
 *  See https://developers.google.com/streetview/spherical-metadata
 */
class XmpDataReader implements IXmpDataReader {
	
	/**
	 * Read files in 8kb blocks
	 */
	private static $CHUNK_SIZE = 8192;

	/**
	 * Maximum of blocks to read for xmp-data
	 * (read max 800kb of the file)
	 */
	private static $MAX_BLOCK_COUNT = 100;

	/**
	 * XML-start-tag for xmp-data
	 */
	private static $XMP_START_TAG = '<x:xmpmeta';

	/**
	 * XML-end-tag for xmp-data
	 */
	private static $XMP_END_TAG = '</x:xmpmeta>';

	/** @var LoggerInterface */
	private $logger;

	/** @var IRegexMatcher */
	private $regexMatcher;

	public function __construct(LoggerInterface $logger, IRegexMatcher $regexMatcher) {
		$this->logger = $logger;
		$this->regexMatcher = $regexMatcher;
	}
	
	public function readXmpDataFromFileObject(\OCP\Files\File $file) : XmpResultModel {
		$firstFileBytesString = $this->readFirstFileBlocks($file);
		return $this->readXmpDataFromFileSting($firstFileBytesString);
	}

	private function readFirstFileBlocks(\OCP\Files\File $file) : string {
		$fileHandle = $file->fopen('rb');
		if (!$fileHandle) {
			throw new \Exception('Could not open file');
		}

		$data = '';
		$blocksRead = 0;
		
		while (!feof($fileHandle) && strpos($data, self::$XMP_END_TAG) === false && $blocksRead < self::$MAX_BLOCK_COUNT) {
			$chunk = fread($fileHandle, self::$CHUNK_SIZE);
			if ($chunk !== false) {
				$data .= $chunk;
			}
			$blocksRead++;
		}
		fclose($fileHandle);

		return $data;
	}

	private function readXmpDataFromFileSting($fileString) : XmpResultModel {
		$posStart = strpos($fileString, self::$XMP_START_TAG);
		$posEnd = strpos($fileString, self::$XMP_END_TAG);

		$xmpResultModel = new XmpResultModel();

		// We need both the start and end tag
		if ($posStart === false || $posEnd === false) {
			return $xmpResultModel;
		}

		// Check if we should use panoramaviewer
		$xmpResultModel->usePanoramaViewer = $this->shouldUsePanoramaViewer($fileString);

		$bufferCutStart = substr($fileString, $posStart);
		$buffer = substr($bufferCutStart, 0, $posEnd + 12);

		$this->fillXmpData($buffer, $xmpResultModel);

		return $xmpResultModel;
	}

	private function shouldUsePanoramaViewer($xmlString) : bool {
		// GPano:UsePanoramaViewer tag (optional)
		$usePanoViewerStr = $this->getXmpStringValue($xmlString, 'UsePanoramaViewer');
		if ($usePanoViewerStr !== null) {
			return strtolower($usePanoViewerStr) === "true";
		}

		// Since GPano:UsePanoramaViewer is optional, take a look at GPano:ProjectionType
		$projectionTypeStr = $this->getXmpStringValue($xmlString, 'ProjectionType');
		if ($projectionTypeStr !== null) {
			return strtolower($projectionTypeStr) === "equirectangular";
		}

		/*
			We also support VR180. These cameras often don't set the
			 ProjectionType but it's mandatory to set GImage:Mime
			(see https://developers.google.com/vr/reference/cardboard-camera-vr-photo-format).
			So if that tag is set to image/jpg in the first xmpdata block,
			we can guess that it's a VR180 image which can be shown by our app.
		*/
		$gImageMimeStr = $this->getXmpStringValue($xmlString, 'Mime', 'GImage');
		if ($gImageMimeStr !== null) {
			return strtolower($gImageMimeStr) === "image/jpeg";
		}

		return false;
	}

	private function fillXmpData($xmlString, XmpResultModel $model) {
		/*
			This logic is mainly taken from photo-sphere-viewer.js -> TextureLoader.js
		*/
		$gPanoMatch = $this->regexMatcher->preg_match('/GPano:/', $xmlString);
		if ($gPanoMatch === false) {
			$this->logger->warning("Regex match on 'GPano:' failed");
			return;
		}
		if ($gPanoMatch === 0) {
			// containsCroppingConfig is false here
			return;
		}

		$model->containsCroppingConfig = true;

		$model->croppingConfig->fullWidth = $this->getXmpIntValue($xmlString, 'FullPanoWidthPixels');
		$model->croppingConfig->fullHeight = $this->getXmpIntValue($xmlString, 'FullPanoHeightPixels');
		$model->croppingConfig->croppedWidth = $this->getXmpIntValue($xmlString, 'CroppedAreaImageWidthPixels');
		$model->croppingConfig->croppedHeight = $this->getXmpIntValue($xmlString, 'CroppedAreaImageHeightPixels');
		$model->croppingConfig->croppedX = $this->getXmpIntValue($xmlString, 'CroppedAreaLeftPixels');
		$model->croppingConfig->croppedY = $this->getXmpIntValue($xmlString, 'CroppedAreaTopPixels');
		$model->croppingConfig->poseHeading = $this->getXmpFloatValue($xmlString, 'PoseHeadingDegrees');
		$model->croppingConfig->posePitch = $this->getXmpFloatValue($xmlString, 'PosePitchDegrees');
		$model->croppingConfig->poseRoll = $this->getXmpFloatValue($xmlString, 'PoseRollDegrees');
	}

	private function getXmpStringValue(string $xmlString, string $xmpKey, string $xmlNs = 'GPano') : ?string {
		// XMP data can be stored in attributes or separate nodes
		$matchResult = $this->regexMatcher->preg_match("/$xmlNs:$xmpKey((.?=.?\"(.*?)\")|(>(.*?)<))/", $xmlString, $matchValues);

		if ($matchResult === false) {
			$this->logger->warning("Regex match on XMP metadata '$xmpKey' failed");
			return null;
		}

		return $matchResult === 1 ? end($matchValues) : null;
	}

	private function getXmpIntValue(string $xmlString, string $xmpKey) : ?int {
		$str = $this->getXmpStringValue($xmlString, $xmpKey);

		return $str !== null ? intval($str) : null;
	}

	private function getXmpFloatValue(string $xmlString, string $xmpKey) : ?float {
		$str = $this->getXmpStringValue($xmlString, $xmpKey);

		return $str !== null ? floatval($str) : null;
	}
}
