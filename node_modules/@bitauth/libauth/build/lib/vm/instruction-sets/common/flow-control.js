import { useOneStackItem } from './combinators.js';
import { applyError, AuthenticationErrorCommon } from './errors.js';
import { stackItemIsTruthy } from './instruction-sets-utils.js';
export const opVerify = (state) => useOneStackItem(state, (nextState, [item]) => stackItemIsTruthy(item)
    ? nextState
    : applyError(nextState, AuthenticationErrorCommon.failedVerify));
export const reservedOperation = (state) => applyError(state, AuthenticationErrorCommon.calledReserved);
export const opReturn = (state) => applyError(state, AuthenticationErrorCommon.calledReturn);
export const opIf = (state) => {
    if (state.controlStack.every((item) => item)) {
        return useOneStackItem(state, (nextState, [item]) => {
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            nextState.controlStack.push(stackItemIsTruthy(item));
            return state;
        });
    }
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.controlStack.push(false);
    return state;
};
/**
 * Note, `OP_NOTIF` is not completely equivalent to `OP_NOT OP_IF`. `OP_NOT`
 * operates on a VM Number (as the inverse of `OP_0NOTEQUAL`), while `OP_NOTIF`
 * checks the "truthy-ness" of a stack item like `OP_IF`.
 */
export const opNotIf = (state) => {
    if (state.controlStack.every((item) => item)) {
        return useOneStackItem(state, (nextState, [item]) => {
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            nextState.controlStack.push(!stackItemIsTruthy(item));
            return state;
        });
    }
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.controlStack.push(false);
    return state;
};
export const opEndIf = (state) => {
    // eslint-disable-next-line functional/immutable-data
    const element = state.controlStack.pop();
    if (element === undefined) {
        return applyError(state, AuthenticationErrorCommon.unexpectedEndIf);
    }
    return state;
};
export const opElse = (state) => {
    const top = state.controlStack[state.controlStack.length - 1];
    if (top === undefined) {
        return applyError(state, AuthenticationErrorCommon.unexpectedElse);
    }
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.controlStack[state.controlStack.length - 1] = !top;
    return state;
};
//# sourceMappingURL=flow-control.js.map