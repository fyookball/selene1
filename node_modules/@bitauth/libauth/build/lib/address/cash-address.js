import { formatError } from '../format/format.js';
import { decodeBech32, encodeBech32, isBech32CharacterSet, regroupBits, } from './bech32.js';
export var CashAddressNetworkPrefix;
(function (CashAddressNetworkPrefix) {
    CashAddressNetworkPrefix["mainnet"] = "bitcoincash";
    CashAddressNetworkPrefix["testnet"] = "bchtest";
    CashAddressNetworkPrefix["regtest"] = "bchreg";
})(CashAddressNetworkPrefix || (CashAddressNetworkPrefix = {}));
/**
 * The CashAddress specification standardizes the format of the version byte:
 * - Most significant bit: reserved, must be `0`
 * - next 4 bits: Address Type
 * - 3 least significant bits: Payload Size
 *
 * Two Address Type values are currently standardized:
 * - 0 (`0b0000`): P2PKH
 * - 1 (`0b0001`): P2SH
 *
 * And two are proposed by `CHIP-2022-02-CashTokens`:
 * - 2 (`0b0010`): P2PKH + Token Support
 * - 3 (`0b0011`): P2SH + Token Support
 *
 * The CashAddress specification standardizes expected payload size using
 * {@link CashAddressSizeBits}. Currently, two size bit values are in use by
 * standard CashAddress types:
 * - `0` (`0b000`): 20 bytes (in use by `p2pkh` and `p2sh20`)
 * - `3` (`0b011`): 32 bytes (in use by `p2sh32`)
 */
export var CashAddressVersionByte;
(function (CashAddressVersionByte) {
    /**
     * Pay to Public Key Hash (P2PKH): `0b00000000`
     *
     * - Most significant bit: `0` (reserved)
     * - Address Type bits: `0000` (P2PKH)
     * - Size bits: `000` (20 bytes)
     */
    CashAddressVersionByte[CashAddressVersionByte["p2pkh"] = 0] = "p2pkh";
    /**
     * 20-byte Pay to Script Hash (P2SH20): `0b00001000`
     *
     * - Most significant bit: `0` (reserved)
     * - Address Type bits: `0001` (P2SH)
     * - Size bits: `000` (20 bytes)
     */
    CashAddressVersionByte[CashAddressVersionByte["p2sh20"] = 8] = "p2sh20";
    /**
     * 32-byte Pay to Script Hash (P2SH20): `0b00001000`
     *
     * - Most significant bit: `0` (reserved)
     * - Address Type bits: `0001` (P2SH)
     * - Size bits: `011` (32 bytes)
     */
    CashAddressVersionByte[CashAddressVersionByte["p2sh32"] = 11] = "p2sh32";
    /**
     * Pay to Public Key Hash (P2PKH) with token support: `0b00010000`
     *
     * - Most significant bit: `0` (reserved)
     * - Address Type bits: `0010` (P2PKH + Tokens)
     * - Size bits: `000` (20 bytes)
     */
    CashAddressVersionByte[CashAddressVersionByte["p2pkhWithTokens"] = 16] = "p2pkhWithTokens";
    /**
     * 20-byte Pay to Script Hash (P2SH20) with token support: `0b00011000`
     * - Most significant bit: `0` (reserved)
     * - Address Type bits: `0011` (P2SH + Tokens)
     * - Size bits: `000` (20 bytes)
     */
    CashAddressVersionByte[CashAddressVersionByte["p2sh20WithTokens"] = 24] = "p2sh20WithTokens";
    /**
     * 32-byte Pay to Script Hash (P2SH32) with token support: `0b00011011`
     * - Most significant bit: `0` (reserved)
     * - Address Type bits: `0011` (P2SH + Tokens)
     * - Size bits: `011` (32 bytes)
     */
    CashAddressVersionByte[CashAddressVersionByte["p2sh32WithTokens"] = 27] = "p2sh32WithTokens";
})(CashAddressVersionByte || (CashAddressVersionByte = {}));
/**
 * The address types currently defined in the CashAddress specification. See
 * also: {@link CashAddressVersionByte}.
 */
