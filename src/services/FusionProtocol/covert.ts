/* eslint-disable max-classes-per-file */

import { Plugins } from "@capacitor/core";
import { Protocol } from "./protocol";

const { Torboar } = Plugins;

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
    while (this._expiries.length && this.expiries[0] < now) {
      this._expiries.shift();
    }
  }

  get count(): number {
    this._cleanup();
    return this.expiries.length;
  }

  bump() {
    const now = Date.now() / 1000 + this.lifetime;
    this.expiries.push(now);
  }
}

/**
 * One isolated Tor circuit slot.
 */
class CovertCircuit {
  circuitKey: string;

  circuitId: string | null = null;

  constructor(circuitKey: string) {
    this.circuitKey = circuitKey;
  }

  async create() {
    const res = await Torboar.createNewCircuit();
    this.circuitId = res.circuitId;
  }

  async makeRequest(url: string): Promise<string> {
    if (!this.circuitId) throw new Error("Circuit not created yet");
    const res = await Torboar.makeRequestThroughCircuit({
      circuitKey: this.circuitKey,
      url,
    });
    return res.response as string;
  }

  async ping(): Promise<void> {
    // Optionally implement a ping using makeRequestThroughCircuit
    await Torboar.makeRequestThroughCircuit({
      circuitKey: this.circuitKey,
      url: Protocol.PING_URL || "http://check.torproject.org/", // placeholder
    });
  }
}

/**
 * Manages a pool of covert circuits and spares.
 */
export class CovertSubmitter {
  private _circuits: CovertCircuit[] = [];

  private _spareCircuits: CovertCircuit[] = [];

  private _limiter: TorLimiter;

  constructor(private _numComponents: number) {
    this._limiter = new TorLimiter(Protocol.TOR_COOLDOWN_TIME || 5); // seconds
  }

  /**
   * Create all circuits before round start.
   * Call this after Torboar.startTor() has been run once at app start.
   */

  async scheduleCircuits(connectSpares: number) {
    // build an array of promises for primary circuits
    const primaryPromises = Array.from({ length: this._numComponents }).map(
      async (_, i) => {
        const c = new CovertCircuit(`slot-${i}`);
        await c.create();
        this._circuits[i] = c;
      }
    );

    // build an array of promises for spare circuits
    const sparePromises = Array.from({ length: connectSpares }).map(
      async (_, s) => {
        const c = new CovertCircuit(`spare-${s}`);
        await c.create();
        this._spareCircuits.push(c);
      }
    );

    // run them all in parallel and wait for completion
    await Promise.all([...primaryPromises, ...sparePromises]);
  }

  /**
   * Send one request over a slot, retrying with a spare if needed.
   */
  async submitRequest(slotIndex: number, url: string) {
    try {
      const c = this._circuits[slotIndex];
      return await c.makeRequest(url);
    } catch (err) {
      // fallback to spare
      const spare = this._sparecircuits.shift();
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
   * slotMessages: array of URLs to request (or null to ping).
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
          if (msg === null) {
            // schedule a ping instead of sending a message
            await this._circuits[idx].ping();
          } else {
            await this.submitRequest(idx, msg);
          }
          Log.log(`Slot ${idx} submission done`);
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
    return this._sparecircuits.length;
  }
}
