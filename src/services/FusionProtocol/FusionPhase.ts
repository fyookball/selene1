/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */ // Absolutely required for our architecture. We intentionally pass the service object through the stack.
/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-continue */
/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-restricted-syntax */

import { Commitment, PedersenSetup } from "./pedersen";
import { Protocol } from "./protocol";
import LogService from "@/services/LogService";
import { Config } from "./config";
import { block_checkpoints } from "@/util/block_checkpoints";
import { CovertSubmitter } from "./covert";
import { BlindSignatureRequest } from "./schnorr";
import {
  sha256,
  toHex,
  fromHex,
  hexToBytes,
  componentFee,
  sizeOfInput,
  sizeOfOutput,
  randomOutputsForTier,
  calcInitialHash,
  intToBytesBE,
} from "./util";

import type { FusionService } from "@/services/FusionService";
import type { FusionPhase } from "./util";

type ClientHelloType = import("@/proto/fusion").fusion.ClientHello;
type ClientMessageType = import("@/proto/fusion").fusion.ClientMessage;
type ServerHelloType = import("@/proto/fusion").fusion.ServerHello;
type ComponentType = import("@/proto/fusion").fusion.Component;
type InitialCommitmentType = import("@/proto/fusion").fusion.InitialCommitment;
type ProofType = import("@/proto/fusion").fusion.Proof;
type JoinPoolsType = import("@/proto/fusion").fusion.JoinPools;
type PoolTagType = import("@/proto/fusion").fusion.JoinPools.PoolTag;
type FusionBeginType = import("@/proto/fusion").fusion.FusionBegin;
type StartRoundType = import("@/proto/fusion").fusion.StartRound;
type PlayerCommitType = import("@/proto/fusion").fusion.PlayerCommit;

const Log = LogService("FusionService");
// Each phase returns the next FusionPhase string.
// All have access to the FusionService instance for shared state (tcp, utxos, etc.)

export async function phase_starting(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("Fusion Phase: starting");
  // TODO: clear old TCP
  return "selecting_inputs"; // Specify next phase.
}

export async function phase_selectingInputs(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("Fusion Phase: selecting_inputs");

  // Fetch all UTXOs and select a random subset
  service._inputs = service._selectRandomUtxos(
    await service._grabWalletUtxos(),
    0.5
  );

  return "sending_greet"; // Specify next phase.
}

export async function phase_sendGreet(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("Fusion Phase: sending_greet");

  const host = Config.FusionHost();
  const port = Config.FusionPort();

  await service._torboar.connectTcp({ host, port, ssl: true });

  const versionBytes = Protocol.VERSION;
  const genesisHash = hexToBytes(
    block_checkpoints.satoshiGenesis.blockhash
  ).reverse();

  if (!service._fusion) {
    Log.log("Fusion proto not loaded; call start() first");
    throw new Error("Fusion proto not loaded");
  }

  const clientHello = service._fusion.ClientHello.create({
    version: versionBytes,
    genesisHash,
  });

  const clientMessage = service._fusion.ClientMessage.create({
    clienthello: clientHello,
  });
  const payloadBytes =
    service._fusion.ClientMessage.encode(clientMessage).finish();

  const MAGIC = hexToBytes(Protocol.MAGIC);
  const lengthBytes = new Uint8Array([
    (payloadBytes.length >>> 24) & 0xff,
    (payloadBytes.length >>> 16) & 0xff,
    (payloadBytes.length >>> 8) & 0xff,
    payloadBytes.length & 0xff,
  ]);

  const frameBytes = new Uint8Array(
    MAGIC.length + lengthBytes.length + payloadBytes.length
  );
  frameBytes.set(MAGIC, 0);
  frameBytes.set(lengthBytes, MAGIC.length);
  frameBytes.set(payloadBytes, MAGIC.length + lengthBytes.length);

  await service._torboar.sendTcpDataPersistent({
    data: Buffer.from(frameBytes).toString("hex"),
  });

  //return "fubar1";
  return "waiting_for_server_hello";
}

export async function phase_waitForServerHello(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("Fusion Phase: waiting_for_server_hello");

  let hexResponse: string;
  try {
    const TIMEOUT_MS = 9000; // 9-second timeout
    const result = await Promise.race([
      service._torboar.receiveTcpDataPersistent(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timed out waiting for ServerHello")),
          TIMEOUT_MS
        )
      ),
    ]);

    hexResponse = (result as { data: string }).data;
    Log.log("fusion Received raw hexResponse:", hexResponse);
  } catch (err) {
    Log.error("Error during receiveTcpData:", err);
    throw err; // abort round
  }

  const responseBytes = fromHex(hexResponse);

  // Drop the first 12 bytes (8-byte magic + 4-byte length):
  const responsePayloadBytes = responseBytes.slice(12);

  let serverMsg;
  try {
    serverMsg = service._fusion.ServerMessage.decode(responsePayloadBytes);
  } catch (err) {
    Log.error(
      "Error decoding ServerMessage:",
      err,
      "hex:",
      toHex(responsePayloadBytes)
    );
    throw err;
  }

  const serverHello = serverMsg.serverhello as ServerHelloType | undefined;
  if (!serverHello) {
    Log.error("ServerMessage did not contain serverhello");
    throw new Error("Missing ServerHello in response");
  }

  const componentFeerate = Number(serverHello.componentFeerate);
  const minExcessFee = Number(serverHello.minExcessFee);
  const maxExcessFee = Number(serverHello.maxExcessFee);
  const numComponents = Number(serverHello.numComponents);
  const tiers = serverHello.tiers.map(Number);

  service._minExcessFee = minExcessFee;
  service._maxExcessFee = maxExcessFee;
  service._componentFeerate = componentFeerate;
  service._numComponents = numComponents;
  service._serverHello = serverHello;

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
  if (numComponents < Protocol.MIN_TX_COMPONENTS * 1.5) {
    throw new Error("Bad server config: too few components");
  }

  Log.log("Fusion server ready. Tiers available:", tiers);

  return "allocating_outputs";
}

