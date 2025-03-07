import { Filesystem, Directory } from "@capacitor/filesystem";
import { _dbOpen } from "@/services/DatabaseService";
import LogService from "@/services/LogService";
import WalletManagerService from "@/services/WalletManagerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import BlockchainService from "@/services/BlockchainService";

const Log = LogService("Janitor");

export default function JanitorService() {
  return {
    migrateLegacyDatabases,
    recoverWalletFiles,
    fsck,
    purgeStaleData,
  };

  async function migrateLegacyDatabases() {
    try {
      await Filesystem.mkdir({
        path: "selene/",
        directory: Directory.Library,
        recursive: true,
      });
    } catch {
      // empty
    }

    // check for pre-2024.05 .db.bak files
    const getLegacyBackupFiles = async () => {
      try {
        const backupFiles = (
          await Filesystem.readdir({
            path: "/selene",
            directory: Directory.Library,
          })
        ).files.filter((file) => file.type === "file");

        return backupFiles.map((file) => `/selene/${file.name}`);
      } catch (e) {
        Log.error(e);
        return [];
      }
    };

    // copy wallets from database to filesystem
    const extractLegacyWallets = async (legacy_db) => {
      const legacy_wallets = legacy_db.exec("SELECT * FROM wallets");
      const WalletManager = WalletManagerService();
      return Promise.all(
        legacy_wallets.map((wallet) => {
          return WalletManager.exportWalletFile({
            ...wallet,
            created_at: wallet.date_created, // rename date_created field
          });
        })
      );
    };

    // attempt to open a .db file and extract wallet data, then delete the .db file
    const attemptMigration = async (filename) => {
      try {
        // check if legacy db file exists (throws if not exists)
        const legacy_db = await _dbOpen(filename, true);
        await extractLegacyWallets(legacy_db);

        const deleteResult = await Filesystem.deleteFile({
          path: filename,
          directory: Directory.Library,
        });
        Log.log("Migrated legacy database file", filename, deleteResult);
      } catch (e) {
        // empty
      }
    };

    // check for pre-2024.10, 2024.05 databases
    const backupFiles = await getLegacyBackupFiles();
    const attemptFiles = ["selene/selene.db", "db/selene.db", ...backupFiles];

    await Promise.allSettled(
      attemptFiles.map((file) => attemptMigration(file))
    );

    // stale dir
    try {
      await Filesystem.rmdir({
        path: "/db",
        directory: Directory.Library,
        recursive: true,
      });
    } catch (e) {
      // empty
    }
  }

  async function recoverWalletFiles() {
    Log.debug("Searching for lost wallet files");

    const { files: fileWallets } = await Filesystem.readdir({
      path: "/selene/wallets",
      directory: Directory.Library,
    });

    const WalletManager = WalletManagerService();

    const metaWallets = WalletManager.listWallets();

    Log.debug(
      `Found ${fileWallets.length} wallet files, ${metaWallets.length} in database`,
      metaWallets
    );

    // make a list of walletHashes that are on the filesystem, but not in database
    const importWallets = fileWallets
      .map((file) => {
        const walletHash = file.name.split(".")[0];
        return metaWallets.some((w) => w.walletHash === walletHash)
          ? null
          : walletHash;
      })
      .filter((hash) => hash !== null);

    if (importWallets.length > 0) {
      Log.debug("recoverWalletFiles", importWallets);
    }

    return Promise.all(
      importWallets.map((walletHash) =>
        WalletManagerService().importWalletFile(walletHash)
      )
    );
  }

  // fsck: FileSystem Consistency Check
  async function fsck() {
    try {
      await Filesystem.readdir({
        path: "/selene",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene",
        directory: Directory.Library,
      });
    }

    try {
      await Filesystem.readdir({
        path: "/selene/db",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene/db",
        directory: Directory.Library,
      });
    }

    try {
      await Filesystem.readdir({
        path: "/selene/wallets",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene/wallets",
        directory: Directory.Library,
      });
    }

    try {
      await Filesystem.readdir({
        path: "/selene/tx",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene/tx",
        directory: Directory.Library,
      });
    }

    try {
      await Filesystem.readdir({
        path: "/selene/blocks",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene/blocks",
        directory: Directory.Library,
      });
    }
  }

  async function purgeLegacyTransactionFiles() {
    try {
      await Filesystem.rmdir({
        path: "/tx",
        directory: Directory.Library,
        recursive: true,
      });
    } catch (e) {
      // empty
    }
  }

  async function purgeStaleData() {
    await purgeLegacyTransactionFiles();
    await TransactionManagerService().purgeTransactions();
    await BlockchainService().purgeBlocks();
  }
}
