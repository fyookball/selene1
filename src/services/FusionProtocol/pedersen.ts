/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-bitwise */
/* eslint-disable no-else-return */
/* eslint-disable prefer-template */
/* eslint-disable no-plusplus */

import { intToBytesBE, randomScalar } from "./util";
import { Protocol } from "./protocol";

const SECP256K1_EC_UNCOMPRESSED = 0x02;
const SECP256K1_EC_COMPRESSED = 0x102;
const ORDER = Protocol.SECP256K1_ORDER;

/*

NOT NEEDED SINCE WE HARDCODE UNCOMPRESSED G.


// Converts a curve point { x, y } to serialized bytes.
// If comp=true  -> compressed (33 bytes)
// If comp=false -> uncompressed (65 bytes)
export function pointToSer(
  P: { x: bigint; y: bigint },
  comp: boolean = true
): Uint8Array {
  const xHex = P.x.toString(16).padStart(64, "0");
  const yHex = P.y.toString(16).padStart(64, "0");

  if (comp) {
    // prefix 0x02 if y is even, 0x03 if odd
    const prefix = (P.y & 1n) === 0n ? "02" : "03";
    return hexToBytes(prefix + xHex);
  } else {
    // uncompressed prefix 0x04 + x + y
    return hexToBytes("04" + xHex + yHex);
  }
}

*/

export class PedersenSetup {
  private torboar: any;
  public _seclib_H!: Uint8Array;

  constructor(torboarInstance: any) {
    this.torboar = torboarInstance;
  }

  async init(): Promise<void> {
    // H = 0x02 + ascii "CashFusion gives us fungibility."
    const H_HEX =
      "0243617368467573696f6e2067697665732075732066756e676962696c6974792e";

    const H = Uint8Array.from(Buffer.from(H_HEX, "hex"));

    const inputH = Array.from(H);
    const outputH = new Array(64).fill(0);
    const inputHLen = inputH.length;

    const { res: resH, pubkey: pubH } =
      await this.torboar.secp256k1EcPubkeyParse({
        input: inputH,
        output: outputH,
        inputLen: inputHLen,
      });

    if (resH !== 1) throw new Error("H could not be parsed by secp256k1");

    this._seclib_H = Uint8Array.from(pubH);

    // Parse G (generator point for secp256k1 curve)
    // uncompressed generator: 0x04 + X + Y (65 bytes)

    const G_HEX = Protocol.SECP256K1_G_HEX;
    const G = Uint8Array.from(Buffer.from(G_HEX, "hex"));

    const inputG = Array.from(G);
    const outputG = new Array(64).fill(0);
    const inputGLen = inputG.length;

    const { res: resG, pubkey: pubG } =
      await this.torboar.secp256k1EcPubkeyParse({
        input: inputG,
        output: outputG,
        inputLen: inputGLen,
      });

    if (resG !== 1) throw new Error("pubkey parse failed for G");
    const seclib_G = Uint8Array.from(pubG);

    this._seclib_G = seclib_G;

    // Combine H + G into HG
    const outputHG = new Array(64).fill(0);

    const { res: resHG, pubkey: pubHG } =
      await this.torboar.secp256k1EcPubkeyCombine({
        output: outputHG,
        input1: Array.from(this._seclib_H),
        input2: Array.from(this._seclib_G),
      });

    if (resHG !== 1) {
      throw new Error("Insecure H point: H = -G");
    }

    this._seclib_HG = Uint8Array.from(pubHG);

    const { res: resHSer, pubkey: serH } =
      await this.torboar.secp256k1EcPubkeySerialize({
        input: Array.from(this._seclib_H),
        flags: SECP256K1_EC_UNCOMPRESSED,
      });
    if (resHSer !== 1) throw new Error("Serialize H failed");
    this.H = Uint8Array.from(serH);

    const { res: resHGSer, pubkey: serHG } =
      await this.torboar.secp256k1EcPubkeySerialize({
        input: Array.from(this._seclib_HG),
        flags: SECP256K1_EC_UNCOMPRESSED,
      });
    if (resHGSer !== 1) throw new Error("Serialize HG failed");
    this.HG = Uint8Array.from(serHG);
  } // end of init.
} // end of class.

export class Commitment {
  private setup: PedersenSetup;
  public amount: bigint;
  public amountMod: bigint;
  public nonce: bigint;
  public P_uncompressed!: Uint8Array;
  public P_compressed!: Uint8Array;