export var CashAddressType;
(function (CashAddressType) {
    /**
     * Pay to Public Key Hash (P2PKH): `0b0000`
     */
    CashAddressType["p2pkh"] = "p2pkh";
    /**
     * Pay to Script Hash (P2SH): `0b0001`
     */
    CashAddressType["p2sh"] = "p2sh";
    /**
     * Pay to Public Key Hash (P2PKH) with token support: `0b0010`
     */
    CashAddressType["p2pkhWithTokens"] = "p2pkhWithTokens";
    /**
     * Pay to Script Hash (P2SH) with token support: `0b0011`
     */
    CashAddressType["p2shWithTokens"] = "p2shWithTokens";
})(CashAddressType || (CashAddressType = {}));
/**
 * The address type bits currently defined in the CashAddress specification.
 * These map to: {@link CashAddressType}.
 */
export var CashAddressTypeBits;
(function (CashAddressTypeBits) {
    /**
     * Pay to Public Key Hash (P2PKH)
     */
    CashAddressTypeBits[CashAddressTypeBits["p2pkh"] = 0] = "p2pkh";
    /**
     * Pay to Script Hash (P2SH)
     */
    CashAddressTypeBits[CashAddressTypeBits["p2sh"] = 1] = "p2sh";
    /**
     * Pay to Public Key Hash (P2PKH) with token support
     */
    CashAddressTypeBits[CashAddressTypeBits["p2pkhWithTokens"] = 2] = "p2pkhWithTokens";
    /**
     * Pay to Script Hash (P2SH) with token support
     */
    CashAddressTypeBits[CashAddressTypeBits["p2shWithTokens"] = 3] = "p2shWithTokens";
})(CashAddressTypeBits || (CashAddressTypeBits = {}));
export const cashAddressTypeToTypeBits = {
    [CashAddressType.p2pkh]: CashAddressTypeBits.p2pkh,
    [CashAddressType.p2sh]: CashAddressTypeBits.p2sh,
    [CashAddressType.p2pkhWithTokens]: CashAddressTypeBits.p2pkhWithTokens,
    [CashAddressType.p2shWithTokens]: CashAddressTypeBits.p2shWithTokens,
};
export const cashAddressTypeBitsToType = {
    [CashAddressTypeBits.p2pkh]: CashAddressType.p2pkh,
    [CashAddressTypeBits.p2sh]: CashAddressType.p2sh,
    [CashAddressTypeBits.p2pkhWithTokens]: CashAddressType.p2pkhWithTokens,
    [CashAddressTypeBits.p2shWithTokens]: CashAddressType.p2shWithTokens,
};
/* eslint-disable @typescript-eslint/naming-convention */
export const cashAddressSizeBitsToLength = {
    0: 20,
    1: 24,
    2: 28,
    3: 32,
    4: 40,
    5: 48,
    6: 56,
    7: 64,
};
export const cashAddressLengthToSizeBits = {
    20: 0,
    24: 1,
    28: 2,
    32: 3,
    40: 4,
    48: 5,
    56: 6,
    64: 7,
};
/**
 * Encode a CashAddress version byte for the given address type and payload
 * length. See {@link CashAddressVersionByte} for more information.
 *
 * The `type` parameter must be a number between `0` and `15`, and `bitLength`
 * must be one of the standardized lengths. To use the contents of a variable,
 * cast it to {@link CashAddressType} or {@link CashAddressSize} respectively,
 * e.g.:
 * ```ts
 * const type = 3 as CashAddressType;
 * const size = 160 as CashAddressSize;
 * getCashAddressVersionByte(type, size);
 * ```
 * @param typeBits - the address type bit of the payload being encoded
 * @param length - the length of the payload being encoded
 */
export const encodeCashAddressVersionByte = (typeBits, length) => 
// eslint-disable-next-line no-bitwise
(typeBits << 3 /* Constants.cashAddressTypeBitsShift */) |
    cashAddressLengthToSizeBits[length];
export var CashAddressVersionByteDecodingError;
(function (CashAddressVersionByteDecodingError) {
    CashAddressVersionByteDecodingError["reservedBitSet"] = "Reserved bit is set.";
})(CashAddressVersionByteDecodingError || (CashAddressVersionByteDecodingError = {}));
/**
 * Decode a CashAddress version byte. For a list of known versions, see
 * {@link CashAddressVersionByte}.
 *
 * @param version - the version byte to decode
 */