export async function phase_allocateOutputs(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("Fusion Phase: allocating_outputs");

  // Set available tiers from ServerHello
  const serverHello = service._serverHello;
  if (!serverHello) {
    throw new Error("No ServerHello found in service");
  }

  const tiers = serverHello.tiers.map(Number);
  service.availableTiers = tiers;

  const numInputs = service._inputs.length;
  const maxComponents = Math.min(
    service._numComponents,
    Protocol.MAX_COMPONENTS
  );
  const maxOutputs = maxComponents - numInputs;

  const uniqueAddresses = new Set(service._inputs.map((u) => u.address));
  const numDistinct = uniqueAddresses.size;
  const minOutputs = Math.max(Protocol.MIN_TX_COMPONENTS - numDistinct, 1);

  if (maxOutputs < minOutputs) {
    throw new Error(
      `Too few distinct inputs selected (${numDistinct}); cannot satisfy output count constraint (>=${minOutputs}, <=${maxOutputs})`
    );
  }

  const sumInputsValue = service._inputs
    .map((u) => Number(u.amount))
    .reduce((a, b) => a + b, 0);

  const inputFees = service._inputs
    .map((u) => componentFee(sizeOfInput(u), service._componentFeerate))
    .reduce((a, b) => a + b, 0);

  const availForOutputs = sumInputsValue - inputFees - service._minExcessFee;
  const feePerOutput = componentFee(34, service._componentFeerate);
  const offsetPerOutput = Protocol.MIN_OUTPUT + feePerOutput;

  if (availForOutputs < offsetPerOutput) {
    throw new Error("Selected inputs had too little value");
  }

  const rng = {
    expovariate: (lambd: number) => -Math.log(1 - Math.random()) / lambd,
  };

  const tierOutputs: Record<number, number[]> = {};
  const excessFees: Record<number, number> = {};

  tiers.forEach((scale) => {
    const fuzzFeeMax = Math.floor(scale / 1_000_000);
    const fuzzFeeMaxReduced = Math.min(
      fuzzFeeMax,
      Protocol.MAX_EXCESS_FEE - service._minExcessFee,
      service._maxExcessFee - service._minExcessFee
    );

    if (fuzzFeeMaxReduced < 0) return;

    const fuzzFee = Math.floor(Math.random() * (fuzzFeeMaxReduced + 1));
    const reducedAvail = availForOutputs - fuzzFee;
    if (reducedAvail < offsetPerOutput) return;

    const outputs = randomOutputsForTier(
      rng,
      reducedAvail,
      scale,
      offsetPerOutput,
      maxOutputs
    );
    if (!outputs || outputs.length < minOutputs) return;

    const adjustedOutputs = outputs.map((o) => o - feePerOutput);
    if (numInputs + adjustedOutputs.length > Protocol.MAX_COMPONENTS) return;

    Log.log(
      ` Tier ${scale} — adjustedOutputs: [${adjustedOutputs.join(", ")}]`
    );
    excessFees[scale] = sumInputsValue - inputFees - reducedAvail;
    tierOutputs[scale] = adjustedOutputs;
  });

  Log.log("=== Dumping tierOutputs ===");
  Object.entries(tierOutputs).forEach(([scale, outputs]) => {
    Log.log(`Tier ${scale}: [${outputs.join(", ")}]`);
  });
  Log.log("=== End dump ===");

  // Persist into class
  service._tierOutputs = tierOutputs;
  service._safetyExcessFees = excessFees;
  service._safetySumIn = sumInputsValue;

  Log.log(" Allocation results:");
  Log.log("_tierOutputs keys:", Object.keys(service._tierOutputs));
  Log.log("_safetyExcessFees:", JSON.stringify(service._safetyExcessFees));
  Log.log("_safetySumIn:", service._safetySumIn);

  return "join_pools";
}

export async function phase_joinPools(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("Fusion Phase: Sending JoinPools message to server...");

  const tiersSorted = Object.keys(service._tierOutputs)
    .map(Number)
    .sort((a, b) => a - b);

  const randomTag = crypto.getRandomValues(new Uint8Array(20));
  const tags = [
    service._fusion.JoinPools.PoolTag.create({
      id: randomTag,
      limit: 1,
    }),
  ];

  const joinPoolsMsg = service._fusion.JoinPools.create({
    tiers: tiersSorted,
    tags,
  });

  const clientMessage = service._fusion.ClientMessage.create({
    joinpools: joinPoolsMsg,
  });

  const payloadBytes =
    service._fusion.ClientMessage.encode(clientMessage).finish();

  const MAGIC = hexToBytes(Protocol.MAGIC);
  const lengthBytes = new Uint8Array([
    (payloadBytes.length >>> 24) & 0xff,
    (payloadBytes.length >>> 16) & 0xff,
    (payloadBytes.length >>> 8) & 0xff,
    payloadBytes.length & 0xff,
  ]);

  const frameBytes = new Uint8Array(
    MAGIC.length + lengthBytes.length + payloadBytes.length
  );
  frameBytes.set(MAGIC, 0);
  frameBytes.set(lengthBytes, MAGIC.length);
  frameBytes.set(payloadBytes, MAGIC.length + lengthBytes.length);
  await service._torboar.sendTcpDataPersistent({ data: toHex(frameBytes) });

  Log.log("sent message to server for join pools.");

  return "wait_for_fusion_begin";
}

