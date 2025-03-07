import { ElectrumClient, ConnectionStatus } from "@electrum-cash/network";
import { store } from "@/redux";
import { selectBchNetwork, setPreference } from "@/redux/preferences";
import {
  syncConnectionUp,
  syncConnectionDown,
  syncAddressState,
  syncChaintip,
} from "@/redux/sync";

import LogService from "@/services/LogService";
import { AddressEntity } from "@/services/AddressManagerService";
import BlockchainService from "@/services/BlockchainService";

//import { bchToSats } from "@/util/sats";
import { electrum_servers } from "@/util/electrum_servers";

const Log = LogService("Electrum");

export class ElectrumNotConnectedError extends Error {
  constructor() {
    super(`ElectrumNotConnectedError`);
  }
}

// pointer for current ElectrumClient instance
let electrum: ElectrumClient | null = null;

const server_blacklist: Array<string> = [];
const pendingTxRequests: Array<Promise<object>> = [];

// ElectrumService: brokers interactions with electrum server
export default function ElectrumService() {
  return {
    connect,
    disconnect,
    getIsConnected,
    subscribeToAddress,
    subscribeToChaintip,
    //requestBalance,
    requestAddressState,
    requestAddressHistory,
    requestUtxos,
    requestTransaction,
    //requestMerkle,
    requestBlockHeader,
    requestBlock,
    broadcastTransaction,
    //requestRelayFee,
    selectFallbackServer,
    getElectrumHost,
  };

  // connect: connect to an Electrum server
  // Creates a new ElectrumClient every time
  async function connect(server: string) {
    const bchNetwork = selectBchNetwork(store.getState());
    const server_list = electrum_servers[bchNetwork];

    const connectServer = server || server_list[0];

    Log.log("Connecting to", connectServer, bchNetwork);

    if (electrum !== null) {
      // force disconnect old electrum object to ensure all handlers are cleared
      if (electrum.status !== ConnectionStatus.DISCONNECTED) {
        await electrum.disconnect(true);
      }

      // explicitly set electrum to null to prompt garbage collection
      electrum = null;
    }

    // create a new ElectrumClient every time to enable server switching
    electrum = new ElectrumClient("Selene.cash", "1.4", connectServer);

    // need to establish listeners every time we recreate the ElectrumClient
    electrum.addListener("connected", () => {
      Log.log("ELECTRUM CONNECTED", connectServer);

      // only listen for notifications when connected
      electrum.addListener("notification", handleElectrumNotifications);
      store.dispatch(syncConnectionUp(connectServer));
    });

    electrum.addListener("disconnected", () => {
      Log.log("ELECTRUM DISCONNECTED");
      store.dispatch(syncConnectionDown());
    });

    electrum.addListener("connecting", () => {
      Log.debug("connecting...");
    });

    electrum.addListener("reconnecting", () => {
      Log.debug("reconnecting...");
    });

    electrum.addListener("disconnecting", () => {
      Log.debug("disconnecting...");
    });

    electrum.addListener("error", handleElectrumError);

    return electrum.connect();
  }

  // disconnect: disconnect the Electrum instance
  async function disconnect(force: boolean) {
    if (electrum !== null) {
      Log.debug("electrum disconnect");
      return electrum.disconnect(force);
    }

    return true;
  }

  function getIsConnected() {
    return electrum !== null
      ? electrum.status === ConnectionStatus.CONNECTED
      : false;
  }

  // subscribeToAddress: listen for updates on an address
  async function subscribeToAddress(
    address: AddressEntity
  ): Promise<{ address: AddressEntity; addressState: string | null }> {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const result = await electrum.subscribe(
      "blockchain.address.subscribe",
      address.address
    );

    if (result instanceof Error) {
      throw result;
    }

    return result;
  }

  async function subscribeToChaintip(): Promise<boolean> {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const result = await electrum.subscribe("blockchain.headers.subscribe");

    if (result instanceof Error) {
      throw result;
    }

    return result;
  }

  // request the most up-to-date balance information for an address
  /*
  // this function isn't actually used, so prune it from distribution by commenting for now
  async function requestBalance(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const result = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    if (result instanceof Error) {
      throw result;
    }

    const { confirmed, unconfirmed } = result;

    return confirmed + unconfirmed;
  }
  */

  // request the most up-to-date state hash for an address
  async function requestAddressState(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }
    const addressState = await electrum.request(
      "blockchain.address.subscribe",
      address
    );

    if (addressState instanceof Error) {
      throw addressState;
    }

    return addressState;
  }

  // request the entire transaction history for an address
  async function requestAddressHistory(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const history = await electrum.request(
      "blockchain.address.get_history",
      address
    );

    if (history instanceof Error) {
      throw history;
    }

    return history;
  }

  // request all current UTXOs for an address
  async function requestUtxos(address: string) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const utxos = await electrum.request(
      "blockchain.address.listunspent",
      address
    );

    if (utxos instanceof Error) {
      throw utxos;
    }

    return utxos;
  }

  // request a transaction by its txid
  async function requestTransaction(tx_hash: string, verbose: boolean = true) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    if (pendingTxRequests[tx_hash]) {
      Log.warn("waiting on resolution for", tx_hash);
      return pendingTxRequests[tx_hash];
    }

    const txRequest = electrum
      .request("blockchain.transaction.get", tx_hash, verbose)
      .then(async (tx) => {
        //Log.debug("requesting height for", tx_hash);
        const requestHeight = await electrum.request(
          "blockchain.transaction.get_height",
          tx_hash
        );

        let height = 0;
        if (!(requestHeight instanceof Error)) {
          height = requestHeight;
        }

        //Log.debug("height", height, tx_hash, requestHeight instanceof Error);

        delete pendingTxRequests[tx_hash];
        return { ...tx, height };
      })
      .catch((e) => {
        Log.error("txRequest failed", e);
        throw e;
      });

    pendingTxRequests[tx_hash] = txRequest;

    return txRequest;
  }

  /*
  // unused, prune from dist payload for now
  async function requestMerkle(tx_hash, height) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }
    const merkle = await electrum.request(
      "blockchain.transaction.get_merkle",
      tx_hash,
      height
    );

    return merkle;
  }
  */

  // requestBlockHeader: request a block by height
  async function requestBlockHeader(height, checkpoint_height = 0) {
    if (height < 0 || checkpoint_height < 0) {
      throw new Error("height must be non-negative integer");
    }

    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const header = await electrum.request(
      "blockchain.block.header",
      height,
      checkpoint_height
    );

    if (header instanceof Error) {
      throw header;
    }

    Log.debug("requestBlockHeader", header, height);
    return header;
  }

  // requestBlock: request a block by height or hash
  async function requestBlock(blockhashOrHeight: string | number) {
    const block = await electrum.request(
      "blockchain.header.get",
      blockhashOrHeight
    );

    if (block instanceof Error) {
      throw block;
    }

    const blockhash = BlockchainService().calculateBlockhash(block.hex);

    Log.debug("requestBlock", block, blockhash);
    return { ...block, blockhash };
  }

  async function broadcastTransaction(tx_hex) {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }

    const tx_hash = await electrum.request(
      "blockchain.transaction.broadcast",
      tx_hex
    );

    if (tx_hash instanceof Error) {
      throw tx_hash;
    }

    Log.log("broadcastTransaction", tx_hash, tx_hex);
    return tx_hash;
  }

  /*
  // unused, prune from dist
  async function requestRelayFee() {
    if (electrum === null || electrum.status !== ConnectionStatus.CONNECTED) {
      throw new ElectrumNotConnectedError();
    }
    const result = await electrum.request("blockchain.relayfee");

    if (result instanceof Error) {
      throw error;
    }

    const relayFee = bchToSats(result);
    return relayFee;
  }
  */

  function selectFallbackServer(prevServer: string): string {
    const bchNetwork = selectBchNetwork(store.getState());
    const server_list = electrum_servers[bchNetwork];

    // don't blacklist the known-good Selene-operated server
    if (prevServer && prevServer !== server_list[0]) {
      server_blacklist.push(prevServer);
    }

    const chooseRandomServer = () => {
      return server_list[Math.floor(Math.random() * server_list.length)];
    };

    let newServer = chooseRandomServer();
    while (server_blacklist.indexOf(newServer) > -1) {
      newServer = chooseRandomServer();
    }

    // only overwrite user server preference on mainnet
    if (bchNetwork === "mainnet") {
      store.dispatch(
        setPreference({ key: "electrumServer", value: newServer })
      );
    }

    Log.log(
      "selectFallbackServer",
      newServer,
      prevServer,
      server_blacklist,
      bchNetwork
    );
    return newServer;
  }
}

function handleElectrumNotifications(data) {
  if (data.method === "blockchain.address.subscribe") {
    store.dispatch(syncAddressState(data.params));
  }

  if (data.method === "blockchain.headers.subscribe") {
    handleChaintipSubscription(data.params);
  }
}

function handleElectrumError(error) {
  Log.warn(error);
}

function handleChaintipSubscription(data) {
  if (!Array.isArray(data)) {
    return;
  }

  const chaintip = data[0];
  store.dispatch(syncChaintip(chaintip));
}

function getElectrumHost() {
  return electrum ? electrum.connection.host : "";
}
