// Manages a persistent FusionService that continuously checks
// whether a new fusion round should start, and runs it safely (no overlap).

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */ // CAN REMOVE LATER
/* eslint-disable prefer-const */ // CAN REMOVE LATER
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return*/
/* eslint-disable no-undef-init */
/* eslint-disable no-empty */
/* eslint-disable prefer-template */

import * as secp256k1 from "@noble/secp256k1";
import Long from "long";

import { Plugins } from "@capacitor/core";
import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import { Protocol } from "./FusionProtocol/protocol";
import { block_checkpoints } from "@/util/block_checkpoints";
import AddressManagerService from "@/services/AddressManagerService";
import { WalletEntity } from "@/services/WalletManagerService";
import { CovertSubmitter } from "./FusionProtocol/covert";

import { Commitment, PedersenSetup } from "./FusionProtocol/pedersen";
import HdNodeService from "@/services/HdNodeService";
import { convertCashAddress } from "../util/cashaddr";
import { BlindSignatureRequest } from "./FusionProtocol/schnorr";

import {
  genKeypair,
  calcInitialHash,
  randomOutputsForTier,
  componentFee,
  sizeOfInput,
  sizeOfOutput,
  sha256,
  hexToBytes,
  hash160,
  buildP2PKHScript,
  randomScalar,
  intToBytesBE,
} from "./FusionProtocol/util";

const Log = LogService("FusionService");

const secp = secp256k1;

const { Torboar } = Plugins;
const { CURVE } = secp256k1;

type Utxo = {
  address: string;
  txid: string;
  tx_pos: number;
  amount: bigint;
  memo: string | null;
};

type ServerHelloType = import("@/proto/fusion").fusion.ServerHello;
type ComponentType = import("@/proto/fusion").fusion.Component;
type InitialCommitmentType = import("@/proto/fusion").fusion.InitialCommitment;
type ProofType = import("@/proto/fusion").fusion.Proof;

export interface GenComponentsResult {
  initialCommitments: Uint8Array[];
  componentIndices: number[];
  serializedComponents: Uint8Array[];
  proofs: ProofType[];
  commPrivKeys: Uint8Array[];
  totalAmount: bigint;
  pedersenTotalNonce: Uint8Array;
}

// Fusion Protocol Components (from fusion.proto)

export type ComponentInput = {
  prev_txid: Uint8Array;
  prev_index: number; // uint32
  pubkey: Uint8Array; // compressed pubkey
  amount: number; // uint64
};

export type ComponentOutput = {
  scriptpubkey: Uint8Array;
  amount: number; // uint64
};

//  ----------------------------------------------------

export class FusionService {
  private _isRunning = false;

  private _shouldStopRequested = false;

  private _currentRound: Promise<void> | null = null;

  private _wallet: WalletEntity;

  private _walletHash: string;

  private _utxoManager: ReturnType<typeof UtxoManagerService>;

  private static _defaultMaxCoins = 10;

  private _fusion?: typeof import("@/proto/fusion").fusion;

  private _tier?: number;

  private _covertDomain?: string;

  private _covertPort?: number;

  private _covertSsl?: boolean;

  private _beginTime?: number;

  private _tFusionBegin?: number;

  private _lastHash?: Uint8Array;

  private _tierOutputs: Record<number, number[]> = {};

  private _safetyExcessFees: Record<number, number> = {};

  private _safetySumIn = 0;

  private _minExcessFee = 0;

  private _maxExcessFee = 0;

  private _numComponents = 0;

  private _componentFeerate = 0;

  private _reservedAddresses: string[] = [];

  private _inputs: Utxo[] = [];

  private _outputs: Array<[number, string]> = [];

  private _hdNode: ReturnType<typeof HdNodeService>;

