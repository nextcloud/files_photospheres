<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2024 Robin Windey <ro.windey@gmail.com>
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
use PHPUnit\Framework\TestCase;

class CroppingConfigModelTest extends TestCase {
	public function testFromArray() {
		$croppingConfig = CroppingConfigModel::fromArray([
			'fullWidth' => 1,
			'fullHeight' => 2,
			'croppedWidth' => 3,
			'croppedHeight' => 4,
			'croppedX' => 5,
			'croppedY' => 6,
			'poseHeading' => 7,
			'posePitch' => 8,
			'poseRoll' => 9,
		]);

		$this->assertEquals(1, $croppingConfig->fullWidth);
		$this->assertEquals(2, $croppingConfig->fullHeight);
		$this->assertEquals(3, $croppingConfig->croppedWidth);
		$this->assertEquals(4, $croppingConfig->croppedHeight);
		$this->assertEquals(5, $croppingConfig->croppedX);
		$this->assertEquals(6, $croppingConfig->croppedY);
		$this->assertEquals(7, $croppingConfig->poseHeading);
		$this->assertEquals(8, $croppingConfig->posePitch);
		$this->assertEquals(9, $croppingConfig->poseRoll);
	}
}
