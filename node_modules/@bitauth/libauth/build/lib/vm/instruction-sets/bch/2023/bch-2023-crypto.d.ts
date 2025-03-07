import type { AuthenticationProgramStateCommon, Operation, Secp256k1, Sha256 } from '../../../../lib.js';
export declare const opCheckSigBCH2023: <State extends AuthenticationProgramStateCommon>({ secp256k1, sha256, }?: {
    sha256: {
        hash: Sha256['hash'];
    };
    secp256k1: {
        verifySignatureSchnorr: Secp256k1['verifySignatureSchnorr'];
        verifySignatureDERLowS: Secp256k1['verifySignatureDERLowS'];
    };
}) => Operation<State>;
export declare const opCheckMultiSigBCH2023: <State extends AuthenticationProgramStateCommon>({ secp256k1, sha256, }?: {
    sha256: {
        hash: Sha256['hash'];
    };
    secp256k1: {
        verifySignatureDERLowS: Secp256k1['verifySignatureDERLowS'];
    };
}) => (s: State) => State;
export declare const opCheckSigVerifyBCH2023: <State extends AuthenticationProgramStateCommon>({ secp256k1, sha256, }?: {
    sha256: {
        hash: Sha256['hash'];
    };
    secp256k1: {
        verifySignatureSchnorr: Secp256k1['verifySignatureSchnorr'];
        verifySignatureDERLowS: Secp256k1['verifySignatureDERLowS'];
    };
}) => Operation<State>;
export declare const opCheckMultiSigVerifyBCH2023: <State extends AuthenticationProgramStateCommon>({ secp256k1, sha256, }: {
    sha256: {
        hash: Sha256['hash'];
    };
    secp256k1: {
        verifySignatureDERLowS: Secp256k1['verifySignatureDERLowS'];
    };
}) => Operation<State>;
//# sourceMappingURL=bch-2023-crypto.d.ts.map