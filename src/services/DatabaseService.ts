import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";
import {
  run_appdb_migrations,
  run_walletdb_migrations,
} from "@/util/migrations";
import { resultToJson } from "@/util/sql";
import LogService from "@/services/LogService";

const Log = LogService("Database");

const APP_DB_FILENAME = "/selene/db/app.db";

export class DatabaseNotOpenError extends Error {
  constructor(handle: string) {
    super(`No Database open with handle ${handle}`);
  }
}

// Connect to SQLite Database
Log.log("* Initializing SQLite *");
const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });

const db_handles = new Map();
let db_keepalive = null;

// open a db file from filesystem
// by default, creates and initializes the db file if it doesn't exist
export async function _dbOpen(filename, skipCreate = false) {
  let db;
  try {
    const dbFile = await Filesystem.readFile({
      path: filename,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });
    const dbData = dbFile.data.toString();
    db = new SQL.Database(dbData.split(","));
  } catch (e) {
    if (skipCreate) {
      throw e;
    }

    Log.warn("Creating database file", filename);
    db = new SQL.Database();
  }

  const dbExec = db.exec;
  db.exec = (...args) => resultToJson(dbExec.apply(db, args));

  db.path = filename;
  return db;
}

// DatabaseService: brokers interactions with raw SQLite database
export default function DatabaseService() {
  return {
    initAppDatabase,
    getAppDatabase,
    getWalletDatabase,
    openWalletDatabase,
    closeWalletDatabase,
    deleteWalletDatabase,
    flushDatabase,
    flushHandles,
    setKeepAlive,
    getKeepAlive,
  };

  // attempt to preload the app db
  async function initAppDatabase() {
    let appDb;
    if (db_handles.has("app")) {
      appDb = db_handles.get("app");
    } else {
      Log.time("initAppDatabase");
      appDb = await _dbOpen(APP_DB_FILENAME);
      run_appdb_migrations(appDb);
      Log.log("Loaded app database");
      db_handles.set("app", appDb);
      Log.timeEnd("initAppDatabase");
    }

    return appDb;
  }

  // getAppDatabase: return the appDb handle
  function getAppDatabase() {
    if (!db_handles.has("app")) {
      throw new DatabaseNotOpenError("app");
    }

    return db_handles.get("app");
  }

  // synchronous getWalletDatabase (requires db handle to be open already)
  function getWalletDatabase(walletHash) {
    if (!db_handles.has(walletHash)) {
      throw new DatabaseNotOpenError(walletHash);
    }

    const walletDb = db_handles.get(walletHash);
    return walletDb;
  }

  // asynchronous openWalletDatabase (returns db handle when ready)
  async function openWalletDatabase(walletHash, network = "mainnet") {
    if (walletHash === "") {
      throw new DatabaseNotOpenError(walletHash);
    }

    //Log.time(`openWalletDatabase ${walletHash}`);

    let walletDb;
    if (db_handles.has(walletHash)) {
      walletDb = db_handles.get(walletHash);
    } else {
      const walletDbFilename = `/selene/db/${walletHash}.${network}.db`;
      walletDb = await _dbOpen(walletDbFilename);
      run_walletdb_migrations(walletDb);
    }

    db_handles.set(walletHash, walletDb);
    //Log.timeEnd(`openWalletDatabase ${walletHash}`);
    return walletDb;
  }

  async function closeWalletDatabase(walletHash, skipFlush = false) {
    if (!db_handles.has(walletHash)) {
      Log.warn("closeWalletDatabase: not open", walletHash);
      return;
    }

    //Log.time(`closeWalletDatabase ${walletHash}`);

    if (getKeepAlive() !== walletHash) {
      if (!skipFlush) {
        await flushDatabase(walletHash);
      }

      const walletDb = getWalletDatabase(walletHash);
      walletDb.close();
      db_handles.delete(walletHash);
    }

    //Log.timeEnd(`closeWalletDatabase ${walletHash}`);
  }

  async function deleteWalletDatabase(walletHash, network) {
    await closeWalletDatabase(walletHash, true);

    return Filesystem.deleteFile({
      path: `/selene/db/${walletHash}.${network}.db`,
      directory: Directory.Library,
    });
  }

  // flushDatabase: writes database to disk
  async function flushDatabase(handle = "app") {
    Log.time(`flushDatabase ${handle}`);
    try {
      const db_handle = db_handles.get(handle);
      if (!db_handle) {
        throw new DatabaseNotOpenError(handle);
      }

      const data = db_handle.export().toString();
      const result = await Filesystem.writeFile({
        path: db_handle.path,
        data,
        directory: Directory.Library,
        encoding: Encoding.UTF8,
        recursive: true,
      });
      Log.debug("flushDatabase success", result.uri);
    } catch (e) {
      Log.error("flushDatabase error", e);
    }
    Log.timeEnd(`flushDatabase ${handle}`);
  }

  function flushHandles(shouldCloseHandles: boolean = true) {
    Log.debug("flushHandles", db_handles);
    const promises = [...db_handles].map(([handle]) => {
      if (shouldCloseHandles && handle !== "app" && handle !== getKeepAlive()) {
        return closeWalletDatabase(handle, false);
      }

      // else flush without closing
      return flushDatabase(handle);
    });
    //Log.debug("flushHandles promises", promises);

    return Promise.all(promises);
  }

  function setKeepAlive(handle) {
    db_keepalive = handle;
  }

  function getKeepAlive() {
    return db_keepalive;
  }
}

// HERE BE SATS if someone wants to try to steal them!
// Some ancient commit will load this wallet, but send wasn't implemented yet...
/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
