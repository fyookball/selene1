/**
 * Verify that a private key is valid for the Secp256k1 curve. Returns `true`
 * for success, or `false` on failure.
 *
 * Private keys are 256-bit numbers encoded as a 32-byte, big-endian Uint8Array.
 * Nearly every 256-bit number is a valid secp256k1 private key. Specifically,
 * any 256-bit number greater than `0x01` and less than
 * `0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140`
 * is a valid private key. This range is part of the definition of the
 * secp256k1 elliptic curve parameters.
 *
 * This method does not require a `Secp256k1` implementation.
 */
export declare const validateSecp256k1PrivateKey: (privateKey: Uint8Array) => boolean;
/**
 * Securely generate a valid Secp256k1 private key given a secure source of
 * randomness.
 *
 * **Node.js Usage**
 * ```ts
 * import { randomBytes } from 'crypto';
 * import { generatePrivateKey } from '@bitauth/libauth';
 *
 * const key = generatePrivateKey(() => randomBytes(32));
 * ```
 *
 * **Browser Usage**
 * ```ts
 * import { generatePrivateKey } from '@bitauth/libauth';
 *
 * const key = generatePrivateKey(() =>
 *   window.crypto.getRandomValues(new Uint8Array(32))
 * );
 * ```
 *
 * @param secureRandom - a method that returns a securely-random 32-byte
 * Uint8Array
 */
export declare const generatePrivateKey: (secureRandom: () => Uint8Array) => Uint8Array;
//# sourceMappingURL=key-utils.d.ts.map