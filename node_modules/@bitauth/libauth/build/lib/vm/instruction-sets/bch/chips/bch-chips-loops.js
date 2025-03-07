import { applyError, AuthenticationErrorCommon, ConsensusCommon, encodeAuthenticationInstructions, isMinimalDataPush, pushToStack, stackItemIsTruthy, useOneStackItem, } from '../../common/common.js';
import { AuthenticationErrorBCHCHIPs } from './bch-chips-errors.js';
const executionIsActive = (state) => state.controlStack.every((item) => item !== false);
/**
 * An implementation of {@link conditionallyEvaluate} that supports
 * `CHIP-2021-05-loops`.
 */
export const conditionallyEvaluateChipLoops = (operation) => (state) => executionIsActive(state) ? operation(state) : state;
export const undefinedOperationChipLoops = conditionallyEvaluateChipLoops((state) => applyError(state, AuthenticationErrorCommon.unknownOpcode));
export const pushOperationChipLoops = (maximumPushSize = ConsensusCommon.maximumStackItemLength) => (state) => {
    const instruction = state.instructions[state.ip];
    return instruction.data.length > maximumPushSize
        ? applyError(state, `${AuthenticationErrorCommon.exceededMaximumStackItemLength} Item length: ${instruction.data.length} bytes.`)
        : executionIsActive(state)
            ? isMinimalDataPush(instruction.opcode, instruction.data)
                ? pushToStack(state, instruction.data)
                : applyError(state, AuthenticationErrorCommon.nonMinimalPush)
            : state;
};
/**
 * Return the provided state with the provided value pushed to its control stack.
 * @param state - the state to update and return
 * @param data - the value to push to the stack
 */
export const pushToControlStackChipLoops = (state, value) => {
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.controlStack.push(value);
    return state;
};
export const opIfChipLoops = (state) => {
    if (executionIsActive(state)) {
        return useOneStackItem(state, (nextState, [item]) => pushToControlStackChipLoops(nextState, stackItemIsTruthy(item)));
    }
    return pushToControlStackChipLoops(state, false);
};
export const opNotIfChipLoops = (state) => {
    if (executionIsActive(state)) {
        return useOneStackItem(state, (nextState, [item]) => pushToControlStackChipLoops(nextState, !stackItemIsTruthy(item)));
    }
    return pushToControlStackChipLoops(state, false);
};
export const opEndIfChipLoops = (state) => {
    // eslint-disable-next-line functional/immutable-data
    const element = state.controlStack.pop();
    if (typeof element !== 'boolean') {
        return applyError(state, AuthenticationErrorCommon.unexpectedEndIf);
    }
    return state;
};
export const opElseChipLoops = (state) => {
    const top = state.controlStack[state.controlStack.length - 1];
    if (typeof top !== 'boolean') {
        return applyError(state, AuthenticationErrorCommon.unexpectedElse);
    }
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.controlStack[state.controlStack.length - 1] = !top;
    return state;
};
export const opBegin = (state) => pushToControlStackChipLoops(state, state.ip);
export const opUntil = (state) => {
    // eslint-disable-next-line functional/immutable-data
    const controlValue = state.controlStack.pop();
    if (typeof controlValue !== 'number') {
        return applyError(state, AuthenticationErrorBCHCHIPs.unexpectedUntil);
    }
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.repeatedBytes += encodeAuthenticationInstructions(state.instructions.slice(controlValue, state.ip)).length;
    const activeBytecodeLength = encodeAuthenticationInstructions(state.instructions).length;
    if (state.repeatedBytes + activeBytecodeLength >
        ConsensusCommon.maximumBytecodeLength) {
        return applyError(state, AuthenticationErrorBCHCHIPs.excessiveLooping, `Repeated bytes: ${state.repeatedBytes}; active bytecode length: ${activeBytecodeLength}`);
    }
    return useOneStackItem(state, (nextState, [item]) => {
        if (item.length === 1 && item[0] === 1) {
            return nextState;
        }
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        nextState.ip = controlValue - 1;
        return nextState;
    });
};
//# sourceMappingURL=bch-chips-loops.js.map