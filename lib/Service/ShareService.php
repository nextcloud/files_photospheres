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

namespace OCA\Files_PhotoSpheres\Service;

use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCP\Share\IManager as ShareManager;
use OCP\Share\Exceptions\ShareNotFound;

/**
 * class ShareService
 *
 * @package OCA\Files_PhotoSpheres\Service;
 */
class ShareService implements IShareService {

    /**
     * @var ShareManager 
     */
    private $shareManager;

    /**
     *
     * @var IXmpDataReader
     */
    private $xmpDataReader;

    public function __construct(ShareManager $shareManager, IXmpDataReader $xmpDataReader) {
        $this->shareManager = $shareManager;
        $this->xmpDataReader = $xmpDataReader;
    }

    /**
     * 
     * @param string $shareToken
     * @return array|NULL
     */
    public function getXmpData($shareToken): array {
        // This part is taken from OCA\Files_Sharing\Controller
        // Check whether share exists 
        try {
            $share = $this->shareManager->getShareByToken($shareToken);
        } catch (ShareNotFound $e) {
            throw new \Exception('Share not found');
        }

        if (!$this->validateShare($share)) {
            throw new \Exception('Share not found');
        }

        $shareNode = $share->getNode();

        return $this->xmpDataReader->readXmpDataFromFileObject($shareNode);
    }

    /**
     * Validate the permissions of the share
     *
     * @param Share\IShare $share
     * @return bool
     */
    private function validateShare(\OCP\Share\IShare $share) {
        return $share->getNode()->isReadable() && $share->getNode()->isShareable();
    }

}
