/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { setPreference, selectElectrumServer } from "@/redux/preferences";
import { syncConnect, syncClearAddresses } from "@/redux/sync";

import { ValidBchNetwork } from "@/util/electrum_servers";

import { cashfusionInit } from "@/redux/fusion";

import WalletManagerService, {
  WalletEntity,
} from "@/services/WalletManagerService";
import ElectrumService from "@/services/ElectrumService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import AddressScannerService from "@/services/AddressScannerService";

import ToastService from "@/services/ToastService";

import { convertCashAddress } from "@/util/cashaddr";

const initialState = {
  walletHash: "",
  balance: "0",
  spendable_balance: "0",
  name: "-",
  key_viewed_at: "",
};

// --------------------------------

// walletBoot: loads wallet by walletHash and initializes Electrum connection
export const walletBoot = createAsyncThunk(
  "wallet/boot",
  async (
    payload: { walletHash: string; network: ValidBchNetwork },
    thunkApi
  ) => {
    const { walletHash, network } = payload;

    // load Wallet from database
    const wallet = await WalletManagerService().boot(walletHash);

    thunkApi.dispatch(
      setPreference({ key: "activeWalletHash", value: wallet.walletHash })
    );

    thunkApi.dispatch(syncClearAddresses());
    thunkApi.dispatch(walletReloadAddresses({ wallet }));

    const isMainnet = network === "mainnet";

    const server = isMainnet
      ? selectElectrumServer(thunkApi.getState())
      : ElectrumService().selectFallbackServer("");

    // connect to Electrum
    await thunkApi.dispatch(
      syncConnect({
        attempts: 0,
        server,
      })
    );

    //kick off CashFusion subservice
    try {
      console.log(
        "walletBoot: Dispatching cashfusionInit()",
        wallet.walletHash
      );
      await thunkApi.dispatch(cashfusionInit(wallet));

      console.log("walletBoot: cashfusionInit() completed");
    } catch (err) {
      console.error("walletBoot: Error dispatching cashfusionInit:", err);
    }

    return wallet;
  }
);

export const walletBalanceUpdate = createAction(
  "wallet/balanceUpdate",
  (payload: { wallet: WalletEntity; isChange: boolean }) => {
    const { wallet, isChange } = payload;

    // address and wallet balances are automatically derived on SQL layer when UTXO entries are updated
    const sqlWallet = WalletManagerService().getWallet(wallet.walletHash);

    const previousBalance = BigInt(wallet.balance);
    const currentBalance = BigInt(sqlWallet.balance);
    const currentSpendableBalance = BigInt(sqlWallet.spendable_balance);

    // show receive notification
    if (currentBalance > previousBalance && isChange === false) {
      const difference = currentBalance - previousBalance;
      ToastService().paymentReceived(difference);
    }

    return {
      payload: {
        currentBalance: currentBalance.toString(),
        currentSpendableBalance: currentSpendableBalance.toString(),
      },
    };
  }
);

export const walletSetName = createAction<string>("wallet/name");

export const walletSetKeyViewed = createAction(
  "wallet/key_viewed",
  (payload: { walletHash: string }) => {
    const key_viewed_at = WalletManagerService().updateKeyViewed(
      payload.walletHash
    );

    return { payload: key_viewed_at };
  }
);

export const walletReloadAddresses = createAction(
  "wallet/reloadAddresses",
  (payload: { wallet: WalletEntity }) => {
    const AddressManager = AddressManagerService(payload.wallet.walletHash);
    const AddressScanner = AddressScannerService(payload.wallet);

    AddressScanner.populateAddresses();

    const myAddresses = [
      ...AddressManager.getReceiveAddresses(),
      ...AddressManager.getChangeAddresses(),
    ].map((a) => ({ change: a.change, address: a.address }));

    myAddresses.push(
      ...myAddresses.map((a) => ({
        change: a.change,
        address: convertCashAddress(a.address, "tokenaddr"),
      }))
    );

    return { payload: myAddresses };
  }
);

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletBoot.fulfilled, (state, action) => {
      const wallet = action.payload;
      return wallet;
    })
    .addCase(walletBalanceUpdate, (state, action) => {
      state.balance = action.payload.currentBalance;
      state.spendable_balance = action.payload.currentSpendableBalance;
    })
    .addCase(walletSetName, (state, action) => {
      state.name = action.payload;
    })
    .addCase(walletSetKeyViewed, (state, action) => {
      state.key_viewed_at = action.payload;
    });
});

const addressInitialState: Array<AddressEntity> = [];
export const addressReducer = createReducer(addressInitialState, (builder) => {
  builder.addCase(walletReloadAddresses, (state, action) => {
    const addresses = action.payload;
    return addresses;
  });
});

export const selectActiveWallet = createSelector(
  (state: RootState) => state,
  (state) => state.wallet
);

export const selectActiveWalletHash = createSelector(
  (state: RootState) => state.wallet,
  (wallet) => wallet.walletHash
);

export const selectWalletAddresses = createSelector(
  (state: RootState) => state,
  (state) => state.addresses
);

export const selectGenesisHeight = createSelector(
  (state: RootState) => state.wallet,
  (wallet) => wallet.genesis_height
);

export const selectActiveWalletBalance = createSelector(
  (state) => state.wallet,
  (wallet) => wallet.spendable_balance
);

export const selectActiveWalletName = createSelector(
  (state) => state.wallet,
  (wallet) => wallet.name
);

export const selectKeyViewedAt = createSelector(
  (state) => state.wallet,
  (wallet) => wallet.key_viewed_at
);