  constructor(wallet: WalletEntity) {
    this._wallet = wallet;
    this._walletHash = wallet.walletHash;
    this._utxoManager = UtxoManagerService(this._walletHash);
    this._hdNode = HdNodeService(wallet);
    Log.log("FusionService initialized with wallet:", this._walletHash);
    Log.log("[FusionService] HdNodeService instance:", this._hdNode);
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

    try {
      Log.log("Calling Torboar.startTor...");
      await Torboar.startTor();
      Log.log("✅ Torboar.startTor() succeeded");
    } catch (e) {
      Log.error("❌ Torboar.startTor() failed", e);
      throw e;
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
            //this._scheduleNextRound(); //Schedule next round
          });
      } else {
        //this._scheduleNextRound();  //DEBUGGING. i think we dont need this...??.
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
      `fusion Selected ${selected.length} UTXOs out of ${allUtxos.length}`
    );
    selected.forEach((utxo, index) => {
      Log.log(
        `Selected UTXO #${index + 1}:`,
        `address=${utxo.address}, txid=${utxo.txid}, tx_pos=${utxo.tx_pos}, amount=${utxo.amount}, memo=${utxo.memo}`
      );
    });

    return selected;
  }

  public allocateOutputs(): void {
    Log.log("------------.allocating this many inputs: ", this._inputs.length);
    const numInputs = this._inputs.length;

    // Compute maximum outputs allowed
    const maxComponents = Math.min(
      this._numComponents,
      Protocol.MAX_COMPONENTS
    );
    const maxOutputs = maxComponents - numInputs;
    // This is where we could add logic to force MaxOutputs to be a different value based on "consolidation mode" (not implemented yet)

    // Enforce minimum outputs
    const uniqueAddresses = new Set(this._inputs.map((u) => u.address));
    const numDistinct = uniqueAddresses.size;

    const minOutputs = Math.max(Protocol.MIN_TX_COMPONENTS - numDistinct, 1);

    if (maxOutputs < minOutputs) {
      throw new Error(
        `Too few distinct inputs selected (${numDistinct}); cannot satisfy output count constraint (>=${minOutputs}, <=${maxOutputs})`
      );
    }

    // Compute available value
    const sumInputsValue = (this._inputs || [])
      .map((u) => Number(u.amount))
      .reduce((a, b) => a + b, 0);

    // compute per-input fee using sizeOfInput and componentFee
    const inputFees = (this._inputs || [])
      .map((u) => componentFee(sizeOfInput(u), this._componentFeerate))
      .reduce((a, b) => a + b, 0);

    const availForOutputs = sumInputsValue - inputFees - this._minExcessFee;

    // Compute per-output cost
    const feePerOutput = componentFee(34, this._componentFeerate);
    const offsetPerOutput = Protocol.MIN_OUTPUT + feePerOutput;

    if (availForOutputs < offsetPerOutput) {
      throw new Error("Selected inputs had too little value");
    }

    // RNG setup — expovariate random number generator
    const rng = {
      expovariate: (lambd: number) => -Math.log(1 - Math.random()) / lambd,
    };

    // Iterate over available tiers
    const tierOutputs: Record<number, number[]> = {};
    const excessFees: Record<number, number> = {};

    this.availableTiers.forEach((scale) => {
      const fuzzFeeMax = Math.floor(scale / 1_000_000);
      const fuzzFeeMaxReduced = Math.min(
        fuzzFeeMax,
        Protocol.MAX_EXCESS_FEE - this._minExcessFee,
        this._maxExcessFee - this._minExcessFee
      );

      if (fuzzFeeMaxReduced < 0) {
        return;
      }

      const fuzzFee = Math.floor(Math.random() * (fuzzFeeMaxReduced + 1));
      const reducedAvailForOutputs = availForOutputs - fuzzFee;

      if (reducedAvailForOutputs < offsetPerOutput) {
        //double check this logic.
        return;
      }

      const outputs = randomOutputsForTier(
        rng,
        reducedAvailForOutputs,
        scale,
        offsetPerOutput,
        maxOutputs
      );

      if (!outputs || outputs.length < minOutputs) {
        //double chcek this logic
        return;
      }

      const adjustedOutputs = outputs.map((o) => o - feePerOutput);

      if (
        this._inputs.length + adjustedOutputs.length >
        Protocol.MAX_COMPONENTS
      ) {
        Log.log("probelm with inputs and outputs length.....................");
        //double check this logic
        return;
      }

      Log.log(`Attempting allocation for tier ${scale}`);
      Log.log("adjustedOutputs =", adjustedOutputs);
      Log.log("adjustedOutputs.length =", adjustedOutputs.length);

      excessFees[scale] = sumInputsValue - inputFees - reducedAvailForOutputs;
      tierOutputs[scale] = adjustedOutputs;
    });

    Log.log("=== Dumping tierOutputs ===");
    Object.entries(tierOutputs).forEach(([scale, outputs]) => {
      Log.log(`Tier ${scale}: [${outputs.join(", ")}]`);
    });
    Log.log("=== End dump ===");

    //  Safety values
    this._tierOutputs = tierOutputs;
    this._safetyExcessFees = excessFees;
    this._safetySumIn = sumInputsValue;
  }

  private async _grabChangeAddresses(outAmounts: number[]) {
    const addrMgr = AddressManagerService(this._wallet.walletHash);
    const outAddrs = addrMgr.getUnusedAddresses(outAmounts.length, 1);
    return outAddrs;
  }

  private async createInputComponents(
    selectedUtxos: Utxo[]
  ): Promise<ComponentInput[]> {
    if (!Array.isArray(selectedUtxos)) {
      throw new Error("selectedUtxos is not an array");
    }

    return Promise.all(
      selectedUtxos.map(async (utxo, idx) => {
        if (!utxo || typeof utxo !== "object") {
          throw new Error(
            `Invalid utxo at index ${idx}: ${JSON.stringify(utxo)}`
          );
        }

        const requiredFields = ["txid", "tx_pos", "address", "amount"];
        for (const field of requiredFields) {
          if (!(field in utxo)) {
            throw new Error(`Missing field '${field}' in UTXO at index ${idx}`);
          }
        }

        const publicKeyHex = this._hdNode.getAddressPublicKey(utxo.address);
        const pubkey = Uint8Array.from(Buffer.from(publicKeyHex, "hex"));
        const prev_txid = Uint8Array.from(
          Buffer.from(utxo.txid, "hex")
        ).reverse();

        const prev_index = Long.fromValue(utxo.tx_pos);
        const amount = Long.fromValue(utxo.amount);

        if (!Long.isLong(prev_index) || !Long.isLong(amount)) {
          throw new Error(
            `Long conversion failed at index ${idx}: prev_index=${utxo.tx_pos}, amount=${utxo.amount}`
          );
        }

        return {
          prev_txid,
          prev_index,
          pubkey,
          amount,
        };
      })
    );
  }

  private async createOutputComponents(
    outputs: Array<[number, AddressEntity]>
  ): Promise<ComponentOutput[]> {
    return Promise.all(
      outputs.map(async ([amount, addressObj]) => {
        const publicKeyHex = this._hdNode.getAddressPublicKey(
          addressObj.address
        );
        const pubkey = Uint8Array.from(Buffer.from(publicKeyHex, "hex"));

        const pubkeyHash = await hash160(pubkey);
        const scriptPubKey = await buildP2PKHScript(pubkeyHash);

        return {
          scriptpubkey: scriptPubKey,
          amount,
        };
      })
    );
  }

  //-------------------------------------------------
  // GEN COMPONENTS
  //--------------------------------------

  private async genComponents(
    setup: PedersenSetup,
    numBlanks: number,
    inputs: ComponentInput[],
    outputs: ComponentOutput[],
    feerate: number,
    randomSalts: Uint8Array[]
  ): Promise<GenComponentsResult> {
    if (numBlanks < 0) throw new Error("numBlanks < 0");

    if (!this._fusion) {
      throw new Error("Fusion proto not loaded; call start() first");
    }

    Log.log("fubar 31");
    const components: Array<[ComponentType, bigint]> = [];

    Log.log("fubar 32");

    //HELPER FOR DEBUG TOUINT8
    function toUint8(x: any): Uint8Array {
      return x instanceof Uint8Array ? x : new Uint8Array(x);
    }

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const fee = componentFee(sizeOfInput(), feerate);

      const safeInput = {
        prev_txid: toUint8(input.prev_txid),
        prev_index: Number(input.prev_index),
        pubkey: toUint8(input.pubkey),
        amount: Number(input.amount),
      };

      const safeObject = {
        component: { input: safeInput },
        salt_commitment: new Uint8Array(32), // placeholder, overwritten later
      };

      const comp = this._fusion.Component.create(safeObject);
      Log.log(
        `fubar 32.inputCreated [${i}]`,
        this._fusion.Component.toObject(comp)
      );

      components.push([comp, BigInt(safeInput.amount) - BigInt(fee)]);
    }

    Log.log("fubar 33");

    // Handle output components
    for (const output of outputs) {
      const fee = componentFee(sizeOfOutput(), feerate);
      const comp = this._fusion.Component.create({
        component: {
          output: {
            scriptpubkey: output.scriptpubkey,
            amount: output.amount,
          },
        },
        salt_commitment: new Uint8Array(32), // placeholder, overwritten later
      }) as ComponentType;
      components.push([comp, -(BigInt(output.amount) + BigInt(fee))]);
    }

    Log.log("fubar 34");
    // Handle blank components
    for (let i = 0; i < numBlanks; i++) {
      const comp = this._fusion.Component.create({
        component: { blank: {} },
        salt_commitment: new Uint8Array(32), // placeholder, overwritten later
      }) as ComponentType;
      components.push([comp, 0n]);
    }

    let sumNonce = 0n;
    let sumAmounts = 0n;
    Log.log("fubar 35");
    const resultList: Array<
      [Uint8Array, number, Uint8Array, ProofType, Uint8Array]
    > = [];

    Log.log("fubar 36");

    for (let cnum = 0; cnum < components.length; cnum++) {
      const [comp, commitAmount] = components[cnum];
      Log.log(`fubar 36.1: processing component ${cnum}`);

      const salt = randomSalts[cnum];
      if (!(salt instanceof Uint8Array)) {
        throw new Error(`Salt at index ${cnum} is not a Uint8Array`);
      }

      let saltCommit: Uint8Array;
      try {
        saltCommit = await sha256(salt);
      } catch (e) {
        Log.error("fubar 36.1a: sha256(salt) failed", e);
        throw e;
      }

      Log.log(`fubar -------comp [${cnum}]`, JSON.stringify(comp));

      const subcomp = comp.component;

      Log.log(`fubar 36.rawsub [${cnum}]`, JSON.stringify(subcomp));
      let componentType = "unknown";
      if (subcomp?.input) {
        componentType = "input";
      } else if (subcomp?.output) {
        componentType = "output";
      } else if (subcomp?.blank) {
        componentType = "blank";
      }

      Log.log(`fubar 36.typecheck [${cnum}] type=${componentType}`);

      const compWithSaltCommit: any = {
        salt_commitment: saltCommit,
        ...(subcomp?.input ? { input: { ...subcomp.input } } : {}),
        ...(subcomp?.output ? { output: { ...subcomp.output } } : {}),
        ...(subcomp?.blank ? { blank: {} } : {}),
      };

      let compser: Uint8Array;
      try {
        const compMsg = this._fusion.Component.create(compWithSaltCommit);
        if (!compMsg || typeof compMsg !== "object") {
          throw new Error("Component.create returned invalid object");
        }
        Log.log(
          `fubar 36.encodePrecheck [${cnum}] created type=${compMsg.constructor?.name}`
        );
        compser = this._fusion.Component.encode(compMsg).finish();
        Log.log(`fubar 36.encodeSuccess [${cnum}] length=${compser.length}`);
      } catch (e) {
        Log.error("fubar 36.encodeFailure", e, {
          cnum,
          compWithSaltCommit,
        });
        throw e;
      }

      Log.log("fubar 36.aaa");
      // ---- Pedersen + Commitments ----
      const pedersenCommitment = new Commitment(setup, commitAmount);
      sumNonce += pedersenCommitment.nonce;
      sumAmounts += commitAmount;

      Log.log("fubar 36.bbb");

      const [privkey, pubkeyUncompressed, pubkeyCompressed] = genKeypair(secp);

      Log.log("fubar 36.bbb1");
      let saltedHash: Uint8Array;
      try {
        Log.log("fubar 36.bbb2");
        saltedHash = await sha256(new Uint8Array([...salt, ...compser]));
      } catch (e) {
        Log.error("fubar 36.3: sha256(salt+compser) failed", e);
        throw e;
      }

      Log.log("fubar 36.ccc");
      let ic: InitialCommitmentType;
      try {
        ic = this._fusion.InitialCommitment.create({
          salted_component_hash: saltedHash,
          amount_commitment: pedersenCommitment.pointPUncompressed,
          communication_key: pubkeyCompressed,
        }) as InitialCommitmentType;
      } catch (e) {
        Log.error("fubar 36.4: InitialCommitment.create failed", e);
        throw e;
      }

      Log.log("fubar 36.ddd");

      let icser: Uint8Array;
      try {
        icser = this._fusion.InitialCommitment.encode(ic).finish();
      } catch (e) {
        Log.error("fubar 36.5: InitialCommitment.encode failed", e);
        throw e;
      }

      let proof: ProofType;
      try {
        proof = this._fusion.Proof.create({
          component_idx: cnum,
          salt,
          pedersen_nonce: pedersenCommitment.nonceBytes, // 👈 no parentheses
        }) as ProofType;
      } catch (e) {
        Log.error("fubar 36.6: Proof.create failed", e);
        throw e;
      }

      resultList.push([icser, cnum, compser, proof, privkey]);

      Log.log("fubar 37a");
    }

    Log.log("fubar 37b");

    // Sort by serialized InitialCommitment
    resultList.sort((a, b) => {
      const aa = a[0];
      const bb = b[0];
      for (let i = 0; i < Math.min(aa.length, bb.length); i++) {
        if (aa[i] !== bb[i]) return aa[i] - bb[i];
      }
      return aa.length - bb.length;
    });

    Log.log("fubar 38");
    // Unpack results
    const initialCommitments: Uint8Array[] = [];
    const componentIndices: number[] = [];
    const serializedComponents: Uint8Array[] = [];
    const proofs: ProofType[] = [];
    const commPrivKeys: Uint8Array[] = [];

    Log.log("fubar 39");
    for (const [icser, cnum, compser, proof, privkey] of resultList) {
      initialCommitments.push(icser);
      componentIndices.push(cnum);
      serializedComponents.push(compser);
      proofs.push(proof);
      commPrivKeys.push(privkey);
    }

    Log.log("fubar 40");
    sumNonce %= Protocol.SECP256K1_ORDER;

    const pedersenTotalNonce = intToBytesBE(sumNonce, 32);

    Log.log("fubar 41");
    return {
      initialCommitments,
      componentIndices,
      serializedComponents,
      proofs,
      commPrivKeys,
      totalAmount: sumAmounts,
      pedersenTotalNonce,
    };
  }

  /* eslint-enable class-methods-use-this, 
                  no-restricted-syntax, 
                  operator-assignment */

  // END GEN COMPONENTS
  //---------------------------------------

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
    const numComponents = Number(serverHello.numComponents);
    const tiers = serverHello.tiers.map(Number);
    this._minExcessFee = minExcessFee;

    this._maxExcessFee = maxExcessFee;
    this._componentFeerate = componentFeerate;
    this._numComponents = numComponents;

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

  //-----------REGISTER AND WAIT----------------------

  //-----------REGISTER AND WAIT----------------------
  /* eslint-disable no-await-in-loop */
  /* eslint-disable no-constant-condition, no-else-return */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  /* eslint-disable no-promise-executor-return */
  /* eslint-disable no-void */
  /* eslint-disable no-console */
  /* eslint-disable no-continue */

  private async _registerAndWait(
    serverHello: ServerHello,
    selectedUtxos: Utxo[]
  ): Promise<void> {
    Log.log("=== Dumping tierOutputs in REGWAIT ===");
    Object.entries(this._tierOutputs).forEach(([scale, outputs]) => {
      Log.log(`Tier ${scale}: [${outputs.join(", ")}]`);
    });
    Log.log("=== End dump ===");

    if (!this._fusion) throw new Error("Fusion proto not loaded");

    Log.log("[FusionService] selectedUtxos", selectedUtxos);

    const tiersSorted = Object.keys(this._tierOutputs)
      .map(Number)
      .sort((a, b) => a - b);

    const randomTag = crypto.getRandomValues(new Uint8Array(20));
    const tags = [
      this._fusion.JoinPools.PoolTag.create({
        id: randomTag,
        limit: 1,
      }),
    ];

    const joinPoolsMsg = this._fusion.JoinPools.create({
      tiers: tiersSorted,
      tags,
    });

    const clientMessage = this._fusion.ClientMessage.create({
      joinpools: joinPoolsMsg,
    });

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

    Log.log("[FusionService] Sending JoinPools message to server...");
    await Torboar.sendTcpData({ data: FusionService._toHex(frameBytes) });

    let gotFusionBegin = false;
    let noMessageCounter = 0;
    const MAX_EMPTY_MESSAGES = 20;

    while (true) {
      Log.log("top of register and wait while loop...");
      try {
        const tcpStatus = await Torboar.checkTcpStatus();
        const alive = tcpStatus.alive;

        Log.log(`[FusionService] TCP status: alive=${alive}`, tcpStatus);
        if (!alive) {
          Log.log(
            "[FusionService] TCP socket is no longer alive — restarting Fusion"
          );
          //   break out of this loop so you can restart the fusion outside
          break;
        }
      } catch (err) {
        Log.error("[FusionService] Failed to get TCP status", err);
      }

      let result;
      try {
        // ✅ Java-side timeout = 5000 ms
        const pluginCall = Torboar.receiveTcpData({ timeoutMs: 5000 });

        // ✅ JS-side fallback timeout = 10 s
        const fallback = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timed out waiting for server")),
            10000
          )
        );

        result = await Promise.race([pluginCall, fallback]);
      } catch (err) {
        const msg = err?.message || err.toString();
        Log.error(
          "[FusionService] Error while waiting for server message:",
          msg
        );

        if (
          msg.includes("Socket closed") ||
          msg.includes("connection") ||
          msg.includes("ECONNRESET")
        ) {
          Log.error("[FusionService] Fatal TCP error — exiting receive loop");
          break;
        }

        noMessageCounter += 1;
        if (!gotFusionBegin && noMessageCounter >= MAX_EMPTY_MESSAGES) {
          throw new Error(
            "Gave up waiting for FusionBegin after multiple retries"
          );
        }
        continue;
      }

      const hexResponse = (result as { data: string }).data;
      const responseBytes = FusionService._fromHex(hexResponse);
      const payload = responseBytes.slice(12); // drop magic+len

      Log.log(
        `[FusionService] payload length = ${payload.length} bytes (before decode)`
      );
      Log.log(
        "[FusionService] payload hex preview:",
        Array.from(payload.slice(0, 32))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ")
      );

      try {
        const serverMsg = this._fusion.ServerMessage.decode(payload);

        const keys = Object.keys(serverMsg).filter(
          (k) => serverMsg[k] !== null && serverMsg[k] !== undefined
        );
        Log.log("[FusionService] Decoded ServerMessage keys:", keys);

        Log.log(
          "[FusionService] ServerMessage object:",
          JSON.stringify(
            this._fusion.ServerMessage.toObject(serverMsg, {
              longs: String,
              enums: String,
              bytes: String,
              defaults: true,
              arrays: true,
              objects: true,
            }),
            null,
            2
          )
        );

        noMessageCounter = 0;

        if (serverMsg.fusionbegin) {
          const fb = serverMsg.fusionbegin;
          Log.log("Got FusionBegin:", fb);
          Log.log("fubar 000 fb toJSON:", JSON.stringify(fb.toJSON(), null, 2));

          const localTimeSec = Date.now() / 1000;
          Log.log("fubar 0");
          Log.log("fubar 0.1 fb.servertime ", fb.serverTime);

          const clockMismatch = fb.serverTime - localTimeSec;

          Log.log(
            `zzz FusionBegin times: serverTime=${fb.serverTime} localTime=${localTimeSec} mismatch=${clockMismatch.toFixed(
              3
            )} seconds`
          );

          if (Math.abs(clockMismatch) > Protocol.MAX_CLOCK_DISCREPANCY) {
            Log.error(
              `Clock mismatch too large: ${clockMismatch.toFixed(
                3
              )} seconds (server=${fb.serverTime}, local=${localTimeSec})`
            );
            throw new Error(
              `Clock mismatch too large: ${clockMismatch.toFixed(3)} seconds`
            );
          }

          Log.log("fubar 1");

          // --- Fusion Begin Response ---
          Log.log("[FusionService] ======<<<<<<<<<<<<<<<<<<<<<<<<<<<======");
          Log.log("[FusionService] fb.tier =", fb.tier);
          Log.log("[FusionService] fb.covertDomain =", fb.covertDomain);
          Log.log("[FusionService] fb.covertPort =", fb.covertPort);
          Log.log("[FusionService] fb.covertSsl =", fb.covertSsl);
          Log.log("[FusionService] fb.serverTime =", fb.serverTime);
          Log.log(
            "[FusionService] available tier keys in this._tierOutputs:",
            Object.keys(this._tierOutputs).join(", ")
          );
          Log.log(
            "[FusionService] this._tierOutputs full dump:",
            JSON.stringify(this._tierOutputs)
          );
          Log.log(
            "[FusionService] this._safetyExcessFees full dump:",
            JSON.stringify(this._safetyExcessFees)
          );
          Log.log("======================================================");

          this._tier = fb.tier;
          this._covertDomain = fb.covertDomain;
          this._covertPort = fb.covertPort;
          Log.log(
            "fubar covertdomain is ",
            fb.covertDomain,
            " port is ",
            fb.covertPort
          );
          this._covertSsl = fb.covertSsl;
          this._beginTime = fb.serverTime;
          this._tFusionBegin = performance.now() / 1000; // local monotonic time

          Log.log("fubar 2");
          const hash = calcInitialHash(
            this._tier,
            this._covertDomain!,
            this._covertPort!,
            this._covertSsl!,
            this._beginTime!
          );
          this._lastHash = hash;

          const outAmounts = this._tierOutputs[this._tier] ?? [];
          const outAddrs = await this._grabChangeAddresses(outAmounts);
          console.log("[FusionService] typeof address:", typeof outAddrs[0]);
          console.log("[FusionService] address value:", outAddrs[0]);

          console.log(
            "[FusionService] typeof outamountss:",
            typeof outAmounts[0]
          );
          console.log("[FusionService] address value:", outAmounts[0]);
          this._reservedAddresses = outAddrs;
          this._outputs = outAmounts.map((amt, i) => [amt, outAddrs[i]]);

          Log.log("=== Dumping FIRST TIME this._outputs ===");
          this._outputs.forEach((entry, idx) => {
            const [amt, addr] = entry;
            Log.log(
              `output[${idx}] amount=`,
              amt.toString(),
              "addressEntity=",
              JSON.stringify(addr)
            );
          });
          Log.log("=== End dump ===");
          this._safetyExcessFee = this._safetyExcessFees[this._tier] ?? 0;

          Log.log(
            `starting fusion rounds at tier ${this._tier}: ${this._inputs.length} inputs and ${this._outputs.length} outputs`
          );

          Log.log("fubar 3");
          gotFusionBegin = true;

          Log.log(">>> about to call startCovert");

          // eslint-disable-next-line no-void
          void FusionService._startCovert({
            covertDomain: this._covertDomain!,
            covertPort: this._covertPort!,
            covertSsl: this._covertSsl!,
            numComponents: this._numComponents,
            tFusionBegin: this._tFusionBegin!,
          });

          Log.log("yyy done with covert setup");

          // eslint-disable-next-line no-continue
          continue;
        } else if (serverMsg.startround) {
          Log.log("Got StartRound:", serverMsg.startround);

          const pedersenSetup = new PedersenSetup(Torboar); // you provide torboar instance
          await pedersenSetup.init();
          Log.log("PedersenSetup done!");

          // -- Timing setup --
          const covert_T0 = performance.now() / 1000; // seconds monotonic
          const covertClock = () => performance.now() / 1000 - covert_T0;

          const serverTime = serverMsg.startround.serverTime;
          const localUnixTime = Date.now() / 1000;
          const clockMismatch = serverTime - localUnixTime;
          Log.log("fubar 20");
          if (Math.abs(clockMismatch) > Protocol.MAX_CLOCK_DISCREPANCY) {
            throw new Error(
              `Clock mismatch too large: ${clockMismatch.toFixed(3)}s (server=${serverTime}, local=${localUnixTime})`
            );
          }

          if (this._tFusionBegin !== null) {
            const warmupLag =
              covert_T0 - this._tFusionBegin - Protocol.WARMUP_TIME;
            if (Math.abs(warmupLag) > Protocol.WARMUP_SLOP) {
              throw new Error(
                `Warmup time mismatch: |${warmupLag.toFixed(3)}s| > ${Protocol.WARMUP_SLOP}`
              );
            }
            this._tFusionBegin = null;
          }

          Log.log("fubar 21");

          Log.log("inputs length:", this._inputs.length);
          Log.log("outputs length:", this._outputs.length);

          this._inputs.slice(0, 3).forEach((input, i) => {
            Log.log(`input[${i}] =`, input);
            Log.log(`typeof input[${i}].amount:`, typeof input.amount);
          });

          Log.log("this._componentFeerate:", this._componentFeerate);
          Log.log("sizeOfInput():", sizeOfInput());
          Log.log("sizeOfOutput():", sizeOfOutput());

          const compFeeIn = componentFee(sizeOfInput(), this._componentFeerate);
          const compFeeOut = componentFee(
            sizeOfOutput(),
            this._componentFeerate
          );

          Log.log("componentFee input:", compFeeIn);
          Log.log("componentFee output:", compFeeOut);

          const inputFees = this._inputs.length * compFeeIn;
          Log.log("inputFees:", inputFees);

          Log.log("fubar 21a");

          const outputFees = this._outputs.length * compFeeOut;
          Log.log("outputFees:", outputFees);

          Log.log("fubar 21b");

          let sumIn = 0n;
          try {
            sumIn = this._inputs.reduce(
              (sum, input: any) => sum + BigInt(input.amount),
              0n
            );
            Log.log("sumIn:", sumIn.toString());
          } catch (e) {
            Log.log("Error during sumIn reduce:", e);
          }

          Log.log("=== Dumping this._outputs ===");
          this._outputs.forEach((entry, idx) => {
            const [amt, addr] = entry;
            Log.log(
              `output[${idx}] amount=`,
              amt.toString(),
              "addressEntity=",
              JSON.stringify(addr)
            );
          });
          Log.log("=== End dump ===");

          let sumOut = 0n;
          sumOut = this._outputs.reduce(
            (sum, [amt, _]) => sum + BigInt(amt),
            0n
          );

          Log.log("fubar 21c");

          let totalFee = 0n;
          let excessFee = 0n;
          try {
            totalFee = sumIn - sumOut;
            excessFee = totalFee - BigInt(inputFees + outputFees);
            Log.log("totalFee:", totalFee.toString());
            Log.log("excessFee:", excessFee.toString());
          } catch (e) {
            Log.log("Error computing fees:", e);
          }

          Log.log("fubar 22");
          Log.log("sumIn:", sumIn.toString());
          Log.log(
            "_safetySumIn:",
            this._safetySumIn?.toString?.() ?? this._safetySumIn
          );
          Log.log("sumIn === _safetySumIn:", sumIn === this._safetySumIn);

          Log.log("excessFee:", excessFee.toString());
          Log.log(
            "_safetyExcessFee:",
            this._safetyExcessFee?.toString?.() ?? this._safetyExcessFee
          );
          Log.log(
            "excessFee === _safetyExcessFee:",
            excessFee === this._safetyExcessFee
          );

          Log.log("Protocol.MAX_EXCESS_FEE:", Protocol.MAX_EXCESS_FEE);
          Log.log(
            "excessFee <= MAX_EXCESS_FEE:",
            excessFee <= Protocol.MAX_EXCESS_FEE
          );

          Log.log("Protocol.MAX_FEE:", Protocol.MAX_FEE);
          Log.log("totalFee:", totalFee.toString());
          Log.log("totalFee <= MAX_FEE:", totalFee <= Protocol.MAX_FEE);

          const safeties = [
            Number(sumIn) === Number(this._safetySumIn),
            Number(excessFee) === Number(this._safetyExcessFee),
            Number(excessFee) <= Protocol.MAX_EXCESS_FEE,
            Number(totalFee) <= Protocol.MAX_FEE,
          ];

          Log.log("fubar 23");

          if (safeties.includes(false)) {
            Log.log("fubar 23b");
            throw new Error(`Funds re-check failed: ${safeties.join(", ")}`);
          }

          Log.log("fubar 23");

          if (safeties.includes(false)) {
            Log.log("fubar 23b");

            throw new Error(`Funds re-check failed: ${safeties.join(", ")}`);
          }

          // -- Extract round data --
          Log.log("fubar 23c");

          try {
            this._roundPubKey = serverMsg.startround.roundPubkey;
            this._blindNoncePoints = serverMsg.startround.blindNoncePoints;

            Log.log("fubar 23d");

            if (!this._blindNoncePoints) {
              Log.error(
                "[FusionService] blindNoncePoints is undefined or null."
              );
              throw new Error(
                "Missing blindNoncePoints in serverMsg.startround"
              );
            }

            Log.log(
              `[FusionService] Received ${this._blindNoncePoints.length} blind nonce points:`
            );

            this._blindNoncePoints.forEach((point, index) => {
              Log.log(
                `[FusionService] blindNonce[${index}]: ${Buffer.from(point).toString("hex")}`
              );
            });

            if (this._blindNoncePoints.length !== this._numComponents) {
              throw new Error(
                `blindNoncePoints length mismatch: got ${this._blindNoncePoints.length}, expected ${this._numComponents}`
              );
            }

            Log.log("fubar 25");
          } catch (e) {
            Log.error("[FusionService] Error while extracting round data:", e);
            throw e;
          }

          // -- Save covert start time function --
          this._covert_T0 = covert_T0;
          this._covertClock = covertClock;

          Log.log("fubar 26");

          Log.log("End StartRound. sanity checks passed.");
          Log.log("Ready to build components.");

          // -- Build Component Inputs --
          Log.log(
            "[FusionService] Building ComponentInputs from selected UTXOs..."
          );

          Log.log("[FusionService] this._inputs before build:", this._inputs);
          Log.log(
            "[FusionService] typeof this._inputs[0]:",
            typeof this._inputs[0]
          );
          Log.log("[FusionService] this._inputs[0]:", this._inputs[0]);

          // debug: Check if this._inputs is an array of UTXOs or [utxo, pubkey] tuples
          const utxos: Utxo[] = Array.isArray(this._inputs[0])
            ? this._inputs.map(([utxo]) => utxo)
            : this._inputs;

          Log.log("[FusionService] typeof this._hdNode:", typeof this._hdNode);
          Log.log(
            "[FusionService] this._hdNode keys:",
            Object.keys(this._hdNode || {})
          );
          Log.log(
            "[FusionService] typeof this._hdNode.getAddressPublicKey:",
            typeof this._hdNode?.getAddressPublicKey
          );

          // Build input components safely
          let inputComponents: ComponentInput[] = [];

          try {
            inputComponents = await this.createInputComponents(utxos);

            Log.log(
              "[FusionService] ComponentInputs ready: count=",
              inputComponents.length
            );

            // Optionally store for later steps in FusionService
            this._inputComponents = inputComponents;
          } catch (err) {
            Log.error("[FusionService] error with createInputComponents:", err);
            await Haptic.error?.();
            // bubble up or handle locally
            throw err;
          }

          // Only log count again if we actually succeeded
          if (inputComponents && inputComponents.length > 0) {
            Log.log(
              `[FusionService] ComponentInputs ready: count=${inputComponents.length}`
            );
          } else {
            Log.warn("[FusionService] No ComponentInputs were created.");
          }

          Log.log("fubar 27");

          // -- Build Component Outputs --
          Log.log(
            "[FusionService] Building ComponentOutputs from output map..."
          );
          const outputComponents = await this.createOutputComponents(
            this._outputs
          );
          Log.log(
            `[FusionService] ComponentOutputs ready: count=${outputComponents.length}`
          );

          Log.log("fubar 28");

          // -- Determine Blank Component Count --
          const numBlanks =
            this._numComponents -
            inputComponents.length -
            outputComponents.length;
          Log.log(`[FusionService] numBlanks=${numBlanks}`);

          if (numBlanks < 0) {
            throw new Error(
              `[FusionService] Component overflow: have ${
                inputComponents.length + outputComponents.length
              }, but only ${this._numComponents} slots`
            );
          }

          Log.log("fubar 29...");

          // Pre-generate salts for all components
          const totalComponents =
            inputComponents.length + outputComponents.length + numBlanks;
          const randomSalts = Array.from({ length: totalComponents }, () =>
            crypto.getRandomValues(new Uint8Array(32))
          );

          // ---- BEGIN DIAGNOSTIC LOGGING ---- //
          Log.log("[FusionService] Inspecting inputs to genComponents...");

          Log.log("numBlanks =", numBlanks);
          Log.log("inputComponents.length =", inputComponents.length);
          for (let i = 0; i < inputComponents.length; i++) {
            const ic = inputComponents[i];
            Log.log(
              `[input ${i}] types: prev_txid: ${ic.prev_txid instanceof Uint8Array}, prev_index: ${typeof ic.prev_index}, pubkey: ${ic.pubkey instanceof Uint8Array}, amount: ${typeof ic.amount}`
            );
          }

          Log.log("outputComponents.length =", outputComponents.length);
          for (let i = 0; i < outputComponents.length; i++) {
            const oc = outputComponents[i];
            Log.log(
              `[output ${i}] types: scriptpubkey: ${oc.scriptpubkey instanceof Uint8Array}, amount: ${typeof oc.amount}`
            );
          }

          Log.log(
            "randomSalts[0] type:",
            randomSalts[0] instanceof Uint8Array,
            "length:",
            randomSalts[0].length
          );
          // ---- END DIAGNOSTIC LOGGING ---- //

          // -- Call genComponents --
          Log.log("prepare setup type check");

          if (pedersenSetup == null) {
            Log.log("pedersenSetup is null or undefined");
          } else {
            Log.log("typeof pedersenSetup:", typeof pedersenSetup);
            Log.log("constructor name:", pedersenSetup.constructor.name);
            Log.log("setup keys:", Object.keys(pedersenSetup));
          }

          Log.log("[FusionService] Calling genComponents...");
          const generatedComponents = await this.genComponents(
            pedersenSetup,
            numBlanks,
            inputComponents,
            outputComponents,
            this._componentFeerate,
            randomSalts
          );

          // -- Log result --
          Log.log("[FusionService] genComponents complete.");

          Log.log(
            `[FusionService] InitialCommitments count: ${generatedComponents.initialCommitments.length}`
          );
          Log.log(
            `[FusionService] Total commitment amount: ${generatedComponents.totalAmount.toString()}`
          );
          Log.log(
            `[FusionService] Pedersen nonce: ${Buffer.from(
              generatedComponents.pedersenTotalNonce
            ).toString("hex")}`
          );
          // Blind Signature Requests
          Log.log(
            "[FusionService] Starting blind signature request generation..."
          );

          const roundPubkey: Uint8Array = serverMsg.startround.roundPubkey;

          // Log all blind nonce points (hex-encoded)
          Log.log(
            `[FusionService] Received ${this._blindNoncePoints.length} blind nonce points:`
          );

          try {
            this._blindNoncePoints.forEach((point, index) => {
              Log.log(
                `[FusionService] blindNonce[${index}]: ${Buffer.from(point).toString("hex")}`
              );
            });
          } catch (e) {
            Log.log("SUMTHING BROKE ", e);
          }

          Log.log("FUBAR42a");
          // Sanity check: number of nonce points must match number of components
          if (
            this._blindNoncePoints.length !==
            generatedComponents.serializedComponents.length
          ) {
            Log.log("FUBAR42b");
            throw new Error(
              `Blind nonce count mismatch: expected ${generatedComponents.serializedComponents.length}, got ${this._blindNoncePoints.length}`
            );
          }

          Log.log("FUBAR42c");
          // Generate blind signature requests
          const blindSigRequests: BlindSignatureRequest[] = [];

          Log.log("FUBAR42d");
          for (
            let i = 0;
            i < generatedComponents.serializedComponents.length;
            i++
          ) {
            Log.log("FUBAR42e");
            const component = generatedComponents.serializedComponents[i];

            Log.log("FUBAR42e2");
            const noncePoint = this._blindNoncePoints[i];

            Log.log("FUBAR42e3");
            const messageHash = await sha256(component);

            Log.log("FUBAR42e4");

            Log.log("roundpubkey ", roundPubkey);
            Log.log("---");
            Log.log("type is ", typeof roundPubkey);

            Log.log(
              `[FusionService] roundPubkey = ${Buffer.from(roundPubkey).toString("hex")}`
            );
            Log.log(
              `[FusionService] noncePoint[${i}] = ${Buffer.from(noncePoint).toString("hex")}`
            );
            Log.log(
              `[FusionService] messageHash[${i}] = ${Buffer.from(messageHash).toString("hex")}`
            );

            Log.log(`typeof messageHash = ${typeof messageHash}`);
            Log.log(
              `Array.isArray(messageHash) = ${Array.isArray(messageHash)}`
            );
            Log.log(
              `messageHash instanceof Uint8Array = ${messageHash instanceof Uint8Array}`
            );

            try {
              Log.log("len of messagehash is ", messageHash.length);
            } catch (e) {
              Log.log("cant get len. with ", e);
            }

            const request = new BlindSignatureRequest(
              roundPubkey,
              noncePoint,
              messageHash
            );

            Log.log("FUBAR42f");
            blindSigRequests.push(request);

            Log.log("FUBAR42g");
          }

          Log.log(`[FusionService] Finished blind signature setup.`);
          Log.log(
            `[FusionService] Built ${blindSigRequests.length} BlindSignatureRequest objects.`
          );
          Log.log("fubar 43");

          continue;
        } else if (serverMsg.tierstatusupdate) {
          Log.log("Got TierStatusUpdate:", serverMsg.tierstatusupdate);
          Object.entries(serverMsg.tierstatusupdate.statuses).forEach(
            ([tier, status]) => {
              const { players, min_players, max_players, time_remaining } =
                status;
              // you can add handling here if needed
            }
          );
          continue;
        } else {
          Log.error("Unknown ServerMessage type:", serverMsg);
          continue;
        }
      } catch (err) {
        Log.error("Error decoding ServerMessage:", err);
        continue;
      }
    }
  }

  // END REGISTER AND WAIT

  /* eslint-enable no-constant-condition, no-else-return */
  /* eslint-enable @typescript-eslint/no-unused-vars */

  //--------------------------------------------------------------

  private static async _startCovert(params: {
    covertDomain: string;
    covertPort: number;
    covertSsl: boolean;
    numComponents: number;
    tFusionBegin: number;
  }) {
    Log.log("fubar 10");
    const { covertDomain, covertPort, covertSsl, numComponents, tFusionBegin } =
      params;

    Log.log("fubar 11");

    const covert = new CovertSubmitter(
      covertDomain,
      covertPort,
      covertSsl,
      numComponents,
      Protocol.COVERT_SUBMIT_WINDOW,
      Protocol.COVERT_SUBMIT_TIMEOUT,
      Torboar
    );

    covert.startHealthMonitor();
    Log.log("fubar 12");

    try {
      Log.log(`zzz tFusionBegin (${typeof tFusionBegin}):`, tFusionBegin);
      Log.log(
        `zzz COVERT_CONNECT_WINDOW (${typeof Protocol.COVERT_CONNECT_WINDOW}):`,
        Protocol.COVERT_CONNECT_WINDOW
      );
      Log.log(
        `zzz COVERT_CONNECT_SPARES (${typeof Protocol.COVERT_CONNECT_SPARES}):`,
        Protocol.COVERT_CONNECT_SPARES
      );
      Log.log(
        `zzz COVERT_CONNECT_TIMEOUT (${typeof Protocol.COVERT_CONNECT_TIMEOUT}):`,
        Protocol.COVERT_CONNECT_TIMEOUT
      );

      // Fire-and-forget (no await)

      // eslint-disable-next-line no-void
      void covert
        .scheduleConnections(
          tFusionBegin,
          Protocol.COVERT_CONNECT_WINDOW,
          Protocol.COVERT_CONNECT_SPARES,
          Protocol.COVERT_CONNECT_TIMEOUT
        )
        .catch((err) => {
          Log.log("zzz scheduleConnections threw:", err);
        });
    } catch (outerErr) {
      Log.log("zzz scheduleConnections outer try block threw:", outerErr);
    }

    const tend =
      tFusionBegin + (Protocol.WARMUP_TIME - Protocol.WARMUP_SLOP - 1);

    while (Date.now() / 1000 < tend) {
      const numConnected = covert.connectedCount;
      const numSpareConnected = covert.spareCount;
      Log.log(
        `Setting up Tor connections (${numConnected}+${numSpareConnected} out of ${numComponents})`
      );

      covert.checkOk?.();
      // optionally: this.checkStop();
      // optionally: this.checkCoins();
      // eslint-disable-next-line no-promise-executor-return
      await new Promise<void>((r) => setTimeout(r, 1000));
    }

    return covert;
  }

  //-------------------------------------------------------------------

  private async _startFusionRound(): Promise<void> {
    Log.log("Starting fusion round...");
    const allUtxos = await this._grabWalletUtxos();
    const selectedUtxos = FusionService._selectRandomUtxos(allUtxos, 0.5);
    Log.log("Selected UTXOs:", selectedUtxos);
    this._inputs = selectedUtxos;

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

    // After the server handshake, but before registering for tiers, we need to allocate outputs.

    this.availableTiers = serverHello.tiers;
    Log.log("AVAILABLE TIERS from server:");
    Log.log("[FusionService] ===== ServerHello Info =====");
    Log.log("[FusionService] Available Tiers:", this.availableTiers.join(", "));
    Log.log("[FusionService] Number of Tiers:", this.availableTiers.length);
    Log.log(
      "[FusionService] Raw Tier Array:",
      JSON.stringify(this.availableTiers)
    );
    Log.log(
      "[FusionService] component_feerate =",
      serverHello.componentFeerate
    );
    Log.log("[FusionService] num_components =", serverHello.numComponents);
    Log.log("[FusionService] min_excess_fee =", serverHello.minExcessFee);
    Log.log("[FusionService] max_excess_fee =", serverHello.maxExcessFee);
    Log.log("[FusionService] =============================");

    this.coins = new Map<string, [string, number]>(); // rebuild coins map from selectedUtxos

    selectedUtxos.forEach((utxo) => {
      const outpoint = `${utxo.txid}:${utxo.tx_pos}`;
      this.coins.set(outpoint, [utxo.address, Number(utxo.amount)]);
    });

    try {
      this.allocateOutputs();
    } catch (err) {
      Log.error("allocateOutputs failed:", err);
      return; // abort round
    }

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
