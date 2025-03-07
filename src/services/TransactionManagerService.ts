import { Filesystem, Directory } from "@capacitor/filesystem";
import { Decimal } from "decimal.js";
import {
  decodeTransaction,
  lockingBytecodeToCashAddress,
  TransactionCommon as LibauthTransaction,
} from "@bitauth/libauth";

import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
import UtxoManagerService from "@/services/UtxoManagerService";
import WalletManagerService, {
  WalletEntity,
} from "@/services/WalletManagerService";

import { hexToBin, binToHex } from "@/util/hex";

const Log = LogService("TransactionManager");

export interface TransactionStub {
  txid: string;
  hex: string;
}

export interface TransactionEntity extends TransactionStub {
  blockhash: string | null;
  blocktime: number;
  time: string;
  size: string;
  version: number;
  height: number;
  vin: Array<TransactionInput>;
  vout: Array<TransactionOutput>;
}

export interface TransactionInput {
  txid: string;
  vout: number;
}
export interface TransactionOutput {
  n: number;
  scriptPubKey: object;
  value: string;
}

export class TransactionNotExistsError extends Error {
  constructor(tx_hash: string) {
    super(`No Transaction with id ${tx_hash}`);
  }
}

export default function TransactionManagerService() {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();

  const WalletManager = WalletManagerService();

  return {
    resolveTransaction,
    waitForTransactionToResolve,
    sendTransaction,
    deleteTransaction,
    purgeTransactions,
  };

  // --------------------------------

  // resolveTransaction: load transaction from db, fetch it from electrum if we don't have it
  async function resolveTransaction(
    tx_hash: string
  ): Promise<TransactionEntity> {
    try {
      const localTx = await getTransactionByHash(tx_hash);

      // request the tx again if it's unconfirmed
      if (localTx.blockhash === null || localTx.height <= 0) {
        throw new Error("Transaction Unconfirmed");
      }

      //Log.debug("resolveTransaction", "local", tx_hash, localTx);
      return localTx;
    } catch (e) {
      // if there's any problem retrieving the tx locally, try to resolve it
      const Electrum = ElectrumService();
      const remoteTx = await Electrum.requestTransaction(tx_hash);
      //Log.debug("resolveTransaction", "remote", tx_hash, remoteTx);
      const registeredTx = await _registerTransaction(remoteTx);
      return registeredTx;
    }
  }

  // Will poll resolveTransaction at the given interval for up to the given timeout period.
  // This function is useful in situations where we need to monitor ("wait") for a transaction that is broadcasted by a third-party node (not us).
  // NOTE: A more optimal implementation in future might be to use Fulcrum's tx.subscribe emthods.
  //       However, this would probably be a heavy refactor that introduces additional state.
  async function waitForTransactionToResolve(
    transactionId: string,
    timeoutMs = 10_000,
    intervalMs = 1000
  ) {
    const startTime = Date.now();

    return new Promise<TransactionEntity>((resolve, reject) => {
      const checkTransaction = async () => {
        try {
          const tx = await resolveTransaction(transactionId);
          resolve(tx);
        } catch (error) {
          // If the transaction is not resolved yet, check again after the interval
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < timeoutMs) {
            setTimeout(checkTransaction, intervalMs);
          } else {
            reject(
              new Error(`Failed to resolve transaction after ${timeoutMs}ms`)
            );
          }
        }
      };

      // Start checking the transaction
      checkTransaction();
    });
  }

  async function sendTransaction(tx: TransactionStub, wallet: WalletEntity) {
    const { txid: tx_hash, hex: tx_hex } = tx;

    const Electrum = ElectrumService();
    const result = await Electrum.broadcastTransaction(tx_hex);
    const isSuccess = result === tx_hash;

    if (isSuccess) {
      const UtxoManager = UtxoManagerService(wallet);
      const decodedTx = decodeTransaction(hexToBin(tx_hex));
      const vin = getVinFromDecodedTransaction(decodedTx);

      vin.forEach((input) => {
        UtxoManager.discardUtxo({ tx_hash: input.txid, tx_pos: input.vout });
      });
    } else {
      Log.warn("transaction send failure", result);
    }

    return { isSuccess, result };
  }

  async function deleteTransaction(tx_hash: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `/selene/tx/${tx_hash}.raw`,
        directory: Directory.Library,
      });
    } catch (e) {
      //Log.warn(e);
    }

    //Log.debug("deleteTransaction", tx_hash);
    APP_DB.run(`DELETE FROM transactions WHERE txid="${tx_hash}";`);
  }

  async function purgeTransactions(): Promise<void> {
    const wallets = WalletManager.listWallets();

    // get list of txids associated with our utxos or history (for ALL wallets)
    const live_txids = (
      await Promise.all(
        wallets.map(async ({ walletHash }) => {
          const walletDb = await WalletManager.openWalletDatabase(walletHash);
          const utxo_txids = walletDb.exec("SELECT txid FROM address_utxos");
          const history_txids = walletDb.exec(
            "SELECT txid FROM address_transactions"
          );

          const cat_txids = [
            ...utxo_txids.map(({ txid }) => `"${txid}"`),
            ...history_txids.map(({ txid }) => `"${txid}"`),
          ].join(",");

          return cat_txids;
        })
      )
    )
      .filter((txid) => txid !== "")
      .join(",");

    const purgeHashes = APP_DB.exec(
      `SELECT txid FROM transactions WHERE txid NOT IN (${live_txids})`
    ).map(({ txid }) => txid);

    const fileTxHashes = (
      await Filesystem.readdir({
        path: "/selene/tx",
        directory: Directory.Library,
      })
    ).files
      .map((file) => file.name.split(".")[0])
      .filter(
        (txid) => !live_txids.includes(txid) && !purgeHashes.includes(txid) // purgeHashes already included
      );

    const tx_hashes = [...purgeHashes, ...fileTxHashes];

    Log.time("purgeTransactions");
    await Promise.all(tx_hashes.map((txid) => deleteTransaction(txid)));
    Log.debug("purgeTransactions", tx_hashes);
    Log.timeEnd("purgeTransactions");
  }

  // --------------------------------

  // Raw transaction data is stored directly on the device filesystem
  // This prevents bloating the in-memory sqlite db and causing OOM errors

  // [private] _loadTxData: read raw transaction hex data from filesystem
  async function _loadTxData(tx_hash: string): Promise<string> {
    try {
      const txFile = await Filesystem.readFile({
        path: `/selene/tx/${tx_hash}.raw`,
        directory: Directory.Library,
      });

      const txData = txFile.data.toString();

      if (txData === "") {
        throw new TransactionNotExistsError(tx_hash);
      }

      // Filesystem plugin gives us base64-encoded data
      const tx_hex = atob(txData);
      return tx_hex;
    } catch (e) {
      throw new TransactionNotExistsError(tx_hash);
    }
  }

  // [private] _writeTxData: write raw transaction hex data to filesystem
  async function _writeTxData(tx_hash: string, tx_hex: string) {
    // Filesystem plugin writes as raw bytes, but we must pass base64
    const data = btoa(tx_hex);

    const result = await Filesystem.writeFile({
      path: `/selene/tx/${tx_hash}.raw`,
      directory: Directory.Library,
      recursive: true,
      data,
    });

    return result;
  }

  // --------------------------------

  async function _registerTransaction(
    tx: TransactionEntity
  ): Promise<TransactionEntity> {
    const blockhash = tx.blockhash ? tx.blockhash : null;
    const blocktime = tx.blocktime ? tx.blocktime : null;
    const time = tx.time ? tx.time : Math.floor(Date.now() / 1000);

    const result = APP_DB.exec(
      `INSERT INTO transactions (
        txid,
        size,
        blockhash,
        time,
        blocktime,
        version,
        height
      )
      VALUES ($txid, $size, $blockhash, $time, $blocktime, $version, $height)
      ON CONFLICT DO 
        UPDATE SET
          size=$size,
          blockhash=$blockhash,
          time=$time,
          blocktime=$blocktime,
          height=$height
      RETURNING *;
      `,
      {
        $txid: tx.txid,
        $size: tx.size,
        $blockhash: blockhash,
        $time: time,
        $blocktime: blocktime,
        $version: tx.version,
        $height: tx.height,
      }
    )[0];

    await _writeTxData(tx.txid, tx.hex);

    const decodedTx = decodeTransaction(hexToBin(tx.hex)) as LibauthTransaction;

    // reconstruct "vin" from raw hex
    const vin = getVinFromDecodedTransaction(decodedTx);

    // reconstruct "vout" from raw hex
    const vout = getVoutFromDecodedTransaction(decodedTx);

    const finalTx = { ...result, vin, vout };

    //Log.debug("_registerTransaction", tx, time, blockhash);
    return finalTx;
  }

  async function getTransactionByHash(
    tx_hash: string
  ): Promise<TransactionEntity> {
    const result = APP_DB.exec(
      `SELECT * FROM transactions WHERE txid="${tx_hash}"`
    );

    if (result.length < 1) {
      throw new TransactionNotExistsError(tx_hash);
    }

    // reconstruct transaction from raw tx hex
    const localTx = result[0];
    localTx.hex = await _loadTxData(tx_hash);

    const decodedTx = decodeTransaction(
      hexToBin(localTx.hex)
    ) as LibauthTransaction;

    // reconstruct "vin" from raw hex
    const vin = getVinFromDecodedTransaction(decodedTx);

    // reconstruct "vout" from raw hex
    const vout = getVoutFromDecodedTransaction(decodedTx);

    const tx = { ...localTx, vin, vout };

    //Log.log("getTransactionByHash", tx_hash, decodedTx, tx);
    return tx;
  }

  function getVinFromDecodedTransaction(
    decodedTx: LibauthTransaction
  ): Array<TransactionInput> {
    return decodedTx.inputs.map(
      (input): TransactionInput => ({
        txid: binToHex(input.outpointTransactionHash),
        vout: input.outpointIndex,
      })
    );
  }

  function getVoutFromDecodedTransaction(
    decodedTx: LibauthTransaction
  ): Array<TransactionOutput> {
    return decodedTx.outputs.map((output, n): TransactionOutput => {
      const value = new Decimal(output.valueSatoshis.toString());

      const cashAddr = lockingBytecodeToCashAddress(
        output.lockingBytecode,
        WalletManager.getPrefix()
      );

      return {
        n,
        scriptPubKey: {
          addresses: [value.greaterThan(0) ? cashAddr : ""],
        },
        value: value.toString(),
      };
    });
  }
}
