/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

//import * as secp from "@noble/secp256k1";

import Ripemd160 from "ripemd160";
import { Protocol } from "./protocol";
import LogService from "@/services/LogService";

const Log = LogService("FusionService");

/**
 * Generate a random secp256k1 keypair.
 * Returns:
 *  - privkey (32 bytes)
 *  - pubkeyUncompressed (65 bytes, 0x04 + x + y)
 *  - pubkeyCompressed (33 bytes, 0x02/0x03 + x)
 */

export function genKeypair(secp: any): [Uint8Array, Uint8Array, Uint8Array] {
  const privkey = randomPrivateKey();

  const pubkeyCompressed = secp.getPublicKey(privkey, true); // 33 bytes
  const pubkeyUncompressed = secp.getPublicKey(privkey, false); // 65 bytes

  return [privkey, pubkeyUncompressed, pubkeyCompressed];
}
export function randomPrivateKey(): Uint8Array {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return buf;
}

export function randomOutputsForTier(
  rng: { expovariate: (lambd: number) => number },
  inputAmount: number,
  scale: number,
  offset: number,
  maxCount: number,
  allowExtraChange = false
): number[] | null {
  if (inputAmount < offset) {
    return null;
    Log.log("test");
  }

  const lambd = 1.0 / scale;
  let remaining = inputAmount;

  const values: number[] = [];

  for (let i = 0; i < maxCount + 1; i += 1) {
    const val = rng.expovariate(lambd);

    remaining -= Math.ceil(val) + offset;
    if (remaining < 0) {
      break;
    }
    values.push(val);
  }

  if (values.length > maxCount) {
    if (allowExtraChange) {
      const result = values.slice(0, -1).map((v) => Math.round(v) + offset);
      const change = inputAmount - result.reduce((a, b) => a + b, 0);
      result.push(change);
      return result;
    }
    return null;
  }

  if (values.length === 0) {
    return null;
  }

  const desiredRandomSum = inputAmount - values.length * offset;
  if (desiredRandomSum < 0) {
    return null;
  }

  const cumsum: number[] = [];
  values.reduce((acc, v) => {
    const next = acc + v;
    cumsum.push(next);
    return next;
  }, 0);

  const rescale = desiredRandomSum / cumsum[cumsum.length - 1];
  const normedCumsum = cumsum.map((v) => Math.round(rescale * v));

  const differences: number[] = [];
  let prev = 0;
  normedCumsum.forEach((a) => {
    differences.push(a - prev);
    prev = a;
  });

  const result = differences.map((d) => offset + d);

  const sum = result.reduce((a, b) => a + b, 0);
  if (sum !== inputAmount) {
    throw new Error("randomOutputsForTier: sum mismatch");
  }

  return result;
}

export function sizeOfInput(): number {
  return 141;
}

export function sizeOfOutput(): number {
  // assume standard P2PKH
  return 34;
}

export async function hash160(pubkey: Uint8Array): Promise<Uint8Array> {
  const sha = await sha256(pubkey);
  const ripemd = new Ripemd160().update(sha).digest(); // Requires 'ripemd160' lib
  return ripemd;
}

export async function buildP2PKHScript(pubkeyHash: Uint8Array): Uint8Array {
  // OP_DUP OP_HASH160 <20-byte hash> OP_EQUALVERIFY OP_CHECKSIG
  return Uint8Array.from([
    0x76, // OP_DUP
    0xa9, // OP_HASH160
    0x14, // PUSH 20 bytes
    ...pubkeyHash,
    0x88, // OP_EQUALVERIFY
    0xac, // OP_CHECKSIG
  ]);
}

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

export function componentFee(size: number, feerate: number): number {
  return Math.floor((size * feerate + 999) / 1000);
}

export function bytesToBigInt(b: Uint8Array): bigint {
  return BigInt(`0x${Buffer.from(b).toString("hex")}`);
}

export function intToBytesBE(value: bigint, length = 32): Uint8Array {
  if (value < 0n) {
    throw new Error("Cannot encode negative bigint as bytes");
  }
  const hex = value.toString(16).padStart(length * 2, "0");
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

export async function listhash(pieces: Uint8Array[]): Uint8Array {
  const totalParts: Uint8Array[] = [];

  for (const piece of pieces) {
    // 4-byte big-endian length
    const lenBytes = new Uint8Array(4);
    new DataView(lenBytes.buffer).setUint32(0, piece.length, false);
    totalParts.push(lenBytes);
    totalParts.push(piece);
  }

  // Flatten all parts into one Uint8Array
  const totalLength = totalParts.reduce((sum, p) => sum + p.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of totalParts) {
    merged.set(part, offset);
    offset += part.length;
  }

  return sha256(merged);
}

export async function calcInitialHash(
  tier: number,
  covertDomain: Uint8Array,
  covertPort: number,
  covertSsl: boolean,
  beginTime: number
): Promise<Uint8Array> {
  const pieces: Uint8Array[] = [];

  pieces.push(new TextEncoder().encode("Cash Fusion Session"));
  pieces.push(Protocol.VERSION);

  const tierBytes = new Uint8Array(8);
  new DataView(tierBytes.buffer).setBigUint64(0, BigInt(tier), false);
  pieces.push(tierBytes);

  pieces.push(covertDomain);

  const portBytes = new Uint8Array(4);
  new DataView(portBytes.buffer).setUint32(0, covertPort, false);
  pieces.push(portBytes);

  pieces.push(new Uint8Array([covertSsl ? 1 : 0]));

  const timeBytes = new Uint8Array(8);
  new DataView(timeBytes.buffer).setBigUint64(0, BigInt(beginTime), false);
  pieces.push(timeBytes);

  return await listhash(pieces);
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export function randomScalar(order: bigint): bigint {
  // rejection-sample in (0, order)
  while (true) {
    const b = new Uint8Array(32);
    crypto.getRandomValues(b);
    const x = bytesToBigInt(b);
    if (x > 0n && x < order) return x;
  }
}

export async function testCalcInitialHashPythonVector(): Promise<void> {
  const tier = 1800000;
  const covertDomain = hexToBytes("34352e37372e3133362e39");
  const covertPort = 34993;
  const covertSsl = false;
  const beginTime = 1759422559;

  const expectedHashHex =
    "7ef446abc48eef95148551fca85d9a461f235e1d1e4daf0e3a9869a0b0b5d2ee";

  const actualHash = await calcInitialHash(
    tier,
    covertDomain,
    covertPort,
    covertSsl,
    beginTime
  );
  const actualHashHex = Buffer.from(actualHash).toString("hex");

  const isMatch = actualHashHex === expectedHashHex;

  Log.log("[Test] calcInitialHash Python vector");
  Log.log("Expected Hash:", expectedHashHex);
  Log.log("Actual Hash:  ", actualHashHex);
  Log.log("Match:", isMatch);

  if (!isMatch) {
    throw new Error("❌ calcInitialHash does not match Python output.");
  }
}