  constructor(
    setup: PedersenSetup,
    amount: bigint,
    nonce?: bigint,
    _P_uncompressed?: Uint8Array
  ) {
    if (!setup) throw new Error("Commitment requires PedersenSetup instance");
    this.setup = setup;

    //  Normalize amount
    this.amount = BigInt(amount);

    this.amountMod = ((this.amount % ORDER) + ORDER) % ORDER;

    //  Nonce handling
    if (nonce === undefined || nonce === null) {
      this.nonce = randomScalar(ORDER);
    } else {
      this.nonce = BigInt(nonce);
      if (this.nonce <= 0n || this.nonce >= ORDER) {
        throw new Error("NonceRangeError: nonce out of range");
      }
    }

    //  If _P_uncompressed provided, reconstruct compressed version
    if (_P_uncompressed) {
      if (_P_uncompressed.length !== 65 || _P_uncompressed[0] !== 4) {
        throw new Error("Invalid _P_uncompressed format");
      }
      this.P_uncompressed = _P_uncompressed;

      const yIsOdd = (_P_uncompressed[_P_uncompressed.length - 1] & 1) === 1;
      const prefix = yIsOdd ? 0x03 : 0x02;
      this.P_compressed = new Uint8Array([
        prefix,
        ..._P_uncompressed.slice(1, 33),
      ]);
    }
  }

  async calcInitialFast(): Promise<void> {
    //  Prepare scalars
    const k = this.nonce;
    const a = this.amountMod;

    //  Convert k → 32-byte
    const kBytes = intToBytesBE(k, 32);

    //  Copy HG buffer (G + H)
    const kHG_buf = Array.from(this.setup._seclib_HG); // 64 bytes

    //  Call native tweak-mul
    const { res: resK, pubkey: pubKHG } =
      await this.setup.torboar.secp256k1EcPubkeyTweakMul({
        inputPubkey: kHG_buf,
        scalar: Array.from(kBytes),
      });

    if (resK !== 1) {
      throw new Error("secp256k1_ec_pubkey_tweak_mul failed: k*(G+H)");
    }

    // Store result for next step
    const kHG_buf_out = Uint8Array.from(pubKHG);

    // Compute (a − k) × H and combine
    let a_k = (a - k) % ORDER;
    if (a_k < 0n) a_k += ORDER;

    let resultBuf: Uint8Array;

    if (a_k !== 0n) {
      // Calculate (a - k) * H
      const aKBytes = intToBytesBE(a_k, 32);
      const akH_buf = Array.from(this.setup._seclib_H); // copy 64 bytes

      const { res: resAk, pubkey: pubAkH } =
        await this.setup.torboar.secp256k1EcPubkeyTweakMul({
          inputPubkey: akH_buf,
          scalar: Array.from(aKBytes),
        });

      if (resAk !== 1) {
        throw new Error("secp256k1_ec_pubkey_tweak_mul failed: (a - k) * H");
      }

      const akH_buf_out = Uint8Array.from(pubAkH);

      // Combine (k * (G + H)) + ((a - k) * H)
      const { res: resCombine, pubkey: pubResult } =
        await this.setup.torboar.secp256k1EcPubkeyCombine({
          output: new Array(64).fill(0),
          input1: Array.from(kHG_buf_out),
          input2: Array.from(akH_buf_out),
        });

      if (resCombine !== 1) {
        throw new Error("ResultAtInfinity");
      }

      resultBuf = Uint8Array.from(pubResult);
    } else {
      // the case of: a == k (rare shortcut)
      resultBuf = kHG_buf_out;
    }

    // Serialize the resulting commitment point
    const { res: resUncompressed, pubkey: pubUncompressed } =
      await this.setup.torboar.secp256k1EcPubkeySerialize({
        input: Array.from(resultBuf),
        flags: SECP256K1_EC_UNCOMPRESSED,
      });

    if (resUncompressed !== 1) {
      throw new Error("secp256k1_ec_pubkey_serialize failed (uncompressed)");
    }
    if (pubUncompressed.length !== 65) {
      throw new Error(
        `Unexpected uncompressed pubkey length: ${pubUncompressed.length}`
      );
    }

    this.P_uncompressed = Uint8Array.from(pubUncompressed);

    // Serialize compressed form
    const { res: resCompressed, pubkey: pubCompressed } =
      await this.setup.torboar.secp256k1EcPubkeySerialize({
        input: Array.from(resultBuf),
        flags: SECP256K1_EC_COMPRESSED,
      });

    if (resCompressed !== 1) {
      throw new Error("secp256k1_ec_pubkey_serialize failed (compressed)");
    }
    if (pubCompressed.length !== 33) {
      throw new Error(
        `Unexpected compressed pubkey length: ${pubCompressed.length}`
      );
    }

    this.P_compressed = Uint8Array.from(pubCompressed);
  }

  static async create(
    setup: PedersenSetup,
    amount: bigint,
    nonce?: bigint,
    _P_uncompressed?: Uint8Array
  ): Promise<Commitment> {
    const c = new Commitment(setup, amount, nonce, _P_uncompressed);
    await c.calcInitialFast();
    return c;
  }
}
