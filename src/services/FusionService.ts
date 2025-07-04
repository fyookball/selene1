//import { Torboar } from "torboar";

// Manages a persistent FusionService that continuously checks
// whether a new fusion round should start, and runs it safely (no overlap).

import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";

import { store } from "@/redux";
import { selectActiveWalletHash } from "../redux/wallet";

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

  constructor() {
    Log.log("FusionService instance created (constructor)");
  }

  public async start(): Promise<void> {
    if (this._isRunning) {
      Log.log("FusionService already running");
      return;
    }

    try {
      this._walletHash = selectActiveWalletHash(store.getState());
      this._utxoManager = UtxoManagerService(this._walletHash);
      Log.log("FusionService initialized with walletHash:", this._walletHash);
    } catch (e) {
      console.error("FusionService start() threw error:", e);
      throw e;
    }

    this._isRunning = true;
    this._shouldStopRequested = false;
    Log.log("FusionService started");

    await this._grabWalletUtxos();
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
        this._currentRound = FusionService._startFusionRound()
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
    return utxos;
  }

  private static async _startFusionRound(): Promise<void> {
    Log.log("Starting fusion round...");

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 5000);
    });

    Log.log("Fusion round completed");
  }
}
