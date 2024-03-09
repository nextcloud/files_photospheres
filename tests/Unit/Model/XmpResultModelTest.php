<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2023 Robin Windey <ro.windey@gmail.com>
 *
 *  @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


namespace OCA\Files_PhotoSpheres\Tests\Unit\Model;

use OCA\Files_PhotoSpheres\Model\CroppingConfigModel;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use PHPUnit\Framework\TestCase;
use Sabre\Xml\Writer;

class XmpResultModelTest extends TestCase {
	public function testXmlSerialize() {
		$writerMock = $this->createMock(Writer::class);
		$xmpModel = new XmpResultModel();
		
		$xmpModel->usePanoramaViewer = false;
		$xmpModel->containsCroppingConfig = true;
		$croppingConfig = new CroppingConfigModel();
		$croppingConfig->fullWidth = 1;
		$croppingConfig->fullHeight = 2;
		$croppingConfig->croppedWidth = 3;
		$croppingConfig->croppedHeight = 4;
		$croppingConfig->croppedX = 5;
		$croppingConfig->croppedY = 6;
		$croppingConfig->poseHeading = 7;
		$croppingConfig->posePitch = 8;
		$croppingConfig->poseRoll = 9;
		$xmpModel->croppingConfig = $croppingConfig;

		$expectedArray = [
			'usePanoramaViewer' => false,
			'containsCroppingConfig' => true,
			'croppingConfig' => [
				'fullWidth' => 1,
				'fullHeight' => 2,
				'croppedWidth' => 3,
				'croppedHeight' => 4,
				'croppedX' => 5,
				'croppedY' => 6,
				'poseHeading' => 7,
				'posePitch' => 8,
				'poseRoll' => 9,
			]
		];

		$writerMock->expects($this->once())
			->method('write')
			->with($this->equalTo($expectedArray));

		$xmpModel->xmlSerialize($writerMock);
	}

	public function testCanBeSerializedAndDeserialized() {
		$xmpModel = new XmpResultModel();
		
		$xmpModel->usePanoramaViewer = false;
		$xmpModel->containsCroppingConfig = true;
		$croppingConfig = new CroppingConfigModel();
		$croppingConfig->fullWidth = 1;
		$croppingConfig->fullHeight = 2;
		$croppingConfig->croppedWidth = 3;
		$croppingConfig->croppedHeight = 4;
		$croppingConfig->croppedX = 5;
		$croppingConfig->croppedY = 6;
		$croppingConfig->poseHeading = 7;
		$croppingConfig->posePitch = 8;
		$croppingConfig->poseRoll = 9;
		$xmpModel->croppingConfig = $croppingConfig;

		// This is important to be able to add the XmpResultModel to the apcu cache
		$serialized = serialize($xmpModel);
		$deserialized = unserialize($serialized);

		$this->assertEquals($xmpModel, $deserialized);
	}

	public function testFromArray() {
		$data = [
			'usePanoramaViewer' => false,
			'containsCroppingConfig' => true,
			'croppingConfig' => [
				'fullWidth' => 1,
				'fullHeight' => 2,
				'croppedWidth' => 3,
				'croppedHeight' => 4,
				'croppedX' => 5,
				'croppedY' => 6,
				'poseHeading' => 7,
				'posePitch' => 8,
				'poseRoll' => 9,
			]
		];

		$xmpModel = XmpResultModel::fromArray($data);

		$this->assertEquals($data['usePanoramaViewer'], $xmpModel->usePanoramaViewer);
		$this->assertEquals($data['containsCroppingConfig'], $xmpModel->containsCroppingConfig);
		$this->assertEquals($data['croppingConfig']['fullWidth'], $xmpModel->croppingConfig->fullWidth);
		$this->assertEquals($data['croppingConfig']['fullHeight'], $xmpModel->croppingConfig->fullHeight);
		$this->assertEquals($data['croppingConfig']['croppedWidth'], $xmpModel->croppingConfig->croppedWidth);
		$this->assertEquals($data['croppingConfig']['croppedHeight'], $xmpModel->croppingConfig->croppedHeight);
		$this->assertEquals($data['croppingConfig']['croppedX'], $xmpModel->croppingConfig->croppedX);
		$this->assertEquals($data['croppingConfig']['croppedY'], $xmpModel->croppingConfig->croppedY);
		$this->assertEquals($data['croppingConfig']['poseHeading'], $xmpModel->croppingConfig->poseHeading);
		$this->assertEquals($data['croppingConfig']['posePitch'], $xmpModel->croppingConfig->posePitch);
		$this->assertEquals($data['croppingConfig']['poseRoll'], $xmpModel->croppingConfig->poseRoll);
	}
}
