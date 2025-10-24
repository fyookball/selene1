/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-plusplus */
/* eslint-disable no-promise-executor-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable no-bitwise */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-empty */

import PQueue from "p-queue";
import { Protocol } from "./protocol";
import LogService from "@/services/LogService";
import { hexToBytes } from "./util";
import { fusion } from "@/proto/fusion";

type PingType = import("@/proto/fusion").fusion.Ping;
type OKType = import("@/proto/fusion").fusion.OK;
type ErrorType = import("@/proto/fusion").fusion.Error;
type CovertMessageType = import("@/proto/fusion").fusion.CovertMessage;
type CovertResponseType = import("@/proto/fusion").fusion.CovertResponse;
type CovertComponentType = import("@/proto/fusion").fusion.CovertComponent;
type CovertTransactionSignatureType =
  import("@/proto/fusion").fusion.CovertTransactionSignature;

const Log = LogService("FusionService");

/**
 * Trapezoidal random number between 0 and 1 (like Electron Cash rand_trap).
 */
function randTrap(): number {
  const sixth = 1 / 6;
  const f = Math.random();
  const fc = 1 - f;
  if (f < sixth) return Math.sqrt(0.375 * f);
  if (fc < sixth) return 1 - Math.sqrt(0.375 * fc);
  return 0.75 * f + 0.125;
}

/**
 *  rate limiter: remembers when connections were opened and how many
 * are still inside the lifetime window.
 */
class TorLimiter {
  private _expiries: number[] = [];

  constructor(private _lifetime: number) {}

  private _cleanup() {
    const now = Date.now() / 1000;
    while (this._expiries.length && this._expiries[0] < now) {
      this._expiries.shift();
    }
  }

  get count(): number {
    this._cleanup();
    return this._expiries.length;
  }

  bump() {
    const now = Date.now() / 1000 + this._lifetime;
    this._expiries.push(now);
  }
}

class CovertCircuit {
  private _circuitKey: string;
  private _circuitId: string | null = null;

  private _torboar: any;
  private _covertDomain: string;
  private _covertPort: number;
  private _covertSsl: boolean;
  private _socksUser: string;
  private _covertSubmitter: CovertSubmitter;

  constructor(
    circuitKey: string,
    torboar: any,
    covertDomain: string,
    covertPort: number,
    covertSsl: boolean,
    covertSubmitter: CovertSubmitter,
    socksUser?: string
  ) {
    this._circuitKey = circuitKey;
    this._torboar = torboar;
    this._covertDomain = covertDomain;
    this._covertPort = covertPort;
    this._covertSsl = covertSsl;
    this._covertSubmitter = covertSubmitter;
    this._socksUser = socksUser;
  }
  private static _timeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error("Timeout")), ms);
      promise
        .then((res) => {
          clearTimeout(id);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(id);
          reject(err);
        });
    });
  }

  public get socksUser(): string {
    return this._socksUser;
  }

  async create() {
    //Log.log("CREATE FUNCTION ");

    // Step 1: Create the circuit itself
    const result = await this._torboar.createNewCircuit({ timeoutMs: 30000 });
    const circuitId = result.circuitId;
    //Log.log(`[CovertCircuit] (${this._circuitKey}) circuitId=${circuitId}`);

    // Step 2: Open a Tor connection with unique SOCKS user
    //Log.log(   `[CovertCircuit] (${this._circuitKey}) opening Tor connection with socksUser=${this._socksUser}`);

    await this._torboar.openConnectionThroughCircuit({
      host: this._covertDomain,
      port: this._covertPort,
      ssl: this._covertSsl,
      circuitKey: this._circuitKey,
      socksUser: this._socksUser, // this is what Tor uses to isolate the circuit
    });

    // Step 3: Verify the connection (ping)
    //Log.log(`[CovertCircuit] (${this._circuitKey}) verifying connection...`);
    // const isVerified = await this.verifyConnection();

    // DONT "VERIFY" CIRCUITS, THERE IS NO VERIFY. CIRCUITS ARE BUILT AND STAY SILENT UNTIL THE TIME
    const isVerified = true;

    return { circuitId, isVerified };
  }

  async makeRequest(url: string): Promise<string> {
    if (!this._circuitId) throw new Error("Circuit not created yet");
    const res = await this._torboar.makeRequestThroughCircuit({
      circuitKey: this._circuitKey,
      url,
    });
    return res.response as string;
  }

  async verifyConnection(): Promise<boolean> {
    Log.log(
      `[CovertCircuit] (${this._circuitKey}) Starting verifyConnection (protobuf ping)`
    );

    try {
      // ---- build the oneof properly ----
      const ping = fusion.Ping.create({});
      const covertMsg = fusion.CovertMessage.create({ ping }); // oneof field name correct
      const payloadBytes = fusion.CovertMessage.encode(covertMsg).finish();

      // --- Frame and send over TCP ---
      const MAGIC = hexToBytes(Protocol.MAGIC);
      const len = payloadBytes.length;
      const lengthBytes = new Uint8Array([
        (len >>> 24) & 0xff,
        (len >>> 16) & 0xff,
        (len >>> 8) & 0xff,
        len & 0xff,
      ]);

      const frame = new Uint8Array(MAGIC.length + lengthBytes.length + len);
      frame.set(MAGIC, 0);
      frame.set(lengthBytes, MAGIC.length);
      frame.set(payloadBytes, MAGIC.length + lengthBytes.length);

      const frameHex = Buffer.from(frame).toString("hex");
      Log.log(
        `[CovertCircuit] (${this._circuitKey}) 🧾 frame len=${frame.length} head=${frameHex.slice(
          0,
          40
        )}...`
      );

      // Quick local sanity decode
      const testDecode = fusion.CovertMessage.decode(payloadBytes);
      Log.log(
        `[CovertCircuit] (${this._circuitKey}) Decoded payload type: ${Object.keys(
          testDecode
        )}`
      );

      // ---- send the frame ----
      await this._torboar.sendTcpData({
        circuitKey: this._circuitKey,
        data: frameHex,
      });

      // ---- wait for reply ----
      const res = await this._torboar.receiveTcpData({
        circuitKey: this._circuitKey,
        timeoutMs: 15000, // allow some latency
      });

      const responseBytes = Buffer.from(res.data, "hex");

      let response;
      try {
        response = fusion.CovertResponse.decode(responseBytes);
      } catch (decodeErr) {
        Log.error(
          `[CovertCircuit] (${this._circuitKey}) Could not decode response:`,
          decodeErr
        );
        Log.log(
          `[CovertCircuit] (${this._circuitKey}) raw response bytes:`,
          bytesToHex(responseBytes.slice(0, 40)),
          "..."
        );
        return false;
      }

      if (response.ok) {
        Log.log(
          `[CovertCircuit] (${this._circuitKey}) Verification successful`
        );
        return true;
      }

      if (response.error) {
        Log.warn(
          `[CovertCircuit] (${this._circuitKey}) Server error: ${response.error.message}`
        );
        return false;
      }

      Log.warn(`[CovertCircuit] (${this._circuitKey}) Unexpected response`);
      return false;
    } catch (err) {
      Log.error(`[CovertCircuit] (${this._circuitKey}) Ping failed`, err);
      return false;
    }
  }

  //--------------------------------
} //end class

