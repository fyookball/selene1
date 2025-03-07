import { int32UnsignedToSigned } from '../../../format/format.js';
import { pushToStackChecked, pushToStackVmNumberChecked, useOneVmNumber, } from './combinators.js';
import { applyError, AuthenticationErrorCommon } from './errors.js';
import { encodeAuthenticationInstructions } from './instruction-sets-utils.js';
export const opInputIndex = (state) => pushToStackVmNumberChecked(state, BigInt(state.program.inputIndex));
export const opActiveBytecode = (state) => pushToStackChecked(state, encodeAuthenticationInstructions(state.instructions.slice(state.lastCodeSeparator + 1)));
export const opTxVersion = (state) => pushToStackVmNumberChecked(state, BigInt(int32UnsignedToSigned(state.program.transaction.version)));
export const opTxInputCount = (state) => pushToStackVmNumberChecked(state, BigInt(state.program.transaction.inputs.length));
export const opTxOutputCount = (state) => pushToStackVmNumberChecked(state, BigInt(state.program.transaction.outputs.length));
export const opTxLocktime = (state) => pushToStackVmNumberChecked(state, BigInt(state.program.transaction.locktime));
export const useTransactionUtxo = (state, operation) => useOneVmNumber(state, (nextState, [index]) => {
    const utxo = nextState.program.sourceOutputs[Number(index)];
    if (utxo === undefined) {
        return applyError(nextState, AuthenticationErrorCommon.invalidTransactionUtxoIndex);
    }
    return operation(state, [utxo]);
});
export const opUtxoValue = (state) => useTransactionUtxo(state, (nextState, [utxo]) => pushToStackVmNumberChecked(nextState, utxo.valueSatoshis));
export const opUtxoBytecode = (state) => useTransactionUtxo(state, (nextState, [utxo]) => pushToStackChecked(nextState, utxo.lockingBytecode.slice()));
export const useTransactionInput = (state, operation) => useOneVmNumber(state, (nextState, [index]) => {
    const input = nextState.program.transaction.inputs[Number(index)];
    if (input === undefined) {
        return applyError(nextState, AuthenticationErrorCommon.invalidTransactionInputIndex);
    }
    return operation(state, [input]);
});
export const opOutpointTxHash = (state) => useTransactionInput(state, (nextState, [input]) => pushToStackChecked(nextState, input.outpointTransactionHash.slice().reverse()));
export const opOutpointIndex = (state) => useTransactionInput(state, (nextState, [input]) => pushToStackVmNumberChecked(nextState, BigInt(input.outpointIndex)));
export const opInputBytecode = (state) => useTransactionInput(state, (nextState, [input]) => pushToStackChecked(nextState, input.unlockingBytecode.slice()));
export const opInputSequenceNumber = (state) => useTransactionInput(state, (nextState, [input]) => pushToStackVmNumberChecked(nextState, BigInt(input.sequenceNumber)));
export const useTransactionOutput = (state, operation) => useOneVmNumber(state, (nextState, [index]) => {
    const input = nextState.program.transaction.outputs[Number(index)];
    if (input === undefined) {
        return applyError(nextState, AuthenticationErrorCommon.invalidTransactionOutputIndex);
    }
    return operation(state, [input]);
});
export const opOutputValue = (state) => useTransactionOutput(state, (nextState, [output]) => pushToStackVmNumberChecked(nextState, output.valueSatoshis));
export const opOutputBytecode = (state) => useTransactionOutput(state, (nextState, [output]) => pushToStackChecked(nextState, output.lockingBytecode.slice()));
//# sourceMappingURL=inspection.js.map