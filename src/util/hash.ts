import {
  sha256 as _sha256,
  Sha256 as _Sha256,
  ripemd160,
} from "@bitauth/libauth";
import { binToHex } from "@/util/hex";

interface Sha256 extends _Sha256 {
  text: (string) => string;
}

_sha256.text = (payload: string): string => {
  const encodedPayload = new TextEncoder().encode(payload);
  return binToHex(_sha256.hash(encodedPayload));
};

export const sha256: Sha256 = _sha256 as Sha256;

export { ripemd160 };
