import { createAsyncThunk } from "@reduxjs/toolkit";
import { FusionService } from "@/services/FusionService";
import { WalletEntity } from "@/services/WalletManagerService";

export const cashfusionInit = createAsyncThunk(
  "fusion/init",
  async (wallet: WalletEntity) => {
    console.log("cashfusionInit: thunk started with wallet =", wallet);

    if (!wallet || !wallet.walletHash) {
      console.error(
        "cashfusionInit: Received empty wallet, skipping FusionService start."
      );
      return;
    }

    console.log(
      "cashfusionInit: opening wallet database for walletHash:",
      wallet.walletHash
    );

    console.log("cashfusionInit: creating FusionService");
    const fusion = new FusionService(wallet);
    await fusion.start();
    console.log("cashfusionInit: fusion.start() completed");
  }
);
