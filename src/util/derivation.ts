export const DERIVATION_PATHS: string[] = ["m/44'/145'/0'", "m/44'/0'/0'"];

export type ValidDerivationPath = (typeof DERIVATION_PATHS)[number];

export const DEFAULT_DERIVATION_PATH: ValidDerivationPath = DERIVATION_PATHS[0];
