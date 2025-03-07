import { lockingBytecodeToCashAddress } from '../address/address.js';
import { importAuthenticationTemplate } from '../schema/schema.js';
import { authenticationTemplateToCompilerBCH } from './compiler-bch/compiler-bch.js';
import { authenticationTemplateP2pkh } from './standard/standard.js';
/**
 * Derive the P2PKH locking bytecode at the provided index of the provided HD
 * private key.
 */
export const hdPrivateKeyToP2pkhLockingBytecode = ({ addressIndex, hdKey, }) => {
    const compiler = authenticationTemplateToCompilerBCH(importAuthenticationTemplate(authenticationTemplateP2pkh));
    const lockingBytecode = compiler.generateBytecode({
        data: { hdKeys: { addressIndex, hdPrivateKeys: { owner: hdKey } } },
        scriptId: 'lock',
    });
    return lockingBytecode.bytecode;
};
/**
 * Derive the P2PKH address at the provided index of the provided HD
 * private key.
 */
export const hdPrivateKeyToP2pkhAddress = ({ addressIndex, hdKey, prefix = 'bitcoincash', }) => lockingBytecodeToCashAddress(hdPrivateKeyToP2pkhLockingBytecode({ addressIndex, hdKey }), prefix);
//# sourceMappingURL=p2pkh-utils.js.map