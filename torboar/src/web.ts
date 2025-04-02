import { WebPlugin } from '@capacitor/core';
import type { TorboarPlugin } from './definitions';

export class TorboarWeb extends WebPlugin implements TorboarPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.warn('Torboar echo is not implemented on web');
    return options;
  }

  async startTor(): Promise<{ message: string }> {
    console.warn('Torboar startTor is not implemented on web');
    return { message: 'startTor not implemented in web' };
  }
}

