import type { CashAddressNetworkPrefix } from '../lib.js';
/**
 * Derive the P2PKH locking bytecode at the provided index of the provided HD
 * private key.
 */
export declare const hdPrivateKeyToP2pkhLockingBytecode: ({ addressIndex, hdKey, }: {
    /**
     * An encoded HD private key, e.g.
     * `xprv9s21ZrQH143K2JbpEjGU94NcdKSASB7LuXvJCTsxuENcGN1nVG7QjMnBZ6zZNcJaiJogsRaLaYFFjs48qt4Fg7y1GnmrchQt1zFNu6QVnta`
     *
     * HD private keys may be encoded for either mainnet or testnet (the network
     * information is ignored).
     */
    hdKey: string;
    /**
     * The address index at which to derive the address.
     */
    addressIndex: number;
}) => Uint8Array;
/**
 * Derive the P2PKH address at the provided index of the provided HD
 * private key.
 */
export declare const hdPrivateKeyToP2pkhAddress: ({ addressIndex, hdKey, prefix, }: {
    /**
     * An encoded HD private key, e.g.
     * `xprv9s21ZrQH143K2JbpEjGU94NcdKSASB7LuXvJCTsxuENcGN1nVG7QjMnBZ6zZNcJaiJogsRaLaYFFjs48qt4Fg7y1GnmrchQt1zFNu6QVnta`
     *
     * HD private keys may be encoded for either mainnet or testnet (the network
     * information is ignored).
     */
    hdKey: string;
    /**
     * The address index at which to derive the address.
     */
    addressIndex: number;
    /**
     * The {@link CashAddressNetworkPrefix} to use when encoding the address.
     * (Default: `bitcoincash`)
     */
    prefix?: "bitcoincash" | "bchtest" | "bchreg" | undefined;
}) => string;
//# sourceMappingURL=p2pkh-utils.d.ts.map