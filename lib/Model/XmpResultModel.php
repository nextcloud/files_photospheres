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

class XmpResultModel {
    
    /** @var int */
    public $containsGpanoData = FALSE;

    /** @var int */
    public $fullWidth;

    /** @var int */
    public $fullHeight;

    /** @var int */
    public $croppedWidth;

    /** @var int */
    public $croppedHeight;

    /** @var int */
    public $croppedX;

    /** @var int */
    public $croppedY;
}