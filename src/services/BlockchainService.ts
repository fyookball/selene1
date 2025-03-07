/* eslint-disable max-classes-per-file */
import { swapEndianness } from "@bitauth/libauth";
import { Filesystem, Directory } from "@capacitor/filesystem";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
import { hexToBin, binToHex } from "@/util/hex";
import { sha256 } from "@/util/hash";

const Log = LogService("Blockchain");

export class BlockNotExistsError extends Error {
  constructor(id: string | number) {
    super(`No Block with id ${id}`);
  }
}

export class ChaintipNotExistsError extends Error {
  constructor() {
    super(`No Chaintip?`);
  }
}

export interface BlockEntity {
  blockhash: string;
  height: number;
  hex: string;
}

// BlockchainService: brokers interactions with the block data
export default function BlockchainService() {
  const APP_DB = DatabaseService().getAppDatabase();

  return {
    registerBlock,
    getBlocks,
    getBlockByHash,
    getBlockByHeight,
    resolveBlockByHash,
    resolveBlockByHeight,
    getChaintip,
    calculateBlockhash,
    decodeBlockHeader,
    verifyMerkleProof,
    purgeBlocks,
  };

  // --------------------------------

  // Raw block data is stored directly on the device filesystem
  // This helps prevent bloating the in-memory sqlite db and causing OOM errors

  // [private] _loadBlockData: read raw block hex data from filesystem
  async function _loadBlockData(blockhash: string): Promise<string> {
    const blockFile = await Filesystem.readFile({
      path: `/selene/blocks/${blockhash}.raw`,
      directory: Directory.Library,
    });

    const blockData = blockFile.data.toString();

    if (blockData === "") {
      throw new BlockNotExistsError(blockhash);
    }

    // Filesystem plugin gives us base64-encoded data
    const block_hex = atob(blockData);
    return block_hex;
  }

  // [private] _writeBlockData: write raw transaction hex data to filesystem
  async function _writeBlockData(blockhash: string, hex: string) {
    // Filesystem plugin writes as raw bytes, but we must pass base64
    const data = btoa(hex);

    const result = await Filesystem.writeFile({
      path: `/selene/blocks/${blockhash}.raw`,
      directory: Directory.Library,
      recursive: true,
      data,
    });

    return result;
  }

  // registerBlock: insert a block into the database
  async function registerBlock(block) {
    const blockhash = calculateBlockhash(block.hex);

    APP_DB.run(
      `INSERT INTO blockchain (
        blockhash,
        height
      ) VALUES ($blockhash, $height)
        ON CONFLICT DO 
        UPDATE SET height=$height
      `,
      { $blockhash: blockhash, $height: block.height }
    );

    await _writeBlockData(blockhash, block.hex);

    return { blockhash, ...block };
  }

  // getBlocks: return all known blocks
  function getBlocks(): Array<BlockEntity> {
    const result = APP_DB.exec(`SELECT * FROM blockchain;`);
    //Log.log("getBlocks", result);
    return result;
  }

  // getBlockByHash: get block from database by blockhash
  async function getBlockByHash(blockhash): Promise<BlockEntity> {
    const result = APP_DB.exec(
      `SELECT * FROM blockchain WHERE blockhash="${blockhash}";`
    );

    if (result.length < 1) {
      throw new BlockNotExistsError(blockhash);
    }

    const block = {
      ...result[0],
      hex: await _loadBlockData(result[0].blockhash),
    };

    //Log.debug("getBlockByHash", block);
    return block;
  }

  // getBlockByHeight: get block from database by height
  async function getBlockByHeight(height): Promise<BlockEntity> {
    const result = APP_DB.exec(
      `SELECT * FROM blockchain WHERE height="${height}";`
    );

    if (result.length < 1) {
      throw new BlockNotExistsError(height);
    }

    const block = {
      ...result[0],
      hex: await _loadBlockData(result[0].blockhash),
    };

    //Log.debug("getBlockByHeight", block);
    return block;
  }

  async function resolveBlockByHash(blockhash: string) {
    let block;
    try {
      block = await getBlockByHash(blockhash);
    } catch {
      const requestedBlock = await ElectrumService().requestBlock(blockhash);
      block = await registerBlock(requestedBlock);
    }
    return block;
  }

  async function resolveBlockByHeight(height: number) {
    let block;
    try {
      block = await getBlockByHeight(height);
    } catch {
      const hex = await ElectrumService().requestBlockHeader(height);
      block = await registerBlock({ hex, height });
    }
    return block;
  }

  async function getChaintip() {
    const result = APP_DB.exec(
      `SELECT * FROM blockchain ORDER BY height DESC LIMIT 1`
    );

    if (result.length < 1) {
      throw new ChaintipNotExistsError();
    }

    const block = {
      ...result[0],
      hex: await _loadBlockData(result[0].blockhash),
    };

    return block;
  }

  // calculateBlockHash: get the sha256 hash of the block header (little-endian)
  function calculateBlockhash(hex) {
    const blockhash = swapEndianness(
      binToHex(sha256.hash(sha256.hash(hexToBin(hex))))
    );

    return blockhash;
  }

  // decodeBlockHeader: extracts data from raw block header
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function decodeBlockHeader(hex) {
    /*
     * version: 4 bytes int
     * prevBlockhash: 32 bytes block hash
     * merkleRoot: 32 bytes merkle root
     * timestamp: 4 bytes int
     * target: 4 bytes
     * nonce: 4 bytes
     */

    return {};
  }

  function verifyMerkleProof(txHash, txIndex, merkleBranch, merkleRoot) {
    //Log.log("verifyMerkleProof", txHash, txIndex, merkleBranch, merkleRoot);

    let hash = txHash;
    let index = txIndex;

    for (let i = 0; i < merkleBranch.length; i += 1) {
      const branchHash = merkleBranch[i];

      if (index % 2 === 1) {
        hash = sha256.hash(
          Uint8Array.from([...hexToBin(branchHash), ...hexToBin(hash)])
        );
      } else {
        hash = sha256.hash(
          Uint8Array.from([...hexToBin(hash), ...hexToBin(branchHash)])
        );
      }

      index = Math.floor(index / 2);
    }
    return binToHex(hash) === merkleRoot;
  }

  async function deleteBlock(blockhash: string): Promise<void> {
    await deleteBlockFile(blockhash);
    APP_DB.run(`DELETE FROM blockchain WHERE blockhash="${blockhash}";`);
    //Log.debug("deleteBlock", blockhash);
  }

  async function deleteBlockFile(blockhash: string) {
    try {
      //Log.debug("deleteBlockFile", blockhash);
      await Filesystem.deleteFile({
        path: `/selene/blocks/${blockhash}.raw`,
        directory: Directory.Library,
      });
    } catch (e) {
      Log.warn(e);
    }
  }

  async function purgeBlocks(): Promise<void> {
    Log.time("purgeBlocks");

    const purgeBlockHashes = APP_DB.exec(
      `
        SELECT blockhash FROM blockchain WHERE
        blockhash NOT IN (SELECT blockhash FROM transactions)
        AND height < (SELECT height FROM blockchain ORDER BY height DESC LIMIT 1)
      `
    ).map(({ blockhash }) => blockhash);

    //Log.debug("purgeBlockHashes", purgeBlockHashes);

    const keepBlockHashes = APP_DB.exec(
      `
        SELECT blockhash FROM blockchain WHERE
        blockhash IN (SELECT blockhash FROM transactions)
        OR height = (SELECT height FROM blockchain ORDER BY height DESC LIMIT 1)
      `
    ).map(({ blockhash }) => blockhash);

    //Log.debug("keepBlockHashes", keepBlockHashes);

    const fileBlockhashes = (
      await Filesystem.readdir({
        path: "/selene/blocks",
        directory: Directory.Library,
      })
    ).files.map((file) => file.name.split(".")[0]);

    //Log.debug("fileBlockhashes", fileBlockhashes);

    const blockhashes = purgeBlockHashes.concat(
      fileBlockhashes.filter(
        (h) => !keepBlockHashes.includes(h) && !purgeBlockHashes.includes(h)
      )
    );

    await Promise.all(blockhashes.map((blockhash) => deleteBlock(blockhash)));

    Log.debug("purgeBlocks", blockhashes);
    Log.timeEnd("purgeBlocks");
  }
}
