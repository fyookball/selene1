/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-bitwise */
/* eslint-disable operator-assignment */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */ //jacobi
/* eslint-disable prefer-template */

import { sha256, intToBytesBE, bytesToBigInt, randomScalar } from "./util";
import { Protocol } from "./protocol";
import LogService from "@/services/LogService";

const Log = LogService("FusionService");

const SECP256K1_EC_UNCOMPRESSED = 0x02;
const SECP256K1_EC_COMPRESSED = 0x102;

export class BlindSignatureRequest {
  readonly pubkey: Uint8Array;

  readonly R: Uint8Array;

  readonly messageHash: Uint8Array;

  readonly torboar: any;

  a: bigint;

  b: bigint;

  Rxnew!: Uint8Array;

  pubkeyCompressed!: Uint8Array;

  c!: bigint;

  e!: bigint;

  enew!: bigint;

  constructor(opts: {
    torboar: any;
    pubkey: Uint8Array;
    R: Uint8Array;
    messageHash: Uint8Array;
  }) {
    const { torboar, pubkey, R, messageHash } = opts;

    if (messageHash.length !== 32)
      throw new Error("message_hash must be 32 bytes");

    this.torboar = torboar;
    this.pubkey = pubkey;
    this.R = R;
    this.messageHash = messageHash;

    //Log.log("SCHNOR1b");
    //Log.log("R (hex): " + Buffer.from(R).toString("hex"));
    //Log.log("pubkey (hex): " + Buffer.from(pubkey).toString("hex"));

    this.a = randomScalar(this.order);
    this.b = randomScalar(this.order);
  }

  private get order(): bigint {
    return Protocol.SECP256K1_ORDER;
  }

  private get fieldsize(): bigint {
    return Protocol.SECP256K1_FIELD_SIZE;
  }

  async init(): Promise<void> {
    await this.calcInitialFast();

    const ehashBytes = await sha256(
      new Uint8Array([
        ...this.Rxnew,
        ...this.pubkeyCompressed,
        ...this.messageHash,
      ])
    );

    const ehashInt = bytesToBigInt(ehashBytes) % this.order;

    this.e = (this.c * ehashInt + this.b) % this.order;
    this.enew = ehashInt;

    // Normalize both e and enew to positive range [0, n)
    this.e = ((this.e % this.order) + this.order) % this.order;
    this.enew = ((this.enew % this.order) + this.order) % this.order;
  }

