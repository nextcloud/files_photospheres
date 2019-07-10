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
    
    /** @var bool */
    public $containsGpanoData = FALSE;

    /** @var bool */
    public $containsCroppingConfig = FALSE;

    /** @var CroppingConfigModel */
    public $croppingConfig;

    function __construct() {
        $this->croppingConfig = new CroppingConfigModel();
    }
}