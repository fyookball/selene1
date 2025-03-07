import * as bip39 from "bip39";
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPrivateNodeChild,
  deriveHdPath,
  encodeCashAddress,
  secp256k1,
  ripemd160,
} from "@bitauth/libauth";

import { hexToBin } from "@/util/hex";
import { sha256 } from "@/util/hash";

import LogService from "@/services/LogService";
import AddressManagerService from "@/services/AddressManagerService";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Log = LogService("HdNode");

export default function HdNodeService(wallet) {
  const { mnemonic, derivation, passphrase } = wallet;

  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
  const hdMaster = deriveHdPrivateNodeFromSeed(seed);
  const hdMain = deriveHdPath(hdMaster, `${derivation}/0`);
  const hdChange = deriveHdPath(hdMaster, `${derivation}/1`);

  return {
    generateAddress,
    signInputs,
  };

  // raw address generation function
  function generateAddress(index, change = 0) {
    const child = deriveHdPrivateNodeChild(change ? hdChange : hdMain, index);

    const pubKey = secp256k1.derivePublicKeyCompressed(child.privateKey);
    const hash = ripemd160.hash(sha256.hash(pubKey));
    const address = encodeCashAddress(wallet.prefix, "p2pkh", hash);

    //Log.debug("generateAddress", index, address);
    return address;
  }

  function _deriveAddressPrivateKey(address) {
    const AddressManager = AddressManagerService(wallet);
    const { hd_index, change } = AddressManager.getAddress(address);

    const { privateKey } = deriveHdPrivateNodeChild(
      change ? hdChange : hdMain,
      hd_index
    );

    return privateKey;
  }

  function signInputs(inputs, compiler) {
    return inputs.map((input) => ({
      outpointTransactionHash: hexToBin(input.txid),
      outpointIndex: input.tx_pos,
      sequenceNumber: 0,
      unlockingBytecode: {
        compiler,
        script: "unlock",
        valueSatoshis: BigInt(input.amount),
        data: {
          keys: {
            privateKeys: {
              key: _deriveAddressPrivateKey(input.address),
            },
          },
        },
      },
    }));
  }
}
