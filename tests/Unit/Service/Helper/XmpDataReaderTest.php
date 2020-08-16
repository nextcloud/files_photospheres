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

namespace OCA\Files_PhotoSpheres\Tests\Unit\Service\Helper;

use Exception;
use PHPUnit\Framework\TestCase;
use OCA\Files_PhotoSpheres\Service\Helper\XmpDataReader;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCP\Files\File;

class XmpDataReaderTest extends TestCase {
	/** @var XmpDataReader */
	private $xmpDataReader;

	public function setUp() {
		$this->xmpDataReader = new XmpDataReader();
	}
	
	/**
	 * @dataProvider dataProvider_Positive
	 */
	public function testUsePanoramaViewer_Positive($path) {
		$testFile = new TestFile($path);
		/** @var XmpResultModel */
		$xmpResultModel = $this->xmpDataReader->readXmpDataFromFileObject($testFile);
		$this->assertTrue($xmpResultModel->usePanoramaViewer);
	}

	/**
	 * @dataProvider dataProvider_Negative
	 */
	public function testUsePanoramaViewer_Negative($path) {
		$testFile = new TestFile($path);
		/** @var XmpResultModel */
		$xmpResultModel = $this->xmpDataReader->readXmpDataFromFileObject($testFile);
		$this->assertFalse($xmpResultModel->usePanoramaViewer);
	}

	public function testThrowsOnCannotOpenFile() {
		$mockFile = $this->createMock(File::class);
		$mockFile->expects($this->once())
			->method('fopen')
			->willReturn(false)
			->withAnyParameters();

		$exceptionThrown = false;
		
		try {
			$this->xmpDataReader->readXmpDataFromFileObject($mockFile);
		}	
		catch(Exception $e) {
			$exceptionThrown = true;
			$this->assertTrue(strpos($e->getMessage(), 'not open file') > 0);
		}	
		
		$this->assertTrue($exceptionThrown);
	}

	public function testReturnsFalseOnMissingXmpStartTag() {
		$testFile = new TestFile('./tests/Testdata/missing_starttag.jpg');
		/** @var XmpResultModel */
		$xmpResultModel = $this->xmpDataReader->readXmpDataFromFileObject($testFile);
		$this->assertFalse($xmpResultModel->usePanoramaViewer);
	}

	public function testReturnsFalseOnMissingXmpEndTag() {
		$testFile = new TestFile('./tests/Testdata/missing_endtag.jpg');
		/** @var XmpResultModel */
		$xmpResultModel = $this->xmpDataReader->readXmpDataFromFileObject($testFile);
		$this->assertFalse($xmpResultModel->usePanoramaViewer);
	}

	public function testReturnsFalseOnMissingXmpTags() {
		$testFile = new TestFile('./tests/Testdata/missing_tags.jpg');
		/** @var XmpResultModel */
		$xmpResultModel = $this->xmpDataReader->readXmpDataFromFileObject($testFile);
		$this->assertFalse($xmpResultModel->usePanoramaViewer);
	}

	public function dataProvider_Positive() {
		$ret = [];
		for ($i = 1; $i <= 9; $i++) {
			$path = realpath("./tests/Testdata/pos$i.jpg");
			$ret[] = [ $path ];
		}
		return $ret;
	}

	public function dataProvider_Negative() {
		$ret = [];
		for ($i = 1; $i <= 2; $i++) {
			$path = realpath("./tests/Testdata/neg$i.jpg");
			$ret[] = [ $path ];
		}
		return $ret;
	}
}

class TestFile implements File {
	private $filePath;
	
	public function __construct($filePath) {
		$this->filePath = $filePath;
	}

	public function getContent() {
	}
	public function putContent($data) {
	}
	public function getMimeType() {
		return "";
	}
	public function fopen($mode) {
		return fopen($this->filePath, $mode);
	}
	public function hash($type, $raw = false) {
	}
	public function move($targetPath) {
	}
	public function delete() {
	}
	public function copy($targetPath) {
	}
	public function touch($mtime = null) {
	}
	public function lock($type) {
	}
	public function changeLock($targetType) {
	}
	public function unlock($type) {
	}
	public function getEtag() {
	}
	public function getSize($includeMounts = true) {
	}
	public function getMtime() {
	}
	public function getName() {
	}
	public function getInternalPath() {
	}
	public function getPath() {
	}
	public function getMimePart() {
	}
	public function getStorage() {
	}
	public function getId() {
	}
	public function isEncrypted() {
	}
	public function getPermissions() {
	}
	public function getType() {
	}
	public function isReadable() {
	}
	public function isUpdateable() {
	}
	public function getExtension(): string {
		return "";
	}
	public function getCreationTime(): int {
		return 0;
	}
	public function getChecksum() {
	}
	public function stat() {
	}
	public function isDeletable() {
	}
	public function isShareable() {
	}
	public function getParent() {
	}
	public function isCreatable() {
	}
	public function isShared() {
	}
	public function isMounted() {
	}
	public function getMountPoint() {
	}
	public function getOwner() {
	}
	public function getUploadTime() : int {
		return 0;
	}
}
