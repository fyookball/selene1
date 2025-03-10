/* eslint-disable */
import { hexToBin } from "@bitauth/libauth";

// faster binToHex implementation: https://archive.is/2v7QZ
// libauth uses slower array conversion method
export function binToHex(buffer) {
  let out = "";
  for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
    out += LUT_HEX_8b[buffer[idx]];
  }
  return out;
}

// re-export libauth hexToBin
export { hexToBin };

// initialize binToHex lookup tables
const LUT_HEX_4b = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xf]}${LUT_HEX_4b[n & 0xf]}`;
}
