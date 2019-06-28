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

class XmpDataReader implements IXmpDataReader {
    
        /**
     * Read files in 100kb blocks
     */
    private static $CHUNK_SIZE = 1024 * 100;

    /**
     * Maximum of blocks to read for xmp-data
     */
    private static $MAX_BLOCK_COUNT = 5;

    /**
     * XML-start-tag for xmp-data
     */
    private static $XMP_START_TAG = '<x:xmpmeta';

    /**
     * XML-end-tag for xmp-data
     */
    private static $XMP_END_TAG = '</x:xmpmeta>';
    
    function __construct() {
     
    }
    
    public function readXmpDataFromFileObject(\OCP\Files\File $file) : array {
        $fileHandle = $file->fopen('rb');
        if (!$fileHandle) {
            throw new \Exception('Could not open file');
        }

        $data = '';
        $blocksRead = 0;

        while (!feof($fileHandle) && strpos($data, self::$XMP_END_TAG) === FALSE && $blocksRead < self::$MAX_BLOCK_COUNT) {
            $chunk = fread($fileHandle, self::$CHUNK_SIZE);
            if ($chunk !== FALSE) {
                $data .= $chunk;
            }
            $blocksRead++;
        }
        fclose($fileHandle);

        return $this->readXmpDataFromFileSting($data);
    }

    private function readXmpDataFromFileSting($fileString) {
        $posStart = strpos($fileString, self::$XMP_START_TAG);
        $posEnd = strpos($fileString, self::$XMP_END_TAG);

        // We need both the start and end tag
        if ($posStart === FALSE || $posEnd === FALSE)
            return array();

        $bufferCutStart = substr($fileString, $posStart);
        $buffer = substr($bufferCutStart, 0, $posEnd + 12);

        return $this->getXmpArrayFromXml($buffer);
    }

    private function getXmpArrayFromXml($xmlString) {
        preg_match('/FullPanoWidthPixels="(.*?)"/', $xmlString, $fullWithMatch);
        preg_match('/FullPanoHeightPixels="(.*?)"/', $xmlString, $fullHeightMatch);
        preg_match('/CroppedAreaImageWidthPixels="(.*?)"/', $xmlString, $croppedAreaWidthMatch);
        preg_match('/CroppedAreaImageHeightPixels="(.*?)"/', $xmlString, $croppedAreaHeightMatch);
        preg_match('/CroppedAreaLeftPixels="(.*?)"/', $xmlString, $croppedAreaLeftMatch);
        preg_match('/CroppedAreaTopPixels="(.*?)"/', $xmlString, $croppedAreaTopMatch);

        $arrReturn = array();

        if ($fullWithMatch) {
            $arrReturn['full_width'] = intval($fullWithMatch[1]);
        }
        if ($fullHeightMatch) {
            $arrReturn['full_height'] = intval($fullHeightMatch[1]);
        }
        if ($croppedAreaWidthMatch) {
            $arrReturn['cropped_width'] = intval($croppedAreaWidthMatch[1]);
        }
        if ($croppedAreaHeightMatch) {
            $arrReturn['cropped_height'] = intval($croppedAreaHeightMatch[1]);
        }
        if ($croppedAreaLeftMatch) {
            $arrReturn['cropped_x'] = intval($croppedAreaLeftMatch[1]);
        }
        if ($croppedAreaTopMatch) {
            $arrReturn['cropped_y'] = intval($croppedAreaTopMatch[1]);
        }

        return $arrReturn;
    }
}
