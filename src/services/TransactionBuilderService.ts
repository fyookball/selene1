import { Decimal } from "decimal.js";
import {
  encodeTransaction,
  generateTransaction,
  swapEndianness,
  cashAddressToLockingBytecode,
  base58AddressToLockingBytecode,
  importAuthenticationTemplate,
  authenticationTemplateP2pkhNonHd,
  authenticationTemplateToCompilerBCH,
  getMinimumFee,
} from "@bitauth/libauth";

import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import AddressManagerService from "@/services/AddressManagerService";
import HdNodeService from "@/services/HdNodeService";
import { WalletEntity } from "@/services/WalletManagerService";
import { TransactionStub } from "@/services/TransactionManagerService";

import { DUST_LIMIT } from "@/util/sats";
import { validateBchUri } from "@/util/uri";
import { binToHex, hexToBin } from "@/util/hex";
import { sha256 } from "@/util/hash";

// NOTE: Couldn't find this type defined elsewhere, so have added it here.
export type ElectrumUtxo = {
  height: number;
  token_data?: {
    amount: string;
    category: string;
    nft?: {
      capability: string;
      commitment: string;
    };
  };
  tx_hash: string;
  tx_pos: number;
  value: number;
};

const Log = LogService("TxBuilder");

export class TransactionBuilderError extends Error {}

export default function TransactionBuilderService(wallet: WalletEntity) {
  return {
    buildP2pkhTransaction,
  };

  // --------------------------------

  function addressToLockingBytecode(addr) {
    const { isBase58Address, address } = validateBchUri(addr);
    const lockingBytecode = isBase58Address
      ? base58AddressToLockingBytecode(address)
      : cashAddressToLockingBytecode(address);

    if (typeof lockingBytecode === "string") {
      throw new Error(lockingBytecode);
    }

    return lockingBytecode.bytecode;
  }

  function buildP2pkhTransaction(
    recipients: Array<{ address: string; amount: Decimal }>,
    fee: number = DUST_LIMIT / 3,
    depth: number = 0
  ): TransactionStub | number | null {
    // calculate total amount to send for all recipients
    const sendTotal = recipients
      .reduce((sum, cur) => sum.plus(cur.amount), new Decimal(0))
      .toNumber();

    // gather suitable inputs
    const UtxoManager = UtxoManagerService(wallet);
    const inputs = UtxoManager.selectUtxos(sendTotal, fee);

    Log.debug("using utxos:", inputs);

    const inputTotal = inputs
      .reduce((sum, cur) => sum.plus(cur.amount), new Decimal(0))
      .toNumber();

    // calculate change
    const changeTotal = inputTotal - sendTotal - fee;

    // insufficient funds
    if (changeTotal < 0) {
      Log.debug(
        "buildP2pkhTransaction: insufficient funds",
        inputTotal,
        sendTotal,
        fee,
        inputTotal - sendTotal,
        changeTotal,
        sendTotal - fee
      );
      return sendTotal - fee;
    }

    // construct tx outputs
    const vout = recipients.map((recipient) => ({
      lockingBytecode: addressToLockingBytecode(recipient.address),
      valueSatoshis: BigInt(recipient.amount.toString()),
    }));

    // construct change outputs
    if (changeTotal >= DUST_LIMIT) {
      const AddressManager = AddressManagerService(wallet);
      const changeAddress = AddressManager.getUnusedAddresses(1, 1)[0];

      vout.push({
        lockingBytecode: addressToLockingBytecode(changeAddress.address),
        valueSatoshis: BigInt(changeTotal),
      });
    }

    // initialize transaction compiler
    const template = importAuthenticationTemplate(
      authenticationTemplateP2pkhNonHd
    );
    const compiler = authenticationTemplateToCompilerBCH(template);

    // sign inputs
    const HdNode = HdNodeService(wallet);
    const signedInputs = HdNode.signInputs(inputs, compiler);

    const generatedTx = generateTransaction({
      inputs: signedInputs,
      outputs: vout,
      locktime: 0,
      version: 2,
    });

    if (generatedTx.success === false) {
      Log.warn("tx generation failed", generatedTx);
      return null;
    }

    const tx_raw = encodeTransaction(generatedTx.transaction);
    const tx_hex = binToHex(tx_raw);
    const tx_hash = swapEndianness(binToHex(sha256.hash(sha256.hash(tx_raw))));

    // if we didn't reclaim change, add it to total fee
    const feeTotal = changeTotal < DUST_LIMIT ? fee + changeTotal : fee;
    if (feeTotal < tx_raw.length) {
      Log.debug(
        `Fee under 1 sat/B... try again with ${tx_raw.length} bytelength as fee`,
        depth
      );
      // TODO: use relay fee provided by electrum (futureproofing)
      return buildP2pkhTransaction(recipients, tx_raw.length, depth + 1);
    }

    if (feeTotal > tx_raw.length * 3 && depth < 3) {
      if (fee !== tx_raw.length) {
        Log.debug(
          "Fee greater than 300% of byte length. Can we make it smaller?",
          depth
        );
        return buildP2pkhTransaction(recipients, tx_raw.length, depth + 1);
      }

      // if we're here, fee can't get any smaller. proceed
    }

    /*
    Log.log(
      "buildTransaction",
      tx_hash,
      vout,
      signedInputs,
      tx_hex,
      tx_raw.length,
      fee,
      feeTotal
    );
    */

    return {
      txid: tx_hash,
      hex: tx_hex,
    };
  }
}

