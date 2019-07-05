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

    /**
     * XML-start-tag for GPano data
     */
    private static $GPANO_START_TAG = 'GPano:';
    
    function __construct() {
     
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
        
        while (!feof($fileHandle) && strpos($data, self::$XMP_END_TAG) === FALSE && $blocksRead < self::$MAX_BLOCK_COUNT) {
            $chunk = fread($fileHandle, self::$CHUNK_SIZE);
            if ($chunk !== FALSE) {
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
        if ($posStart === FALSE || $posEnd === FALSE)
            return $xmpResultModel;

        // Check if we have some GPano data
        $posGpano = strpos($fileString, self::$GPANO_START_TAG);
        $xmpResultModel->containsGpanoData = $posGpano !== FALSE;

        $bufferCutStart = substr($fileString, $posStart);
        $buffer = substr($bufferCutStart, 0, $posEnd + 12);

        $this->fillXmpData($buffer, $xmpResultModel);

        return $xmpResultModel;
    }

    private function fillXmpData($xmlString, XmpResultModel $model) {
        preg_match('/FullPanoWidthPixels((.?=.?"(.*?)")|(>(.*?)<))/', $xmlString, $fullWithMatch);
        preg_match('/FullPanoHeightPixels((.?=.?"(.*?)")|(>(.*?)<))/', $xmlString, $fullHeightMatch);
        preg_match('/CroppedAreaImageWidthPixels((.?=.?"(.*?)")|(>(.*?)<))/', $xmlString, $croppedAreaWidthMatch);
        preg_match('/CroppedAreaImageHeightPixels((.?=.?"(.*?)")|(>(.*?)<))/', $xmlString, $croppedAreaHeightMatch);
        preg_match('/CroppedAreaLeftPixels((.?=.?"(.*?)")|(>(.*?)<))/', $xmlString, $croppedAreaLeftMatch);
        preg_match('/CroppedAreaTopPixels((.?=.?"(.*?)")|(>(.*?)<))/', $xmlString, $croppedAreaTopMatch);

        if (!empty($fullWithMatch)) {
            $model->fullWidth = intval(end($fullWithMatch));
        }
        if (!empty($fullHeightMatch)) {
            $model->fullHeight = intval(end($fullHeightMatch));
        }
        if (!empty($croppedAreaWidthMatch)) {
            $model->croppedWidth = intval(end($croppedAreaWidthMatch));
        }
        if (!empty($croppedAreaHeightMatch)) {
            $model->croppedHeight = intval(end($croppedAreaHeightMatch));
        }
        if (!empty($croppedAreaLeftMatch)) {
            $model->croppedX = intval(end($croppedAreaLeftMatch));
        }
        if (!empty($croppedAreaTopMatch)) {
            $model->croppedY = intval(end($croppedAreaTopMatch));
        }
    }
}
