// Manages a persistent FusionService that continuously checks
// whether a new fusion round should start, and runs it safely (no overlap).

import { Plugins } from "@capacitor/core";
import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";

import { Protocol } from "./FusionProtocol/protocol";
import { block_checkpoints } from "@/util/block_checkpoints";

const Log = LogService("FusionService");
const { Torboar } = Plugins;

type Utxo = {
  address: string;
  txid: string;
  tx_pos: number;
  amount: bigint;
  memo: string | null;
};

type ServerHelloType = import("@/proto/fusion").fusion.ServerHello;

export class FusionService {
  private _isRunning = false;

  private _shouldStopRequested = false;

  private _currentRound: Promise<void> | null = null;

  private _walletHash: string;

  private _utxoManager: ReturnType<typeof UtxoManagerService>;

  private static _defaultMaxCoins = 10;

  private _fusion?: typeof import("@/proto/fusion").fusion;

  constructor(walletHash: string) {
    this._walletHash = walletHash;
    this._utxoManager = UtxoManagerService(this._walletHash);
    Log.log("FusionService initialized with walletHash:", this._walletHash);
  }

  private static _toHex(u8: Uint8Array): string {
    return [...u8].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private static _fromHex(hex: string): Uint8Array {
    const bytes = hex.match(/.{1,2}/g);
    if (!bytes) throw new Error("Invalid hex");
    return new Uint8Array(bytes.map((b) => parseInt(b, 16)));
  }

  private static _hexToReversedUint8Array(hex: string): Uint8Array {
    const bytes = hex.match(/.{2}/g);
    if (!bytes) throw new Error("Invalid hex");
    return new Uint8Array(bytes.reverse().map((b) => parseInt(b, 16)));
  }

  public async start(): Promise<void> {
    Log.log("start of fusion service...");
    if (this._isRunning) {
      Log.log("FusionService already running");
      return;
    }

    this._isRunning = true;
    this._shouldStopRequested = false;
    Log.log("FusionService started");
    if (!this._fusion) {
      try {
        const { fusion } = await import("@/proto/fusion");
        this._fusion = fusion;
      } catch (err) {
        Log.error("Failed to import fusion proto:", err);
      }
    }
    this._scheduleNextRound();
  }

  public stop(): void {
    this._shouldStopRequested = true;
  }

  private _scheduleNextRound(): void {
    setTimeout(() => {
      if (this._shouldStopRequested) {
        this._isRunning = false;
        Log.log("FusionService stopped");
        return;
      }

      if (!this._currentRound) {
        this._currentRound = this._startFusionRound()
          .catch((err) => Log.error("Fusion round failed", err))
          .finally(() => {
            this._currentRound = null;
            //this._scheduleNextRound();  //DEBUGGING. IF WE WANT PERSISTENT FUSIONS, UNCOMMENT.
          });
      } else {
        //this._scheduleNextRound();  //DEBUGGING. IF WE WANT PERSISTENT FUSIONS, UNCOMMENT.
      }
    }, 10000); // 10-second interval between checks
  }

  private async _grabWalletUtxos(): Promise<Utxo[]> {
    Log.log(`Grabbing wallet UTXOs for walletHash: ${this._walletHash}`);

    const coins = this._utxoManager.getWalletCoins() as Utxo[];
    const utxos = coins ?? [];

    Log.log(`Found ${utxos.length} UTXOs total`);

    utxos.forEach((utxo, index) => {
      Log.log(
        `UTXO #${index + 1}:`,
        `address=${utxo.address}, txid=${utxo.txid}, tx_pos=${utxo.tx_pos}, amount=${utxo.amount}, memo=${utxo.memo}`
      );
    });

    return utxos;
  }

  private static _selectRandomUtxos(
    allUtxos: Utxo[],
    inclusionProbability = 0.5
  ): Utxo[] {
    const addressMap = new Map<string, Utxo[]>();
    allUtxos.forEach((utxo) => {
      if (!addressMap.has(utxo.address)) {
        addressMap.set(utxo.address, []);
      }
      addressMap.get(utxo.address)!.push(utxo);
    });

    const addressEntries = Array.from(addressMap.entries());
    // Shuffle addresses to randomize selection
    addressEntries.sort(() => Math.random() - 0.5);

    let selected: Utxo[] = [];
    selected = addressEntries.reduce((acc, [address, utxos]) => {
      // Skip addresses with too many UTXOs
      if (utxos.length > 5) {
        Log.log(
          `Skipping address ${address} with ${utxos.length} UTXOs (too many)`
        );
        return acc;
      }

      // Skip addresses that do not meet the inclusion probability
      if (Math.random() > inclusionProbability) {
        return acc;
      }

      // Skip if selecting these UTXOs would exceed max coins
      if (acc.length + utxos.length > FusionService._defaultMaxCoins) {
        Log.log(`Skipping address ${address} due to exceeding MAX_COINS`);
        return acc;
      }

      // Add the UTXOs to the selected list

      return [...acc, ...utxos];
    }, [] as Utxo[]);

    Log.log(
      `zzzfusion Selected ${selected.length} UTXOs out of ${allUtxos.length}`
    );
    selected.forEach((utxo, index) => {
      Log.log(
        `Selected UTXO #${index + 1}:`,
        `address=${utxo.address}, txid=${utxo.txid}, tx_pos=${utxo.tx_pos}, amount=${utxo.amount}, memo=${utxo.memo}`
      );
    });

    return selected;
  }

  private async _sendGreet(): Promise<ServerHelloType | undefined> {
    const host = "45.77.136.9"; // for dev, DNS can be flaky in emulator
    const port = 8789;

    await Torboar.connectTcp({ host, port, ssl: true });

    const versionBytes = Protocol.VERSION;

    const genesisHash = FusionService._hexToReversedUint8Array(
      block_checkpoints.satoshiGenesis.blockhash
    );

    if (!this._fusion) {
      throw new Error("Fusion proto not loaded; call start() first");
    }

    const clientHello = this._fusion.ClientHello.create({
      version: versionBytes,
      genesisHash,
    });

    // wrap inner message in outer ClientMessage
    const clientMessage = this._fusion.ClientMessage.create({
      clienthello: clientHello,
    });

    // serialize the outer message
    const payloadBytes =
      this._fusion.ClientMessage.encode(clientMessage).finish();

    // Magic & 4-byte length
    /* eslint-disable no-bitwise */
    const MAGIC = FusionService._fromHex("765be8b4e4396dcf");
    const lengthBytes = new Uint8Array([
      (payloadBytes.length >>> 24) & 0xff,
      (payloadBytes.length >>> 16) & 0xff,
      (payloadBytes.length >>> 8) & 0xff,
      payloadBytes.length & 0xff,
    ]);
    /* eslint-enable no-bitwise */

    // Combine
    const frameBytes = new Uint8Array(
      MAGIC.length + lengthBytes.length + payloadBytes.length
    );
    frameBytes.set(MAGIC, 0);
    frameBytes.set(lengthBytes, MAGIC.length);
    frameBytes.set(payloadBytes, MAGIC.length + lengthBytes.length);

    // Send raw bytes (Torboar plugin takes hex)
    await Torboar.sendTcpData({ data: FusionService._toHex(frameBytes) });

    let hexResponse: string;
    try {
      const TIMEOUT_MS = 9000; // 9-second timeout
      const result = await Promise.race([
        Torboar.receiveTcpData(),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Timed out waiting for ServerHello"));
          }, TIMEOUT_MS);
        }),
      ]);

      hexResponse = (result as { data: string }).data;
      Log.log("fusion Received raw hexResponse:", hexResponse);
    } catch (err) {
      Log.error("Error during receiveTcpData:", err);
      throw err; // abort round
    }

    const responseBytes = FusionService._fromHex(hexResponse);

    // Drop the first 12 bytes (8-byte magic + 4-byte length):
    const responsepayloadBytes = responseBytes.slice(12);

    let serverMsg;
    try {
      // decode the outer message first
      serverMsg = this._fusion.ServerMessage.decode(responsepayloadBytes);
    } catch (err) {
      Log.error(
        "Error decoding ServerMessage:",
        err,
        "hex:",
        FusionService._toHex(responsepayloadBytes)
      );
      return undefined;
    }

    // Extract the ServerHello from severMsg
    const serverHello = serverMsg.serverhello as ServerHelloType | undefined;
    if (!serverHello) {
      Log.error("ServerMessage did not contain serverhello");
      return undefined;
    }

    const componentFeerate = Number(serverHello.componentFeerate);
    const minExcessFee = Number(serverHello.minExcessFee);
    const maxExcessFee = Number(serverHello.maxExcessFee);
    const tiers = serverHello.tiers.map(Number);

    Log.log("fusion Received ServerHello:", {
      numComponents: serverHello.numComponents,
      componentFeerate,
      minExcessFee,
      maxExcessFee,
      tiers,
      donationAddress: serverHello.donationAddress,
    });

    // Validations
    if (componentFeerate > Protocol.MAX_COMPONENT_FEERATE) {
      throw new Error("Excessive component feerate from server");
    }
    if (minExcessFee > Protocol.MIN_EXCESS_FEE_CLIENT) {
      throw new Error("Excessive min excess fee from server");
    }
    if (minExcessFee > maxExcessFee) {
      throw new Error("Bad server config: minExcessFee > maxExcessFee");
    }
    if (serverHello.numComponents < Protocol.MIN_TX_COMPONENTS * 1.5) {
      throw new Error("Bad server config: too few components");
    }

    Log.log("Fusion server ready. Tiers available:", tiers);

    return serverHello;
  } // END OF FUNCTION SEND GREET

  //------------------------------------------------------------
  /* eslint-disable no-await-in-loop */
  /* eslint-disable no-constant-condition, no-else-return */
  private async _registerAndWait(
    serverHello: ServerHello,
    selectedUtxos: Utxo[]
  ): Promise<void> {
    if (!this._fusion) throw new Error("Fusion proto not loaded");

    // Get the tier list from the server.
    const tiersSorted = [...serverHello.tiers].sort((a, b) => a - b);
    if (!tiersSorted.length) {
      throw new Error("No outputs available at any tier");
    }

    Log.log("selectedutxos is ", selectedUtxos);

    Log.log("Registering for tiers:", tiersSorted);

    // Build PoolTag (part of JoinPoolsMsg)
    const randomTag = crypto.getRandomValues(new Uint8Array(20));

    // Assume limit 1 -- later we can implement "fuse as two players"
    const tags = [
      this._fusion.JoinPools.PoolTag.create({
        id: randomTag,
        limit: 1,
      }),
    ];

    // Create JoinPools message
    const joinPoolsMsg = this._fusion.JoinPools.create({
      tiers: tiersSorted,
      tags,
    });

    // wrap in ClientMessage for sending
    const clientMessage = this._fusion.ClientMessage.create({
      joinpools: joinPoolsMsg, // lowercased matches proto oneof field
    });

    // encode and send
    const payloadBytes =
      this._fusion.ClientMessage.encode(clientMessage).finish();

    const MAGIC = FusionService._fromHex("765be8b4e4396dcf");
    /* eslint-disable no-bitwise */
    const lengthBytes = new Uint8Array([
      (payloadBytes.length >>> 24) & 0xff,
      (payloadBytes.length >>> 16) & 0xff,
      (payloadBytes.length >>> 8) & 0xff,
      payloadBytes.length & 0xff,
    ]);
    /* eslint-enable no-bitwise */

    const frameBytes = new Uint8Array(
      MAGIC.length + lengthBytes.length + payloadBytes.length
    );
    frameBytes.set(MAGIC, 0);
    frameBytes.set(lengthBytes, MAGIC.length);
    frameBytes.set(payloadBytes, MAGIC.length + lengthBytes.length);

    await Torboar.sendTcpData({ data: FusionService._toHex(frameBytes) });

    // Now wait for either TierStatusUpdate or FusionBegin.

    /* eslint-disable no-promise-executor-return */
    while (true) {
      Log.log("Waiting for TierStatusUpdate or FusionBegin...");
      let result;
      try {
        result = await Promise.race([
          Torboar.receiveTcpData(),
          new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error("Timed out waiting for server")),
              10000
            );
          }),
        ]);
      } catch (err) {
        Log.error("Error while waiting for server message:", err);
        // break or continue ...maybe we should break.
        // eslint-disable-next-line no-continue
        continue;
      }
      /* eslint-enable no-promise-executor-return */

      Log.log("About to unwrap fusion");
      const hexResponse = (result as { data: string }).data;
      const responseBytes = FusionService._fromHex(hexResponse);
      const payload = responseBytes.slice(12); // drop magic+len

      try {
        // decode outer wrapper
        const serverMsg = this._fusion.ServerMessage.decode(payload);

        if (serverMsg.fusionbegin) {
          Log.log("Got FusionBegin:", serverMsg.fusionbegin);
          // store tier, covert_domain etc. from fusionBegin
          return; // exit the loop
        } else if (serverMsg.tierstatusupdate) {
          Log.log("Got TierStatusUpdate:", serverMsg.tierstatusupdate);
          // This is where we could add logic to update tiers for UI.
          // eslint-disable-next-line no-continue
          continue;
        } else {
          Log.error("Unknown ServerMessage type:", serverMsg);
          // eslint-disable-next-line no-continue
          continue;
        }
      } catch (err) {
        Log.error("Error decoding ServerMessage:", err);
        // eslint-disable-next-line no-continue
        continue;
      }
    }
  }
  /* eslint-enable no-await-in-loop */
  /* eslint-enable no-constant-condition, no-else-return */
  //--------------------------------------------------------------

  private async _startFusionRound(): Promise<void> {
    Log.log("Starting fusion round...");

    const allUtxos = await this._grabWalletUtxos();
    const selectedUtxos = FusionService._selectRandomUtxos(allUtxos, 0.5);
    Log.log("Selected UTXOs:", selectedUtxos);

    // Phase 1: Greet the server and get ServerHello info
    let serverHello;
    try {
      serverHello = await this._sendGreet();
    } catch (err) {
      Log.error("greet with fusion server failed:", err);
      return; // abort round
    }

    // Now we have the tiers, etc, in serverHello
    Log.log("ServerHello returned tiers:", serverHello.tiers);

    // Phase 2: Register for tiers and wait
    try {
      await this._registerAndWait(serverHello, selectedUtxos);
    } catch (err) {
      Log.error("registerAndWait failed:", err);
      return;
    }

    Log.log("Fusion round completed");
  }
} // END OF CLASS.