//---------COVERT SUBMITTER

type CircuitStatus = "pending" | "built" | "failed" | "late";

interface CircuitRecord {
  key: string;
  socksUser: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  verified?: boolean;
  circuitId?: string;
  status: CircuitStatus;
  circuit?: CovertCircuit;
}

/**
 * Manages a pool of covert circuits and spares.
 */
export class CovertSubmitter {
  private _circuits: CovertCircuit[] = [];
  private _spareCircuits: CovertCircuit[] = [];
  private _limiter: TorLimiter;
  private _covertDomain: string;
  private _covertPort: number;
  private _covertSsl: boolean;
  private _numComponents: number;
  private _submitWindow: number;
  private _submitTimeout: number;
  private _torboar: any;
  private _circuitLedger: Map<string, CircuitRecord> = new Map();

  constructor(
    covertDomain: string,
    covertPort: number,
    covertSsl: boolean,
    numComponents: number,
    submitWindow: number,
    submitTimeout: number,
    torboar: any
  ) {
    Log.log("start of CovertSubmitter constructor");

    this._covertDomain = covertDomain;
    this._covertPort = covertPort;
    this._covertSsl = covertSsl;
    this._numComponents = numComponents;
    this._submitWindow = submitWindow;
    this._submitTimeout = submitTimeout;
    this._torboar = torboar;
    this._limiter = new TorLimiter(Protocol.TOR_COOLDOWN_TIME || 5);

    Log.log(
      `[CovertSubmitter] constructed with domain=${covertDomain}, port=${covertPort}, ssl=${covertSsl}`
    );

    // Debug: show if torboar is defined and what methods it exposes
    if (!torboar) {
      Log.error("[CovertSubmitter] torboar instance is undefined!");
    } else {
      try {
        const keys = Object.keys(torboar);
        const funcNames = keys.filter(
          (k) => typeof (torboar as any)[k] === "function"
        );
        Log.log(
          `[CovertSubmitter] torboar is defined with ${funcNames.length} methods: ${funcNames.join(
            ", "
          )}`
        );
      } catch (e) {
        Log.error("[CovertSubmitter] ⚠ Error inspecting torboar:", e);
      }
    }

    Log.log("end of CovertSubmitter constructor");
  }

