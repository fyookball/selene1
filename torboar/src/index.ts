import { registerPlugin } from '@capacitor/core';
import type { TorboarPlugin } from './definitions';

console.log("initializing Torboar.");

const Torboar = registerPlugin<TorboarPlugin>('Torboar', {
  android: () => {
    console.log("loading torboar android implementation...");
    return import('./android');
  },
  web: () => {
    console.warn("web fallback for torboar is running.");
    return import('./web').then((m) => new m.torboarWeb());
  },
});

console.log("torboar plugin registered.");

export * from './definitions';
export { Torboar };