export const decodeCashAddressVersionByte = (version) => 
// eslint-disable-next-line no-negated-condition, no-bitwise
(version & 128 /* Constants.cashAddressReservedBitMask */) !== 0
    ? CashAddressVersionByteDecodingError.reservedBitSet
    : {
        length: cashAddressSizeBitsToLength[
        // eslint-disable-next-line no-bitwise
        (version &
            7 /* Constants.cashAddressSizeBits */)],
        typeBits: 
        // eslint-disable-next-line no-bitwise
        (version >>> 3 /* Constants.cashAddressTypeBitsShift */) &
            15 /* Constants.cashAddressTypeBits */,
    };
/**
 * Convert a string into an array of 5-bit numbers, representing the characters
 * in a case-insensitive way.
 * @param prefix - the prefix to mask
 */
export const maskCashAddressPrefix = (prefix) => {
    const result = [];
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < prefix.length; i++) {
        // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
        result.push(prefix.charCodeAt(i) & 31 /* Constants.asciiCaseInsensitiveBits */);
    }
    return result;
};
// prettier-ignore
const bech32GeneratorMostSignificantByte = [0x98, 0x79, 0xf3, 0xae, 0x1e]; // eslint-disable-line @typescript-eslint/no-magic-numbers
// prettier-ignore
const bech32GeneratorRemainingBytes = [0xf2bc8e61, 0xb76d99e2, 0x3e5fb3c4, 0x2eabe2a8, 0x4f43e470]; // eslint-disable-line @typescript-eslint/no-magic-numbers
/**
 * Perform the CashAddress polynomial modulo operation, which is based on the
 * Bech32 polynomial modulo operation, but the returned checksum is 40 bits,
 * rather than 30.
 *
 * A.K.A. `PolyMod`
 *
 * @remarks
 * Notes from C++ implementation:
 * This function will compute what 8 5-bit values to XOR into the last 8 input
 * values, in order to make the checksum 0. These 8 values are packed together
 * in a single 40-bit integer. The higher bits correspond to earlier values.
 *
 * The input is interpreted as a list of coefficients of a polynomial over F
 * = GF(32), with an implicit 1 in front. If the input is [v0,v1,v2,v3,v4],
 * that polynomial is v(x) = 1*x^5 + v0*x^4 + v1*x^3 + v2*x^2 + v3*x + v4.
 * The implicit 1 guarantees that [v0,v1,v2,...] has a distinct checksum
 * from [0,v0,v1,v2,...].
 *
 * The output is a 40-bit integer whose 5-bit groups are the coefficients of
 * the remainder of v(x) mod g(x), where g(x) is the cashaddr generator, x^8
 * + [19]*x^7 + [3]*x^6 + [25]*x^5 + [11]*x^4 + [25]*x^3 + [3]*x^2 + [19]*x
 * + [1]. g(x) is chosen in such a way that the resulting code is a BCH
 * code, guaranteeing detection of up to 4 errors within a window of 1025
 * characters. Among the various possible BCH codes, one was selected to in
 * fact guarantee detection of up to 5 errors within a window of 160
 * characters and 6 errors within a window of 126 characters. In addition,
 * the code guarantee the detection of a burst of up to 8 errors.
 *
 * Note that the coefficients are elements of GF(32), here represented as
 * decimal numbers between []. In this finite field, addition is just XOR of
 * the corresponding numbers. For example, [27] + [13] = [27 ^ 13] = [22].
 * Multiplication is more complicated, and requires treating the bits of
 * values themselves as coefficients of a polynomial over a smaller field,
 * GF(2), and multiplying those polynomials mod a^5 + a^3 + 1. For example,
 * [5] * [26] = (a^2 + 1) * (a^4 + a^3 + a) = (a^4 + a^3 + a) * a^2 + (a^4 +
 * a^3 + a) = a^6 + a^5 + a^4 + a = a^3 + 1 (mod a^5 + a^3 + 1) = [9].
 *
 * During the course of the loop below, `c` contains the bit-packed
 * coefficients of the polynomial constructed from just the values of v that
 * were processed so far, mod g(x). In the above example, `c` initially
 * corresponds to 1 mod (x), and after processing 2 inputs of v, it
 * corresponds to x^2 + v0*x + v1 mod g(x). As 1 mod g(x) = 1, that is the
 * starting value for `c`.
 *
 * @param v - Array of 5-bit integers over which the checksum is to be computed
 */
