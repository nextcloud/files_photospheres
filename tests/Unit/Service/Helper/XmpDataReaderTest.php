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
use JsonMapper;
use OCA\Files_PhotoSpheres\Model\CroppingConfigModel;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Service\Helper\IRegexMatcher;
use OCA\Files_PhotoSpheres\Service\Helper\RegexMatcher;
use OCA\Files_PhotoSpheres\Service\Helper\XmpDataReader;
use OCP\Files\File;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class XmpDataReaderTest extends TestCase {
	/** @var XmpDataReader */
	private $xmpDataReader;

	/** @var LoggerInterface|MockObject */
	private $logger;

	public function setUp() : void {
		parent::setUp();
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->xmpDataReader = new XmpDataReader($this->logger, new RegexMatcher());
	}

	/**
	 * @dataProvider dataProvider_Positive
	 */
	public function testUsePanoramaViewer_Positive($path) {
		$testFile = new TestFile($path);
		/** @var XmpResultModel */
		$xmpResultModel = $this->xmpDataReader->readXmpDataFromFileObject($testFile);
		$this->assertTrue($xmpResultModel->usePanoramaViewer);

		$testFileInfo = pathinfo($path);
		$jsonFile = $testFileInfo['dirname'] . '/' . $testFileInfo['filename'] . '.json';
		if (file_exists($jsonFile)) {
			// If we have the data payload as JSON we can check that, too
			$jsonMapper = new JsonMapper();
			$expectedCroppingConfig = $jsonMapper->map(json_decode(file_get_contents($jsonFile)), new CroppingConfigModel());
			$this->assertEquals($expectedCroppingConfig, $xmpResultModel->croppingConfig);
		}
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
		} catch (Exception $e) {
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

	public function testLogsWarningOnRegexError_GpanoTag() {
		$loggerMock = $this->createMock(LoggerInterface::class);
		$loggerMock->expects($this->once())
			->method('warning');

		$gPanoMatchCnt = 0;
		$realMatcher = new RegexMatcher();
		$regexMatcherMock = $this->createMock(IRegexMatcher::class);
		$regexMatcherMock
			->method('preg_match')
			->willReturnCallback(function (string $pattern, string $subject, ?array &$matches = null, int $flags = 0, int $offset = 0) use ($gPanoMatchCnt, $realMatcher) {
				// Fake gpano match does not succeed
				if ($pattern === '/GPano:/') {
					return false;
				}
				// Proxy to real regex match
				return $realMatcher->preg_match($pattern, $subject, $matches);
			});

		$testFile = new TestFile('./tests/Testdata/pos1.jpg');

		$reader = new XmpDataReader($loggerMock, $regexMatcherMock);
		$reader->readXmpDataFromFileObject($testFile);
	}

	public function testLogsWarningOnRegexError_XmpMetadata() {
		$loggerMock = $this->createMock(LoggerInterface::class);
		$loggerMock->expects($this->atLeast(1))
			->method('warning');

		$regexMatcherMock = $this->createMock(IRegexMatcher::class);
		$regexMatcherMock
			->method('preg_match')
			->willReturnCallback(function () {
				$args = func_get_args();
				// Fake gpano match succeeds
				return $args[0] === '/GPano:/';
			});

		$testFile = new TestFile('./tests/Testdata/pos1.jpg');

		$reader = new XmpDataReader($loggerMock, $regexMatcherMock);
		$reader->readXmpDataFromFileObject($testFile);
	}

	public function dataProvider_Positive() {
		return $this->readTestFiles('pos*.jpg');
	}

	public function dataProvider_Negative() {
		return $this->readTestFiles('neg*.jpg');
	}

	private function readTestFiles(string $globPattern) {
		$ret = [];
		foreach (glob(realpath('./tests/Testdata') . "/$globPattern") as $path) {
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
		return '';
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
		return '';
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
	public function getParentId() : int {
		return 0;
	}
	public function getMetadata(): array {
		return [];
	}
}
