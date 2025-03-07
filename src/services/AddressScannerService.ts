import ElectrumService from "@/services/ElectrumService";
import HdNodeService from "@/services/HdNodeService";
import AddressManagerService, {
  AddressStub,
  AddressEntity,
} from "@/services/AddressManagerService";
import UtxoManagerService from "@/services/UtxoManagerService";
import LogService from "@/services/LogService";
import WalletManagerService from "@/services/WalletManagerService";

import { walletBalanceUpdate } from "@/redux/wallet";
import { store } from "@/redux";

import {
  DEFAULT_DERIVATION_PATH,
  DERIVATION_PATHS,
  ValidDerivationPath,
} from "@/util/derivation";

const ADDRESS_GAP_LIMIT = 20; // BIP-44 gap limit is 20
const DERIVATION_SCAN_LIMIT = 5;
const SCAN_BATCH_SIZE = 3000;

const Log = LogService("AddressScanner");

export default function AddressScannerService(wallet) {
  const Electrum = ElectrumService();
  const WalletManager = WalletManagerService();
  const AddressManager = AddressManagerService(wallet);
  const Hd = HdNodeService(wallet);
  const UtxoManager = UtxoManagerService(wallet);

  return {
    populateAddresses,
    scanDerivationPaths,
    scanAddresses,
    scanMoreAddresses,
    rebuildWallet,
    scanHistory,
    scanUtxos,
  };

  // --------------------------------

  // populateAddresses: derive new addresses such that
  // there are always at least $ADDRESS_GAP_LIMIT addresses
  // returns an array of generated addresses
  function populateAddresses(): Array<AddressEntity> {
    const receiveAddresses = AddressManager.getReceiveAddresses();
    const changeAddresses = AddressManager.getChangeAddresses();

    function populate(change: number): Array<AddressEntity> {
      const generated: Array<AddressEntity> = [];

      const addresses = change ? changeAddresses : receiveAddresses;

      // addresses assumed to be sorted with latest index first
      const latestAddresses = addresses.slice(0, ADDRESS_GAP_LIMIT);
      const latestUnusedAddresses = latestAddresses.filter(
        (a) => a.state === null
      );
      const gapDiff = ADDRESS_GAP_LIMIT - latestUnusedAddresses.length;

      const latestAddress = latestAddresses[0] || null;
      const nextHdIndex =
        latestAddress !== null ? latestAddress.hd_index + 1 : 0;

      const endHdIndex = nextHdIndex + gapDiff;

      // starting from latest index, generate new addresses
      for (let hd_index = nextHdIndex; hd_index < endHdIndex; hd_index += 1) {
        const newAddress = Hd.generateAddress(hd_index, change);

        generated.push(
          AddressManager.registerAddress(newAddress, hd_index, change)
        );
      }

      return generated;
    }

    const generatedAddresses = [...populate(0), ...populate(1)];
    Log.debug("populateAddresses", generatedAddresses);
    return generatedAddresses;
  }

  // determine which derivation path to use by scanning each path
  async function scanDerivationPaths(): Promise<ValidDerivationPath> {
    // race all of the available derivation paths
    // first one to resolve with an active address wins
    const activeDerivationPath = await Promise.any(
      DERIVATION_PATHS.map((path) => {
        // set the derivation path for the WalletEntity
        const tempWallet = WalletManager.createTemporaryWallet({
          ...wallet,
          derivation: path,
        });
        const tempHd = HdNodeService(tempWallet);

        // generate addresses for each change path
        const addresses: Array<string> = [];
        for (let change = 0; change <= 1; change += 1) {
          for (
            let hd_index = 0;
            hd_index < DERIVATION_SCAN_LIMIT;
            hd_index += 1
          ) {
            try {
              const address = tempHd.generateAddress(hd_index, change);
              addresses.push(address);
            } catch (e) {
              Log.error(e);
            }
          }
        }

        // get states for first n addresses, resolve with path if active
        // if all addresses reject, then path also rejects
        // if all paths reject, error is thrown (return default path)
        return Promise.any(
          addresses.map(async (a) => {
            const addressState = await Electrum.requestAddressState(a);
            return addressState !== null
              ? Promise.resolve(path)
              : Promise.reject();
          })
        );
      })
    ).catch(() => DEFAULT_DERIVATION_PATH);

    return activeDerivationPath;
  }

  async function scanAddresses(
    startIndex = 0,
    endIndex = ADDRESS_GAP_LIMIT,
    change = 0,
    callback: (number) => void = () => {}
  ) {
    Log.time(`scanAddresses ${change}`);
    Log.debug("scanAddresses", startIndex, endIndex, change, wallet.walletHash);

    const walletDb = await WalletManager.openWalletDatabase(wallet.walletHash);

    const dbAddresses = change
      ? AddressManager.getChangeAddresses()
      : AddressManager.getReceiveAddresses();

    // generate addresses within specified hd_index range
    const addresses: Array<AddressStub> = [];
    for (let hd_index = startIndex; hd_index < endIndex; hd_index += 1) {
      const address = Hd.generateAddress(hd_index, change);
      addresses.push({ address, hd_index, change, state: null });
    }

    // get updated state for all generated addresses
    const addressStubs: Array<AddressStub> = await Promise.all(
      addresses.map(async (a) => {
        const addressState = await Electrum.requestAddressState(a.address);

        return { ...a, state: addressState };
      })
    );

    Log.debug("resolved states:", addressStubs);

    const genesisAddress = addressStubs.find(
      (stub) => stub.hd_index === 0 && stub.change === 0
    );

    if (genesisAddress && genesisAddress.state === null) {
      WalletManager.setGenesisHeight(wallet.walletHash, 0);
    }

    // filter out all unused addresses
    const activeAddresses = addressStubs.filter((stub) => stub.state !== null);

    if (activeAddresses.length === 0) {
      return addressStubs;
    }

    const nullAddresses = addressStubs.filter((stub) => stub.state === null);

    // don't register addresses that are already in db
    const checkNeedsRegistration = (stub) =>
      dbAddresses.findIndex((dba) => dba.hd_index === stub.hd_index) === -1;

    // don't register addresses past last used address (only fill gaps)
    const gapAddresses = nullAddresses.filter(
      (stub) =>
        checkNeedsRegistration(stub) &&
        stub.hd_index < activeAddresses[activeAddresses.length - 1].hd_index
    );

    const needsRegistrationAddresses = activeAddresses
      .filter((stub) => checkNeedsRegistration(stub))
      .concat(gapAddresses);

    // for each address with state, register it if we don't have it.
    // [Kludge] We have to use raw SQL here instead of AddressManager.registerAddress
    // [K] so that we can batch all of the writes into one transction for performance
    let query: Array<string> = [];
    query.push("BEGIN TRANSACTION;");
    query = query.concat(
      needsRegistrationAddresses.map(
        (stub) =>
          `INSERT INTO addresses (
            address, 
            hd_index,
            change
          ) 
          VALUES (
            "${stub.address}", 
            "${stub.hd_index}",
            "${stub.change}"
          );`
      )
    );
    query.push("COMMIT;");
    try {
      //Log.debug(query);
      walletDb.exec(query.join(""));
    } catch (e) {
      Log.error(e);
    }

    // discard UTXO set for all generated addresses
    addresses.forEach((stub) => UtxoManager.discardAddressUtxos(stub.address));

    // get updated UTXOs for active addresses
    await Promise.all(activeAddresses.map((stub) => scanUtxos(stub.address)));

    // get history for active addresses
    const stateUpdates = await Promise.all(
      activeAddresses.map((stub) => {
        const calculatedState = AddressManager.calculateAddressState(
          stub.address
        );

        // if states match, address does not need update
        if (calculatedState !== stub.state) {
          return scanHistory(stub, callback, true);
        }

        callback(1);
        return Promise.resolve([stub.address, calculatedState]);
      })
    );

    query = [];
    query.push("BEGIN TRANSACTION;");
    query = query.concat(
      stateUpdates.map((update) =>
        Array.isArray(update)
          ? `UPDATE addresses SET state="${update[1]}" WHERE address="${update[0]}";`
          : ""
      )
    );
    query.push("COMMIT;");
    try {
      //Log.debug(query);
      walletDb.exec(query.join(""));
    } catch (e) {
      Log.error(e);
    }

    Log.debug(
      "Scanned",
      addressStubs.length,
      "Active",
      activeAddresses.length,
      "Null",
      nullAddresses.length
    );

    Log.timeEnd(`scanAddresses ${change}`);
    return addressStubs;
  }

  async function scanMoreAddresses(
    nScanMore: number = ADDRESS_GAP_LIMIT,
    change: number = 0,
    callback: (number) => void = () => {}
  ) {
    const addresses = change
      ? AddressManager.getChangeAddresses()
      : AddressManager.getReceiveAddresses();

    const firstUnused = AddressManager.getUnusedAddresses(1, change)[0] || null;
    const lastAddress = addresses[0] || null;

    const scanEndIndex =
      (lastAddress !== null ? lastAddress.hd_index : 0) + nScanMore;

    // start scan from first unused address index, not latest (rechecks gaps)
    const scanStartIndex =
      firstUnused !== null ? firstUnused.hd_index : scanEndIndex - nScanMore;

    Log.debug(
      "scanMoreAddresses",
      nScanMore,
      scanStartIndex,
      scanEndIndex,
      firstUnused
    );

    const scannedAddresses = await scanAddresses(
      scanStartIndex,
      scanEndIndex,
      change,
      callback
    );

    return scannedAddresses;
  }

  async function rebuildWallet(callback: (number) => void = () => {}) {
    Log.debug("Starting Wallet Rebuild");
    Log.time("rebuildWallet");

    const getUnusedCount = (addresses) =>
      addresses.filter((a) => a.state === null).length;

    await WalletManager.clearWalletData(wallet.walletHash);

    /* eslint-disable no-await-in-loop */
    for (let change = 0; change <= 1; change += 1) {
      let addresses = await scanMoreAddresses(
        SCAN_BATCH_SIZE,
        change,
        callback
      );

      while (getUnusedCount(addresses) < ADDRESS_GAP_LIMIT) {
        addresses = await scanMoreAddresses(SCAN_BATCH_SIZE, change, callback);
      }

      store.dispatch(walletBalanceUpdate({ wallet, isChange: change === 1 }));
    }

    await WalletManager.saveWallet(wallet.walletHash);

    Log.debug("Wallet Rebuild Done");
    Log.timeEnd("rebuildWallet");
  }

  async function scanUtxos(address: string) {
    const utxos = await Electrum.requestUtxos(address);

    // we need to delete our knowledge of UTXO set
    // in case some utxos were spent elsewhere
    // i.e. wallet seed shared on multiple devices
    UtxoManager.discardAddressUtxos(address);

    if (Array.isArray(utxos)) {
      utxos.forEach((utxo) => {
        UtxoManager.registerUtxo(address, utxo);
        /*
        // TODO: validate that the UTXOs pass merkle inclusion
        // for now we just trust that fulcrum isn't lying to us
        listenerApi.dispatch(syncBlock(utxo.height));
        listenerApi.dispatch(syncTxRequest(utxo.tx_hash));
        */
      });
    }

    return Promise.resolve();
  }

  async function scanHistory(
    address: AddressStub,
    callback: (number) => void = () => {},
    batch = false
  ) {
    const walletDb = await WalletManager.openWalletDatabase(wallet.walletHash);

    const history = await Electrum.requestAddressHistory(address.address);
    history.forEach((historyTx) => {
      AddressManager.registerTransaction(address.address, historyTx);
    });

    const newCalculatedState = AddressManager.calculateAddressState(
      address.address
    );

    // set wallet genesis height based on first received transaction
    if (address.hd_index === 0 && address.change === 0) {
      const genesisHeight = history.reduce((lowest, cur) => {
        if (lowest === 0) {
          return cur.height;
        }

        return cur.height < lowest ? cur.height : lowest;
      }, 0);

      WalletManager.setGenesisHeight(wallet.walletHash, genesisHeight);
    }

    try {
      if (!batch) {
        walletDb.run(
          `UPDATE addresses SET 
          state=?
        WHERE address="${address.address}";
      `,
          [newCalculatedState]
        );
      }
    } catch (e) {
      Log.error(e);
      return Promise.reject();
    }

    //Log.debug("scanHistory", address, newCalculatedState);
    callback(1);
    return Promise.resolve([address.address, newCalculatedState]);
  }
}
