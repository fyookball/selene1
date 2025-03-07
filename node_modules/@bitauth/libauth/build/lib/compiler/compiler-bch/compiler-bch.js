import { hash256, ripemd160 as internalRipemd160, secp256k1 as internalSecp256k1, sha256 as internalSha256, sha512 as internalSha512, } from '../../crypto/crypto.js';
import { createVirtualMachineBCH, generateBytecodeMap, generateSigningSerializationBCH, OpcodesBCHCHIPs, SigningSerializationFlag, SigningSerializationTypeBCH, } from '../../vm/vm.js';
import { attemptCompilerOperations, compilerOperationAttemptBytecodeResolution, compilerOperationHelperCompileScript, compilerOperationHelperDeriveHdKeyPrivate, compilerOperationHelperGenerateCoveredBytecode, compilerOperationRequires, } from '../compiler-operation-helpers.js';
import { compilerOperationsCommon } from '../compiler-operations.js';
import { authenticationTemplateToCompilerConfiguration, compilerConfigurationToCompilerBCH, createAuthenticationProgramEvaluationCommon, } from '../compiler-utils.js';
export var SigningSerializationAlgorithmIdentifier;
(function (SigningSerializationAlgorithmIdentifier) {
    /**
     * A.K.A. `SIGHASH_ALL|SIGHASH_FORKID`
     */
    SigningSerializationAlgorithmIdentifier["allOutputs"] = "all_outputs";
    /**
     * A.K.A. `SIGHASH_ALL|SIGHASH_UTXOS|SIGHASH_FORKID`
     */
    SigningSerializationAlgorithmIdentifier["allOutputsAllUtxos"] = "all_outputs_all_utxos";
    /**
     * A.K.A. `SIGHASH_ALL|SIGHASH_FORKID|ANYONECANPAY`
     */
    SigningSerializationAlgorithmIdentifier["allOutputsSingleInput"] = "all_outputs_single_input";
    /**
     * A.K.A. `SIGHASH_ALL|SIGHASH_UTXOS|SIGHASH_FORKID|ANYONECANPAY`
     */
    SigningSerializationAlgorithmIdentifier["allOutputsSingleInputInvalidAllUtxos"] = "all_outputs_single_input_INVALID_all_utxos";
    /**
     * A.K.A. `SIGHASH_SINGLE|SIGHASH_FORKID`
     */
    SigningSerializationAlgorithmIdentifier["correspondingOutput"] = "corresponding_output";
    /**
     * A.K.A. `SIGHASH_SINGLE|SIGHASH_UTXOS|SIGHASH_FORKID`
     */
    SigningSerializationAlgorithmIdentifier["correspondingOutputAllUtxos"] = "corresponding_output_all_utxos";
    /**
     * A.K.A. `SIGHASH_SINGLE|SIGHASH_FORKID|ANYONECANPAY`
     */
    SigningSerializationAlgorithmIdentifier["correspondingOutputSingleInput"] = "corresponding_output_single_input";
    /**
     * A.K.A. `SIGHASH_SINGLE|SIGHASH_UTXOS|SIGHASH_FORKID|ANYONECANPAY`
     */
    SigningSerializationAlgorithmIdentifier["correspondingOutputSingleInputInvalidAllUtxos"] = "corresponding_output_single_input_INVALID_all_utxos";
    /**
     * An alias for `all_outputs_all_utxos`
     * (A.K.A. `SIGHASH_ALL|SIGHASH_UTXOS|SIGHASH_FORKID`),
     * the most secure signing serialization algorithm.
     *
     * Note that as of 2022, `all_outputs` (A.K.A. `SIGHASH_ALL|SIGHASH_FORKID`)
     * is more commonly used and is therefore a better choice for privacy in
     * common, existing contract types.
     */
    SigningSerializationAlgorithmIdentifier["default"] = "default";
    /**
     * A.K.A `SIGHASH_NONE|SIGHASH_FORKID`
     */
    SigningSerializationAlgorithmIdentifier["noOutputs"] = "no_outputs";
    /**
     * A.K.A `SIGHASH_NONE|SIGHASH_UTXOS|SIGHASH_FORKID`
     */
    SigningSerializationAlgorithmIdentifier["noOutputsAllUtxos"] = "no_outputs_all_utxos";
    /**
     * A.K.A `SIGHASH_NONE|SIGHASH_FORKID|ANYONECANPAY`
     */
    SigningSerializationAlgorithmIdentifier["noOutputsSingleInput"] = "no_outputs_single_input";
    /**
     * A.K.A. `SIGHASH_NONE|SIGHASH_UTXOS|SIGHASH_FORKID|ANYONECANPAY`
     */
    SigningSerializationAlgorithmIdentifier["noOutputsSingleInputInvalidAllUtxos"] = "no_outputs_single_input_INVALID_all_utxos";
})(SigningSerializationAlgorithmIdentifier || (SigningSerializationAlgorithmIdentifier = {}));
// eslint-disable-next-line complexity
const getSigningSerializationType = (algorithmIdentifier, prefix = '') => {
    switch (algorithmIdentifier) {
        case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputs}`:
            return Uint8Array.of(SigningSerializationTypeBCH.allOutputs);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputsAllUtxos}`:
        case `${prefix}${SigningSerializationAlgorithmIdentifier.default}`:
            return Uint8Array.of(SigningSerializationTypeBCH.allOutputsAllUtxos);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputsSingleInput}`:
            return Uint8Array.of(SigningSerializationTypeBCH.allOutputsSingleInput);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputsSingleInputInvalidAllUtxos}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            SigningSerializationFlag.allOutputs |
                SigningSerializationFlag.singleInput |
                SigningSerializationFlag.utxos |
                SigningSerializationFlag.forkId);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutput}`:
            return Uint8Array.of(SigningSerializationTypeBCH.correspondingOutput);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutputAllUtxos}`:
            return Uint8Array.of(SigningSerializationTypeBCH.correspondingOutputAllUtxos);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutputSingleInput}`:
            return Uint8Array.of(SigningSerializationTypeBCH.correspondingOutputSingleInput);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutputSingleInputInvalidAllUtxos}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            SigningSerializationFlag.correspondingOutput |
                SigningSerializationFlag.singleInput |
                SigningSerializationFlag.utxos |
                SigningSerializationFlag.forkId);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputs}`:
            return Uint8Array.of(SigningSerializationTypeBCH.noOutputs);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputsAllUtxos}`:
            return Uint8Array.of(SigningSerializationTypeBCH.noOutputsAllUtxos);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputsSingleInput}`:
            return Uint8Array.of(SigningSerializationTypeBCH.noOutputsSingleInput);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputsSingleInputInvalidAllUtxos}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            SigningSerializationFlag.noOutputs |
                SigningSerializationFlag.singleInput |
                SigningSerializationFlag.utxos |
                SigningSerializationFlag.forkId);
        default:
            return undefined;
    }
};
export const compilerOperationHelperComputeSignatureBCH = ({ coveredBytecode, identifier, compilationContext, operationName, privateKey, sha256, sign, }) => {
    const [, , algorithm, unknown] = identifier.split('.');
    if (unknown !== undefined) {
        return {
            error: `Unknown component in "${identifier}" - the fragment "${unknown}" is not recognized.`,
            status: 'error',
        };
    }
    if (algorithm === undefined) {
        return {
            error: `Invalid signature identifier. Signatures must be of the form: "[variable_id].${operationName}.[signing_serialization_type]".`,
            status: 'error',
        };
    }
    const signingSerializationType = getSigningSerializationType(algorithm);
    if (signingSerializationType === undefined) {
        return {
            error: `Unknown signing serialization algorithm, "${algorithm}".`,
            status: 'error',
        };
    }
    const serialization = generateSigningSerializationBCH(compilationContext, { coveredBytecode, signingSerializationType }, sha256);
    const digest = hash256(serialization, sha256);
    const bitcoinEncodedSignature = Uint8Array.from([
        ...sign(privateKey, digest),
        ...signingSerializationType,
    ]);
    return {
        bytecode: bitcoinEncodedSignature,
        signature: { serialization },
        status: 'success',
    };
};
export const compilerOperationHelperHdKeySignatureBCH = ({ operationName, secp256k1Method, }) => attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
    canBeSkipped: false,
    configurationProperties: [
        'entityOwnership',
        'ripemd160',
        'secp256k1',
        'sha256',
        'sha512',
        'variables',
        'sourceScriptIds',
        'unlockingScripts',
    ],
    dataProperties: ['hdKeys', 'compilationContext'],
    operation: (identifier, data, configuration) => {
        const { hdKeys, compilationContext } = data;
        const { secp256k1, sha256, sourceScriptIds, unlockingScripts } = configuration;
        const derivationResult = compilerOperationHelperDeriveHdKeyPrivate({
            configuration,
            hdKeys,
            identifier,
        });
        if (derivationResult.status === 'error')
            return derivationResult;
        const result = compilerOperationHelperGenerateCoveredBytecode({
            configuration,
            data,
            identifier,
            sourceScriptIds,
            unlockingScripts,
        });
        if ('error' in result) {
            return result;
        }
        return compilerOperationHelperComputeSignatureBCH({
            compilationContext,
            coveredBytecode: result,
            identifier,
            operationName,
            privateKey: derivationResult.bytecode,
            sha256,
            sign: secp256k1[secp256k1Method],
        });
    },
}));
export const compilerOperationHdKeyEcdsaSignatureBCH = compilerOperationHelperHdKeySignatureBCH({
    operationName: 'signature',
    secp256k1Method: 'signMessageHashDER',
});
export const compilerOperationHdKeySchnorrSignatureBCH = compilerOperationHelperHdKeySignatureBCH({
    operationName: 'schnorr_signature',
    secp256k1Method: 'signMessageHashSchnorr',
});
export const compilerOperationHelperKeySignatureBCH = ({ operationName, secp256k1Method, }) => attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
    canBeSkipped: false,
    configurationProperties: [
        'sha256',
        'secp256k1',
        'unlockingScripts',
        'sourceScriptIds',
    ],
    dataProperties: ['keys', 'compilationContext'],
    operation: (identifier, data, configuration) => {
        const { keys, compilationContext } = data;
        const { secp256k1, sha256, unlockingScripts, sourceScriptIds } = configuration;
        const { privateKeys } = keys;
        const [variableId] = identifier.split('.');
        const privateKey = privateKeys === undefined ? undefined : privateKeys[variableId];
        if (privateKey === undefined) {
            return {
                error: `Identifier "${identifier}" refers to a Key, but a private key for "${variableId}" (or an existing signature) was not provided in the compilation data.`,
                recoverable: true,
                status: 'error',
            };
        }
        const result = compilerOperationHelperGenerateCoveredBytecode({
            configuration,
            data,
            identifier,
            sourceScriptIds,
            unlockingScripts,
        });
        if ('error' in result) {
            return result;
        }
        return compilerOperationHelperComputeSignatureBCH({
            compilationContext,
            coveredBytecode: result,
            identifier,
            operationName,
            privateKey,
            sha256,
            sign: secp256k1[secp256k1Method],
        });
    },
}));
export const compilerOperationKeyEcdsaSignatureBCH = compilerOperationHelperKeySignatureBCH({
    operationName: 'signature',
    secp256k1Method: 'signMessageHashDER',
});
export const compilerOperationKeySchnorrSignatureBCH = compilerOperationHelperKeySignatureBCH({
    operationName: 'schnorr_signature',
    secp256k1Method: 'signMessageHashSchnorr',
});
export const compilerOperationHelperComputeDataSignatureBCH = ({ data, configuration, identifier, operationName, privateKey, sha256, sign, }) => {
    const [, , scriptId, unknown] = identifier.split('.');
    if (unknown !== undefined) {
        return {
            error: `Unknown component in "${identifier}" - the fragment "${unknown}" is not recognized.`,
            status: 'error',
        };
    }
    if (scriptId === undefined) {
        return {
            error: `Invalid data signature identifier. Data signatures must be of the form: "[variable_id].${operationName}.[target_script_id]".`,
            status: 'error',
        };
    }
    const result = compilerOperationHelperCompileScript({
        configuration,
        data,
        targetScriptId: scriptId,
    });
    if (result === false) {
        return {
            error: `Data signature tried to sign an unknown target script, "${scriptId}".`,
            status: 'error',
        };
    }
    if ('error' in result) {
        return result;
    }
    const digest = sha256.hash(result);
    return {
        bytecode: sign(privateKey, digest),
        signature: { digest, message: result },
        status: 'success',
    };
};
export const compilerOperationHelperKeyDataSignatureBCH = ({ operationName, secp256k1Method, }) => attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
    canBeSkipped: false,
    configurationProperties: ['sha256', 'secp256k1'],
    dataProperties: ['keys'],
    operation: (identifier, data, configuration) => {
        const { keys } = data;
        const { secp256k1, sha256 } = configuration;
        const { privateKeys } = keys;
        const [variableId] = identifier.split('.');
        const privateKey = privateKeys === undefined ? undefined : privateKeys[variableId];
        if (privateKey === undefined) {
            return {
                error: `Identifier "${identifier}" refers to a Key, but a private key for "${variableId}" (or an existing signature) was not provided in the compilation data.`,
                recoverable: true,
                status: 'error',
            };
        }
        return compilerOperationHelperComputeDataSignatureBCH({
            configuration,
            data,
            identifier,
            operationName,
            privateKey,
            sha256,
            sign: secp256k1[secp256k1Method],
        });
    },
}));
export const compilerOperationKeyEcdsaDataSignatureBCH = compilerOperationHelperKeyDataSignatureBCH({
    operationName: 'data_signature',
    secp256k1Method: 'signMessageHashDER',
});
export const compilerOperationKeySchnorrDataSignatureBCH = compilerOperationHelperKeyDataSignatureBCH({
    operationName: 'schnorr_data_signature',
    secp256k1Method: 'signMessageHashSchnorr',
});
export const compilerOperationHelperHdKeyDataSignatureBCH = ({ operationName, secp256k1Method, }) => attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
    canBeSkipped: false,
    configurationProperties: [
        'entityOwnership',
        'ripemd160',
        'secp256k1',
        'sha256',
        'sha512',
        'variables',
    ],
    dataProperties: ['hdKeys'],
    operation: (identifier, data, configuration) => {
        const { hdKeys } = data;
        const { secp256k1, sha256 } = configuration;
        const derivationResult = compilerOperationHelperDeriveHdKeyPrivate({
            configuration,
            hdKeys,
            identifier,
        });
        if (derivationResult.status === 'error')
            return derivationResult;
        return compilerOperationHelperComputeDataSignatureBCH({
            configuration,
            data,
            identifier,
            operationName,
            privateKey: derivationResult.bytecode,
            sha256,
            sign: secp256k1[secp256k1Method],
        });
    },
}));
export const compilerOperationHdKeyEcdsaDataSignatureBCH = compilerOperationHelperHdKeyDataSignatureBCH({
    operationName: 'data_signature',
    secp256k1Method: 'signMessageHashDER',
});
export const compilerOperationHdKeySchnorrDataSignatureBCH = compilerOperationHelperHdKeyDataSignatureBCH({
    operationName: 'schnorr_data_signature',
    secp256k1Method: 'signMessageHashSchnorr',
});
export const compilerOperationSigningSerializationFullBCH = compilerOperationRequires({
    canBeSkipped: false,
    configurationProperties: ['sha256', 'sourceScriptIds', 'unlockingScripts'],
    dataProperties: ['compilationContext'],
    operation: (identifier, data, configuration) => {
        const [, algorithmOrComponent, unknownPart] = identifier.split('.');
        if (algorithmOrComponent === undefined) {
            return {
                error: `Invalid signing serialization operation. Include the desired component or algorithm, e.g. "signing_serialization.version".`,
                status: 'error',
            };
        }
        if (unknownPart !== undefined) {
            return {
                error: `Unknown component in "${identifier}" - the fragment "${unknownPart}" is not recognized.`,
                status: 'error',
            };
        }
        const signingSerializationType = getSigningSerializationType(algorithmOrComponent, 'full_');
        if (signingSerializationType === undefined) {
            return {
                error: `Unknown signing serialization algorithm, "${algorithmOrComponent}".`,
                status: 'error',
            };
        }
        const { sha256, sourceScriptIds, unlockingScripts } = configuration;
        const result = compilerOperationHelperGenerateCoveredBytecode({
            configuration,
            data,
            identifier,
            sourceScriptIds,
            unlockingScripts,
        });
        if ('error' in result) {
            return result;
        }
        const { compilationContext } = data;
        return {
            bytecode: generateSigningSerializationBCH(compilationContext, {
                coveredBytecode: result,
                signingSerializationType,
            }, sha256),
            status: 'success',
        };
    },
});
/* eslint-disable camelcase, @typescript-eslint/naming-convention */
export const compilerOperationsBCH = {
    ...compilerOperationsCommon,
    hdKey: {
        data_signature: compilerOperationHdKeyEcdsaDataSignatureBCH,
        public_key: compilerOperationsCommon.hdKey.public_key,
        schnorr_data_signature: compilerOperationHdKeySchnorrDataSignatureBCH,
        schnorr_signature: compilerOperationHdKeySchnorrSignatureBCH,
        signature: compilerOperationHdKeyEcdsaSignatureBCH,
    },
    key: {
        data_signature: compilerOperationKeyEcdsaDataSignatureBCH,
        public_key: compilerOperationsCommon.key.public_key,
        schnorr_data_signature: compilerOperationKeySchnorrDataSignatureBCH,
        schnorr_signature: compilerOperationKeySchnorrSignatureBCH,
        signature: compilerOperationKeyEcdsaSignatureBCH,
    },
    signingSerialization: {
        ...compilerOperationsCommon.signingSerialization,
        full_all_outputs: compilerOperationSigningSerializationFullBCH,
        full_all_outputs_all_utxos: compilerOperationSigningSerializationFullBCH,
        full_all_outputs_single_input: compilerOperationSigningSerializationFullBCH,
        full_all_outputs_single_input_INVALID_all_utxos: compilerOperationSigningSerializationFullBCH,
        full_corresponding_output: compilerOperationSigningSerializationFullBCH,
        full_corresponding_output_all_utxos: compilerOperationSigningSerializationFullBCH,
        full_corresponding_output_single_input: compilerOperationSigningSerializationFullBCH,
        full_corresponding_output_single_input_INVALID_all_utxos: compilerOperationSigningSerializationFullBCH,
        full_default: compilerOperationSigningSerializationFullBCH,
        full_no_outputs: compilerOperationSigningSerializationFullBCH,
        full_no_outputs_all_utxos: compilerOperationSigningSerializationFullBCH,
        full_no_outputs_single_input: compilerOperationSigningSerializationFullBCH,
        full_no_outputs_single_input_INVALID_all_utxos: compilerOperationSigningSerializationFullBCH,
    },
};
/**
 * Create a compiler using the default BCH compiler configuration.
 *
 * Internally instantiates the necessary crypto and VM implementations – use
 * {@link compilerConfigurationToCompilerBCH} for more control.
 *
 * @param configuration - a compiler configuration from which properties
 * will be used to override properties of the default BCH configuration – must
 * include the `scripts` property
 */
export const createCompilerBCH = (configuration) => compilerConfigurationToCompilerBCH({
    ...{
        createAuthenticationProgram: createAuthenticationProgramEvaluationCommon,
        opcodes: generateBytecodeMap(OpcodesBCHCHIPs),
        operations: compilerOperationsBCH,
        ripemd160: internalRipemd160,
        secp256k1: internalSecp256k1,
        sha256: internalSha256,
        sha512: internalSha512,
        vm: configuration.vm === undefined
            ? createVirtualMachineBCH()
            : configuration.vm,
    },
    ...configuration,
});
export const createCompiler = createCompilerBCH;
/**
 * Create a BCH `Compiler` from an `AuthenticationTemplate` and an optional set
 * of overrides.
 * @param template - the `AuthenticationTemplate` from which to create the BCH
 * compiler
 * @param overrides - a compiler configuration from which properties will be
 * used to override properties of the default BCH configuration
 */
export const authenticationTemplateToCompilerBCH = (template, overrides) => createCompilerBCH({
    ...overrides,
    ...authenticationTemplateToCompilerConfiguration(template),
});
//# sourceMappingURL=compiler-bch.js.map