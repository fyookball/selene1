import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectActiveWalletHash } from "@/redux/wallet";
import { FusionService } from "@/services/FusionService";

export const cashfusionInit = createAsyncThunk(
  "fusion/init",
  async (_, thunkApi) => {
    const walletHash = selectActiveWalletHash(thunkApi.getState());
    if (!walletHash) {
      console.error(
        "cashfusionInit: No active walletHash available, skipping FusionService start."
      );
      return;
    }

    console.log(
      "cashfusionInit: Starting FusionService with walletHash:",
      walletHash
    );
    const fusion = new FusionService();
    await fusion.start();
  }
);
