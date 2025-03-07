import { SigningSerializationTypeBCH } from './signing-serialization.js';
/**
 * Consensus settings for the `BCH_2022_05` instruction set.
 */
export var ConsensusCommon;
(function (ConsensusCommon) {
    /**
     * A.K.A. `MAX_SCRIPT_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumBytecodeLength"] = 10000] = "maximumBytecodeLength";
    /**
     * A.K.A. `MAX_OP_RETURN_RELAY`, `nMaxDatacarrierBytes`
     */
    ConsensusCommon[ConsensusCommon["maximumDataCarrierBytes"] = 223] = "maximumDataCarrierBytes";
    /**
     * A.K.A. `MAX_OPS_PER_SCRIPT`
     */
    ConsensusCommon[ConsensusCommon["maximumOperationCount"] = 201] = "maximumOperationCount";
    /**
     * A.K.A. `MAX_STACK_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumStackDepth"] = 1000] = "maximumStackDepth";
    /**
     * A.K.A. `MAX_SCRIPT_ELEMENT_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumStackItemLength"] = 520] = "maximumStackItemLength";
    /**
     * A.K.A. `MAX_STANDARD_VERSION`
     */
    ConsensusCommon[ConsensusCommon["maximumStandardVersion"] = 2] = "maximumStandardVersion";
    /**
     * A.K.A. `MAX_TX_IN_SCRIPT_SIG_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumStandardUnlockingBytecodeLength"] = 1650] = "maximumStandardUnlockingBytecodeLength";
    /**
     * A.K.A. `MIN_TX_SIZE`
     */
    ConsensusCommon[ConsensusCommon["minimumTransactionSize"] = 100] = "minimumTransactionSize";
    /**
     * A.K.A. `MAX_STANDARD_TX_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumStandardTransactionSize"] = 100000] = "maximumStandardTransactionSize";
    /**
     * A.K.A. `MAX_TX_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumTransactionSize"] = 1000000] = "maximumTransactionSize";
    /**
     * A.K.A. `MAXIMUM_ELEMENT_SIZE_64_BIT`
     */
    ConsensusCommon[ConsensusCommon["maximumVmNumberLength"] = 8] = "maximumVmNumberLength";
    ConsensusCommon["minVmNumber"] = "-9223372036854775807";
    ConsensusCommon["maxVmNumber"] = "9223372036854775807";
    ConsensusCommon[ConsensusCommon["schnorrSignatureLength"] = 64] = "schnorrSignatureLength";
})(ConsensusCommon || (ConsensusCommon = {}));
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SigningSerializationTypesCommon = [
    SigningSerializationTypeBCH.allOutputs,
    SigningSerializationTypeBCH.allOutputsSingleInput,
    SigningSerializationTypeBCH.correspondingOutput,
    SigningSerializationTypeBCH.correspondingOutputSingleInput,
    SigningSerializationTypeBCH.noOutputs,
    SigningSerializationTypeBCH.noOutputsSingleInput,
];
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SigningSerializationTypesBCH = SigningSerializationTypesCommon;
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ConsensusBCH = ConsensusCommon;
//# sourceMappingURL=consensus.js.map