// Derived from the `bitcore-lib-cash` implementation (does not require BigInt): https://github.com/bitpay/bitcore
export const cashAddressPolynomialModulo = (v) => {
    /* eslint-disable functional/no-let, functional/no-loop-statement, functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers */
    let mostSignificantByte = 0;
    let lowerBytes = 1;
    let c = 0;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of, no-plusplus
    for (let j = 0; j < v.length; j++) {
        c = mostSignificantByte >>> 3;
        mostSignificantByte &= 0x07;
        mostSignificantByte <<= 5;
        mostSignificantByte |= lowerBytes >>> 27;
        lowerBytes &= 0x07ffffff;
        lowerBytes <<= 5;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        lowerBytes ^= v[j];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < bech32GeneratorMostSignificantByte.length; ++i) {
            // eslint-disable-next-line functional/no-conditional-statement
            if (c & (1 << i)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                mostSignificantByte ^= bech32GeneratorMostSignificantByte[i];
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                lowerBytes ^= bech32GeneratorRemainingBytes[i];
            }
        }
    }
    lowerBytes ^= 1;
    // eslint-disable-next-line functional/no-conditional-statement
    if (lowerBytes < 0) {
        lowerBytes ^= 1 << 31;
        lowerBytes += (1 << 30) * 2;
    }
    return mostSignificantByte * (1 << 30) * 4 + lowerBytes;
    /* eslint-enable functional/no-let, functional/no-loop-statement, functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers */
};
/**
 * Convert the checksum returned by {@link cashAddressPolynomialModulo} to an
 * array of 5-bit positive integers that can be Base32 encoded.
 * @param checksum - a 40 bit checksum returned by
 * {@link cashAddressPolynomialModulo}
 */
export const cashAddressChecksumToUint5Array = (checksum) => {
    const result = [];
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < 8 /* Constants.base256WordLength */; ++i) {
        // eslint-disable-next-line functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers, functional/immutable-data
        result.push(checksum & 31);
        // eslint-disable-next-line functional/no-expression-statement, @typescript-eslint/no-magic-numbers, no-param-reassign
        checksum /= 32;
    }
    // eslint-disable-next-line functional/immutable-data
    return result.reverse();
};
/**
 * Encode a payload as a CashAddress-like string using the CashAddress format.
 *
 * To encode a standard CashAddress, use {@link encodeCashAddress}.
 *
 * @param prefix - a valid prefix indicating the network for which to encode the
 * address – must be only lowercase letters (for standard CashAddress prefixes,
 * see {@link CashAddressNetworkPrefix})
 * @param version - a single byte indicating the version of this address (for
 * standard CashAddress versions, see {@link CashAddressVersionByte})
 * @param payload - the payload to encode
 */
export const encodeCashAddressFormat = (prefix, version, payload) => {
    const checksum40BitPlaceholder = [0, 0, 0, 0, 0, 0, 0, 0];
    const payloadContents = regroupBits({
        bin: Uint8Array.from([version, ...payload]),
        resultWordLength: 5 /* Constants.base32WordLength */,
        sourceWordLength: 8 /* Constants.base256WordLength */,
    });
    const checksumContents = [
        ...maskCashAddressPrefix(prefix),
        0 /* Constants.payloadSeparator */,
        ...payloadContents,
        ...checksum40BitPlaceholder,
    ];
    const checksum = cashAddressPolynomialModulo(checksumContents);
    const encoded = [
        ...payloadContents,
        ...cashAddressChecksumToUint5Array(checksum),
    ];
    return `${prefix}:${encodeBech32(encoded)}`;
};
export var CashAddressEncodingError;
(function (CashAddressEncodingError) {
    CashAddressEncodingError["unsupportedPayloadLength"] = "Error encoding CashAddress: a payload of this length can not be encoded as a valid CashAddress.";
    CashAddressEncodingError["noTypeBitsValueStandardizedForP2pk"] = "Error encoding CashAddress: no CashAddress type bit has been standardized for P2PK locking bytecode.";
    CashAddressEncodingError["unknownLockingBytecodeType"] = "Error encoding CashAddress: unknown locking bytecode type.";
})(CashAddressEncodingError || (CashAddressEncodingError = {}));
export const isValidCashAddressPayloadLength = (length) => cashAddressLengthToSizeBits[length] !== undefined;
/**
 * Encode a payload as a CashAddress. This function is similar to
 * {@link encodeCashAddress} but supports non-standard `prefix`es and `type`s.
 *
 * **Note: this function cannot prevent all implementation errors via types.**
 * The function will throw if `payload` is not a valid
 * {@link CashAddressSupportedLength}. Confirm the length of untrusted inputs
 * before providing them to this function.
 *
 * For other address standards that closely follow the CashAddress
 * specification (but have alternative version byte requirements), use
 * {@link encodeCashAddressFormat}.
 *
 * @param prefix - a valid prefix indicating the network for which to encode the
 * address (usually a {@link CashAddressNetworkPrefix}) – must be only lowercase
 * letters
 * @param typeBits - the type bit to encode in the version byte – must be a
 * number between `0` and `15`
 * @param payload - the payload to encode (for P2PKH, the public key hash; for
 * P2SH, the redeem bytecode hash)
 */
