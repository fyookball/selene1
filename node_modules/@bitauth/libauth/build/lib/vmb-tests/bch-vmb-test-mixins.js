export const simpleP2pkhOutput = {
    lockingBytecode: { script: 'lockP2pkh' },
    valueSatoshis: 10000,
};
export const simpleP2pkhInput = {
    unlockingBytecode: { script: 'unlockP2pkh' },
};
export const emptyP2sh20Output = {
    lockingBytecode: { script: 'lockEmptyP2sh20' },
    valueSatoshis: 10000,
};
export const emptyP2sh20Input = {
    unlockingBytecode: { script: 'unlockEmptyP2sh20' },
};
export const vmbTestOutput = {
    lockingBytecode: { script: 'vmbTestNullData' },
    valueSatoshis: 0,
};
export const slotOutput = {
    lockingBytecode: ['slot'],
    valueSatoshis: 10000,
};
export const slotInput = {
    unlockingBytecode: ['slot'],
};
export const slot0Scenario = {
    sourceOutputs: [slotOutput, simpleP2pkhOutput],
    transaction: {
        inputs: [slotInput, simpleP2pkhInput],
        outputs: [vmbTestOutput],
    },
};
export const slot1Scenario = {
    sourceOutputs: [simpleP2pkhOutput, slotOutput],
    transaction: {
        inputs: [simpleP2pkhInput, slotInput],
        outputs: [vmbTestOutput],
    },
};
export const slot2Scenario = {
    sourceOutputs: [simpleP2pkhOutput, simpleP2pkhOutput, slotOutput],
    transaction: {
        inputs: [simpleP2pkhInput, simpleP2pkhInput, slotInput],
        outputs: [vmbTestOutput],
    },
};
export const slot9Scenario = {
    sourceOutputs: [
        simpleP2pkhOutput,
        simpleP2pkhOutput,
        simpleP2pkhOutput,
        simpleP2pkhOutput,
        simpleP2pkhOutput,
        simpleP2pkhOutput,
        simpleP2pkhOutput,
        simpleP2pkhOutput,
        simpleP2pkhOutput,
        slotOutput,
    ],
    transaction: {
        inputs: [
            simpleP2pkhInput,
            simpleP2pkhInput,
            simpleP2pkhInput,
            simpleP2pkhInput,
            simpleP2pkhInput,
            simpleP2pkhInput,
            simpleP2pkhInput,
            simpleP2pkhInput,
            simpleP2pkhInput,
            slotInput,
        ],
        outputs: [vmbTestOutput],
    },
};
//# sourceMappingURL=bch-vmb-test-mixins.js.map