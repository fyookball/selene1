import { cloneAuthenticationInstruction, cloneAuthenticationProgramCommon, cloneStack, } from '../../common/common.js';
/**
 * Consensus settings for the `BCH_CHIPs` instruction set.
 */
export var ConsensusBCHCHIPs;
(function (ConsensusBCHCHIPs) {
    ConsensusBCHCHIPs[ConsensusBCHCHIPs["maximumTransactionVersion"] = 2] = "maximumTransactionVersion";
    ConsensusBCHCHIPs[ConsensusBCHCHIPs["bannedTransactionSize"] = 64] = "bannedTransactionSize";
    ConsensusBCHCHIPs[ConsensusBCHCHIPs["maximumHashDigestIterations"] = 660] = "maximumHashDigestIterations";
})(ConsensusBCHCHIPs || (ConsensusBCHCHIPs = {}));
export const cloneAuthenticationProgramStateBCHCHIPs = (state) => ({
    ...(state.error === undefined ? {} : { error: state.error }),
    alternateStack: cloneStack(state.alternateStack),
    controlStack: state.controlStack.slice(),
    hashDigestIterations: state.hashDigestIterations,
    instructions: state.instructions.map(cloneAuthenticationInstruction),
    ip: state.ip,
    lastCodeSeparator: state.lastCodeSeparator,
    program: cloneAuthenticationProgramCommon(state.program),
    repeatedBytes: state.repeatedBytes,
    signedMessages: state.signedMessages.map((item) => ({
        digest: item.digest.slice(),
        ...('serialization' in item
            ? { serialization: item.serialization.slice() }
            : { message: item.message.slice() }),
    })),
    stack: cloneStack(state.stack),
});
export const createAuthenticationProgramStateBCHCHIPs = ({ program, instructions, stack, }) => ({
    alternateStack: [],
    controlStack: [],
    hashDigestIterations: 0,
    instructions,
    ip: 0,
    lastCodeSeparator: -1,
    program,
    repeatedBytes: 0,
    signedMessages: [],
    stack,
});
//# sourceMappingURL=bch-chips-types.js.map