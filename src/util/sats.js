import { Decimal } from "decimal.js";

export const SATOSHI = 100000000; // sats per 1 BCH
export const MAX_SATOSHI = new Decimal(SATOSHI * 21000000).toString();
export const DUST_LIMIT = 546; // 3 * minRelayFee (currently 1000 sat/kB on most nodes)
export const VALID_DENOMINATIONS = ["BCH", "mBCH", "bits", "sats"];

export function satsToBch(sats) {
  return {
    sats: new Decimal(sats).toNumber(),
    bch: Number.parseFloat(
      new Decimal(sats).div(SATOSHI).toFixed(8, Decimal.ROUND_DOWN)
    ),
    mbch: Number.parseFloat(
      new Decimal(sats).div(SATOSHI).mul(1000).toFixed(5, Decimal.ROUND_DOWN)
    ),
    bits: Number.parseFloat(
      new Decimal(sats).div(SATOSHI).mul(1000000).toFixed(2, Decimal.ROUND_DOWN)
    ),
  };
}

export function bchToSats(bch, denomination = "bch") {
  switch (denomination) {
    case "sats":
      return new Decimal(bch);

    case "mbch":
      return new Decimal(bch)
        .div(1000)
        .mul(SATOSHI)
        .toDecimalPlaces(0, Decimal.ROUND_DOWN);

    case "bits":
      return new Decimal(bch)
        .div(1000000)
        .mul(SATOSHI)
        .toDecimalPlaces(0, Decimal.ROUND_DOWN);

    case "bch":
    default:
      return new Decimal(bch)
        .mul(SATOSHI)
        .toDecimalPlaces(0, Decimal.ROUND_DOWN);
  }
}
