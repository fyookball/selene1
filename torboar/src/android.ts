

const TorboarNative = (window as any).Capacitor?.Plugins?.Torboar;

export class TorboarAndroid {
  async startTor(): Promise<{ message: string }> {
    if (!TorboarNative || typeof TorboarNative.startTor !== 'function') {
      throw new Error('"Torboar.startTor" is not implemented on android');
    }
    return TorboarNative.startTor();
  }
}

