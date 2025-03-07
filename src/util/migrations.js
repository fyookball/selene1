// migrations.js: handle sqlite database schema updates
import LogService from "@/services/LogService";
import { DEFAULT_DERIVATION_PATH } from "@/util/derivation";

const Log = LogService("migrations");

// functions in the migrations array will be executed sequentially,
// starting with the function at index PRAGMA user_version
// each entry should represent a new db version
const appdb_migrations = [
  function migrate_v0() {
    const query = [];

    query.push("PRAGMA user_version = 0;");

    query.push("DROP TABLE IF EXISTS wallets;");
    query.push("DROP TABLE IF EXISTS blockchain;");
    query.push("DROP TABLE IF EXISTS transactions;");

    // WalletMeta
    query.push(
      `CREATE TABLE IF NOT EXISTS wallets ( 
        walletHash text not null,
        name text default "" not null,
        balance int default 0,
        created_at text default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        key_viewed_at text default null,
        network text not null CHECK(network IN ("mainnet", "chipnet", "testnet3", "testnet4")) default "mainnet",
        UNIQUE(walletHash, network)
      );`
    );

    query.push(
      `CREATE TABLE IF NOT EXISTS blockchain (
        blockhash text primary key,
        height int not null
      );`
    );

    query.push(
      `CREATE TABLE IF NOT EXISTS transactions (
        txid text primary key not null, 
        time_seen default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        time int,
        blocktime int,
        blockhash text,
        size int,
        version int
      );`
    );

    query.push("PRAGMA user_version = 1;");

    return query.join("");
  },
  function migrate_v1() {
    const query = [];

    query.push(
      "ALTER TABLE transactions ADD COLUMN height int not null default 0;"
    );

    query.push("PRAGMA user_version = 2;");

    return query.join("");
  },
  /*function migrate_v2() {
    const query = [];

    query.push("PRAGMA user_version = 3;");

    return query.join("");
  },*/
];

const walletdb_migrations = [
  function migrate_v0() {
    const query = [];

    query.push("PRAGMA user_version = 0;");

    query.push("DROP TABLE IF EXISTS wallet;");
    query.push("DROP TABLE IF EXISTS addresses;");
    query.push("DROP TABLE IF EXISTS address_utxos;");
    query.push("DROP TABLE IF EXISTS address_transactions;");
    query.push("DROP TRIGGER IF EXISTS balance_update;");
    query.push("DROP TRIGGER IF EXISTS utxo_balance_delete;");
    query.push("DROP TRIGGER IF EXISTS utxo_balance_insert;");
    query.push("DROP INDEX IF EXISTS idx_address_transactions;");
    query.push("DROP INDEX IF EXISTS idx_address_utxos;");

    // WalletEntity
    query.push(
      `CREATE TABLE IF NOT EXISTS wallet ( 
        walletHash text primary key not null, 
        mnemonic text not null, 
        passphrase text default "" not null,
        derivation text default "${DEFAULT_DERIVATION_PATH}" not null,
        name text not null, 
        balance int default 0 not null,
        genesis_height int default null,
        created_at text default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        key_viewed_at text default null, 
        key_verified_at text default null 
      );`
    );

    // AddressEntity
    query.push(
      `CREATE TABLE IF NOT EXISTS addresses (
        address text primary key not null, 
        hd_index int not null, 
        balance int default 0 not null, 
        change int default 0 not null, 
        state text default null,
        memo text default null
      );`
    );

    query.push(
      `CREATE TABLE IF NOT EXISTS address_transactions (
        txid text not null, 
        height int default 0 not null,
        address text not null,
        time text default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        time_seen default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        amount int,
        fiat_amount text,
        fiat_currency text,
        memo text default null,
        UNIQUE(txid, address)
      );`
    );

    query.push(
      `CREATE INDEX idx_address_transactions ON address_transactions (address);`
    );

    query.push(
      `CREATE TABLE IF NOT EXISTS address_utxos (
        address text not null,
        txid text not null,
        tx_pos int not null,
        amount int not null,
        memo text default null
      );`
    );

    query.push(`CREATE INDEX idx_address_utxos ON address_utxos (address);`);

    // update total wallet balance when address balances are updated
    query.push(
      `CREATE TRIGGER IF NOT EXISTS balance_update AFTER UPDATE ON addresses
        BEGIN
          UPDATE wallet SET 
            balance=(
              SELECT SUM(balance) FROM addresses 
            )
          ;
        END
      ;`
    );

    // update address balances immediately when local utxo set is updated
    query.push(
      `CREATE TRIGGER IF NOT EXISTS utxo_balance_delete AFTER DELETE ON address_utxos
        BEGIN
          UPDATE addresses SET 
            balance=(
              SELECT COALESCE(SUM(amount), 0) FROM address_utxos
              WHERE address=OLD.address
            ) WHERE address=OLD.address
          ;
        END
      ;`
    );

    query.push(
      `CREATE TRIGGER IF NOT EXISTS utxo_balance_insert AFTER INSERT ON address_utxos
        BEGIN
          UPDATE addresses SET 
            balance=(
              SELECT COALESCE(SUM(amount), 0) FROM address_utxos
              WHERE address=NEW.address
            ) WHERE address=NEW.address
          ;
        END
      ;`
    );

    query.push("PRAGMA user_version = 1;");

    return query.join("");
  },
  function migrate_v1() {
    const query = [];

    // fix history time column to use unix time
    query.push("ALTER TABLE address_transactions DROP COLUMN time;");
    query.push(
      "ALTER TABLE address_transactions ADD COLUMN time int default null;"
    );

    query.push("PRAGMA user_version = 2;");

    return query.join("");
  },
  /*function migrate_v2() {
    const query = [];

    query.push("PRAGMA user_version = 3;");

    return query.join("");
  },*/
];

// run_migrations: run all migrations in migrations array sequentially
// Starts with index indicated in PRAGMA user_version
export function run_migrations(migrations, db) {
  //Log.time("dbMigrate");
  const DB_VERSION = db.exec("PRAGMA user_version")[0].user_version;
  //Log.log("DB_VERSION", DB_VERSION, migrations.length);
  for (let version = DB_VERSION; version < migrations.length; version += 1) {
    Log.log("DB_MIGRATE", `${version}/${migrations.length}`, DB_VERSION);
    try {
      //Log.debug(migrations[version]());
      db.run(migrations[version]());
    } catch (e) {
      Log.error("error during migrations", e);
      return false;
    }
  }
  //Log.timeEnd("dbMigrate");
  return true;
}

export function run_appdb_migrations(appDb) {
  //appDb.run("PRAGMA user_version = 0;");
  return run_migrations(appdb_migrations, appDb);
}

export function run_walletdb_migrations(walletDb) {
  //walletDb.run("PRAGMA user_version = 0;");
  return run_migrations(walletdb_migrations, walletDb);
}