// TODO: Once Token support is added to Selene, add it to this function too.
//       It will require more complex logic: An output will need to be added per each token.
export function buildSweepTransaction(
  utxos: Array<ElectrumUtxo>,
  privateKey: Uint8Array,
  receivingAddress: string
): TransactionStub {
  // Convert the receiving address to locking bytecode.
  const receivingBytecode = cashAddressToLockingBytecode(receivingAddress);

  // If we could not convert it successfully, throw an error.
  if (typeof receivingBytecode === "string") {
    throw new Error(receivingBytecode);
  }

  // Create our P2PKH Compiler.
  const compilerP2pkh = authenticationTemplateToCompilerBCH(
    authenticationTemplateP2pkhNonHd
  );

  // Compile our inputs.
  const inputDirectives = utxos.map((unspent) => ({
    outpointIndex: unspent.tx_pos,
    outpointTransactionHash: hexToBin(unspent.tx_hash),
    sequenceNumber: 0,
    unlockingBytecode: {
      compiler: compilerP2pkh,
      data: {
        keys: { privateKeys: { key: privateKey } },
      },
      script: "unlock",
      valueSatoshis: BigInt(unspent.value),
    },
  }));

  // Calculate the total sats available in our inputs.
  const totalSats = inputDirectives.reduce((total, input) => {
    if (input.unlockingBytecode instanceof Uint8Array) {
      return total + 0n;
    }

    return total + input.unlockingBytecode.valueSatoshis;
  }, 0n);

  // We need to calculate the number of bytes so that we can calculate the fee.
  // So we loop twice and store the final transaction here each time.
  // 1st time will have zero fee. 2nd time will accommodate the fee.
  let encodedTransaction = new Uint8Array();

  // Create the transaction by looping twice.
  // 1st loop: Transaction without a fee.
  // 2nd loop: Accommodate the fee.
  for (let i = 0; i < 2; i += 1) {
    // Get the fee using 1000 sats/KB.
    const feeSats = getMinimumFee(BigInt(encodedTransaction.length), 1000n);

    // Attempt to generate the transaction.
    const generatedTransaction = generateTransaction({
      version: 2,
      locktime: 0,
      inputs: inputDirectives,
      outputs: [
        {
          lockingBytecode: receivingBytecode.bytecode,
          valueSatoshis: totalSats - feeSats,
        },
      ],
    });

    if (!generatedTransaction.success) {
      throw new Error("Failed to generate transaction");
    }

    // Encode the transaction for broadcasting (and fee estimation).
    encodedTransaction = encodeTransaction(generatedTransaction.transaction);
  }

  // Calculate the txid and convert the transaction to hex format.
  const txid = swapEndianness(
    binToHex(sha256.hash(sha256.hash(encodedTransaction)))
  );
  const hex = binToHex(encodedTransaction);

  // Return the transaction.
  return {
    txid,
    hex,
  };
}
