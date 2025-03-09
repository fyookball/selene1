


import { WebPlugin } from '@capacitor/core';
import type { TorboarPlugin } from './definitions';

console.log("calling torboar src web.ts");

export class torboarWeb extends WebPlugin implements TorboarPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async startTor(): Promise<{ success: boolean }> {
    console.warn("torrrrrrr is not available on the web!");
    return { success: false };
  }
}