export const encodeCashAddressNonStandard = (prefix, typeBits, payload) => {
    const { length } = payload;
    if (!isValidCashAddressPayloadLength(length)) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error(formatError(CashAddressEncodingError.unsupportedPayloadLength, `Payload length: ${length}.`));
    }
    return encodeCashAddressFormat(prefix, encodeCashAddressVersionByte(typeBits, length), payload);
};
/**
 * Encode a payload as a CashAddress.
 *
 * **Note: this function cannot prevent all implementation errors via types.**
 * The function will throw if `payload` is not a valid
 * {@link CashAddressSupportedLength}. Confirm the length of untrusted inputs
 * before providing them to this function.
 *
 * To encode a CashAddress with a custom/unknown prefix or type bit, see
 * {@link encodeCashAddressNonStandard}. For other address standards that
 * closely follow the CashAddress specification (but have alternative version
 * byte requirements), use {@link encodeCashAddressFormat}.
 *
 * @param prefix - the network for which to encode the address
 * (a {@link CashAddressNetworkPrefix})
 * @param type - the address type (a {@link CashAddressType})
 * @param payload - the payload to encode – for P2PKH, the public key hash; for
 * P2SH, the redeem bytecode hash
 */
export const encodeCashAddress = (prefix, type, payload) => encodeCashAddressNonStandard(prefix, cashAddressTypeToTypeBits[type], payload);
export var CashAddressDecodingError;
(function (CashAddressDecodingError) {
    CashAddressDecodingError["improperPadding"] = "Error decoding CashAddress: the payload is improperly padded.";
    CashAddressDecodingError["invalidCharacters"] = "Error decoding CashAddress: the payload contains non-bech32 characters.";
    CashAddressDecodingError["invalidChecksum"] = "Error decoding CashAddress: invalid checksum - please review the address for errors.";
    CashAddressDecodingError["invalidFormat"] = "Error decoding CashAddress: CashAddresses should be of the form \"prefix:payload\".";
    CashAddressDecodingError["mismatchedPayloadLength"] = "Error decoding CashAddress: mismatched payload length for specified address version.";
    CashAddressDecodingError["reservedByte"] = "Error decoding CashAddress: unknown CashAddress version, reserved byte set.";
    CashAddressDecodingError["unknownAddressType"] = "Error decoding CashAddress: unknown CashAddress type.";
})(CashAddressDecodingError || (CashAddressDecodingError = {}));
/**
 * Decode and validate a string using the CashAddress format. This is more
 * lenient than {@link decodeCashAddress}, which also validates the contents of
 * the version byte.
 *
 * Note, this method requires `address` to include a network prefix. To
 * decode a string with an unknown prefix, try
 * {@link decodeCashAddressFormatWithoutPrefix}.
 *
 * @param address - the CashAddress-like string to decode
 */
// eslint-disable-next-line complexity
export const decodeCashAddressFormat = (address) => {
    const parts = address.toLowerCase().split(':');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
        return CashAddressDecodingError.invalidFormat;
    }
    const [prefix, payload] = parts;
    if (!isBech32CharacterSet(payload)) {
        return CashAddressDecodingError.invalidCharacters;
    }
    const decodedPayload = decodeBech32(payload);
    const polynomial = [
        ...maskCashAddressPrefix(prefix),
        0 /* Constants.payloadSeparator */,
        ...decodedPayload,
    ];
    if (cashAddressPolynomialModulo(polynomial) !== 0) {
        return CashAddressDecodingError.invalidChecksum;
    }
    const checksum40BitPlaceholderLength = 8;
    const payloadContents = regroupBits({
        allowPadding: false,
        bin: decodedPayload.slice(0, -checksum40BitPlaceholderLength),
        resultWordLength: 8 /* Constants.base256WordLength */,
        sourceWordLength: 5 /* Constants.base32WordLength */,
    });
    if (typeof payloadContents === 'string') {
        return CashAddressDecodingError.improperPadding;
    }
    const [version, ...contents] = payloadContents;
    const result = Uint8Array.from(contents);
    return { payload: result, prefix, version };
};
/**
 * Decode and validate a CashAddress, strictly checking the version byte
 * according to the CashAddress specification. This is important for error
 * detection in CashAddresses.
 *
 * This function is similar to {@link decodeCashAddress} but supports
 * non-standard `type`s.
 *
 * For other address-like standards that closely follow the CashAddress
 * specification (but have alternative version byte requirements), use
 * {@link decodeCashAddressFormat}.
 *
 * Note, this method requires that CashAddresses include a network prefix. To
 * decode an address with an unknown prefix, try
 * {@link decodeCashAddressFormatWithoutPrefix}.
 *
 * @param address - the CashAddress to decode
 */