  private async pingSend(circuitKey: string): Promise<void> {
    // 1. Build protobuf payload
    const pingMsg = this._fusion.CovertMessage.create({
      ping: this._fusion.Ping.create({}),
    });
    const payload = this._fusion.CovertMessage.encode(pingMsg).finish();

    // 2. Add framing: MAGIC + 4-byte big-endian length
    const MAGIC = hexToBytes(Protocol.MAGIC); // same constant used elsewhere
    const len = payload.length;
    const lengthBytes = new Uint8Array([
      (len >>> 24) & 0xff,
      (len >>> 16) & 0xff,
      (len >>> 8) & 0xff,
      len & 0xff,
    ]);

    const frame = new Uint8Array(MAGIC.length + lengthBytes.length + len);
    frame.set(MAGIC, 0);
    frame.set(lengthBytes, MAGIC.length);
    frame.set(payload, MAGIC.length + lengthBytes.length);

    // 3. Send through the circuit socket
    await this._torboar.sendTcpData({
      circuitKey,
      data: Buffer.from(frame).toString("hex"),
    });

    Log.log(
      `[CovertSubmitter] Sent framed Ping for circuit ${circuitKey} (len=${len})`
    );
  }

  private async pingReceive(
    circuitKey: string,
    timeoutMs = 5000
  ): Promise<boolean> {
    try {
      const res = await this._torboar.receiveTcpData({ circuitKey, timeoutMs });
      const raw = Buffer.from(res.data, "hex");

      // optional: debug first few bytes
      Log.log(
        `[CovertSubmitter] (${circuitKey}) raw read len=${raw.length} data=${raw
          .slice(0, 16)
          .toString("hex")}`
      );

      const msgObj = this._fusion.CovertResponse.decode(raw);

      if (msgObj.ok) {
        Log.log(`[CovertSubmitter] Received OK from ${circuitKey}`);
        return true;
      }
      if (msgObj.error) {
        Log.error(
          `[CovertSubmitter] Error from ${circuitKey}:`,
          msgObj.error.message
        );
        return false;
      }

      Log.error(
        `[CovertSubmitter] Unexpected CovertResponse structure:`,
        msgObj
      );
      return false;
    } catch (err) {
      Log.error(`[CovertSubmitter] pingReceive failed for ${circuitKey}:`, err);
      return false;
    }
  }

