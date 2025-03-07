import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import * as bip39 from "bip39";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import { ValidBchNetwork } from "@/util/electrum_servers";
import {
  ValidDerivationPath,
  DEFAULT_DERIVATION_PATH,
} from "@/util/derivation";
import { sha256 } from "@/util/hash";
import { store } from "@/redux";
import { selectBchNetwork } from "@/redux/preferences";

const Log = LogService("WalletManager");

export interface WalletStub {
  mnemonic: string;
  passphrase: string;
  derivation: ValidDerivationPath;
}

export interface WalletMeta {
  walletHash: string;
  name: string;
  balance: number;
  created_at: string;
  key_viewed_at: string;
}

export interface WalletEntity extends WalletStub, WalletMeta {
  key_verified_at: string;
  prefix: string;
  network: ValidBchNetwork;
  nonce: number;
  genesis_height: number | null;
}

export class WalletNotExistsError extends Error {
  constructor(walletHash: string) {
    super(`No Wallet with walletHash ${walletHash}`);
  }
}

export default function WalletManagerService() {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();
  const network = selectBchNetwork(store.getState());

  return {
    listWallets,
    getWallet,
    getWalletMeta,
    boot,
    createWallet,
    importWallet,
    createTemporaryWallet,
    deleteWallet,
    updateKeyViewed,
    updateKeyVerified,
    setWalletName,
    clearWalletData,
    exportWalletFile,
    importWalletFile,
    saveWallet,
    calculateWalletHash,
    openWalletDatabase,
    setGenesisHeight,
    getPrefix,
  };

  // ----------------------------

  // listWallets: return a list of all wallets in the database
  function listWallets(): WalletMeta[] {
    const result = APP_DB.exec(
      `SELECT * FROM wallets WHERE network="${network}"`
    );

    //Log.debug("listWallets", result);
    return result;
  }

  // getWallet: synchronously get a consumable Wallet object from the database
  function getWallet(walletHash): WalletEntity {
    if (!walletHash) {
      throw new WalletNotExistsError(walletHash);
    }

    const walletDb = Database.getWalletDatabase(walletHash);
    const result = walletDb.exec("SELECT * FROM wallet");

    if (result.length === 0) {
      throw new WalletNotExistsError(walletHash);
    }

    const wallet = result[0]; // eslint-disable-line prefer-destructuring

    wallet.network = network;

    // for safety, assume testnet unless we've explicitly stated to be on mainnet
    wallet.prefix = network === "mainnet" ? "bitcoincash" : "bchtest";

    wallet.nonce = 0;

    return wallet;
  }

  function getWalletMeta(walletHash): WalletMeta {
    if (!walletHash) {
      throw new WalletNotExistsError(walletHash);
    }

    const result = APP_DB.exec(
      `SELECT * FROM wallets WHERE walletHash="${walletHash}" AND network="${network}"`
    );

    if (result.length === 0) {
      throw new WalletNotExistsError(walletHash);
    }

    const walletMeta = result[0];
    return walletMeta;
  }

  // ----------------------------

  // boot: load a wallet, create a wallet if none exist
  async function boot(walletHash): Promise<WalletEntity> {
    let wallet: WalletEntity;
    try {
      if (walletHash === "") {
        throw new WalletNotExistsError("");
      }

      Log.debug("walletBoot ~", walletHash, network);
      Database.setKeepAlive(walletHash);
      await Database.openWalletDatabase(walletHash, network);
      wallet = getWallet(walletHash);
      //Log.debug("boot got", wallet);
    } catch (e) {
      if (!(e instanceof WalletNotExistsError)) {
        Log.warn("critical error during walletBoot!", e);
        throw e;
      }

      // requested wallet doesn't exist
      // attempt to return lowest-index wallet instead, create a new wallet if none exist
      const wallets = listWallets();

      let nextWalletHash = "";
      if (wallets.length > 0) {
        nextWalletHash = wallets[0].walletHash;
      } else {
        nextWalletHash = (await createWallet("My Selene Wallet")).walletHash;
        Database.setKeepAlive(nextWalletHash);
      }

      return boot(nextWalletHash);
    }

    Log.debug("walletBoot", walletHash, wallet, wallet.network);

    return wallet;
  }

  // ----------------------------

  // createWallet: generate a new wallet from a randomly generated seed phrase
  // persist the new wallet in the database
  async function createWallet(
    name: string = "New Wallet",
    passphrase: string = "",
    derivation: ValidDerivationPath = DEFAULT_DERIVATION_PATH
  ): Promise<WalletEntity> {
    const mnemonic = bip39.generateMnemonic();

    const walletHash = calculateWalletHash({
      mnemonic,
      passphrase,
      derivation,
    });

    Log.debug("createWallet", walletHash);

    const walletDb = await openWalletDatabase(walletHash);

    const result = walletDb.exec(
      `INSERT INTO wallet (
        walletHash,
        name,
        mnemonic,
        passphrase,
        derivation,
        genesis_height
      ) VALUES (?, ?, ?, ?, ?, 0)
      RETURNING *`,
      [walletHash, name, mnemonic, passphrase, derivation]
    )[0];

    APP_DB.run(
      `INSERT INTO wallets (
          walletHash,
          name,
          network
        ) VALUES (?, ?, ?)`,
      [walletHash, name, network]
    );

    Log.log("creating wallet", result);

    await saveWallet(walletHash);
    return result;
  }

  // importWallet: import a wallet via provided seed phrase
  // persist the imported wallet in the database
  async function importWallet(walletData) {
    const { mnemonic, passphrase, derivation, name } = walletData;

    const walletHash = calculateWalletHash({
      mnemonic,
      passphrase,
      derivation,
    });

    const walletDb = await openWalletDatabase(walletHash);

    const created_at = walletData.date_created
      ? walletData.date_created
      : walletData.created_at || new Date().toISOString();

    try {
      walletDb.run(
        `INSERT INTO wallet (
          name, 
          mnemonic, 
          passphrase, 
          derivation, 
          walletHash,
          created_at,
          key_viewed_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          strftime('%Y-%m-%dT%H:%M:%SZ')
        ) RETURNING *`,
        [name, mnemonic, passphrase, derivation, walletHash, created_at]
      );
    } catch (e) {
      Log.warn("wallet already exists in walletDb", walletHash, e);
    }

    try {
      APP_DB.run(
        `INSERT INTO wallets (
          walletHash,
          name,
          network,
          created_at,
          key_viewed_at
        ) VALUES (
          ?, ?, ?, ?,
          strftime('%Y-%m-%dT%H:%M:%SZ')
        )`,
        [walletHash, name, network, created_at]
      );
    } catch (e) {
      Log.warn("wallet already exists in appDb", walletHash, e);
    }

    Log.log("importing wallet", walletHash);
    await saveWallet(walletHash);
    return walletHash;
  }

  function createTemporaryWallet(walletStub: WalletStub) {
    const walletHash = calculateWalletHash(walletStub);
    const prefix = network === "mainnet" ? "bitcoincash" : "bchtest";

    return { ...walletStub, walletHash, prefix, network };
  }

  async function deleteWallet(walletHash) {
    try {
      APP_DB.run(`DELETE FROM wallets WHERE walletHash="${walletHash}"`);
      await Database.deleteWalletDatabase(walletHash, network);
      await deleteWalletFile(walletHash);
    } catch (e) {
      Log.warn(e);
    }
  }

  // updateKeyViewed: updates the wallet's key_viewed timestamp
  function updateKeyViewed(walletHash) {
    const walletDb = Database.getWalletDatabase(walletHash);

    const result = walletDb.exec(
      `UPDATE wallet SET key_viewed_at=strftime('%Y-%m-%dT%H:%M:%SZ') RETURNING key_viewed_at`
    )[0];

    APP_DB.run(
      `UPDATE wallets SET key_viewed_at=? WHERE walletHash="${walletHash}" AND network="${network}"`,
      [result.key_viewed_at]
    );

    Log.debug("keyViewed", result.key_viewed_at);

    return result.key_viewed_at;
  }

  // updateKeyVerified: updates the wallet's key_verified timestamp
  function updateKeyVerified(walletHash) {
    const walletDb = Database.getWalletDatabase(walletHash);

    walletDb.run(
      `UPDATE wallet SET key_verified_at=strftime('%Y-%m-%dT%H:%M:%SZ')`
    );
  }

  // setWalletName: sets a wallet's display name
  async function setWalletName(walletHash, name: string) {
    try {
      const walletDb = await Database.openWalletDatabase(walletHash);
      APP_DB.run(`UPDATE wallets SET name=? WHERE walletHash="${walletHash}"`, [
        name,
      ]);
      walletDb.run(`UPDATE wallet SET name=?`, [name]);
    } catch (e) {
      Log.error(e);
    }

    Log.debug("setWalletName", walletHash, name);
    await saveWallet(walletHash);
  }

  // clearWalletData: deletes all data associated with a wallet
  // does NOT delete the wallet; all data can be re-derived/resynced
  async function clearWalletData(walletHash) {
    const walletDb = Database.getWalletDatabase(walletHash);

    // delete this wallet's transaction history
    walletDb.run(`DELETE FROM address_transactions`);

    // delete wallet addresses
    walletDb.run(`DELETE FROM addresses`);

    // delete wallet utxos
    walletDb.run(`DELETE FROM address_utxos`);

    walletDb.run("UPDATE wallet SET genesis_height=null");
  }

  function calculateWalletHash(wallet: WalletStub): string {
    const mnemonicHash = sha256.text(wallet.mnemonic);
    const passphraseHash =
      wallet.passphrase !== "" ? sha256.text(wallet.passphrase) : "";
    const derivationHash = sha256.text(wallet.derivation);

    const concatHashes = [mnemonicHash, passphraseHash, derivationHash].join(
      ""
    );

    const walletHash = sha256.text(concatHashes);
    return walletHash;
  }

  async function exportWalletFile(wallet: WalletEntity) {
    const { mnemonic, passphrase, derivation, name, created_at } = wallet;

    const walletHash = calculateWalletHash({
      mnemonic,
      passphrase,
      derivation,
    });

    const walletData = {
      walletHash,
      mnemonic,
      passphrase,
      derivation,
      created_at,
      name,
    };

    const result = await Filesystem.writeFile({
      path: `/selene/wallets/${walletHash}.wallet.json`,
      directory: Directory.Library,
      recursive: true,
      data: JSON.stringify(walletData),
      encoding: Encoding.UTF8,
    });

    Log.debug("exportWalletFile", result, walletData);
    return { result, walletHash };
  }

  async function importWalletFile(walletHash) {
    const walletFile = await Filesystem.readFile({
      path: `/selene/wallets/${walletHash}.wallet.json`,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });

    //Log.debug("importWalletFile", walletHash, JSON.stringify(walletFile));

    await Database.openWalletDatabase(walletHash, network);
    const walletData = JSON.parse(walletFile.data.toString());

    try {
      await importWallet(walletData);
      try {
        await Database.flushHandles(false);
      } catch (e) {
        Log.error(e);
      }
    } catch (e) {
      Log.error("importWalletFile failed", walletHash, e);
      await Database.closeWalletDatabase(walletHash, true);
    }
  }

  async function deleteWalletFile(walletHash) {
    Log.debug("deleteWalletfile", walletHash);
    return Filesystem.deleteFile({
      path: `/selene/wallets/${walletHash}.wallet.json`,
      directory: Directory.Library,
    });
  }

  async function saveWallet(walletHash) {
    Log.debug("saveWallet", walletHash);
    const walletDb = Database.getWalletDatabase(walletHash);

    const wallet = walletDb.exec("SELECT * FROM wallet")[0];
    const { name, balance, created_at, key_viewed_at } = wallet;

    APP_DB.run(
      `UPDATE wallets SET
        name=?,
        balance=?,
        created_at=?,
        key_viewed_at=?
      WHERE walletHash="${walletHash}" AND network="${network}";`,
      [name, balance, created_at, key_viewed_at]
    );

    await exportWalletFile(wallet);
    await Database.flushHandles(true);
  }

  async function openWalletDatabase(walletHash) {
    return Database.openWalletDatabase(walletHash, network);
  }

  function setGenesisHeight(walletHash, height) {
    const walletDb = Database.getWalletDatabase(walletHash);
    walletDb.run(`UPDATE wallet SET genesis_height=?`, [height]);
    Log.debug("setGenesisHeight", height, walletHash);
  }

  function getPrefix() {
    return network === "mainnet" ? "bitcoincash" : "bchtest";
  }
}
