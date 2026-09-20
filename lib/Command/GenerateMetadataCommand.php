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


namespace OCA\Files_PhotoSpheres\Command;

use OCA\Files_PhotoSpheres\Service\XmpMetadataStorage;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\Files\Node;
use OCP\IUserManager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * class GenerateMetadataCommand
 *
 * Backfills the pre-generated XMP metadata (see XmpMetadataStorage) for jpeg
 * files which already existed before this feature was added, or which
 * otherwise were never touched by an upload/edit since. Running it is
 * entirely optional: files without pre-generated metadata are simply
 * resolved on demand instead, on first click (see
 * UserfilesController::getXmpData()).
 *
 * Deliberately its own command instead of hooking into
 * `occ files:scan --generate-metadata`: that command walks the whole
 * instance as part of upgrades/health checks too, which would tie this
 * app's (potentially slow, file-reading) metadata generation to unrelated
 * operations. This command only ever runs when an administrator explicitly
 * asks for it.
 *
 * @package OCA\Files_PhotoSpheres\Command;
 */
class GenerateMetadataCommand extends Command {
	/** @var IUserManager */
	private $userManager;

	/** @var IRootFolder */
	private $rootFolder;

	/** @var XmpMetadataStorage */
	private $xmpMetadataStorage;

	/** @var int */
	private $scanned = 0;

	/** @var int */
	private $found = 0;

	public function __construct(IUserManager $userManager, IRootFolder $rootFolder, XmpMetadataStorage $xmpMetadataStorage) {
		parent::__construct();
		$this->userManager = $userManager;
		$this->rootFolder = $rootFolder;
		$this->xmpMetadataStorage = $xmpMetadataStorage;
	}

	protected function configure(): void {
		$this
			->setName('files_photospheres:generate-metadata')
			->setDescription(
				'Pre-generate photosphere XMP metadata for existing jpeg files. '
				. 'This is optional: files without pre-generated metadata are '
				. 'resolved on demand instead, the first time they are opened.'
			)
			->addArgument(
				'user_id',
				InputArgument::IS_ARRAY | InputArgument::OPTIONAL,
				'Only generate metadata for the given user id(s)'
			)
			->addOption(
				'all',
				null,
				InputOption::VALUE_NONE,
				'Generate metadata for all users who have logged in at least once'
			);
	}

	protected function execute(InputInterface $input, OutputInterface $output): int {
		$userIds = $input->getArgument('user_id');
		$all = (bool)$input->getOption('all');

		if (!$all && empty($userIds)) {
			$output->writeln('<error>Either pass one or more user ids, or --all.</error>');
			return 1;
		}

		if ($all) {
			$this->userManager->callForSeenUsers(function (\OCP\IUser $user) use ($output): void {
				$this->processUser($user->getUID(), $output);
			});
		} else {
			foreach ($userIds as $userId) {
				if (!$this->userManager->userExists($userId)) {
					$output->writeln("<error>Unknown user: $userId</error>");
					continue;
				}
				$this->processUser($userId, $output);
			}
		}

		$output->writeln("Scanned <info>{$this->scanned}</info> jpeg file(s), found <info>{$this->found}</info> photosphere(s).");
		return 0;
	}

	private function processUser(string $userId, OutputInterface $output): void {
		$output->writeln("Processing user <info>$userId</info>");
		$this->processFolder($this->rootFolder->getUserFolder($userId), $output);
	}

	private function processFolder(Folder $folder, OutputInterface $output): void {
		foreach ($folder->getDirectoryListing() as $node) {
			if ($node instanceof Folder) {
				$this->processFolder($node, $output);
				continue;
			}

			if (!$this->isJpeg($node)) {
				continue;
			}

			$this->scanned++;
			/** @var File $node */
			$metadata = $this->xmpMetadataStorage->computeAndPersist($node);
			if ($metadata !== null && $metadata->usePanoramaViewer) {
				$this->found++;
				$output->writeln("  Photosphere found: <info>{$node->getPath()}</info>", OutputInterface::VERBOSITY_VERBOSE);
			}
		}
	}

	private function isJpeg(Node $node): bool {
		return $node instanceof File && $node->getMimetype() === 'image/jpeg';
	}
}