  /**
   * Launches a single circuit, with timeout and ledger tracking.
   */
  async launchSingleCircuit(circuitKey: string, timeoutMs: number) {
    //Log.log(`[CovertSubmitter] launchSingleCircuit(${circuitKey}) start`);

    // Generate deterministic SOCKS username for this circuit
    const socksUser = `CF${Math.random().toString(36).substring(2, 8)}_${circuitKey}`;

    // Create the circuit and pass all parameters explicitly
    const circuit = new CovertCircuit(
      circuitKey,
      this._torboar,
      this._covertDomain,
      this._covertPort,
      this._covertSsl,
      this,
      socksUser
    );

    // Record the attempt
    this._circuitLedger.set(circuitKey, {
      key: circuitKey,
      socksUser: circuit.socksUser,
      startTime: performance.now(),
      status: "pending",
    });

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeoutMs)
    );

    try {
      const result = await Promise.race([circuit.create(), timeout]);

      const rec = this._circuitLedger.get(circuitKey)!;
      rec.status = "built";
      rec.circuitId = result.circuitId;
      rec.verified = result.isVerified;
      rec.endTime = performance.now();
      rec.durationMs = rec.endTime - rec.startTime;

      this._circuits.push(circuit);

      /*
      Log.log(
        `[CovertSubmitter] ${circuitKey} built — id=${result.circuitId}, verified=${result.isVerified}, duration=${(
          rec.durationMs / 1000
        ).toFixed(2)}s`
      );
      
      */

      return result;
    } catch (err: any) {
      const rec = this._circuitLedger.get(circuitKey)!;
      rec.status = "failed";
      rec.endTime = performance.now();
      rec.durationMs = rec.endTime - rec.startTime;
      Log.error(
        `[CovertSubmitter] ${circuitKey} failed (${(
          rec.durationMs / 1000
        ).toFixed(2)}s): ${err.message}`
      );
      throw err;
    }
  }

  async scheduleCircuits() {
    const CIRCUIT_TIMEOUT_MS = 29000;
    const SOFT_CUTOFF = 29000; // return to Fusion at 29s
    const HARD_CUTOFF = 38000; // absolute stop at 40s
    const PHASE_DELAY = 200; // 1s between phases

    // ---- manual schedule (total = 40) ----
    const schedule = [
      { count: 10 }, // phase 1
      { count: 10 }, // phase 2
      { count: 10 }, // phase 3
      { count: 10 }, // phase 4
    ];

    let built = 0;
    let verified = 0;
    let failed = 0;
    let timeouts = 0;
    let late = 0;
    let launched = 0;

    Log.log(
      `[CovertSubmitter] precise scheduler start — total phases=${schedule.length}`
    );

    return new Promise<void>((resolve) => {
      const start = performance.now();
      const launchSingle = this.launchSingleCircuit.bind(this);
      const allPromises: Promise<void>[] = [];

      // ---- recursive phase launcher ----
      const launchPhase = (phaseIndex: number) => {
        const elapsed = (performance.now() - start) / 1000;
        const phase = schedule[phaseIndex];
        if (!phase) return;

        for (let i = 0; i < phase.count; i++) {
          const key = `slot-${phaseIndex + 1}-${i}`;
          launched++;
          const launchStart = performance.now();

          const p = launchSingle(key, CIRCUIT_TIMEOUT_MS)
            .then((result: any) => {
              built++;
              const dur = ((performance.now() - launchStart) / 1000).toFixed(2);
              const wasVerified = result?.isVerified === true;
              if (wasVerified) verified++;
              const now = performance.now() - start;
              if (now > SOFT_CUTOFF) late++;
            })
            .catch((err: any) => {
              const dur = ((performance.now() - launchStart) / 1000).toFixed(2);
              if (err.message?.includes("timeout")) timeouts++;
              else failed++;
            });

          allPromises.push(p);
        }

        // schedule next phase
        if (phaseIndex + 1 < schedule.length) {
          setTimeout(() => launchPhase(phaseIndex + 1), PHASE_DELAY);
        }
      };

      // ---- start first phase ----
      launchPhase(0);

      // ---- SOFT cutoff: report early status ----
      setTimeout(() => {
        Log.log(
          `Soft cutoff ${(SOFT_CUTOFF / 1000).toFixed(1)}s — built=${built}, verified=${verified}, failed=${failed}, timeouts=${timeouts}, launched=${launched}`
        );
      }, SOFT_CUTOFF);

      // ---- HARD cutoff: finalize and resolve ----
      setTimeout(async () => {
        await Promise.allSettled(allPromises);
        const total = built + failed + timeouts;
        Log.warn(
          `Hard cutoff ${(HARD_CUTOFF / 1000).toFixed(1)}s — built=${built}, verified=${verified}, failed=${failed}, timeouts=${timeouts}, late=${late}, launched=${launched}, total=${total}`
        );
        resolve();
      }, HARD_CUTOFF);
    });
  }

  /**
   * EC-style entry point. For now just calls scheduleCircuits().
   * Later you can add covertDomain, torHost, windows, timeouts, etc.
   */
  async scheduleConnections(
    tFusionBegin: number,
    connectWindow: number,
    connectSpares: number,
    connectTimeout: number
  ) {
    Log.log(
      `yyy scheduleConnections stub called: tFusionBegin=${tFusionBegin} window=${connectWindow} spares=${connectSpares} timeout=${connectTimeout}`
    );
    // For now just reuse scheduleCircuits

    await this.scheduleCircuits(connectSpares);
  }

  /**
   * Send one request over a slot, retrying with a spare if needed.
   */
  async submitRequest(slotIndex: number, url: string) {
    try {
      const c = this._circuits[slotIndex];
      return await c.makeRequest(url);
    } catch (err) {
      const spare = this._spareCircuits.shift();
      if (!spare) throw err;
      this._circuits[slotIndex] = spare;
      return spare.makeRequest(url);
    }
  }

  /**
   * Send requests over all slots in parallel immediately.
   */
  async submitAll(urls: string[]) {
    return Promise.all(urls.map((url, idx) => this.submitRequest(idx, url)));
  }

  /**
   * Schedule submissions (or pings) at randomized times starting from tstart.
   */

  async scheduleSubmissions(tstart: number, slotMessages: (string | null)[]) {
    if (slotMessages.length !== this._circuits.length) {
      throw new Error("slotMessages length mismatch with circuits");
    }

    slotMessages.forEach((msg, idx) => {
      const delaySec =
        tstart - Date.now() / 1000 + randTrap() * Protocol.COVERT_SUBMIT_WINDOW;

      setTimeout(async () => {
        try {
          if (msg !== null) {
            await this.submitRequest(idx, msg);
            Log.log(`Slot ${idx} submission done`);
          } else {
            Log.log(`Slot ${idx} skipped (no message to send)`);
          }
        } catch (err) {
          Log.log(`Slot ${idx} submission failed`, err);
        }
      }, delaySec * 1000);
    });
  }

  get connectedCount() {
    return this._circuits.filter(Boolean).length;
  }

  get spareCount() {
    return this._spareCircuits.length;
  }
}
