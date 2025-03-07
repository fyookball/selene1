import type { AuthenticationProgramBCH, AuthenticationProgramStateBCHCHIPs, InstructionSet, ResolvedTransactionBCH, Ripemd160, Secp256k1, Sha1, Sha256 } from '../../../../lib.js';
/**
 * create an instance of the BCH CHIPs virtual machine instruction set, an
 * informal, speculative instruction set that implements a variety of future
 * Bitcoin Cash Improvement Proposals (CHIPs).
 *
 * @param standard - If `true`, the additional `isStandard` validations will be
 * enabled. Transactions that fail these rules are often called "non-standard"
 * and can technically be included by miners in valid blocks, but most network
 * nodes will refuse to relay them. (Default: `true`)
 */
export declare const createInstructionSetBCHCHIPs: (standard?: boolean, { ripemd160, secp256k1, sha1, sha256, }?: {
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
}) => InstructionSet<ResolvedTransactionBCH, AuthenticationProgramBCH, AuthenticationProgramStateBCHCHIPs>;
//# sourceMappingURL=bch-chips-instruction-set.d.ts.map