import type { AuthenticationProgramBCH, AuthenticationProgramStateBCH, InstructionSet, ResolvedTransactionBCH } from '../../../lib.js';
/**
 * create an instance of the XEC virtual machine instruction set.
 *
 * @param standard - If `true`, the additional `isStandard` validations will be
 * enabled. Transactions that fail these rules are often called "non-standard"
 * and can technically be included by miners in valid blocks, but most network
 * nodes will refuse to relay them. (Default: `true`)
 */
export declare const createInstructionSetXEC: (standard?: boolean) => InstructionSet<ResolvedTransactionBCH, AuthenticationProgramBCH, AuthenticationProgramStateBCH>;
//# sourceMappingURL=xec-instruction-set.d.ts.map