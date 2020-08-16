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
 * @copyright Robin Windey 2020
 */

namespace OCA\Files_PhotoSpheres\Tests\Unit\Service;

use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use PHPUnit\Framework\TestCase;
use OCP\Share\IManager;
use PHPUnit\Framework\MockObject\MockObject;
use OCA\Files_PhotoSpheres\Service\Helper\IXmpDataReader;
use OCA\Files_PhotoSpheres\Service\ShareService;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Share\Exceptions\ShareNotFound;
use OCP\Share\IShare;

class ShareServiceTest extends TestCase {

    /** @var IManager|MockObject */
    private $shareManager;

    /** @var IXmpDataReader|MockObject */
    private $xmpDataReader;

    /** @var ShareService */
    private $shareService;

    public function setUp() {
        $this->shareManager = $this->createMock(IManager::class);
        $this->xmpDataReader = $this->createMock(IXmpDataReader::class);
        $this->shareService = new ShareService($this->shareManager, $this->xmpDataReader);
    }

    public function testSingleFileShare() {
        $sharingToken = 'myFileSharingToken';
        $xmpResult = new XmpResultModel();
        $xmpResult->croppingConfig->full_width = 100;

        $fileMock = $this->createMock(File::class);
        $fileMock->method('isReadable')
            ->willReturn(true);
        $fileMock->method('isShareable')
            ->willReturn(true);

        $shareMock = $this->createMock(IShare::class);
        $shareMock->expects($this->once())
            ->method('getPermissions')
            ->willReturn(\OCP\Constants::PERMISSION_READ);
        $shareMock->method('getNode')
            ->willReturn($fileMock);

        $this->shareManager->expects($this->once())
            ->method('getShareByToken')
            ->with($sharingToken)
            ->willReturn($shareMock);

        $this->xmpDataReader->expects($this->once())
            ->method('readXmpDataFromFileObject')
            ->with($fileMock)
            ->willReturn($xmpResult);

        $returnedXmpResult = $this->shareService->getXmpData($sharingToken);

        $this->assertEquals($xmpResult, $returnedXmpResult);
        $this->assertEquals(100, $returnedXmpResult->croppingConfig->full_width);
    }

    /**
	 * @dataProvider dataProvider_DirectoryTests
	 */
    public function testDirectoryShare($filename, $path) {
        $sharingToken = 'myDirectoryToken';
        $xmpResult = new XmpResultModel();
        $xmpResult->croppingConfig->full_width = 100;

        $dirMock = $this->createMock(Folder::class);
        $dirMock->method('isReadable')
            ->willReturn(true);
        $dirMock->method('isShareable')
            ->willReturn(true);

        $shareMock = $this->createMock(IShare::class);
        $shareMock->expects($this->once())
            ->method('getPermissions')
            ->willReturn(\OCP\Constants::PERMISSION_READ);
        $shareMock->method('getNode')
            ->willReturn($dirMock);

        $innerDirMock = $this->createMock(Folder::class);
        $dirMock->method('get')
            ->with($path)
            ->willReturn($innerDirMock);
        
        $innerFileMock = $this->createMock(File::class);
        $innerDirMock->method('get')
            ->willReturn($filename)
            ->willReturn($innerFileMock);

        $this->shareManager->expects($this->once())
            ->method('getShareByToken')
            ->with($sharingToken)
            ->willReturn($shareMock);

         $this->xmpDataReader->expects($this->once())
             ->method('readXmpDataFromFileObject')
             ->with($innerFileMock)
             ->willReturn($xmpResult);

        $returnedXmpResult = $this->shareService->getXmpData($sharingToken, $filename, $path);

        $this->assertEquals($xmpResult, $returnedXmpResult);
        $this->assertEquals(100, $returnedXmpResult->croppingConfig->full_width);
    }

    public function throwsOnShareNotFound() {
        $this->shareManager->expects($this->once())
            ->method('getShareByToken')
            ->withAnyParameters()
            ->willThrowException(new ShareNotFound('SomeMessage'));
        $this->expectException(ShareNotFound::class);
        $this->shareService->getXmpData('someToken');
    }

    public function dataProvider_DirectoryTests() {
        /* $filename, $path */
        $arr = [
            ['myFileInRoot.jpg', '/'],
            ['myFileInSubFolder.jpg', '/mySubFolder']
        ];
        return $arr;
    }
}