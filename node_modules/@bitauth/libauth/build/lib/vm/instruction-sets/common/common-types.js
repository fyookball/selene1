import { cloneTransactionCommon, cloneTransactionOutputsCommon, } from '../../../message/message.js';
import { conditionallyEvaluate } from './combinators.js';
import { ConsensusCommon } from './consensus.js';
import { applyError, AuthenticationErrorCommon } from './errors.js';
import { cloneAuthenticationInstruction } from './instruction-sets-utils.js';
export const undefinedOperation = conditionallyEvaluate((state) => applyError(state, AuthenticationErrorCommon.unknownOpcode));
export const checkLimitsCommon = (operation) => (state) => {
    const nextState = operation(state);
    return nextState.stack.length + nextState.alternateStack.length >
        ConsensusCommon.maximumStackDepth
        ? applyError(nextState, AuthenticationErrorCommon.exceededMaximumStackDepth)
        : nextState.operationCount > ConsensusCommon.maximumOperationCount
            ? applyError(nextState, AuthenticationErrorCommon.exceededMaximumOperationCount)
            : nextState;
};
export const cloneStack = (stack) => stack.map((item) => item.slice());
export const createAuthenticationProgramStateCommon = ({ program, instructions, stack, }) => ({
    alternateStack: [],
    controlStack: [],
    instructions,
    ip: 0,
    lastCodeSeparator: -1,
    operationCount: 0,
    program,
    signatureOperationsCount: 0,
    signedMessages: [],
    stack,
});
export const cloneAuthenticationProgramCommon = (program) => ({
    inputIndex: program.inputIndex,
    sourceOutputs: cloneTransactionOutputsCommon(program.sourceOutputs),
    transaction: cloneTransactionCommon(program.transaction),
});
export const cloneAuthenticationProgramStateCommon = (state) => ({
    ...(state.error === undefined ? {} : { error: state.error }),
    alternateStack: cloneStack(state.alternateStack),
    controlStack: state.controlStack.slice(),
    instructions: state.instructions.map(cloneAuthenticationInstruction),
    ip: state.ip,
    lastCodeSeparator: state.lastCodeSeparator,
    operationCount: state.operationCount,
    program: cloneAuthenticationProgramCommon(state.program),
    signatureOperationsCount: state.signatureOperationsCount,
    signedMessages: state.signedMessages.map((item) => ({
        digest: item.digest.slice(),
        ...('serialization' in item
            ? { serialization: item.serialization.slice() }
            : { message: item.message.slice() }),
    })),
    stack: cloneStack(state.stack),
});
export const cloneAuthenticationProgramStateBCH = cloneAuthenticationProgramStateCommon;
export const cloneAuthenticationProgramState = cloneAuthenticationProgramStateBCH;
const sha256HashLength = 32;
/**
 * This is a meaningless but complete {@link CompilationContextCommon} that uses
 * a different value for each property. This is useful for testing
 * and debugging.
 */
// eslint-disable-next-line complexity
export const createCompilationContextCommonTesting = ({ sourceOutputs, inputs, locktime, version, outputs, } = {}) => ({
    inputIndex: 0,
    sourceOutputs: sourceOutputs
        ? sourceOutputs
        : [
            {
                lockingBytecode: Uint8Array.from([]),
                valueSatoshis: 0xffffffffffffffffn,
            },
        ],
    transaction: {
        inputs: inputs
            ? inputs
            : [
                {
                    outpointIndex: 0,
                    outpointTransactionHash: new Uint8Array(sha256HashLength).fill(1),
                    sequenceNumber: 0,
                    unlockingBytecode: undefined,
                },
            ],
        locktime: locktime === undefined ? 0 : locktime,
        outputs: outputs === undefined
            ? [
                {
                    lockingBytecode: Uint8Array.from([]),
                    valueSatoshis: 0xffffffffffffffffn,
                },
            ]
            : outputs,
        version: version === undefined ? 0 : version,
    },
});
//# sourceMappingURL=common-types.js.map