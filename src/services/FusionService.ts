// Manages a persistent FusionService that continuously checks
// whether a new fusion round loop should start.
// The main loop manages flow in the fusion protocol
// and passes control from one phase to the next,
// with the phase functionality living in FusionPhase.ts.
// This main file also contains some major helper
// functions as well as functions that deal more
// with the wallet layer.

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
/* eslint-disable class-methods-use-this */
/* eslint-disable no-continue */

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

import {
  phase_starting,
  phase_selectingInputs,
  phase_sendGreet,
  phase_waitForServerHello,
  phase_allocateOutputs,
  phase_joinPools,
  phase_waitForFusionBegin,
  phase_prepareCovert,
  phase_waitForStartRound,
  phase_generateComponents,
  phase_sendPlayerCommit,
  phase_blindSignatures,
  phase_pedersenSetup,
  phase_receiveBlindSigResponses,
  phase_fubar1,
} from "@/services/FusionProtocol/FusionPhase";

import type { FusionPhase } from "@/services/FusionProtocol/util";

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
type FusionBeginType = import("@/proto/fusion").fusion.FusionBegin;
type InputComponentType = import("@/proto/fusion").fusion.InputComponent;
type OutputComponentType = import("@/proto/fusion").fusion.OutputComponent;

export interface GenComponentsResult {
  initialCommitments: InitialCommitmentData[];
  componentIndices: number[];
  serializedComponents: Uint8Array[];
  proofs: ProofType[];
  commPrivKeys: Uint8Array[];
  totalAmount: bigint;
  pedersenTotalNonce: Uint8Array;
  components: ComponentType[];
}

// Fusion Protocol Components (from fusion.proto)

