import { registerPlugin } from '@capacitor/core';
import type { TorboarPlugin } from './definitions';

console.log("initializing Torboar.");

const Torboar = registerPlugin<TorboarPlugin>('Torboar', {
  android: () => {
    console.log("loading torboar android implementation...");
    return import('./android').then((m) => new m.TorboarAndroid());
  },
  web: () => {
    console.warn("web fallback for torboar is running.");
    return import('./web').then((m) => new m.TorboarWeb());
  },
});

console.log("torboar plugin registered.");

export * from './definitions';
export { Torboar };

