import { Protocol } from "./protocol";
import LogService from "@/services/LogService";

const Log = LogService("FusionService");
export function randomOutputsForTier(
  rng: { expovariate: (lambd: number) => number },
  inputAmount: number,
  scale: number,
  offset: number,
  maxCount: number,
  allowExtraChange = false
): number[] | null {
  Log.log("yyy start of randomoutputsfortier");
  if (inputAmount < offset) {
    return null;
  }

  const lambd = 1.0 / scale;
  let remaining = inputAmount;
  Log.log("yyy remaining is ", remaining);

  const values: number[] = [];

  for (let i = 0; i < maxCount + 1; i += 1) {
    const val = rng.expovariate(lambd);
    Log.log("yyy val is ", val);
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

export function componentFee(size: number, feerate: number): number {
  return Math.floor((size * feerate + 999) / 1000);
}

export function calcInitialHash(
  tier: number,
  covertDomain: Uint8Array,
  covertPort: number,
  covertSsl: boolean,
  beginTime: number
): Uint8Array {
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

  const totalLength = pieces.reduce((acc, p) => acc + p.length, 0);
  const allBytes = new Uint8Array(totalLength);
  let offset = 0;
  pieces.forEach((p) => {
    allBytes.set(p, offset);
    offset += p.length;
  });

  return allBytes;
}
