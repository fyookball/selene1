import { Decimal } from "decimal.js";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import { DUST_LIMIT } from "@/util/sats";

const Log = LogService("UtxoManager");

export default function UxtoManagerService(wallet) {
  const Database = DatabaseService();
  const walletDb = Database.getWalletDatabase(wallet.walletHash);

  return {
    registerUtxo,
    getWalletUtxos,
    getAddressUtxos,
    selectUtxos,
    discardUtxo,
    discardAddressUtxos,
  };

  function registerUtxo(address, utxo) {
    walletDb.run(
      `INSERT INTO address_utxos (
        address,
        txid,
        tx_pos,
        amount
      ) VALUES (?, ?, ?, ?);`,
      [address, utxo.tx_hash, utxo.tx_pos, utxo.value]
    );
  }

  function getWalletUtxos() {
    const result = walletDb.exec(`SELECT * FROM address_utxos`);

    return result;
  }

  function getAddressUtxos(address) {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE address="${address}"`
    );
    return result;
  }

  function selectUtxos(amount, fee) {
    Log.debug("selectUtxos", amount, fee);
    const targetAmount = new Decimal(amount).plus(fee).toNumber();

    // get all available UTXOs
    const availableUtxos = walletDb.exec(
      `SELECT * FROM address_utxos 
          ORDER BY amount DESC`
    );

    const availableUtxoSum = availableUtxos.reduce(
      (sum, utxo) => sum + utxo.amount,
      0
    );

    Log.debug(
      "selectUtxos availableUtxos",
      availableUtxoSum,
      availableUtxos.length
    );

    // check if we have enough balance across all UTXOs
    // empty set = insufficient funds
    if (availableUtxoSum < targetAmount) {
      return [];
    }

    // 1. if there's an exact UTXO, use that UTXO and its address-mates
    const exactUtxos = availableUtxos.filter(
      (utxo) => utxo.amount === targetAmount
    );
    if (exactUtxos.length > 0) {
      Log.debug("selectUtxos exactUtxo", exactUtxos[0].address);
      // spend all utxos on this address (for privacy)
      return getAddressUtxos(exactUtxos[0].address);
    }

    // all full address balances >= amount are eligible
    const eligibleAddresses = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE 
            balance >= ${targetAmount}
          ORDER BY balance ASC`
    );

    Log.debug(
      "selectUtxos eligibleAddresses",
      eligibleAddresses.map((a) => a.address)
    );

    // 2. if there's a whole address balance that's exact, spend the entire address
    const exactAddresses = eligibleAddresses.filter(
      (address) => address.balance === targetAmount
    );
    if (exactAddresses.length > 0) {
      Log.debug("selectUtxos exactAddress", exactAddresses[0].address);
      return getAddressUtxos(exactAddresses[0].address);
    }

    // try to consolidate small UTXOs to make the targetAmount
    // all UTXOs <= targetAmount are eligible to be consolidated
    const consolidateUtxos = walletDb.exec(
      `SELECT * FROM address_utxos 
          WHERE 
            amount <= ${targetAmount} 
          ORDER BY amount DESC`
    );

    const eligibleUtxos = {
      consolidated: targetUtxos(consolidateUtxos, targetAmount, fee),

      available: targetUtxos(availableUtxos, targetAmount, fee),
      // 0th-index eligible address is smallest with balance >= targetAmount
      address:
        eligibleAddresses.length > 0
          ? targetUtxos(
              getAddressUtxos(eligibleAddresses[0].address),
              targetAmount,
              fee
            )
          : null,
    };

    Log.debug("eligibleUtxos:", eligibleUtxos);

    // this should be impossible, but makes typescript happy. insufficient funds case
    if (eligibleUtxos.available === null) {
      return [];
    }

    // check if it's cheaper to spend consolidated utxos, summed utxos, or eligible addresses
    if (eligibleUtxos.consolidated !== null) {
      // case: address is cheaper than consolidation
      if (
        eligibleUtxos.address !== null &&
        eligibleUtxos.address.feeAmount < eligibleUtxos.consolidated.feeAmount
      ) {
        Log.debug(
          "selectUtxos: spending first-eligible address is cheaper than consolidation",
          eligibleUtxos.address.selection
        );
        return eligibleUtxos.address.selection;
      }

      if (
        eligibleUtxos.consolidated.feeAmount < eligibleUtxos.available.feeAmount
      ) {
        Log.debug(
          "selectUtxos: spending consolidated UTXOs is cheaper than spending large UTXOs",
          eligibleUtxos.consolidated.selection
        );
        return eligibleUtxos.consolidated.selection;
      }
    }

    Log.debug(
      "selectUtxos spending from all available UTXOs",
      eligibleUtxos.available.selection
    );
    return eligibleUtxos.available.selection;
  }

  function targetUtxos(utxos, targetAmount, fee) {
    Log.log("targetUtxos trying", utxos, targetAmount, fee);
    const utxoSum = utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
    if (utxoSum < targetAmount) {
      return null;
    }

    // try to find the smallest combination of UTXOs (fewer UTXOS moving is better for privacy)
    const selection = [];
    let remainingAmount = targetAmount;

    while (remainingAmount > 0 && utxos.length > 0) {
      const utxo = utxos.shift();
      selection.push(utxo);
      remainingAmount -= utxo.amount;
    }

    // negative remainingAmount is change that needs to be returned to wallet
    const changeAmount = remainingAmount * -1 - fee;

    // if remaining change is under dust limit, add it to fee instead
    const feeAmount = changeAmount < DUST_LIMIT ? fee + changeAmount : fee;

    Log.debug("targetUtxos", selection);
    return { selection, changeAmount, feeAmount };
  }

  function discardUtxo(utxo) {
    walletDb.run(
      `DELETE FROM address_utxos WHERE txid="${utxo.tx_hash}" AND tx_pos="${utxo.tx_pos}";`
    );
  }

  function discardAddressUtxos(address) {
    walletDb.run(`DELETE FROM address_utxos WHERE address="${address}";`);
  }
}