export const decodeCashAddressNonStandard = (address) => {
    const decoded = decodeCashAddressFormat(address);
    if (typeof decoded === 'string') {
        return decoded;
    }
    const info = decodeCashAddressVersionByte(decoded.version);
    if (info === CashAddressVersionByteDecodingError.reservedBitSet) {
        return CashAddressDecodingError.reservedByte;
    }
    if (decoded.payload.length !== info.length) {
        return CashAddressDecodingError.mismatchedPayloadLength;
    }
    return {
        payload: decoded.payload,
        prefix: decoded.prefix,
        typeBits: info.typeBits,
    };
};
/**
 * Decode and validate a CashAddress, strictly checking the version byte
 * according to the CashAddress specification. This is important for error
 * detection in CashAddresses.
 *
 * To decode CashAddresses with non-standard `type`s,
 * see {@link decodeCashAddressNonStandard}.
 *
 * For other address-like standards that closely follow the CashAddress
 * specification (but have alternative version byte requirements), use
 * {@link decodeCashAddressFormat}.
 *
 * Note, this method requires that CashAddresses include a network prefix. To
 * decode an address with an unknown prefix, try
 * {@link decodeCashAddressFormatWithoutPrefix}.
 *
 * @param address - the CashAddress to decode
 */
export const decodeCashAddress = (address) => {
    const decoded = decodeCashAddressNonStandard(address);
    if (typeof decoded === 'string') {
        return decoded;
    }
    const type = cashAddressTypeBitsToType[decoded.typeBits];
    if (type === undefined) {
        return `${CashAddressDecodingError.unknownAddressType} Type bit value: ${decoded.typeBits}.`;
    }
    return {
        payload: decoded.payload,
        prefix: decoded.prefix,
        type,
    };
};
/**
 * Attempt to decode and validate a CashAddress against a list of possible
 * prefixes. If the correct prefix is known, use {@link decodeCashAddress}.
 *
 * @param address - the CashAddress to decode
 * @param possiblePrefixes - the network prefixes to try
 */
// decodeCashAddressWithoutPrefix
export const decodeCashAddressFormatWithoutPrefix = (address, possiblePrefixes = [
    CashAddressNetworkPrefix.mainnet,
    CashAddressNetworkPrefix.testnet,
    CashAddressNetworkPrefix.regtest,
]) => {
    // eslint-disable-next-line functional/no-loop-statement
    for (const prefix of possiblePrefixes) {
        const attempt = decodeCashAddressFormat(`${prefix}:${address}`);
        if (attempt !== CashAddressDecodingError.invalidChecksum) {
            return attempt;
        }
    }
    return CashAddressDecodingError.invalidChecksum;
};
/**
 * Convert a CashAddress polynomial to CashAddress string format.
 *
 * @remarks
 * CashAddress polynomials take the form:
 *
 * `[lowest 5 bits of each prefix character] 0 [payload + checksum]`
 *
 * This method remaps the 5-bit integers in the prefix location to the matching
 * ASCII lowercase characters, replaces the separator with `:`, and then Bech32
 * encodes the remaining payload and checksum.
 *
 * @param polynomial - an array of 5-bit integers representing the terms of a
 * CashAddress polynomial
 */
