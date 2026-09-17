<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2026 Robin Windey <ro.windey@gmail.com>
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


namespace OCA\Files_PhotoSpheres\Tests\Unit\Command;

use OCA\Files_PhotoSpheres\Command\GenerateMetadataCommand;
use OCA\Files_PhotoSpheres\Model\XmpResultModel;
use OCA\Files_PhotoSpheres\Service\XmpMetadataStorage;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\Files\IUserFolder;
use OCP\IUser;
use OCP\IUserManager;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;

class GenerateMetadataCommandTest extends TestCase {
	private IUserManager|MockObject $userManager;
	private IRootFolder|MockObject $rootFolder;
	private XmpMetadataStorage|MockObject $xmpMetadataStorage;
	private GenerateMetadataCommand $command;

	protected function setUp(): void {
		parent::setUp();
		$this->userManager = $this->createMock(IUserManager::class);
		$this->rootFolder = $this->createMock(IRootFolder::class);
		$this->xmpMetadataStorage = $this->createMock(XmpMetadataStorage::class);
		$this->command = new GenerateMetadataCommand($this->userManager, $this->rootFolder, $this->xmpMetadataStorage);
	}

	public function testFailsWithoutUserIdsOrAllFlag() {
		$this->userManager->expects($this->never())
			->method('userExists');
		$this->rootFolder->expects($this->never())
			->method('getUserFolder');

		$exitCode = $this->command->run(new ArrayInput([]), new BufferedOutput());

		$this->assertSame(1, $exitCode);
	}

	public function testWarnsAndSkipsUnknownUser() {
		$this->userManager->method('userExists')
			->with('unknown')
			->willReturn(false);
		$this->rootFolder->expects($this->never())
			->method('getUserFolder');

		$output = new BufferedOutput();
		$exitCode = $this->command->run(new ArrayInput(['user_id' => ['unknown']]), $output);

		$this->assertSame(0, $exitCode);
		$this->assertStringContainsString('Unknown user', $output->fetch());
	}

	public function testProcessesJpegFilesRecursivelyForGivenUser() {
		$this->userManager->method('userExists')
			->with('alice')
			->willReturn(true);

		$jpeg1 = $this->fileMock('image/jpeg');
		$jpeg2 = $this->fileMock('image/jpeg');
		$nonJpeg = $this->fileMock('application/pdf');
		$subFolder = $this->createMock(Folder::class);
		$subFolder->method('getDirectoryListing')
			->willReturn([$jpeg2]);

		$userFolder = $this->createMock(IUserFolder::class);
		$userFolder->method('getDirectoryListing')
			->willReturn([$jpeg1, $nonJpeg, $subFolder]);

		$this->rootFolder->expects($this->once())
			->method('getUserFolder')
			->with('alice')
			->willReturn($userFolder);

		$this->xmpMetadataStorage->expects($this->exactly(2))
			->method('computeAndPersist')
			->willReturnCallback(function ($file) use ($jpeg1, $jpeg2) {
				$this->assertContains($file, [$jpeg1, $jpeg2]);
				$result = new XmpResultModel();
				$result->usePanoramaViewer = ($file === $jpeg2);
				return $result;
			});

		$output = new BufferedOutput();
		$exitCode = $this->command->run(new ArrayInput(['user_id' => ['alice']]), $output);

		$this->assertSame(0, $exitCode);
		$this->assertStringContainsString('Scanned 2 jpeg file(s), found 1 photosphere(s)', $output->fetch());
	}

	public function testAllFlagUsesCallForSeenUsers() {
		$user = $this->createMock(IUser::class);
		$user->method('getUID')
			->willReturn('bob');
		$this->userManager->expects($this->once())
			->method('callForSeenUsers')
			->willReturnCallback(function (\Closure $callback) use ($user) {
				$callback($user);
			});

		$userFolder = $this->createMock(IUserFolder::class);
		$userFolder->method('getDirectoryListing')
			->willReturn([]);
		$this->rootFolder->expects($this->once())
			->method('getUserFolder')
			->with('bob')
			->willReturn($userFolder);

		$exitCode = $this->command->run(new ArrayInput(['--all' => true]), new BufferedOutput());

		$this->assertSame(0, $exitCode);
	}

	private function fileMock(string $mimetype) : File|MockObject {
		$file = $this->createMock(File::class);
		$file->method('getMimetype')
			->willReturn($mimetype);
		return $file;
	}
}
