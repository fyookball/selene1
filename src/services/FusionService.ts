// Manages a persistent FusionService that continuously checks
// whether a new fusion round should start, and runs it safely (no overlap).

import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";

const Log = LogService("FusionService");

type Utxo = {
  address: string;
  txid: string;
  tx_pos: number;
  amount: bigint;
  memo: string | null;
};

export class FusionService {
  private _isRunning = false;

  private _shouldStopRequested = false;

  private _currentRound: Promise<void> | null = null;

  private _walletHash: string;

  private _utxoManager: ReturnType<typeof UtxoManagerService>;
 
  private static _defaultMaxCoins = 10;

  constructor(walletHash: string) {
    this._walletHash = walletHash;
    this._utxoManager = UtxoManagerService(this._walletHash);
    Log.log("FusionService initialized with walletHash:", this._walletHash);
  }

  public async start(): Promise<void> {
    if (this._isRunning) {
      Log.log("FusionService already running");
      return;
    }

    this._isRunning = true;
    this._shouldStopRequested = false;
    Log.log("FusionService started");

    this._scheduleNextRound();
  }

  public stop(): void {
    this._shouldStopRequested = true;
  }

  private _scheduleNextRound(): void {
    setTimeout(() => {
      if (this._shouldStopRequested) {
        this._isRunning = false;
        Log.log("FusionService stopped");
        return;
      }

      if (!this._currentRound) {
        this._currentRound = this._startFusionRound()
          .catch((err) => Log.error("Fusion round failed", err))
          .finally(() => {
            this._currentRound = null;
            this._scheduleNextRound();
          });
      } else {
        this._scheduleNextRound();
      }
    }, 10000); // 10-second interval between checks
  }

  private async _grabWalletUtxos(): Promise<Utxo[]> {
    Log.log(`Grabbing wallet UTXOs for walletHash: ${this._walletHash}`);

    const coins = this._utxoManager.getWalletCoins() as Utxo[];
    const utxos = coins ?? [];

    Log.log(`Found ${utxos.length} UTXOs total`);

    utxos.forEach((utxo, index) => {
      Log.log(
        `UTXO #${index + 1}:`,
        `address=${utxo.address}, txid=${utxo.txid}, tx_pos=${utxo.tx_pos}, amount=${utxo.amount}, memo=${utxo.memo}`
      );
    });

    return utxos;
  }

  private static _selectRandomUtxos(
    allUtxos: Utxo[],
    inclusionProbability = 0.5
  ): Utxo[] {
    const addressMap = new Map<string, Utxo[]>();
    allUtxos.forEach((utxo) => {
      if (!addressMap.has(utxo.address)) {
        addressMap.set(utxo.address, []);
      }
      addressMap.get(utxo.address)!.push(utxo);
    });

    const addressEntries = Array.from(addressMap.entries());
    // Shuffle addresses to randomize selection
    addressEntries.sort(() => Math.random() - 0.5);

    let selected: Utxo[] = [];
    selected = addressEntries.reduce((acc, [address, utxos]) => {
      // Skip addresses with too many UTXOs
      if (utxos.length > 5) {
        Log.log(
          `Skipping address ${address} with ${utxos.length} UTXOs (too many)`
        );
        return acc;
      }

      // Skip addresses that do not meet the inclusion probability
      if (Math.random() > inclusionProbability) {
        return acc;
      }

      // Skip if selecting these UTXOs would exceed max coins
      if (acc.length + utxos.length > FusionService._defaultMaxCoins) {
        Log.log(`Skipping address ${address} due to exceeding MAX_COINS`);
        return acc;
      }

      // Add the UTXOs to the selected list
      Log.log(
        `zzzfusion Including address ${address} with ${utxos.length} UTXOs`
      );
      return [...acc, ...utxos];
    }, [] as Utxo[]);

    Log.log(
      `zzzfusion Selected ${selected.length} UTXOs out of ${allUtxos.length}`
    );
    selected.forEach((utxo, index) => {
      Log.log(
        `Selected UTXO #${index + 1}:`,
        `address=${utxo.address}, txid=${utxo.txid}, tx_pos=${utxo.tx_pos}, amount=${utxo.amount}, memo=${utxo.memo}`
      );
    });

    return selected;
  }

  private async _startFusionRound(): Promise<void> {
    Log.log("Starting fusion round...");

    const allUtxos = await this._grabWalletUtxos();
    const selectedUtxos = FusionService._selectRandomUtxos(allUtxos, 0.5);

    Log.log("Selected UTXOs:", selectedUtxos);

    // Simulate a delay to represent fusion processing
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 5000);
    });

    Log.log("Fusion round completed");
  }
}
