export class Config {
  static FusionHost(): string {
    // Hardcoded IP avoids emulator DNS flakiness during development
    return "45.77.136.9";
  }

  static FusionPort(): number {
    return 8789;
  }
}
