/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/naming-convention */

import { Plugins } from "@capacitor/core";
import { Protocol } from "./protocol";
import LogService from "@/services/LogService";

const { Torboar } = Plugins;
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
 * Simplified rate limiter: remembers when connections were opened and how many
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

/**
 * One isolated Tor circuit slot.
 */
class CovertCircuit {
  circuitKey: string;

  circuitId: string | null = null;

  private _torboar: typeof Torboar;

  private _covertDomain: string;

  private _covertPort: number;

  constructor(
    circuitKey: string,
    torboar: typeof Torboar,
    covertDomain: string,
    covertPort: number
  ) {
    this.circuitKey = circuitKey;
    this._torboar = torboar;
    this._covertDomain = covertDomain;
    this._covertPort = covertPort;
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

  async create() {
    Log.log(`[CovertCircuit] create() called for ${this.circuitKey}`);
    let circuitId: string | null = null;
    try {
      // Before Tor logic
      Log.log(
        `[CovertCircuit] (${this.circuitKey}) — starting Tor circuit creation`
      );

      try {
        // actual Tor control logic...
        circuitId = await covertCircuit._timeout(
          this._torboar.createNewCircuit(),
          9000
        );
      } catch (err) {
        Log.log("failed to torboar createnewcircuit with err ", err);
      }

      Log.log(
        `[CovertCircuit] (${this.circuitKey}) — created circuit with ID: ${circuitId}`
      );

      this.circuitId = circuitId;
      Log.log("covertcircuit about to do ping check");
      // Optional ping check
      const ok = await this.verifyConnection();

      Log.log(`[CovertCircuit] (${this.circuitKey}) — ping result: ${ok}`);
    } catch (err) {
      Log.log(`[CovertCircuit] create() failed for ${this.circuitKey}`, err);
      throw err;
    }
  }

  async makeRequest(url: string): Promise<string> {
    if (!this.circuitId) throw new Error("Circuit not created yet");
    const res = await this._torboar.makeRequestThroughCircuit({
      circuitKey: this.circuitKey,
      url,
    });
    return res.response as string;
  }

  async verifyConnection(): Promise<boolean> {
    Log.log("covertcircuit top of verifyconnection function");

    try {
      // Step 1: Open raw connection through circuit
      await this._torboar.openConnectionThroughCircuit({
        host: this._covertDomain,
        port: this._covertPort,
        ssl: false,
        circuitKey: this.circuitKey,
      });

      // Step 2: Send HTTP GET /ping
      const pingRequest = `GET /ping HTTP/1.1\r\nHost: ${this._covertDomain}\r\nConnection: close\r\n\r\n`;
      const pingHex = Buffer.from(pingRequest, "utf-8").toString("hex");
      await this._torboar.sendTcpData({ data: pingHex });

      // Step 3: Read response
      const res = await this._torboar.receiveTcpData();
      if (res.eof) {
        console.log("Connection closed by server.");
      } else {
        console.log("Got data:", res.data);
      }

      const responseData = Buffer.from(res.data, "hex").toString("utf-8");

      Log.log(
        `[CovertCircuit] (${this.circuitKey}) — ping response: ${responseData}`
      );

      // Step 4: Close socket
      await this._torboar.closeConnection();

      // Step 5: Check if server replied with 200 OK
      return responseData.includes("200 OK");
    } catch (e) {
      Log.error(`[CovertCircuit] (${this.circuitKey}) — ping failed`, e);
      try {
        await this._torboar.closeConnection(); // attempt cleanup
      } catch (_) {
        // ignore secondary errors
      }
      return false;
    }
  }
} //end class

/**
 * Manages a pool of covert circuits and spares.
 */
export class CovertSubmitter {
  private _circuits: CovertCircuit[] = [];

  private _spareCircuits: CovertCircuit[] = [];

  private _limiter: TorLimiter;

  constructor(
    private _covertDomain: string,
    private _covertPort: number,
    private _covertSsl: boolean,
    private _numComponents: number,
    private _submitWindow: number,
    private _submitTimeout: number,
    private _torboar: typeof Torboar
  ) {
    Log.log("fubar covertsubmitter constructor");
    this._limiter = new TorLimiter(Protocol.TOR_COOLDOWN_TIME || 5); // seconds

    Log.log("fubar2 covertsubmitter constructor");
  }

  async scheduleCircuits(connectSpares: number) {
    Log.log(
      `yyy scheduleCircuits start: numComponents=${this._numComponents}, spares=${connectSpares}`
    );

    const primaryPromises = Array.from({ length: this._numComponents }).map(
      async (_, i) => {
        try {
          Log.log(`[CovertSubmitter] Creating primary circuit slot-${i}`);
          const c = new CovertCircuit(
            `slot-${i}`,
            this._torboar,
            this._covertDomain,
            this._covertPort
          );

          await c.create();
          this._circuits[i] = c;
          Log.log(`[CovertSubmitter] ✅ Created circuit slot-${i}`);
          return { status: "fulfilled" };
        } catch (err) {
          Log.error(
            `[CovertSubmitter] ❌ Failed to create circuit slot-${i}`,
            err
          );
          return { status: "rejected", reason: err };
        }
      }
    );

    const sparePromises = Array.from({ length: connectSpares }).map(
      async (_, s) => {
        try {
          Log.log(`[CovertSubmitter] Creating spare circuit spare-${s}`);
          const c = new CovertCircuit(
            `slot-${s}`,
            this._torboar,
            this._covertDomain,
            this._covertPort
          );

          await c.create();
          this._spareCircuits.push(c);
          Log.log(`[CovertSubmitter] ✅ Created spare circuit spare-${s}`);
          return { status: "fulfilled" };
        } catch (err) {
          Log.error(
            `[CovertSubmitter] ❌ Failed to create spare circuit spare-${s}`,
            err
          );
          return { status: "rejected", reason: err };
        }
      }
    );

    const results = await Promise.allSettled([
      ...primaryPromises,
      ...sparePromises,
    ]);
    Log.log("results is ", results);

    Log.log(
      `[CovertSubmitter] scheduleCircuits done: ${this._circuits.length} primary, ${this._spareCircuits.length} spare`
    );
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

  // ping removed for now !!!
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
