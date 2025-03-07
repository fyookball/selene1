import { Decimal } from "decimal.js";
import { DateTime } from "luxon";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService, {
  TransactionEntity,
} from "@/services/TransactionManagerService";
import CurrencyService from "@/services/CurrencyService";

import { WalletEntity } from "@/services/WalletManagerService";

const Log = LogService("TransactionHistoryService");

class TransactionHistoryNotExistsError extends Error {
  constructor(tx_hash, walletHash) {
    super(`No address_transactions for ${tx_hash} and wallet ${walletHash}`);
  }
}

export default function TransactionHistoryService(
  wallet: WalletEntity,
  fiatCurrency
) {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();
  const walletDb = Database.getWalletDatabase(wallet.walletHash);

  const AddressManager = AddressManagerService(wallet);
  const myAddresses = [
    ...AddressManager.getReceiveAddresses().map((a) => a.address),
    ...AddressManager.getChangeAddresses().map((a) => a.address),
  ];

  return {
    resolveTransactionHistory,
    calculateTxAmount,
    setTransactionMemo,
    getTransactionMemo,
  };

  function getTransactionHistory(start: number = 0) {
    // get all transactions that are registered with addresses
    const address_transactions_confirmed = walletDb.exec(
      `SELECT * FROM address_transactions
          WHERE height > 0
          GROUP BY txid
          ORDER BY height DESC, time DESC, time_seen DESC
          LIMIT 100 OFFSET ${start};
        `
    );

    const address_transactions_unconfirmed = walletDb.exec(
      `SELECT * FROM address_transactions 
          WHERE height <= 0
          GROUP BY txid
          ORDER BY height ASC, time DESC, time_seen DESC
          LIMIT 100 OFFSET ${start};
        `
    );

    const address_transactions = address_transactions_unconfirmed
      .concat(address_transactions_confirmed)
      .map((at) => {
        let txTime = at.time;
        if (at.height <= 0) {
          txTime = DateTime.fromISO(at.time_seen).toSeconds();
        }
        return { ...at, time: txTime };
      });

    return address_transactions;
  }

  async function resolveTransactionHistory(start: number = 0) {
    //Log.debug("resolveTransactionHistory");
    const address_transactions = getTransactionHistory(start);

    if (!ElectrumService().getIsConnected()) {
      return address_transactions;
    }

    // resolve amounts for transactions that don't have them
    const tx_hashes = address_transactions.map((at) => at.txid);

    Log.debug("resolveTransactionHistory awaiting", tx_hashes.length);
    const txHistory = (
      await Promise.all(
        tx_hashes.map(async (tx_hash) => {
          try {
            const tx = await resolveTransactionAmount(tx_hash);
            return tx;
          } catch (e) {
            await TransactionManagerService().deleteTransaction(tx_hash);
            return null;
          }
        })
      )
    ).filter((tx) => tx !== null);

    return txHistory;
  }

  async function resolveTransactionAmount(tx_hash) {
    try {
      const addressTx = getAddressTransaction(tx_hash);

      if (addressTx.amount === null) {
        throw new TransactionHistoryNotExistsError(tx_hash, wallet.walletHash);
      }

      if (addressTx.height <= 0) {
        throw new TransactionHistoryNotExistsError(tx_hash, wallet.walletHash);
      }

      return addressTx;
    } catch (e) {
      const tx = await TransactionManagerService().resolveTransaction(tx_hash);
      const amount = await calculateTxAmount(tx);
      const updatedAddressTx = updateTxAmount(tx.txid, amount);
      return updatedAddressTx;
    }
  }

  async function calculateTxAmount(tx: TransactionEntity) {
    const TransactionManager = TransactionManagerService();

    const isMyUtxo = (utxo) => {
      if (utxo.value === "0") {
        // OP_RETURN
        return false;
      }

      const isMine =
        utxo.scriptPubKey.addresses.findIndex((address) => {
          return myAddresses.includes(address);
        }) > -1;

      return isMine;
    };

    // resolve vins to real txos
    const vinTxes = await Promise.all(
      tx.vin.map((vin) => TransactionManager.resolveTransaction(vin.txid))
    );

    // for each input tx, get outputs.
    // for each output, include in result if vin and out match
    const vinOuts = vinTxes
      .map((t) =>
        t.vout.filter(
          (out) =>
            tx.vin.findIndex(
              (vin) => vin.txid === t.txid && vin.vout === out.n
            ) > -1
        )
      )
      .flat();

    // any inputs that belong to us are outgoing money
    const myInputs = vinOuts.filter((out) => isMyUtxo(out));

    // any outputs that belong to us are incoming money
    const myOutputs = tx.vout.filter((out) => isMyUtxo(out));

    // sum reducer function
    const sumReducer = (sum, cur) => sum.plus(cur.value);

    const receivedAmount = myOutputs.reduce(sumReducer, new Decimal(0));
    const sentAmount = myInputs.reduce(sumReducer, new Decimal(0));

    // TODO: totalOutput - amount = fee
    const amount = receivedAmount.minus(sentAmount).toNumber();

    return amount;
  }

  function setTransactionMemo(tx_hash: string, memo: string): void {
    walletDb.run(
      `UPDATE address_transactions SET memo=?
        WHERE txid="${tx_hash}";`,
      [memo]
    );

    walletDb.run(
      `UPDATE address_utxos SET memo=?
        WHERE txid="${tx_hash}";`,
      [memo]
    );

    Database.flushDatabase(wallet.walletHash);
  }

  function getTransactionMemo(tx_hash: string): string {
    const result = walletDb.exec(
      `SELECT memo FROM address_transactions WHERE txid="${tx_hash}"`
    );

    const memo = result.length > 0 ? result[0].memo : "";
    return memo;
  }

  function updateTxAmount(tx_hash: string, amount: number) {
    Log.debug("updateTxAmount", tx_hash);
    const fiat_amount = CurrencyService(fiatCurrency).satsToFiat(amount);

    const tx = APP_DB.exec(
      `SELECT time, height FROM transactions WHERE txid="${tx_hash}"`
    )[0];

    const result = walletDb.exec(
      `UPDATE address_transactions SET 
          amount=?,
          fiat_amount=?,
          fiat_currency=?,
          time=?,
          height=?
        WHERE txid="${tx_hash}"
        RETURNING *;`,
      [amount, fiat_amount, fiatCurrency, tx.time, tx.height]
    )[0];
    Log.debug("updateTxAmount", tx_hash, result);

    return result;
  }

  function getAddressTransaction(tx_hash: string) {
    const result = walletDb.exec(
      `SELECT * FROM address_transactions WHERE txid="${tx_hash}";`
    );

    if (result.length === 0) {
      throw new TransactionHistoryNotExistsError(tx_hash, wallet.walletHash);
    }

    //Log.debug("getAddressTransaction", tx_hash, result);
    return result[0];
  }
}