export async function phase_waitForFusionBegin(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("Fusion Phase: waiting_for_fusion_begin");

  let gotFusionBegin = false;
  let noMessageCounter = 0;
  const MAX_EMPTY_MESSAGES = 20;

  // 1. Log the object directly
  Log.log(
    "[FusionService] *********************************************torboar object:",
    service._torboar
  );

  // 2. Log constructor name (for type info)
  Log.log(
    "[FusionService] torboar type:",
    service._torboar?.constructor?.name || "undefined"
  );

  // 3. List available method names (if it's a plain object)
  if (service._torboar && typeof service._torboar === "object") {
    const methods = Object.keys(service._torboar).filter((k) => {
      return typeof (service._torboar as any)[k] === "function";
    });
    Log.log("[FusionService] torboar methods:", methods);
  }

  while (true) {
    Log.log("[FusionService] Top of fusion_begin wait loop...");

    try {
      const tcpStatus = await service._torboar.checkTcpStatusPersistent();
      const alive = tcpStatus.alive;
      Log.log(`[FusionService] TCP status: alive=${alive}`, tcpStatus);

      if (!alive) {
        Log.warn("[FusionService] TCP socket died — aborting round");
        break;
      }
    } catch (err) {
      Log.error("[FusionService] Failed to check TCP status", err);
    }

    let result;
    try {
      const pluginCall = service._torboar.receiveTcpDataPersistent({
        timeoutMs: 5000,
      });

      const fallback = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timed out waiting for server")),
          10000
        )
      );

      result = await Promise.race([pluginCall, fallback]);
    } catch (err) {
      const msg = err?.message || err.toString();
      Log.error("[FusionService] receiveTcpData error:", msg);

      if (
        msg.includes("Socket closed") ||
        msg.includes("connection") ||
        msg.includes("ECONNRESET")
      ) {
        Log.error("[FusionService] TCP failure — exiting");
        break;
      }

      noMessageCounter++;
      if (!gotFusionBegin && noMessageCounter >= MAX_EMPTY_MESSAGES) {
        Log.log("Took too long waiting for fusionbegin. exiting.");
        throw new Error("Timed out waiting for FusionBegin");
      }
      continue;
    }

    const hexResponse = (result as { data: string }).data;
    const responseBytes = fromHex(hexResponse);
    const payload = responseBytes.slice(12);

    Log.log(`[FusionService]  Payload length: ${payload.length}`);
    Log.log(
      "[FusionService] Payload preview:",
      Array.from(payload.slice(0, 32))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ")
    );

    let serverMsg;
    try {
      serverMsg = service._fusion.ServerMessage.decode(payload);
    } catch (err) {
      Log.error("[FusionService] Failed to decode ServerMessage:", err);
      continue;
    }

    const keys = Object.keys(serverMsg).filter(
      (k) => serverMsg[k] !== null && serverMsg[k] !== undefined
    );
    Log.log("[FusionService] ServerMessage keys:", keys);

    Log.log(
      "[FusionService] Decoded ServerMessage:",
      JSON.stringify(
        service._fusion.ServerMessage.toObject(serverMsg, {
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

    // Handle tierstatusupdate
    if (serverMsg.tierstatusupdate) {
      Log.log("[FusionService] ↪ Received TierStatusUpdate");

      Object.entries(serverMsg.tierstatusupdate.statuses).forEach(
        ([tier, status]) => {
          const p = status.players ?? "?";
          const min = status.minPlayers ?? "?";
          const max = status.maxPlayers ?? "?";
          const t = status.timeRemaining ?? "?";

          Log.log(
            `[FusionService] Tier ${tier}: ${p}/${min}-${max} players, ${t}s`
          );
        }
      );

      continue;
    }

    // Handle fusionbegin
    if (serverMsg.fusionbegin) {
      Log.log("[FusionService]  Received FusionBegin");
      service._fusionBegin = serverMsg.fusionbegin;
      gotFusionBegin = true;
      break;
    }
  }

  return "prepare_covert";
}

export async function phase_fubar2(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("PHASE FUBAR 2");

  const result = await service._torboar.foobar();
  Log.log("------");
  Log.log("foobar result is gonna be", result);
  return "done";
}

export async function phase_fubar1(
  service: FusionService
): Promise<FusionPhase> {
  //const MOCK_COVERT_DOMAIN = "45.77.136.9";
  //const MOCK_COVERT_DOMAIN = "23.215.0.136"; //example.com
  //const MOCK_COVERT_DOMAIN = "54.157.190.211"; //httpbin.org
  const MOCK_COVERT_DOMAIN = "httpbin.org";
  const MOCK_COVERT_PORT = 443;
  const MOCK_COVERT_SSL = true;
  const MOCK_NUM_COMPONENTS = 23;

  const tFusionBegin = Date.now() / 1000 + 5;

  // Ensure Torboar plugin is assigned
  if (!service._torboar) {
    const { Torboar } = Plugins;
    service._torboar = Torboar;
    Log.log(`[FusionService]  Assigned Torboar plugin to service._torboar`);
  }

  // Store core params
  service._covertDomain = MOCK_COVERT_DOMAIN;
  service._covertPort = MOCK_COVERT_PORT;
  service._covertSsl = MOCK_COVERT_SSL;
  service._numComponents = MOCK_NUM_COMPONENTS;
  service._tFusionBegin = tFusionBegin;

  // Instantiate CovertSubmitter with Torboar ref

  Log.log(`[FusionService] creating CovertSubmitter with:`);
  Log.log(
    `domain=${service._covertDomain}, port=${service._covertPort}, ssl=${service._covertSsl}`
  );
  Log.log(
    `torboarType=${typeof service._torboar}, torboarKeys=${Object.keys(service._torboar || {})}`
  );

  Log.log(`[FusionService] creating CovertSubmitter with:`);
  Log.log(
    `domain=${service._covertDomain}, port=${service._covertPort}, ssl=${service._covertSsl}`
  );

  const covert = new CovertSubmitter(
    service._covertDomain,
    service._covertPort,
    service._covertSsl,
    service._numComponents,
    Protocol.COVERT_SUBMIT_WINDOW,
    Protocol.COVERT_SUBMIT_TIMEOUT,
    service._torboar
  );
  service._covertSubmitter = covert;

  // Debug the constructor values
  Log.log(`[FusionService] covert._covertDomain = ${covert["_covertDomain"]}`);
  Log.log(`[FusionService] covert._covertPort = ${covert["_covertPort"]}`);
  Log.log(`[FusionService] covert._torboar = ${!!covert["_torboar"]}`);

  // Proceed with circuit scheduling
  try {
    Log.log(`[FusionService] fubar1 starting scheduleConnections...`);
    Log.log(`tFusionBegin = ${tFusionBegin}`);
    Log.log(`connectWindow = ${Protocol.COVERT_CONNECT_WINDOW}`);
    Log.log(`connectSpares = ${Protocol.COVERT_CONNECT_SPARES}`);
    Log.log(`connectTimeout = ${Protocol.COVERT_CONNECT_TIMEOUT}`);

    await covert.scheduleConnections(
      tFusionBegin,
      Protocol.COVERT_CONNECT_WINDOW,
      Protocol.COVERT_CONNECT_SPARES,
      Protocol.COVERT_CONNECT_TIMEOUT
    );

    Log.log("[FusionService]  Covert setup complete (fubar1).");
  } catch (err) {
    Log.error("[FusionService]  scheduleConnections failed fatally:", err);
  }

  return "fubar2";
}

export async function phase_prepareCovert(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("[FusionService] Covert prepare phase.");
  const fb = service._fusionBegin!;
  Log.log("[FusionService] ↪ Received FusionBegin");
  Log.log("[FusionService] fb.toJSON:", JSON.stringify(fb.toJSON(), null, 2));

  // Clock mismatch check
  const localTimeSec = Date.now() / 1000;
  const serverTime = fb.serverTime!;
  const clockMismatch = serverTime - localTimeSec;

  Log.log(`[FusionService]   FusionBegin times:
  serverTime = ${serverTime}
  localTime  = ${localTimeSec}
  mismatch   = ${clockMismatch.toFixed(3)} seconds`);

  if (Math.abs(clockMismatch) > Protocol.MAX_CLOCK_DISCREPANCY) {
    Log.error(
      `[FusionService]  Clock mismatch too large: ${clockMismatch.toFixed(3)}s`
    );
    throw new Error(
      `Clock mismatch too large: ${clockMismatch.toFixed(3)} seconds`
    );
  }

  // Store fusionbegin parameters into class ---
  service._tier = fb.tier!;
  service._covertDomain = fb.covertDomain!;
  service._covertPort = fb.covertPort!;
  service._covertSsl = fb.covertSsl!;
  service._beginTime = serverTime;
  service._tFusionBegin = performance.now() / 1000;

  // Decode the covert domain bytes into a string ---
  const covertDomainStr = new TextDecoder().decode(service._covertDomain);
  Log.log("[FusionService] Covert domain:", covertDomainStr);
  Log.log("[FusionService] Fusion tier:", service._tier);
  Log.log("[FusionService] Covert port:", service._covertPort);
  Log.log("[FusionService] Covert SSL:", service._covertSsl);

  // Compute initial hash ---
  const hash = calcInitialHash(
    service._tier,
    service._covertDomain,
    service._covertPort,
    service._covertSsl,
    service._beginTime
  );
  service._lastHash = hash;

  // Prepare output addresses ---
  const outAmounts = service._tierOutputs[service._tier] ?? [];
  const outAddrs = await service._grabChangeAddresses(outAmounts);
  service._reservedAddresses = outAddrs;
  service._outputs = outAmounts.map((amt, i) => [amt, outAddrs[i]]);

  Log.log("[FusionService] Prepared outputs:");
  service._outputs.forEach(([amt, addr], idx) => {
    Log.log(
      `  [${idx}] amount=${amt.toString()}, address=${JSON.stringify(addr)}`
    );
  });

  service._safetyExcessFee = service._safetyExcessFees[service._tier] ?? 0;

  Log.log(`[FusionService] Prepared for fusion:
  tier = ${service._tier}
  inputs = ${service._inputs.length}
  outputs = ${service._outputs.length}`);

  // Covert circuit setup ---
  Log.log("[FusionService]  Launching covert setup...");

  const covert = new CovertSubmitter(
    covertDomainStr, //  decode before passing
    service._covertPort,
    service._covertSsl,
    service._numComponents,
    Protocol.COVERT_SUBMIT_WINDOW,
    Protocol.COVERT_SUBMIT_TIMEOUT,
    service._torboar
  );

  service._covertSubmitter = covert;

  // Debug + circuit scheduling ---
  try {
    const tFusionBegin = service._tFusionBegin;
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

    // Fire-and-forget circuit scheduling (non-blocking)
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

  // Optional warmup loop before StartRound ---
  const tend =
    service._tFusionBegin + (Protocol.WARMUP_TIME - Protocol.WARMUP_SLOP - 1);

  while (Date.now() / 1000 < tend) {
    const numConnected = covert.connectedCount;
    const numSpareConnected = covert.spareCount;
    Log.log(
      `Setting up Tor connections (${numConnected}+${numSpareConnected} out of ${service._numComponents})`
    );
    await new Promise<void>((r) => setTimeout(r, 1000));
  }

  Log.log("[FusionService]  Covert setup complete.");
  return "wait_for_start_round";
}

export async function phase_waitForStartRound(
  service: FusionService
): Promise<string> {
  const start = Date.now();
  const timeoutMs = 50000;
  const maxEndTime = start + timeoutMs;
  Log.log("[FusionService]   PHASE WAITING FOR STARTROUND");

  // Diagnostics: Torboar sanity check ---
  Log.log(
    "[FusionService] ********************************************* torboar object:",
    service._torboar
  );
  Log.log(
    "[FusionService] torboar type:",
    service._torboar?.constructor?.name || "undefined"
  );

  if (service._torboar && typeof service._torboar === "object") {
    const methods = Object.keys(service._torboar).filter(
      (k) => typeof (service._torboar as any)[k] === "function"
    );
    Log.log("[FusionService] torboar methods:", methods.join(", "));
  }

  // Test reachability to plugin ---
  const result = await service._torboar.foobar();
  Log.log("------");
  Log.log(
    "[FusionService]  Able to reach Torboar layer. foobar() returned:",
    result
  );

  // Main poll loop ---
  while (Date.now() < maxEndTime) {
    try {
      //  Check socket status before polling
      const status = await service._torboar.checkTcpStatusPersistent();
      Log.log(
        "[FusionService]  TCP persistent status:",
        JSON.stringify(status, null, 2)
      );

      if (!status.alive) {
        Log.warn("[FusionService]  Persistent socket not alive, waiting...");
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      //  Poll persistent socket
      Log.log("[FusionService]  Polling persistent socket...");
      const res = await service._torboar.receiveTcpDataPersistent({
        timeoutMs: 5000,
      });

      Log.log("[FusionService]  Received data from persistent socket");

      // Frame handling: strip MAGIC + length (12 bytes) ---
      const hexResponse = res.data;
      const responseBytes = Buffer.from(hexResponse, "hex");
      if (responseBytes.length <= 12) {
        Log.warn(
          "[FusionService]  Response too short to contain a payload:",
          responseBytes.length
        );
        continue;
      }

      const payload = responseBytes.slice(12);
      Log.log(`[FusionService]  Payload length: ${payload.length}`);
      Log.log(
        "[FusionService]  Payload preview:",
        Array.from(payload.slice(0, 32))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ")
      );

      // Decode protobuf ---
      try {
        const serverMsg = service._fusion.ServerMessage.decode(payload);
        const keys = Object.keys(serverMsg);
        Log.log("[FusionService]  Decoded ServerMessage keys:", keys);

        if (serverMsg.startround) {
          Log.log("[FusionService]  Got StartRound:", serverMsg.startround);
          service._startRound = serverMsg.startround;
          return "pedersen_setup";
        }
      } catch (decodeErr) {
        Log.error(
          "[FusionService]  Failed to decode ServerMessage:",
          decodeErr
        );
        Log.log(
          "[FusionService]  Raw payload hex (first 64):",
          payload.slice(0, 64).toString("hex")
        );
      }
    } catch (err) {
      Log.error("[FusionService]  Error while waiting for StartRound:", err);
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error("Timeout waiting for StartRound message from server.");
}

export async function phase_pedersenSetup(
  service: FusionService
): Promise<string> {
  Log.log("[FusionService]  Phase: pedersen_setup");

  // Initialize Pedersen setup ---
  const pedersenSetup = new PedersenSetup(service._torboar);
  await pedersenSetup.init();
  service._pedersenSetup = pedersenSetup;

  Log.log("[FusionService]  PedersenSetup complete");

  // Timing setup ---
  const covert_T0 = performance.now() / 1000; // seconds monotonic
  const covertClock = () => performance.now() / 1000 - covert_T0;

  const serverTime = service._startRound.serverTime;
  const localUnixTime = Date.now() / 1000;
  const clockMismatch = serverTime - localUnixTime;

  if (Math.abs(clockMismatch) > Protocol.MAX_CLOCK_DISCREPANCY) {
    throw new Error(
      `Clock mismatch too large: ${clockMismatch.toFixed(3)}s (server=${serverTime}, local=${localUnixTime})`
    );
  }

  if (service._tFusionBegin !== null) {
    const warmupLag = covert_T0 - service._tFusionBegin - Protocol.WARMUP_TIME;
    if (Math.abs(warmupLag) > Protocol.WARMUP_SLOP) {
      throw new Error(
        `Warmup time mismatch: |${warmupLag.toFixed(3)}s| > ${Protocol.WARMUP_SLOP}`
      );
    }
    service._tFusionBegin = null;
  }

  // Log inputs/outputs summary ---
  Log.log("inputs length:", service._inputs.length);
  Log.log("outputs length:", service._outputs.length);

  service._inputs.slice(0, 3).forEach((input, i) => {
    Log.log(`input[${i}] =`, input);
    Log.log(`typeof input[${i}].amount:`, typeof input.amount);
  });

  Log.log("componentFeerate:", service._componentFeerate);
  Log.log("sizeOfInput():", sizeOfInput());
  Log.log("sizeOfOutput():", sizeOfOutput());

  // Fee calculations ---
  const compFeeIn = componentFee(sizeOfInput(), service._componentFeerate);
  const compFeeOut = componentFee(sizeOfOutput(), service._componentFeerate);

  Log.log("componentFee input:", compFeeIn);
  Log.log("componentFee output:", compFeeOut);

  const inputFees = service._inputs.length * compFeeIn;
  Log.log("inputFees:", inputFees);

  const outputFees = service._outputs.length * compFeeOut;
  Log.log("outputFees:", outputFees);

  // Sum inputs and outputs ---
  let sumIn = 0n;
  try {
    sumIn = service._inputs.reduce(
      (sum, input: any) => sum + BigInt(input.amount),
      0n
    );
    Log.log("sumIn:", sumIn.toString());
  } catch (e) {
    Log.log("Error during sumIn reduce:", e);
  }

  Log.log("=== Dumping outputs ===");
  service._outputs.forEach(([amt, addr], idx) => {
    Log.log(
      `output[${idx}] amount=${amt.toString()}, addressEntity=${JSON.stringify(addr)}`
    );
  });
  Log.log("=== End dump ===");

  let sumOut = 0n;
  sumOut = service._outputs.reduce((sum, [amt]) => sum + BigInt(amt), 0n);

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

  // Safety checks ---
  Log.log("sumIn:", sumIn.toString());
  Log.log("_safetySumIn:", service._safetySumIn);
  Log.log("sumIn === _safetySumIn:", sumIn === service._safetySumIn);

  Log.log("excessFee:", excessFee.toString());
  Log.log("_safetyExcessFee:", service._safetyExcessFee);
  Log.log(
    "excessFee === _safetyExcessFee:",
    excessFee === service._safetyExcessFee
  );

  Log.log("Protocol.MAX_EXCESS_FEE:", Protocol.MAX_EXCESS_FEE);
  Log.log("excessFee <= MAX_EXCESS_FEE:", excessFee <= Protocol.MAX_EXCESS_FEE);

  Log.log("Protocol.MAX_FEE:", Protocol.MAX_FEE);
  Log.log("totalFee:", totalFee.toString());
  Log.log("totalFee <= MAX_FEE:", totalFee <= Protocol.MAX_FEE);

  const safeties = [
    Number(sumIn) === Number(service._safetySumIn),
    Number(excessFee) === Number(service._safetyExcessFee),
    Number(excessFee) <= Protocol.MAX_EXCESS_FEE,
    Number(totalFee) <= Protocol.MAX_FEE,
  ];

  if (safeties.includes(false)) {
    Log.log("Saftey checks failed.");
    throw new Error("Safety checks failed.");
  }

  Log.log("[FusionService]  PedersenSetup complete and safety checks passed.");
  return "generate_components";
}

export async function phase_generateComponents(
  service: FusionService
): Promise<string> {
  Log.log("[FusionService]  Phase: generate_components");

  // -- Extract round data --
  Log.log("fubar 23c");

  try {
    service._roundPubKey = service._startRound.roundPubkey;
    service._blindNoncePoints = service._startRound.blindNoncePoints;

    Log.log("fubar 23d");

    if (!service._blindNoncePoints) {
      Log.error("[FusionService] blindNoncePoints is undefined or null.");
      throw new Error("Missing blindNoncePoints in serverMsg.startround");
    }

    Log.log(
      `[FusionService] Received ${service._blindNoncePoints.length} blind nonce points:`
    );

    service._blindNoncePoints.forEach((point, index) => {
      Log.log(
        `[FusionService] blindNonce[${index}]: ${Buffer.from(point).toString("hex")}`
      );
    });

    if (service._blindNoncePoints.length !== service._numComponents) {
      throw new Error(
        `blindNoncePoints length mismatch: got ${service._blindNoncePoints.length}, expected ${service._numComponents}`
      );
    }

    Log.log("fubar 25");
  } catch (e) {
    Log.error("[FusionService] Error while extracting round data:", e);
    throw e;
  }

  // -- Save covert start time function --
  service._covert_T0 = service._covert_T0 ?? performance.now() / 1000;
  service._covertClock =
    service._covertClock ??
    (() => performance.now() / 1000 - service._covert_T0);

  Log.log("fubar 26");
  Log.log("End StartRound. sanity checks passed.");
  Log.log("Ready to build components.");

  // -- Build Component Inputs --
  Log.log("[FusionService] Building ComponentInputs from selected UTXOs...");
  Log.log("[FusionService] service._inputs before build:", service._inputs);
  Log.log(
    "[FusionService] typeof service._inputs[0]:",
    typeof service._inputs[0]
  );
  Log.log("[FusionService] service._inputs[0]:", service._inputs[0]);

  const utxos: Utxo[] = Array.isArray(service._inputs[0])
    ? service._inputs.map(([utxo]) => utxo)
    : service._inputs;

  Log.log("[FusionService] typeof service._hdNode:", typeof service._hdNode);
  Log.log(
    "[FusionService] service._hdNode keys:",
    Object.keys(service._hdNode || {})
  );
  Log.log(
    "[FusionService] typeof service._hdNode.getAddressPublicKey:",
    typeof service._hdNode?.getAddressPublicKey
  );

  let inputComponents: ComponentInput[] = [];

  try {
    inputComponents = await service.createInputComponents(utxos);

    Log.log(
      "[FusionService] ComponentInputs ready: count=",
      inputComponents.length
    );

    service._inputComponents = inputComponents;
  } catch (err) {
    Log.error("[FusionService] error with createInputComponents:", err);
    await Haptic.error?.();
    throw err;
  }

  if (inputComponents && inputComponents.length > 0) {
    Log.log(
      `[FusionService] ComponentInputs ready: count=${inputComponents.length}`
    );
  } else {
    Log.warn("[FusionService] No ComponentInputs were created.");
  }

  Log.log("fubar 27");

  // -- Build Component Outputs --
  Log.log("[FusionService] Building ComponentOutputs from output map...");
  const outputComponents = await service.createOutputComponents(
    service._outputs
  );
  Log.log(
    `[FusionService] ComponentOutputs ready: count=${outputComponents.length}`
  );

  Log.log("fubar 28");

  // -- Determine Blank Component Count --
  const numBlanks =
    service._numComponents - inputComponents.length - outputComponents.length;
  Log.log(`[FusionService] numBlanks=${numBlanks}`);

  if (numBlanks < 0) {
    throw new Error(
      `[FusionService] Component overflow: have ${
        inputComponents.length + outputComponents.length
      }, but only ${service._numComponents} slots`
    );
  }

  Log.log("fubar 29...");

  // Pre-generate salts for all components
  const totalComponents =
    inputComponents.length + outputComponents.length + numBlanks;
  const randomSalts = Array.from({ length: totalComponents }, () =>
    crypto.getRandomValues(new Uint8Array(32))
  );

  // -Diagnostics ----
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

  Log.log("prepare setup type check");

  if (service._pedersenSetup == null) {
    Log.log("pedersenSetup is null or undefined");
  } else {
    Log.log("typeof pedersenSetup:", typeof service._pedersenSetup);
    Log.log("constructor name:", service._pedersenSetup.constructor.name);
    Log.log("setup keys:", Object.keys(service._pedersenSetup));
  }

  Log.log("[FusionService] Calling genComponents...");

  const generatedComponents = await service.genComponents(
    service._pedersenSetup,
    numBlanks,
    inputComponents,
    outputComponents,
    service._componentFeerate,
    randomSalts
  );

  Log.log("[FusionService] genComponents complete.");
  service._generatedComponents = generatedComponents;

  //  End of phase
  return "blind_signatures";
}

export async function phase_blindSignatures(
  service: FusionService
): Promise<string> {
  Log.log("[FusionService]  Phase: blind_signatures");

  const generatedComponents = service._generatedComponents;
  if (!generatedComponents) {
    throw new Error("Missing generatedComponents from previous phase.");
  }

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

  Log.log("[FusionService] Starting blind signature request generation...");

  const roundPubkey: Uint8Array = service._roundPubKey;
  const Torboar = service._torboar;

  // Log all blind nonce points (hex-encoded)
  Log.log(
    `[FusionService] Received ${service._blindNoncePoints.length} blind nonce points:`
  );

  try {
    service._blindNoncePoints.forEach((point, index) => {
      Log.log(
        `[FusionService] blindNonce[${index}]: ${Buffer.from(point).toString("hex")}`
      );
    });
  } catch (e) {
    Log.log("Error logging blindNoncePoints:", e);
  }

  // Sanity check: number of nonce points must match number of components
  if (
    service._blindNoncePoints.length !==
    generatedComponents.serializedComponents.length
  ) {
    throw new Error(
      `Blind nonce count mismatch: expected ${generatedComponents.serializedComponents.length}, got ${service._blindNoncePoints.length}`
    );
  }

  const blindSigRequests: BlindSignatureRequest[] = [];

  Log.log("[FusionService] Building blind signature requests...");

  for (let i = 0; i < generatedComponents.serializedComponents.length; i++) {
    const component = generatedComponents.serializedComponents[i];
    const noncePoint = service._blindNoncePoints[i];
    const messageHash = await sha256(component);

    Log.log(
      `[FusionService] roundPubkey = ${Buffer.from(roundPubkey).toString("hex")}`
    );
    Log.log(
      `[FusionService] noncePoint[${i}] = ${Buffer.from(noncePoint).toString("hex")}`
    );
    Log.log(
      `[FusionService] messageHash[${i}] = ${Buffer.from(messageHash).toString("hex")}`
    );

    const request = new BlindSignatureRequest({
      pubkey: roundPubkey,
      R: noncePoint,
      messageHash,
      torboar: Torboar,
    });
    await request.init();
    blindSigRequests.push(request);
  }

  Log.log(
    `[FusionService] Built ${blindSigRequests.length} BlindSignatureRequest objects.`
  );
  Log.log("[FusionService]  Finished blind signature setup.");

  // Persist for later phases
  service._blindSigRequests = blindSigRequests;

  //  Transition to next phase
  return "send_player_commit";
}

// =====================================================
// Phase: send_player_commit (hybrid fixed version)
// =====================================================
export async function phase_sendPlayerCommit(
  service: FusionService
): Promise<string> {
  Log.log("[FusionService]  Phase: player_commit");

  const gen = service._generatedComponents;
  const blindSigRequests = service._blindSigRequests;

  if (!gen) throw new Error("Missing generatedComponents");
  if (!blindSigRequests || blindSigRequests.length === 0)
    throw new Error("Missing blindSigRequests");
  if (!service._fusion?.PlayerCommit || !service._fusion?.ClientMessage)
    throw new Error("Protobuf bindings missing (PlayerCommit/ClientMessage)");

  const isUint8 = (v: any): v is Uint8Array => v instanceof Uint8Array;

  const hexToBytesSafe = (hex: string): Uint8Array => {
    const h = hex.startsWith("0x") ? hex.slice(2) : hex;
    const out = new Uint8Array(h.length / 2);
    for (let i = 0; i < h.length; i += 2)
      out[i / 2] = parseInt(h.slice(i, i + 2), 16);
    return out;
  };

  const normalizeBytes = (v: any, ctx: string): Uint8Array => {
    if (isUint8(v)) return v;
    if (Array.isArray(v)) return new Uint8Array(v);
    if (typeof v === "string") return hexToBytesSafe(v);
    throw new Error(`${ctx}: expected bytes, got ${typeof v}`);
  };

  Log.log("[FusionService] gen keys:", Object.keys(gen));

  // ------------------------------------------------------------------
  //  DUMMY ENCODE TEST — verify protobuf bindings
  // ------------------------------------------------------------------
  try {
    const foobar1 = new Uint8Array(32).fill(0xaa);
    const foobar2 = new Uint8Array(32).fill(0xbb);

    const dummyMsg = {
      initialCommitments: [foobar1],
      excessFee: 123,
      pedersenTotalNonce: foobar2,
      randomNumberCommitment: foobar1,
      blindSigRequests: [foobar2],
    };

    const dummyCommit = service._fusion.PlayerCommit.create(dummyMsg);
    const dummyClient = service._fusion.ClientMessage.create({
      playercommit: dummyCommit,
    });
    const dummyEncoded =
      service._fusion.ClientMessage.encode(dummyClient).finish();
    Log.log(
      "[FusionService]  Dummy PlayerCommit encoded OK, len:",
      dummyEncoded.length
    );
  } catch (err) {
    Log.log(
      "[FusionService]  Dummy encoding failed (protobuf binding/schema issue):",
      err
    );
    throw err;
  }

  // ------------------------------------------------------------------
  // Encode each InitialCommitment as a serialized submessage (bytes)
  // ------------------------------------------------------------------
  if (!Array.isArray(gen.initialCommitments))
    throw new Error("initialCommitments missing or not array");

  const initialCommitments: Uint8Array[] = [];
  for (let i = 0; i < gen.initialCommitments.length; i++) {
    const ic = gen.initialCommitments[i];
    try {
      const msg = service._fusion.InitialCommitment.create(ic);
      const encoded = service._fusion.InitialCommitment.encode(msg).finish();
      initialCommitments.push(encoded);
      Log.log(
        `[FusionService] Encoded InitialCommitment[${i}] len=${encoded.length}`
      );
    } catch (err) {
      Log.error(
        `[FusionService]  Failed to encode InitialCommitment[${i}]`,
        err
      );
      throw err;
    }
  }

  Log.log(
    `[FusionService]  Encoded ${initialCommitments.length} InitialCommitments`
  );

  // ------------------------------------------------------------------
  // excess_fee ---
  // ------------------------------------------------------------------
  let excessFee: number | string;
  if (typeof gen.totalAmount === "bigint") {
    const n = Number(gen.totalAmount);
    excessFee = Number.isSafeInteger(n) ? n : gen.totalAmount.toString();
  } else if (typeof gen.totalAmount === "number") {
    excessFee = gen.totalAmount;
  } else if (typeof gen.totalAmount === "string") {
    excessFee = gen.totalAmount;
  } else {
    throw new Error("Invalid totalAmount type");
  }

  Log.log(
    "[FusionService] excessFee typeof:",
    typeof excessFee,
    "value:",
    excessFee
  );

  // ------------------------------------------------------------------
  // pedersen_total_nonce ---
  // ------------------------------------------------------------------
  const pedersenTotalNonce = normalizeBytes(
    gen.pedersenTotalNonce,
    "pedersenTotalNonce"
  );
  if (pedersenTotalNonce.length !== 32)
    throw new Error(
      `pedersenTotalNonce len=${pedersenTotalNonce.length}, expected 32`
    );

  // ------------------------------------------------------------------
  // random_number_commitment ---
  // ------------------------------------------------------------------
  const randomNumber = crypto.getRandomValues(new Uint8Array(32));
  const randomNumberCommitment = await sha256(randomNumber);
  if (!isUint8(randomNumberCommitment) || randomNumberCommitment.length !== 32)
    throw new Error("Invalid randomNumberCommitment");

  // ------------------------------------------------------------------
  // blind_sig_requests (serialize e‖enew) ---
  // ------------------------------------------------------------------
  const blindSigBytes = blindSigRequests
    .map((r, i) => {
      if (typeof r.getRequest !== "function") {
        Log.log(
          `[FusionService] ⚠ blindSigRequests[${i}] missing getRequest()`
        );
        return undefined;
      }
      const { e, enew } = r.getRequest();
      if (typeof e !== "bigint" || typeof enew !== "bigint") {
        Log.log(
          `[FusionService] ⚠ blindSigRequests[${i}] invalid e/enew values`
        );
        return undefined;
      }

      const eBytes = intToBytesBE(e, 32);
      const enewBytes = intToBytesBE(enew, 32);
      const combined = new Uint8Array([...eBytes, ...enewBytes]); // 64 bytes

      Log.log(
        `[FusionService] blindSigRequests[${i}] serialized len=${combined.length}`
      );
      return combined;
    })
    .filter(Boolean) as Uint8Array[];

  Log.log("[FusionService] blindSigRequests:", blindSigBytes.length, "items");

  // ------------------------------------------------------------------
  // Deep inspection before final encode ---
  // ------------------------------------------------------------------
  Log.log("[FusionService] Deep inspection start ---");
  Log.log("initialCommitments[0] len:", initialCommitments[0]?.length);
  Log.log("pedersenTotalNonce len:", pedersenTotalNonce?.length);
  Log.log("randomNumberCommitment len:", randomNumberCommitment?.length);
  Log.log("blindSigRequests length:", blindSigBytes.length);
  if (blindSigBytes.length > 0)
    Log.log("blindSigRequests[0] len:", blindSigBytes[0]?.length);
  Log.log("[FusionService] Deep inspection end ---");

  // ------------------------------------------------------------------
  // Build and encode PlayerCommit ---
  // ------------------------------------------------------------------
  let payloadBytes: Uint8Array;
  try {
    Log.log("[FusionService]  Encoding real PlayerCommit...");
    const playerCommitMsg = {
      initialCommitments,
      excessFee,
      pedersenTotalNonce,
      randomNumberCommitment,
      blindSigRequests: blindSigBytes,
    };

    const commitMsg = service._fusion.PlayerCommit.create(playerCommitMsg);
    const clientMsg = service._fusion.ClientMessage.create({
      playercommit: commitMsg,
    });
    payloadBytes = service._fusion.ClientMessage.encode(clientMsg).finish();
    Log.log(
      "[FusionService]  Real PlayerCommit encoded OK, len:",
      payloadBytes.length
    );
  } catch (err) {
    Log.log("[FusionService]  Real protobuf encoding failed:", err);
    throw err;
  }

  // ------------------------------------------------------------------
  //  Frame and send
  // ------------------------------------------------------------------
  const MAGIC = hexToBytes(Protocol.MAGIC);
  const len = payloadBytes.length;
  const lengthBytes = new Uint8Array([
    (len >>> 24) & 0xff,
    (len >>> 16) & 0xff,
    (len >>> 8) & 0xff,
    len & 0xff,
  ]);
  const frame = new Uint8Array(MAGIC.length + 4 + len);
  frame.set(MAGIC, 0);
  frame.set(lengthBytes, MAGIC.length);
  frame.set(payloadBytes, MAGIC.length + 4);

  Log.log("[FusionService] Frame length:", frame.length);
  try {
    await service._torboar.sendTcpDataPersistent({ data: toHex(frame) });
  } catch (err) {
    Log.log("[FusionService]  TCP send failed:", err);
    throw err;
  }

  Log.log("[FusionService]  Sent PlayerCommit message to server.");
  Log.log(
    `[FusionService] Commit contained ${initialCommitments.length} commitments and ${blindSigBytes.length} blind sig requests.`
  );

  return "receive_blind_sig_responses";
}

// =====================================================
// Phase: receive_blind_sig_responses (minimal + hex logging)
// =====================================================
export async function phase_receiveBlindSigResponses(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("[FusionService] ▶ PHASE: RECEIVE BLIND SIG RESPONSES");

  try {
    Log.log("[FusionService] Waiting up to 15 s for blindsigresponses…");

    //  Wait for TCP payload
    const msg = await service._torboar.receiveTcpDataPersistent({
      timeoutMs: 15000,
    });
    if (!msg?.data) throw new Error("No TCP payload received");

    const responseBytes = hexToBytes(msg.data);
    Log.log(
      `[FusionService]  Received TCP payload (${responseBytes.length} bytes): ${Buffer.from(
        responseBytes
      )
        .toString("hex")
        .slice(0, 80)}...`
    );

    // Strip MAGIC + 4-byte length prefix (12 bytes total) ---
    const payload = responseBytes.slice(12);
    Log.log(
      `[FusionService]  Payload after stripping header (${payload.length} bytes): ${Buffer.from(
        payload
      )
        .toString("hex")
        .slice(0, 80)}...`
    );

    // Decode protobuf ---
    let serverMsg: any;
    try {
      if (service._fusion.ServerMessage) {
        serverMsg = service._fusion.ServerMessage.decode(payload);
      } else if (service._fusion.ServerReply) {
        serverMsg = service._fusion.ServerReply.decode(payload);
      } else {
        throw new Error("No ServerMessage/ServerReply type in proto");
      }
      Log.log("[FusionService]  Successfully decoded ServerMessage.");
    } catch (err) {
      throw new Error(`Failed to decode ServerMessage protobuf: ${err}`);
    }

    // Interpret server response
    if (serverMsg.error) {
      Log.log(
        "[FusionService] ⚠ Server error object:",
        JSON.stringify(serverMsg.error, null, 2)
      );

      throw new Error(serverMsg.error);
    }

    const responses = serverMsg.blindsigresponses;
    if (!responses || !responses.scalars?.length)
      throw new Error("Server returned empty or invalid blindsigresponses");

    Log.log(
      `[FusionService]  Received ${responses.scalars.length} blind signature scalars.`
    );

    // Finalize
    const reqs = service._blindSigRequests as BlindSignatureRequest[];
    if (!reqs?.length)
      throw new Error("No BlindSignatureRequest objects available");
    if (responses.scalars.length !== reqs.length)
      throw new Error(
        `Count mismatch: got ${responses.scalars.length}, expected ${reqs.length}`
      );

    const blindSigs: Uint8Array[] = [];
    for (let i = 0; i < responses.scalars.length; i++) {
      const sig = await reqs[i].finalize(responses.scalars[i], true);
      blindSigs.push(sig);
    }

    service._blindSignatures = blindSigs;
    Log.log(`[FusionService]  Finalized ${blindSigs.length} blind signatures.`);

    return "done";
  } catch (err: any) {
    Log.error("[FusionService]  Error in phase_receiveBlindSigResponses:", err);
    service.status = ["error", "blind sig response phase failed"];
    throw err;
  }
}

export async function phase_blame1(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("[FusionService]  Phase: blame1 (sending proofs)");

  //  Gather needed data from service
  const allCommitments = service._allCommitments; // Array<Uint8Array>
  const myCommitments = service._myCommitments; // Array<Uint8Array>
  const myProofs = service._myProofs; // Array<fusion.Proof>
  const myComponentIdxes = service._myComponentIdxes; // number[]
  const randomNumber = service._randomNumber; // Uint8Array

  if (!allCommitments || !myCommitments || !myProofs)
    throw new Error("Missing commitment/proof data for blame phase");

  //  Choose proof destinations
  const otherIdxes = allCommitments
    .map((_, i) => i)
    .filter((i) => !myComponentIdxes.includes(i));

  if (otherIdxes.length === 0)
    throw new Error("Fusion failed with only me as player");

  const dstCommits = myCommitments.map((_, i) => {
    const pos = randPosition(randomNumber, otherIdxes.length, i);
    return allCommitments[otherIdxes[pos]];
  });

  //  Encrypt proofs
  const encProofs: Uint8Array[] = [];

  for (let i = 0; i < myProofs.length; i++) {
    const proof = myProofs[i];
    const dstCommit = dstCommits[i];
    try {
      const commitMsg = fusion.InitialCommitment.decode(dstCommit);
      proof.component_idx = myComponentIdxes[i];
      const serialized = fusion.Proof.encode(proof).finish();
      const encrypted = encrypt(serialized, commitMsg.communication_key, {
        padToLength: 80,
      });
      encProofs.push(encrypted);
    } catch (e) {
      Log.warn("[FusionService] ⚠ Failed to encrypt proof", e);
      encProofs.push(new Uint8Array()); // blank if encryption fails
    }
  }

  //  Send MyProofsList to server
  const msg = fusion.MyProofsList.create({
    encrypted_proofs: encProofs,
    random_number: randomNumber,
  });

  await service.sendFusionMessage("myproofslist", msg);
  Log.log("[FusionService]  Sent MyProofsList to server");

  // Move to next blame-phase step (receiving TheirProofsList)
  return "blame2";
}

export async function phase_blame2(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("[FusionService]  Phase: blame2 (waiting for TheirProofsList)");

  // Wait for server message
  const msg = await service.recvFusionMessage("theirproofslist", {
    timeout: 2 * Protocol.STANDARD_TIMEOUT,
  });

  service._theirProofsList = msg; // store for next phase
  Log.log(
    `[FusionService]  Received TheirProofsList with ${msg.proofs.length} proofs`
  );

  return "blame3";
}

export async function phase_blame3(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("[FusionService]  Phase: blame3 (verifying proofs)");

  const msg = service._theirProofsList;
  const allCommitments = service._allCommitments;
  const privkeys = service._privkeys;
  const allComponents = service._allComponents;
  const badComponents = service._badComponents || [];
  const componentFeerate = service._componentFeerate;

  const blames: fusion.Blames.IBlameProof[] = [];
  let countInputs = 0;

  for (let i = 0; i < msg.proofs.length; i++) {
    const rp = msg.proofs[i];

    try {
      const privkey = privkeys[rp.dst_key_idx];
      const commitmentBlob = allCommitments[rp.src_commitment_idx];

      // Try decrypt
      let proofBlob: Uint8Array;
      let sessionKey: Uint8Array;
      try {
        [proofBlob, sessionKey] = encrypt.decrypt(rp.encrypted_proof, privkey);
      } catch (e) {
        Log.warn("[FusionService] ⚠ Undecryptable proof");
        blames.push(
          fusion.Blames.BlameProof.create({
            which_proof: i,
            privkey,
            blame_reason: "undecryptable",
          })
        );
        continue;
      }

      // Parse commitment
      const commitment = fusion.InitialCommitment.decode(commitmentBlob);

      // Validate internal structure
      let inpComp: any;
      try {
        inpComp = validateProofInternal(
          proofBlob,
          commitment,
          allComponents,
          badComponents,
          componentFeerate
        );
      } catch (e: any) {
        Log.warn("[FusionService] ⚠ Erroneous proof", e.message);
        blames.push(
          fusion.Blames.BlameProof.create({
            which_proof: i,
            session_key: sessionKey,
            blame_reason: e.message,
          })
        );
        continue;
      }

      // If it's an input, optionally check blockchain
      if (inpComp) {
        countInputs++;
        try {
          await checkInputElectrumx(service.network, inpComp);
        } catch (e: any) {
          Log.warn(
            `[FusionService] ⚠ Bad input [${rp.src_commitment_idx}]: ${e.message}`
          );
          blames.push(
            fusion.Blames.BlameProof.create({
              which_proof: i,
              session_key: sessionKey,
              blame_reason: `input does not match blockchain: ${e.message}`,
              need_lookup_blockchain: true,
            })
          );
        }
      }
    } catch (e) {
      Log.warn("[FusionService] ⚠ Error processing proof", e);
    }
  }

  Log.log(
    `[FusionService]  Checked ${msg.proofs.length} proofs (${countInputs} inputs)`
  );

  // Send blames
  const blameMsg = fusion.Blames.create({ blames });
  await service.sendFusionMessage("blames", blameMsg);
  Log.log("[FusionService]  Sent Blames to server");

  return "blame4";
}

export async function phase_blame4(
  service: FusionService
): Promise<FusionPhase> {
  Log.log("[FusionService]  Phase: blame4 (awaiting restart round)");

  await service.recvFusionMessage("restartround", {
    timeout: 2 * (Protocol.STANDARD_TIMEOUT + Protocol.BLAME_VERIFY_TIME),
  });

  Log.log("[FusionService]  Received RestartRound");
  return "wait_for_start_round"; // or whatever your next logical phase is
}
