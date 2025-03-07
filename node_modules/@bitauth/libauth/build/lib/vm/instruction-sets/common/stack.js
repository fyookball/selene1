import { pushToStack, useFourStackItems, useOneStackItem, useOneVmNumber, useSixStackItems, useThreeStackItems, useTwoStackItems, } from './combinators.js';
import { applyError, AuthenticationErrorCommon } from './errors.js';
import { bigIntToVmNumber, stackItemIsTruthy, } from './instruction-sets-utils.js';
export const opToAltStack = (state) => useOneStackItem(state, (nextState, [item]) => {
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    nextState.alternateStack.push(item);
    return nextState;
});
export const opFromAltStack = (state) => {
    // eslint-disable-next-line functional/immutable-data
    const item = state.alternateStack.pop();
    if (item === undefined) {
        return applyError(state, AuthenticationErrorCommon.emptyAlternateStack);
    }
    return pushToStack(state, item);
};
export const op2Drop = (state) => useTwoStackItems(state, (nextState) => nextState);
export const op2Dup = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStack(nextState, a, b, a.slice(), b.slice()));
export const op3Dup = (state) => useThreeStackItems(state, (nextState, [a, b, c]) => pushToStack(nextState, a, b, c, a.slice(), b.slice(), c.slice()));
export const op2Over = (state) => useFourStackItems(state, (nextState, [a, b, c, d]) => pushToStack(nextState, a, b, c, d, a.slice(), b.slice()));
export const op2Rot = (state) => useSixStackItems(state, (nextState, [a, b, c, d, e, f]) => pushToStack(nextState, c, d, e, f, a, b));
export const op2Swap = (state) => useFourStackItems(state, (nextState, [a, b, c, d]) => pushToStack(nextState, c, d, a, b));
export const opIfDup = (state) => useOneStackItem(state, (nextState, [item]) => pushToStack(nextState, ...(stackItemIsTruthy(item) ? [item, item.slice()] : [item])));
export const opDepth = (state) => pushToStack(state, bigIntToVmNumber(BigInt(state.stack.length)));
export const opDrop = (state) => useOneStackItem(state, (nextState) => nextState);
export const opDup = (state) => useOneStackItem(state, (nextState, [item]) => pushToStack(nextState, item, item.slice()));
export const opNip = (state) => useTwoStackItems(state, (nextState, [, b]) => pushToStack(nextState, b));
export const opOver = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStack(nextState, a, b, a.slice()));
export const opPick = (state) => useOneVmNumber(state, (nextState, depth) => {
    const item = nextState.stack[nextState.stack.length - 1 - Number(depth)];
    if (item === undefined) {
        return applyError(state, AuthenticationErrorCommon.invalidStackIndex);
    }
    return pushToStack(nextState, item.slice());
});
export const opRoll = (state) => useOneVmNumber(state, (nextState, depth) => {
    const index = nextState.stack.length - 1 - Number(depth);
    if (index < 0 || index > nextState.stack.length - 1) {
        return applyError(state, AuthenticationErrorCommon.invalidStackIndex);
    }
    // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-non-null-assertion
    return pushToStack(nextState, nextState.stack.splice(index, 1)[0]);
});
export const opRot = (state) => useThreeStackItems(state, (nextState, [a, b, c]) => pushToStack(nextState, b, c, a));
export const opSwap = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStack(nextState, b, a));
export const opTuck = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStack(nextState, b.slice(), a, b));
export const opSize = (state) => useOneStackItem(state, (nextState, [item]) => pushToStack(nextState, item, bigIntToVmNumber(BigInt(item.length))));
//# sourceMappingURL=stack.js.map