export const cashAddressPolynomialToCashAddress = (polynomial) => {
    const separatorPosition = polynomial.indexOf(0);
    const prefix = polynomial
        .slice(0, separatorPosition)
        .map((integer) => String.fromCharCode(96 /* Constants.asciiLowerCaseStart */ + integer))
        .join('');
    const contents = encodeBech32(polynomial.slice(separatorPosition + 1));
    return `${prefix}:${contents}`;
};
export var CashAddressCorrectionError;
(function (CashAddressCorrectionError) {
    CashAddressCorrectionError["tooManyErrors"] = "This address has more than 2 errors and cannot be corrected.";
})(CashAddressCorrectionError || (CashAddressCorrectionError = {}));
/**
 * Attempt to correct up to 2 errors in a CashAddress. The CashAddress must be
 * properly formed (include a prefix and only contain Bech32 characters).
 *
 * ## **Improper use of this method carries the risk of lost funds.**
 *
 * It is strongly advised that this method only be used under explicit user
 * control. With enough errors, this method is likely to find a plausible
 * correction for any address (but for which no private key exists). This is
 * effectively equivalent to burning the funds.
 *
 * Only 2 substitution errors can be corrected (or a single swap) – deletions
 * and insertions (errors that shift many other characters and change the
 * length of the payload) can never be safely corrected and will produce an
 * error.
 *
 * Errors can be corrected in both the prefix and the payload, but attempting to
 * correct errors in the prefix prior to this method can improve results, e.g.
 * for `bchtest:qq2azmyyv6dtgczexyalqar70q036yund53jvfde0x`, the string
 * `bchtest:qq2azmyyv6dtgczexyalqar70q036yund53jvfdecc` can be corrected, while
 * `typo:qq2azmyyv6dtgczexyalqar70q036yund53jvfdecc` can not.
 *
 * @param address - the CashAddress on which to attempt error correction
 */
// Derived from: https://github.com/deadalnix/cashaddressed
// eslint-disable-next-line complexity
export const attemptCashAddressFormatErrorCorrection = (address) => {
    const parts = address.toLowerCase().split(':');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
        return CashAddressDecodingError.invalidFormat;
    }
    const [prefix, payload] = parts;
    if (!isBech32CharacterSet(payload)) {
        return CashAddressDecodingError.invalidCharacters;
    }
    const decodedPayload = decodeBech32(payload);
    const polynomial = [...maskCashAddressPrefix(prefix), 0, ...decodedPayload];
    const originalChecksum = cashAddressPolynomialModulo(polynomial);
    if (originalChecksum === 0) {
        return {
            address: cashAddressPolynomialToCashAddress(polynomial),
            corrections: [],
        };
    }
    const syndromes = {};
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let term = 0; term < polynomial.length; term++) {
        // eslint-disable-next-line functional/no-loop-statement
        for (
        // eslint-disable-next-line functional/no-let
        let errorVector = 1; errorVector < 32 /* Constants.finiteFieldOrder */; 
        // eslint-disable-next-line no-plusplus
        errorVector++) {
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            polynomial[term] ^= errorVector;
            const correct = cashAddressPolynomialModulo(polynomial);
            if (correct === 0) {
                return {
                    address: cashAddressPolynomialToCashAddress(polynomial),
                    corrections: [term],
                };
            }
            // eslint-disable-next-line no-bitwise
            const s0 = (BigInt(correct) ^ BigInt(originalChecksum)).toString();
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            syndromes[s0] = term * 32 /* Constants.finiteFieldOrder */ + errorVector;
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            polynomial[term] ^= errorVector;
        }
    }
    // eslint-disable-next-line functional/no-loop-statement
    for (const [s0, pe] of Object.entries(syndromes)) {
        // eslint-disable-next-line no-bitwise
        const s1Location = (BigInt(s0) ^ BigInt(originalChecksum)).toString();
        const s1 = syndromes[s1Location];
        if (s1 !== undefined) {
            const correctionIndex1 = Math.trunc(pe / 32 /* Constants.finiteFieldOrder */);
            const correctionIndex2 = Math.trunc(s1 / 32 /* Constants.finiteFieldOrder */);
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            polynomial[correctionIndex1] ^= pe % 32 /* Constants.finiteFieldOrder */;
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            polynomial[correctionIndex2] ^= s1 % 32 /* Constants.finiteFieldOrder */;
            return {
                address: cashAddressPolynomialToCashAddress(polynomial),
                corrections: [correctionIndex1, correctionIndex2].sort((a, b) => a - b),
            };
        }
    }
    return CashAddressCorrectionError.tooManyErrors;
};
//# sourceMappingURL=cash-address.js.map