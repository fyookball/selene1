import { createAsyncThunk } from "@reduxjs/toolkit";
import { FusionService } from "@/services/FusionService";

export const cashfusionInit = createAsyncThunk(
  "fusion/init",
  async (walletHash: string) => {
    console.log("cashfusionInit: thunk started with walletHash =", walletHash);

    if (!walletHash) {
      console.error(
        "cashfusionInit: Received empty walletHash, skipping FusionService start."
      );
      return;
    }

    console.log(
      "cashfusionInit: opening wallet database for walletHash:",
      walletHash
    );

    console.log("cashfusionInit: creating FusionService");
    const fusion = new FusionService(walletHash);
    await fusion.start();
    console.log("cashfusionInit: fusion.start() completed");
  }
);