  async calcInitialFast(): Promise<void> {
    const abytes = Array.from(intToBytesBE(this.a, 32));
    const bbytes = Array.from(intToBytesBE(this.b, 32));

    // --- Parse R ---
    const inputR = Array.from(this.R);
    const outR = new Array(64).fill(0);

    const { res: resR, pubkey: parsedR } =
      await this.torboar.secp256k1EcPubkeyParse({
        input: inputR,
        inputLen: inputR.length,
        output: outR,
      });

    if (resR !== 1) throw new Error("R could not be parsed");

    // Copy parsed R to buffer
    const R_buf = Uint8Array.from(parsedR || outR);

    // --- Parse pubkey ---
    const inputPubkey = Array.from(this.pubkey);
    const outP = new Array(64).fill(0);

    const { res: resP, pubkey: parsedP } =
      await this.torboar.secp256k1EcPubkeyParse({
        input: inputPubkey,
        inputLen: inputPubkey.length,
        output: outP,
      });

    if (resP !== 1) throw new Error("pubkey could not be parsed");

    const pubkey_buf = Uint8Array.from(parsedP || outP);

    // --- Serialize pubkey (compressed) ---
    const pubkeyCompressed = new Uint8Array(33);
    const { res: resSer, pubkey: serializedPubkey } =
      await this.torboar.secp256k1EcPubkeySerialize({
        input: Array.from(pubkey_buf),
        flags: SECP256K1_EC_COMPRESSED,
        output: Array.from(pubkeyCompressed),
      });

    if (resSer !== 1 || !serializedPubkey)
      throw new Error("failed to serialize compressed pubkey");
    this.pubkeyCompressed = Uint8Array.from(serializedPubkey);

    // --- Create aG ---
    const A_buf = new Uint8Array(64);
    const { res: resAG, pubkey: aG } =
      await this.torboar.secp256k1EcPubkeyCreate({
        scalar: abytes,
        output: Array.from(A_buf),
      });
    if (resAG !== 1 || !aG)
      throw new Error("secp256k1_ec_pubkey_create failed");
    for (let i = 0; i < 64; i++) A_buf[i] = aG[i];

    // --- Multiply pubkey by b (bP) ---
    const pubkeyScaled = new Uint8Array(64);
    const { res: resMul, pubkey: scaledP } =
      await this.torboar.secp256k1EcPubkeyTweakMul({
        inputPubkey: Array.from(pubkey_buf),
        scalar: bbytes,
        output: Array.from(pubkeyScaled),
      });
    //Log.log("  resMul:", resMul);
    if (resMul !== 1 || !scaledP) throw new Error("pubkey tweak_mul failed");
    for (let i = 0; i < 64; i++) pubkeyScaled[i] = scaledP[i];

    // --- Combine R + aG ---
    const RplusA = new Uint8Array(64);
    //Log.log("  Combine R + aG");
    const { res: res1, pubkey: combinedRA } =
      await this.torboar.secp256k1EcPubkeyCombine({
        input1: Array.from(R_buf),
        input2: Array.from(A_buf),
        output: Array.from(RplusA),
      });
    //Log.log("  res1 (R + aG):", res1);
    if (res1 !== 1 || !combinedRA) throw new Error("combine failed: R + aG");
    for (let i = 0; i < 64; i++) RplusA[i] = combinedRA[i];

    // --- Combine (R + aG) + bP ---
    const Rnew_buf = new Uint8Array(64);
    //Log.log("  Combine (R + aG) + bP");
    const { res: res2, pubkey: combinedRnew } =
      await this.torboar.secp256k1EcPubkeyCombine({
        input1: Array.from(RplusA),
        input2: Array.from(pubkeyScaled),
        output: Array.from(Rnew_buf),
      });
    //Log.log("  res2 (Rnew):", res2);
    if (res2 !== 1 || !combinedRnew)
      throw new Error("combine failed: (R + aG) + bP");
    for (let i = 0; i < 64; i++) Rnew_buf[i] = combinedRnew[i];

    // --- Serialize Rnew (uncompressed) ---
    const { res: resSerUn, pubkey: serializedRnew } =
      await this.torboar.secp256k1EcPubkeySerialize({
        input: Array.from(Rnew_buf),
        flags: SECP256K1_EC_UNCOMPRESSED,
        output: Array.from(new Array(65).fill(0)),
      });

    if (resSerUn !== 1 || !serializedRnew)
      throw new Error("failed to serialize Rnew (uncompressed)");

    // 🔧 Explicitly convert serializedRnew to Uint8Array
    const Rnew_ser = Uint8Array.from(serializedRnew);

    // --- Extract coordinates + Jacobi ---
    const RxBytes = Rnew_ser.slice(1, 33);
    const yBytes = Rnew_ser.slice(33, 65);
    this.Rxnew = Uint8Array.from(RxBytes);

    //Log.log("  Rxnew (hex):", Buffer.from(this.Rxnew).toString("hex"));
    //Log.log("  yBytes (hex):", Buffer.from(yBytes).toString("hex"));

    const yInt = bytesToBigInt(yBytes);
    //Log.log("  yInt:", yInt.toString());

    this.c = this.jacobi(yInt, this.fieldsize);
    //Log.log("  Jacobi result:", this.c.toString());

    if (this.c !== 1n && this.c !== -1n) {
      Log.log("Bad jacobi");
      throw new Error("invalid Jacobi result");
    }
  }

  private jacobi(a: bigint, n: bigint): bigint {
    if (n < 3n || (n & 1n) === 0n) throw new Error("Invalid Jacobi modulus");

    a = a % n;
    let s = 1n;

    while (a > 1n) {
      let a1 = a;
      let e = 0n;

      while ((a1 & 1n) === 0n) {
        a1 >>= 1n;
        e += 1n;
      }

      if (e % 2n !== 0n && n % 8n !== 1n && n % 8n !== 7n) s = -s;
      if (a1 === 1n) return s;
      if ((a1 & 3n) === 3n && (n & 3n) === 3n) s = -s;

      const tmp = a1;
      a = n % a1;
      n = tmp;
    }

    if (a === 0n) return 0n;
    return s;
  }

  getRequest(): { e: bigint; enew: bigint } {
    if (this.e === undefined || this.enew === undefined) {
      throw new Error("BlindSignatureRequest not initialized");
    }
    return { e: this.e, enew: this.enew };
  }

  async finalize(sbytes: Uint8Array, check = true): Promise<Uint8Array> {
    if (sbytes.length !== 32) throw new Error("sbytes must be 32 bytes");

    const s = bytesToBigInt(sbytes);
    const snew = (this.c * (s + this.a)) % this.order;
    const sig = new Uint8Array([...this.Rxnew, ...intToBytesBE(snew, 32)]);

    if (check) {
      const ok = await verifyBlindSignature({
        torboar: this.torboar,
        pubkey: this.pubkey,
        signature: sig,
        messageHash: this.messageHash,
        fieldsize: this.fieldsize,
      });
      if (!ok) throw new Error("Blind signature verification failed.");
    }

    return sig;
  }
}

