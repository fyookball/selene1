/**
 * See the [Libauth VMB Tests Readme](./readme.md) for background information on
 * VMB tests.
 *
 * Below is the source data structure used to generate Libauth's Bitcoin Cash
 * (BCH) Virtual Machine Bytecode (VMB) tests (`bch_vmb_tests.json` and all
 * `bch_vmb_tests_*.json` files). Compiling from this file allows us to easily
 * 1) validate the data structure, and 2) reproducibly generate artifacts like
 * public keys, hashes, and signatures.
 *
 * To add tests to this file:
 *  1. Clone the Libauth repo and install dependencies using `yarn install`.
 *  2. Add the new tests below.
 *  3. Run `yarn dev:vmb_tests` to quickly regenerate and run all vmb tests.
 *  5. Ensure everything is working, then send your PR.
 *
 * Note: for performance reasons, this file is not exported by the library, but
 * it can still be directly imported.
 */
import type { VmbTestDefinitionGroup } from '../lib.js';
/**
 * The source data structure used to generate the Libauth BCH VMB test
 * vectors (`bch_vmb_tests.json` and all `bch_vmb_*_tx.json` files).
 */
export declare const vmbTestDefinitionsBCH: VmbTestDefinitionGroup[];
export declare const vmbTestsBCH: import("./bch-vmb-test-utils.js").VmbTestMasterBCH[][][];
//# sourceMappingURL=bch-vmb-tests.d.ts.map