import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import { WalletEntity } from "@/services/WalletManagerService";
import { sha256 } from "@/util/hash";

const Log = LogService("AddressManager");

export interface AddressStub {
  address: string;
  hd_index: number;
  change: number;
  state: string | null;
}

export interface AddressEntity extends AddressStub {
  balance: number;
  memo: string;
}

export class AddressNotExistsError extends Error {
  constructor(address: string) {
    super(`No Address ${address}`);
  }
}

// AddressManagerService: handles most address-related operations
export default function AddressManagerService(wallet: WalletEntity) {
  //Log.debug("AddressManagerService", wallet);
  const Database = DatabaseService();
  const walletDb = Database.getWalletDatabase(wallet.walletHash);

  return {
    registerAddress,
    getAddress,
    getAddressRange,
    getReceiveAddresses,
    getChangeAddresses,
    getUnusedAddresses,
    getRecentAddresses,
    getAddressTransactions,
    calculateAddressState,
    registerTransaction,
  };

  // --------------------------------

  // register an address into the database
  function registerAddress(
    address: string,
    hd_index: number,
    change: number = 0
  ): AddressEntity {
    //Log.debug(`registerAddress${change ? " change" : ""}`, hd_index, address);

    try {
      const result = walletDb.exec(
        `INSERT INTO addresses (
          address, 
          hd_index,
          change
        ) 
        VALUES (?, ?, ?)
        RETURNING *;`,
        [address, hd_index, change]
      )[0];

      //Log.debug("registerAddress", result);
      return result;
    } catch (e) {
      const addr = getAddress(address);
      Log.debug("getAddress (register)", addr);
      return addr;
    }
  }

  function getAddress(address: string): AddressEntity {
    const result = walletDb.exec(
      `SELECT * FROM addresses WHERE address="${address}"`
    );

    if (result.length < 1) {
      throw new AddressNotExistsError(address);
    }

    return result[0];
  }

  function getAddressRange(
    startIndex: number = 0,
    endIndex: number = 20,
    change: number = 0
  ): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses
          WHERE hd_index >= ${startIndex}
          AND hd_index <= ${endIndex}
          AND change=${change}
        ;`
    );

    Log.debug("getAddressRange", startIndex, endIndex, result);

    return result;
  }

  // getReceiveAddresses: get all active receive addresses for this wallet
  // in DESCENDING order so we can get latest index with limit 1
  function getReceiveAddresses(limit: number = 0): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE change='0' 
          ORDER BY hd_index DESC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`
    );

    //Log.log("getReceiveAddresses", limit, result);
    return result;
  }

  // getChangeAddresses: get all active change addresses for this wallet
  // in DESCENDING order so we can get latest index with limit 1
  // NB: If you want first UNUSED change address,
  // instead use getUnusedAddress(limit, 1)
  function getChangeAddresses(limit: number = 0): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE change="1" 
          ORDER BY hd_index DESC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`
    );

    //Log.log("getChangeAddresses", limit, result);
    return result;
  }

  // getUnusedAddresess: get the lowest-index unused recv addresses for wallet
  // in ASCENDING order so wallet consumes lowest-index first
  function getUnusedAddresses(
    limit: number = 5,
    change: number = 0
  ): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE state IS NULL 
          AND change="${change}"
          ORDER BY hd_index ASC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`
    );

    //Log.debug("getUnusedAddress", limit, result);
    return result;
  }

  // getRecentAddresess: get the higest-index USED addresses for wallet
  // in DESCENDING order so wallet consumes most recent index first
  function getRecentAddresses(
    limit: number = 20,
    change: number = 0
  ): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE state IS NOT NULL 
          AND change="${change}"
          ORDER BY hd_index DESC 
          ${limit ? `LIMIT ${limit}` : ""}
        ;`
    );

    //Log.debug("getRecentAddresses", limit, result);
    return result;
  }

  function getAddressTransactions(address: string) {
    const confirmed = walletDb.exec(
      `SELECT * FROM address_transactions
          WHERE address="${address}"
          AND height > 0
          ORDER BY height ASC
        ;`
    );

    const unconfirmed = walletDb.exec(
      `SELECT * FROM address_transactions
          WHERE address="${address}"
          AND height <= 0
        ;`
    );

    //Log.log("getAddressTransactions", confirmed, unconfirmed, address);
    return { confirmed, unconfirmed };
  }

  // calculateAddressState: calculate electrum address state using local tx history
  function calculateAddressState(address: string): string | null {
    const localHistory = getAddressTransactions(address);

    // return null if address has no transactions
    if (
      localHistory.confirmed.length === 0 &&
      localHistory.unconfirmed.length === 0
    ) {
      return null;
    }

    const txToState = (tx) => `${tx.txid}:${tx.height}:`;

    const stateString = localHistory.confirmed
      .map(txToState)
      .concat(localHistory.unconfirmed.map(txToState))
      .join("");

    const stateHash = sha256.text(stateString);

    //Log.debug("calculateAddressState", stateHash, stateString, address);
    return stateHash;
  }

  // AddressManager.registerTransaction: register a transaction with an address
  function registerTransaction(
    address: string,
    tx: { tx_hash: string; height: number }
  ): void {
    try {
      walletDb.run(
        `INSERT INTO address_transactions (
          txid,
          height,
          address
        ) VALUES (?, ?, ?)
        ON CONFLICT DO 
          UPDATE SET 
            height=${tx.height}
          WHERE txid=excluded.txid;
        `,
        [tx.tx_hash, tx.height, address]
      );
    } catch (e) {
      Log.error(e);
    }

    //Log.debug("AddressManager.registerTransaction", address, tx);
  }
}