export async function verifyBlindSignature(opts: {
  torboar: any;
  pubkey: Uint8Array;
  signature: Uint8Array;
  messageHash: Uint8Array;
  fieldsize: bigint;
}): Promise<boolean> {
  const { torboar, pubkey, signature, messageHash, fieldsize } = opts;

  if (pubkey.length !== 33 && pubkey.length !== 65)
    throw new Error("pubkey must be 33 or 65 bytes");
  if (signature.length !== 64) throw new Error("signature must be 64 bytes");
  if (messageHash.length !== 32)
    throw new Error("message_hash must be 32 bytes");

  const rBytes = signature.slice(0, 32);
  const sBytes = signature.slice(32);
  const s = bytesToBigInt(sBytes);

  const pubkey_buf = new Uint8Array(64);
  const inputPubkey = Array.from(pubkey);
  const { res: resP } = await torboar.secp256k1EcPubkeyParse({
    input: inputPubkey,
    inputLen: inputPubkey.length,
    output: Array.from(pubkey_buf),
  });
  if (resP !== 1) throw new Error("pubkey could not be parsed");

  const pubCompressed = new Uint8Array(33);
  const { res: resSer } = await torboar.secp256k1EcPubkeySerialize({
    input: Array.from(pubkey_buf),
    flags: SECP256K1_EC_COMPRESSED,
    output: Array.from(pubCompressed),
  });
  if (resSer !== 1 || pubCompressed.length !== 33)
    throw new Error("failed to serialize compressed pubkey");

  const eHash = sha256(
    new Uint8Array([...rBytes, ...pubCompressed, ...messageHash])
  );
  const e = bytesToBigInt(eHash);

  const sG = new Uint8Array(64);
  const { res: resSG } = await torboar.secp256k1EcPubkeyCreate({
    scalar: Array.from(intToBytesBE(s, 32)),
    output: Array.from(sG),
  });
  if (resSG !== 1) return false;

  const eP = new Uint8Array(64);
  const { res: resEP } = await torboar.secp256k1EcPubkeyTweakMul({
    inputPubkey: Array.from(pubkey_buf),
    scalar: Array.from(intToBytesBE(e % (1n << 256n), 32)),
    output: Array.from(eP),
  });
  if (resEP !== 1) return false;

  const negEP = new Uint8Array(64);
  const { res: resNeg } = await torboar.secp256k1EcPubkeyNegate({
    input: Array.from(eP),
    output: Array.from(negEP),
  });
  if (resNeg !== 1) return false;

  const Rprime = new Uint8Array(64);
  const { res: resCombine } = await torboar.secp256k1EcPubkeyCombine({
    input1: Array.from(sG),
    input2: Array.from(negEP),
    output: Array.from(Rprime),
  });
  if (resCombine !== 1) return false;

  const Rser = new Uint8Array(65);
  const { res: resSerR } = await torboar.secp256k1EcPubkeySerialize({
    input: Array.from(Rprime),
    flags: SECP256K1_EC_UNCOMPRESSED,
    output: Array.from(Rser),
  });
  if (resSerR !== 1 || Rser.length !== 65) return false;

  const Rx = Uint8Array.from(Rser.slice(1, 33));
  const Ry = Uint8Array.from(Rser.slice(33, 65));
  const RyInt = bytesToBigInt(Ry);

  const j = jacobi(RyInt, fieldsize);
  if (j !== 1n) return false;

  for (let i = 0; i < 32; i++) {
    if (Rx[i] !== rBytes[i]) return false;
  }

  return true;
}

function jacobi(a: bigint, n: bigint): bigint {
  if (n < 3n || (n & 1n) === 0n) throw new Error("Invalid Jacobi modulus");

  a = a % n;
  let s = 1n;

  while (a > 1n) {
    let a1 = a;
    let e = 0n;

    while ((a1 & 1n) === 0n) {
      a1 >>= 1n;
      e += 1n;
    }

    if (e % 2n !== 0n && n % 8n !== 1n && n % 8n !== 7n) s = -s;
    if (a1 === 1n) return s;
    if ((a1 & 3n) === 3n && (n & 3n) === 3n) s = -s;

    const tmp = a1;
    a = n % a1;
    n = tmp;
  }

  if (a === 0n) return 0n;
  return s;
}
