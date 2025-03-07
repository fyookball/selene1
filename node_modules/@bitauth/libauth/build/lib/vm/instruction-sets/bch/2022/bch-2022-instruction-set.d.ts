import type { AuthenticationProgramBCH, AuthenticationProgramStateBCH, InstructionSet, ResolvedTransactionBCH, Ripemd160, Secp256k1, Sha1, Sha256 } from '../../../../lib.js';
/**
 * create an instance of the BCH 2022 virtual machine instruction set.
 *
 * @param standard - If `true`, the additional `isStandard` validations will be
 * enabled. Transactions that fail these rules are often called "non-standard"
 * and can technically be included by miners in valid blocks, but most network
 * nodes will refuse to relay them. (Default: `true`)
 */
export declare const createInstructionSetBCH2022: (standard?: boolean, { ripemd160, secp256k1, sha1, sha256, }?: {
    /**
     * a Ripemd160 implementation
     */
    ripemd160: {
        hash: Ripemd160['hash'];
    };
    /**
     * a Secp256k1 implementation
     */
    secp256k1: {
        verifySignatureSchnorr: Secp256k1['verifySignatureSchnorr'];
        verifySignatureDERLowS: Secp256k1['verifySignatureDERLowS'];
    };
    /**
     * a Sha1 implementation
     */
    sha1: {
        hash: Sha1['hash'];
    };
    /**
     * a Sha256 implementation
     */
    sha256: {
        hash: Sha256['hash'];
    };
}) => InstructionSet<ResolvedTransactionBCH, AuthenticationProgramBCH, AuthenticationProgramStateBCH>;
//# sourceMappingURL=bch-2022-instruction-set.d.ts.map