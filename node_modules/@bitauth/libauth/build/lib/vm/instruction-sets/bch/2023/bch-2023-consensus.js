import { SigningSerializationTypeBCH, SigningSerializationTypesBCH, } from '../../common/common.js';
/**
 * Consensus settings for the `BCH_2023_05` instruction set.
 */
export var ConsensusBCH2023;
(function (ConsensusBCH2023) {
    /**
     * A.K.A. `MAX_SCRIPT_SIZE`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumBytecodeLength"] = 10000] = "maximumBytecodeLength";
    /**
     * A.K.A. `MAX_OP_RETURN_RELAY`, `nMaxDatacarrierBytes`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumDataCarrierBytes"] = 223] = "maximumDataCarrierBytes";
    /**
     * A.K.A. `MAX_OPS_PER_SCRIPT`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumOperationCount"] = 201] = "maximumOperationCount";
    /**
     * A.K.A. `MAX_STACK_SIZE`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumStackDepth"] = 1000] = "maximumStackDepth";
    /**
     * A.K.A. `MAX_SCRIPT_ELEMENT_SIZE`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumStackItemLength"] = 520] = "maximumStackItemLength";
    /**
     * A.K.A. `MAX_STANDARD_VERSION`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumStandardVersion"] = 2] = "maximumStandardVersion";
    /**
     * A.K.A. `MAX_TX_IN_SCRIPT_SIG_SIZE`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumStandardUnlockingBytecodeLength"] = 1650] = "maximumStandardUnlockingBytecodeLength";
    /**
     * Transactions smaller than 65 bytes are forbidden to prevent exploits of the
     * transaction Merkle tree design.
     *
     * A.K.A. `MIN_TX_SIZE`
     */
    ConsensusBCH2023[ConsensusBCH2023["minimumTransactionSize"] = 65] = "minimumTransactionSize";
    /**
     * A.K.A. `MAX_STANDARD_TX_SIZE`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumStandardTransactionSize"] = 100000] = "maximumStandardTransactionSize";
    /**
     * A.K.A. `MAX_TX_SIZE`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumTransactionSize"] = 1000000] = "maximumTransactionSize";
    /**
     * A.K.A. `MAXIMUM_ELEMENT_SIZE_64_BIT`
     */
    ConsensusBCH2023[ConsensusBCH2023["maximumVmNumberLength"] = 8] = "maximumVmNumberLength";
    ConsensusBCH2023["minVmNumber"] = "-9223372036854775807";
    ConsensusBCH2023["maxVmNumber"] = "9223372036854775807";
    ConsensusBCH2023[ConsensusBCH2023["schnorrSignatureLength"] = 64] = "schnorrSignatureLength";
    ConsensusBCH2023[ConsensusBCH2023["maximumCommitmentLength"] = 40] = "maximumCommitmentLength";
})(ConsensusBCH2023 || (ConsensusBCH2023 = {}));
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SigningSerializationTypesBCH2023 = [
    ...SigningSerializationTypesBCH,
    SigningSerializationTypeBCH.allOutputsAllUtxos,
    SigningSerializationTypeBCH.correspondingOutputAllUtxos,
    SigningSerializationTypeBCH.noOutputsAllUtxos,
];
//# sourceMappingURL=bch-2023-consensus.js.map