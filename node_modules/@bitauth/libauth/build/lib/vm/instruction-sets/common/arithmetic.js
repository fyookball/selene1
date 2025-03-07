import { combineOperations, pushToStack, pushToStackVmNumberChecked, useOneVmNumber, useThreeVmNumbers, useTwoVmNumbers, } from './combinators.js';
import { applyError, AuthenticationErrorCommon } from './errors.js';
import { opVerify } from './flow-control.js';
import { bigIntToVmNumber, booleanToVmNumber, } from './instruction-sets-utils.js';
export const op1Add = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStackVmNumberChecked(nextState, value + 1n));
export const op1Sub = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, bigIntToVmNumber(value - 1n)));
export const opNegate = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, bigIntToVmNumber(-value)));
export const opAbs = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, bigIntToVmNumber(value < 0 ? -value : value)));
export const opNot = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, value === 0n ? bigIntToVmNumber(1n) : bigIntToVmNumber(0n)));
export const op0NotEqual = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, value === 0n ? bigIntToVmNumber(0n) : bigIntToVmNumber(1n)));
export const opAdd = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStackVmNumberChecked(nextState, firstValue + secondValue));
export const opSub = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, bigIntToVmNumber(firstValue - secondValue)));
export const opBoolAnd = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue !== 0n && secondValue !== 0n)));
export const opBoolOr = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue !== 0n || secondValue !== 0n)));
export const opNumEqual = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue === secondValue)));
export const opNumEqualVerify = combineOperations(opNumEqual, opVerify);
export const opNumNotEqual = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue !== secondValue)));
export const opLessThan = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue < secondValue)));
export const opLessThanOrEqual = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue <= secondValue)));
export const opGreaterThan = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue > secondValue)));
export const opGreaterThanOrEqual = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue >= secondValue)));
export const opMin = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, bigIntToVmNumber(firstValue < secondValue ? firstValue : secondValue)));
export const opMax = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, bigIntToVmNumber(firstValue > secondValue ? firstValue : secondValue)));
export const opWithin = (state) => useThreeVmNumbers(state, (nextState, [firstValue, secondValue, thirdValue]) => pushToStack(nextState, booleanToVmNumber(secondValue <= firstValue && firstValue < thirdValue)));
export const opMul = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStackVmNumberChecked(nextState, firstValue * secondValue));
export const opDiv = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => secondValue === 0n
    ? applyError(nextState, AuthenticationErrorCommon.divisionByZero)
    : pushToStack(nextState, bigIntToVmNumber(firstValue / secondValue)));
export const opMod = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => secondValue === 0n
    ? applyError(nextState, AuthenticationErrorCommon.divisionByZero)
    : pushToStack(nextState, bigIntToVmNumber(firstValue % secondValue)));
//# sourceMappingURL=arithmetic.js.map