export interface InitialCommitmentData {
  saltedComponentHash: Uint8Array;
  amountCommitment: Uint8Array;
  communicationKey: Uint8Array;
}

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

  private _torboar: typeof Torboar;

  private _serverHello?: ServerHelloType;

  private _fusionBegin?: FusionBeginType;

  private _startRound?: StartRoundType;

  private _covertSubmitter?: CovertSubmitter;

  private _roundInputs: InputComponentType[] = [];

  private _roundOutputs: OutputComponentType[] = [];

  private _generatedComponents: GenComponentsResult | null = null;

  private _covertT0: number = 0; // unix timestamp for critical schedule from startround.

  constructor(wallet: WalletEntity) {
    this._wallet = wallet;
    this._walletHash = wallet.walletHash;
    this._utxoManager = UtxoManagerService(this._walletHash);
    this._hdNode = HdNodeService(wallet);
    this._torboar = Torboar;
    Log.log("FusionService initialized with wallet:", this._walletHash);
    Log.log("[FusionService] HdNodeService instance:", this._hdNode);
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
      Log.log("Torboar.startTor() succeeded");
    } catch (e) {
      Log.error("Torboar.startTor() failed", e);
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
        //this._currentRound = this._startFusionRound()  //OLD UNFACTORED CODE..REMOVE WHEN DONE WITH IT.
        this._currentRound = this._runFusionRoundLoop()
          .catch((err) => Log.error("Fusion round failed", err))
          .finally(() => {
            this._currentRound = null;
            //this._scheduleNextRound(); //Schedule next round  //UNCOMMENT !!!
          });
      } else {
        Log.Log(
          "Fusion round in progress.  Scheduler is waiting for round to finish..."
        );
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

  private _selectRandomUtxos(
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

  // ------------------------------------------------------------
  // GEN COMPONENTS (safe oneof handling + strong type guards + minimal logs)
  // ------------------------------------------------------------
  private async genComponents(
    setup: PedersenSetup,
    numBlanks: number,
    inputs: ComponentInput[],
    outputs: ComponentOutput[],
    feerate: number,
    randomSalts: Uint8Array[]
  ): Promise<GenComponentsResult> {
    this._roundInputs = inputs;
    this._roundOutputs = outputs;

    if (numBlanks < 0) throw new Error("numBlanks < 0");
    if (!this._fusion)
      throw new Error("Fusion proto not loaded; call start() first");

    const fusion = this._fusion;
    const components: Array<[ComponentType, bigint]> = [];
    const toU8 = (x: any) => (x instanceof Uint8Array ? x : new Uint8Array(x));

    Log.log("[genComponents]   Begin component construction...");

    // ------------------ Inputs ------------------
    for (const input of inputs) {
      const fee = componentFee(sizeOfInput(), feerate);
      const safeAmount = BigInt(input.amount);

      const inputMsg = fusion.InputComponent.create({
        prev_txid: toU8(input.prev_txid),
        prev_index: Number(input.prev_index),
        pubkey: toU8(input.pubkey),
        amount: Number(input.amount),
      });

      const comp = fusion.Component.create({
        salt_commitment: new Uint8Array(32),
        input: inputMsg,
      });

      components.push([comp, safeAmount - BigInt(fee)]);
    }

    // ------------------ Outputs ------------------
    for (const output of outputs) {
      const fee = componentFee(sizeOfOutput(), feerate);
      const safeAmount = BigInt(output.amount);

      const outputMsg = fusion.OutputComponent.create({
        scriptpubkey: output.scriptpubkey,
        amount: Number(output.amount),
      });

      const comp = fusion.Component.create({
        salt_commitment: new Uint8Array(32),
        output: outputMsg,
      });

      components.push([comp, -(safeAmount + BigInt(fee))]);
    }

    // ------------------ Blanks ------------------
    for (let i = 0; i < numBlanks; i++) {
      const comp = fusion.Component.create({
        salt_commitment: new Uint8Array(32),
        blank: {},
      });
      components.push([comp, 0n]);
    }

    Log.log(`[genComponents]   Built ${components.length} raw components`);

    // ------------------------------------------------
    // Encode + Pedersen Commitments
    // ------------------------------------------------
    let sumNonce = 0n;
    let sumAmounts = 0n;
    const resultList: Array<
      [InitialCommitmentData, number, Uint8Array, ProofType, Uint8Array]
    > = [];

    for (let cnum = 0; cnum < components.length; cnum++) {
      const tuple = components[cnum];
      if (!tuple) {
        Log.error(
          `[genComponents] ⚠ Skipping undefined component at index ${cnum}`
        );
        continue;
      }

      const [comp, commitAmount] = tuple;
      const salt = randomSalts[cnum];
      if (!(salt instanceof Uint8Array))
        throw new Error(`Salt at index ${cnum} is not a Uint8Array`);

      const saltCommit = await sha256(salt);
      const flatComp = fusion.Component.create({
        salt_commitment: saltCommit,
        input: (comp as any).input,
        output: (comp as any).output,
        blank: (comp as any).blank,
      });

      const compser = fusion.Component.encode(flatComp).finish();
      Log.log(
        `   [debug-compser ${cnum}] ${Array.from(compser, (b) =>
          b.toString(16).padStart(2, "0")
        ).join("")}`
      );

      // ---- Pedersen commitment ----
      const pedersen = await Commitment.create(setup, commitAmount);
      sumNonce += pedersen.nonce;
      sumAmounts += commitAmount;

      const [privkey, , pubkeyCompressed] = genKeypair(secp);
      const saltedHash = await sha256(new Uint8Array([...salt, ...compser]));

      Log.log(
        `   saltedHash type=${typeof saltedHash}, length=${saltedHash.length}, firstbytes=${Buffer.from(
          saltedHash
        )
          .slice(0, 4)
          .toString("hex")}`
      );

      Log.log("amount commitment is ", pedersen.P_uncompressed);

      //   Store plain data (not protobuf)
      const icData: InitialCommitmentData = {
        saltedComponentHash: new Uint8Array(saltedHash),
        amountCommitment: new Uint8Array(pedersen.P_uncompressed),
        communicationKey: new Uint8Array(pubkeyCompressed),
      };

      Log.log(`[FusionService]   Pre-IC sanity check:`);
      Log.log(`  saltedHash len=${icData.saltedComponentHash.length}`);
      Log.log(`  amountCommitment len=${icData.amountCommitment.length}`);
      Log.log(`  communicationKey len=${icData.communicationKey.length}`);

      const proof = fusion.Proof.create({
        component_idx: cnum,
        salt,
        pedersen_nonce: pedersen.nonceBytes,
      });

      resultList.push([icData, cnum, compser, proof, privkey]);
    }

    // ------------------------------------------------
    // Deterministic sort
    // ------------------------------------------------
    resultList.sort((a, b) => {
      const [ia] = a;
      const [ib] = b;
      const ea = fusion.InitialCommitment.encode(
        fusion.InitialCommitment.create(ia)
      ).finish();
      const eb = fusion.InitialCommitment.encode(
        fusion.InitialCommitment.create(ib)
      ).finish();
      for (let i = 0; i < Math.min(ea.length, eb.length); i++) {
        if (ea[i] !== eb[i]) return ea[i] - eb[i];
      }
      return ea.length - eb.length;
    });

    // ------------------------------------------------
    // Unpack
    // ------------------------------------------------
    const initialCommitments: InitialCommitmentData[] = [];
    const componentIndices: number[] = [];
    const serializedComponents: Uint8Array[] = [];
    const proofs: ProofType[] = [];
    const commPrivKeys: Uint8Array[] = [];

    for (const [ic, idx, compser, proof, priv] of resultList) {
      if (!ic || !compser) {
        Log.error(`[genComponents] ⚠ Skipping malformed entry idx=${idx}`);
        continue;
      }
      initialCommitments.push(ic);
      componentIndices.push(idx);
      serializedComponents.push(compser);
      proofs.push(proof);
      commPrivKeys.push(priv);
    }

    sumNonce %= Protocol.SECP256K1_ORDER;
    const pedersenTotalNonce = intToBytesBE(sumNonce, 32);

    Log.log(
      `[genComponents]       Completed ${initialCommitments.length} components`
    );
    Log.log(`[genComponents] Σamounts=${sumAmounts}  Σnonce=${sumNonce}`);

    //   Debug each InitialCommitment structure
    initialCommitments.forEach((ic, i) => {
      Log.log(
        `[InitialCommitment ${i}] hash len=${ic.saltedComponentHash?.length}, amount len=${ic.amountCommitment?.length}, commkey len=${ic.communicationKey?.length}`
      );
      if (ic.saltedComponentHash) {
        Log.log(
          `[InitialCommitment ${i}] hash prefix=${Buffer.from(
            ic.saltedComponentHash
          )
            .slice(0, 4)
            .toString("hex")}`
        );
      }
    });

    //   Return pure, stable data
    return {
      initialCommitments,
      componentIndices,
      serializedComponents,
      proofs,
      commPrivKeys,
      totalAmount: sumAmounts,
      pedersenTotalNonce,
      components: components.map(([comp]) => comp),
    };
  }
  // END GEN COMPONENTS

  //--------------------------------------------------------------

  private async _runFusionRoundLoop(): Promise<void> {
    let phase: FusionPhase = "starting";

    while (true) {
      if (this._shouldStopRequested) {
        Log.warn("Fusion round loop stopped early due to shutdown request.");
        break;
      }

      try {
        switch (phase) {
          case "starting":
            phase = await phase_starting(this);

            break;

          case "selecting_inputs":
            phase = await phase_selectingInputs(this);
            break;

          case "sending_greet":
            phase = await phase_sendGreet(this);
            break;

          case "waiting_for_server_hello":
            phase = await phase_waitForServerHello(this);
            break;

          case "allocating_outputs":
            phase = await phase_allocateOutputs(this);
            break;

          case "join_pools":
            phase = await phase_joinPools(this);
            break;

          case "wait_for_fusion_begin":
            phase = await phase_waitForFusionBegin(this);
            break;

          case "prepare_covert":
            phase = await phase_prepareCovert(this);
            break;

          case "wait_for_start_round":
            phase = await phase_waitForStartRound(this);
            break;

          case "pedersen_setup":
            phase = await phase_pedersenSetup(this);
            break;

          case "generate_components":
            phase = await phase_generateComponents(this);
            break;

          case "blind_signatures":
            phase = await phase_blindSignatures(this);
            break;

          case "send_player_commit":
            phase = await phase_sendPlayerCommit(this);
            break;

          case "receive_blind_sig_responses":
            phase = await phase_receiveBlindSigResponses(this);
            break;

          case "fubar1":
            phase = await phase_fubar1(this);
            break;

          case "fubar2":
            phase = await phase_fubar2(this);
            break;

          case "done":
            Log.log("Fusion round completed.");
            return; // exit out of the function.  Round is over.

          default:
            Log.log("unknown phase ", phase);
            throw new Error(`Unknown phase: ${phase}`);
        }
      } catch (err) {
        Log.error(`Error in phase '${phase}':`, err);
        throw err; // optionally break instead of rethrowing
      }
    } //end while
  }
} // END OF CLASS.
