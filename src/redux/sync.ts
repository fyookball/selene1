/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { walletBalanceUpdate, selectActiveWallet } from "@/redux/wallet";
import { txHistoryFetch } from "@/redux/txHistory";
import { selectNetworkStatus } from "@/redux/device";
import { selectIsOfflineMode } from "@/redux/preferences";

import LogService from "@/services/LogService";
import ElectrumService from "@/services/ElectrumService";
import BlockchainService from "@/services/BlockchainService";
import WalletManagerService from "@/services/WalletManagerService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import AddressScannerService from "@/services/AddressScannerService";
import UtxoManagerService from "@/services/UtxoManagerService";

import { block_checkpoints } from "@/util/block_checkpoints";

const Log = LogService("redux/sync");

const Electrum = ElectrumService();

export const syncMiddleware = createListenerMiddleware();

// --------------------------------

// syncConnect: request/retry electrum connection
export const syncConnect = createAsyncThunk(
  "sync/connect",
  async (payload: { attempts: number; server: string }, thunkApi) => {
    const isOfflineMode = selectIsOfflineMode(thunkApi.getState());
    if (isOfflineMode) {
      Log.log("sync/connect blocked by offline mode");
      return false;
    }

    Log.log("sync/connect", payload);
    let isSuccess = false;
    try {
      await Electrum.connect(payload.server);
      isSuccess = true;
    } catch (e) {
      Log.error(e);
      // if connection fails, destroy the client and try again
      await Electrum.disconnect(true);

      // try multiple servers only if device reports active network connection
      const { isConnected: isNetworkConnected } = selectNetworkStatus(
        thunkApi.getState()
      );

      // 3 attempts per server
      if (payload.attempts < 2 || !isNetworkConnected) {
        setTimeout(
          () =>
            thunkApi.dispatch(
              syncConnect({ ...payload, attempts: payload.attempts + 1 })
            ),
          Math.min(1000 * (payload.attempts + 1) * 2, 10 * 1000)
        );
      } else {
        // try a different server
        const newServer = Electrum.selectFallbackServer(payload.server);
        thunkApi.dispatch(syncConnect({ server: newServer, attempts: 0 }));
      }
    }

    return isSuccess;
  }
);

// syncReconnect: attempt fresh connection to server
export const syncReconnect = createAsyncThunk(
  "sync/reconnect",
  async (server: string | undefined, thunkApi) => {
    const connectServer = server || Electrum.getElectrumHost();
    thunkApi.dispatch(syncConnect({ attempts: 0, server: connectServer }));
  }
);

export const syncDisconnect = createAsyncThunk("sync/disconnect", async () => {
  return Electrum.disconnect(true);
});

// syncConnectionUp: fired when electrum connection is up
export const syncConnectionUp = createAsyncThunk(
  "sync/up",
  async (server: string, thunkApi): Promise<string> => {
    // set up subscriptions on connect
    try {
      await Electrum.subscribeToChaintip();
      thunkApi.dispatch(syncWalletAddresses());
    } catch (e) {
      Log.error(e);
    }

    return server;
  }
);

// syncConnectionDown: fired if electrum connection goes down
export const syncConnectionDown = createAsyncThunk("sync/down", async () => {
  //async (payload: string, thunkApi) => {
  // attempt reconnect when connection goes down
  //thunkApi.dispatch(syncReconnect(payload));
});

// syncWalletAddresses: generate wallet addresses and set up subscriptions
export const syncWalletAddresses = createAsyncThunk(
  "sync/walletAddresses",
  async (payload, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);
    const AddressScanner = AddressScannerService(wallet);

    AddressScanner.populateAddresses();

    const receiveAddresses = AddressManager.getReceiveAddresses();
    const changeAddresses = AddressManager.getChangeAddresses();

    // don't resync fully spent change addresses
    const filteredChangeAddresses = changeAddresses.filter(
      (address) => !(address.state !== null && address.balance === 0)
    );

    const addresses = receiveAddresses.concat(filteredChangeAddresses);

    thunkApi.dispatch(syncSubscriptionCount(addresses.length));

    await Promise.all(
      addresses.map(async (address) => {
        try {
          await Electrum.subscribeToAddress(address);
        } catch (e) {
          Log.error(e);
        } finally {
          thunkApi.dispatch(syncSubscriptionCount(-1));
        }
      })
    );

    thunkApi.dispatch(syncComplete());
  }
);

export const syncSubscriptionCount = createAction<number>(
  "sync/subscriptionCount"
);

// syncAddressState: fired when data acquired from address subscription
export const syncAddressState = createAsyncThunk(
  "sync/addressState",
  async (
    payload: [string, string | null],
    thunkApi
  ): Promise<[AddressEntity, string | null]> => {
    // get subscription response data from payload
    const [address, addressState] = payload;

    // catch for payload from direct electrum subscription
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);

    const addressObj = AddressManager.getAddress(address);

    // check downloaded state against local state
    if (addressObj.state !== addressState) {
      //Log.debug("address state changed for", address, addressState);
      thunkApi.dispatch(syncAddressUtxos(addressObj));
      thunkApi.dispatch(syncAddressHistory(addressObj));
    }

    thunkApi.dispatch(syncComplete());

    return [addressObj, addressState];
  }
);

// syncAddressUtxos: fired when we learn one of our addresses have changed
// requests current utxo set for an address
const syncAddressUtxos = createAsyncThunk(
  "sync/addressUtxos",
  async (address: AddressEntity, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());

    try {
      await AddressScannerService(wallet).scanUtxos(address.address);
    } catch (e) {
      Log.error(e);
    }

    // update wallet balance; view re-renders on wallet update
    const isChange = address.change === 1;
    thunkApi.dispatch(
      walletBalanceUpdate({
        wallet,
        isChange,
      })
    );
  }
);

export const syncAddressHistory = createAsyncThunk(
  "sync/addressHistory",
  async (address: AddressEntity, thunkApi): Promise<void> => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressManager = AddressManagerService(wallet);
    const AddressScanner = AddressScannerService(wallet);

    const storedAddressState = address.state;

    const calculatedAddressState = AddressManager.calculateAddressState(
      address.address
    );

    if (
      calculatedAddressState !== storedAddressState ||
      storedAddressState === null
    ) {
      try {
        await AddressScanner.scanHistory(address);
      } catch (e) {
        Log.error(e);
      }

      thunkApi.dispatch(syncComplete());
    }
  }
);

export const syncPopulateAddresses = createAsyncThunk(
  "sync/populateAddresses",
  async (action, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const AddressScanner = AddressScannerService(wallet);

    const generatedAddresses = AddressScanner.populateAddresses();
    thunkApi.dispatch(syncSubscriptionCount(generatedAddresses.length));

    await Promise.all(
      generatedAddresses.map(async (address) => {
        try {
          await Electrum.subscribeToAddress(address);
        } catch (e) {
          Log.error(e);
        } finally {
          thunkApi.dispatch(syncSubscriptionCount(-1));
        }
      })
    );

    return generatedAddresses;
  }
);

export const syncHotRefresh = createAsyncThunk(
  "sync/hotRefresh",
  async (payload: { force: boolean }, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const sync = selectSyncState(thunkApi.getState());

    // only allow hot sync after cooldown
    const hotSyncCooldown = 10 * 1000;

    // how many additional addresses to scan (attempt to detect funds beyond the gap)
    const nScanMore = 1600;

    if (
      (sync.isSyncComplete &&
        sync.lastRefresh < Date.now() - hotSyncCooldown) ||
      payload.force
    ) {
      const AddressScanner = AddressScannerService(wallet);
      const AddressManager = AddressManagerService(wallet);
      const UtxoManager = UtxoManagerService(wallet);

      // "hot" addresses are any addresses with UTXOs on them
      const walletUtxos = UtxoManager.getWalletUtxos();
      const hotAddresses = walletUtxos.map((utxo) =>
        AddressManager.getAddress(utxo.address)
      );

      await Promise.all(
        hotAddresses.map(async (address) => {
          try {
            const addressState = await Electrum.requestAddressState(
              address.address
            );
            thunkApi.dispatch(syncAddressState([address, addressState]));
          } catch (e) {
            Log.error(e);
          }
        })
      );

      // scan receive and change addresses from first unused index to last index + nScanMore
      await AddressScanner.scanMoreAddresses(nScanMore, 1);
      await AddressScanner.scanMoreAddresses(nScanMore, 0);

      thunkApi.dispatch(syncPopulateAddresses());
      thunkApi.dispatch(walletBalanceUpdate({ wallet, isChange: false }));

      Log.debug("sync/hotRefresh", sync);
      thunkApi.dispatch(syncComplete());
    }

    return Date.now();
  }
);

export const syncChaintip = createAsyncThunk(
  "sync/chaintip",
  async (chaintip: { height: number; hex: string }, thunkApi) => {
    const { syncPending, chaintip: currentTip } = selectSyncState(
      thunkApi.getState()
    );

    if (syncPending.chaintip <= 1) {
      const Blockchain = BlockchainService();
      const block = await Blockchain.resolveBlockByHeight(chaintip.height);

      Log.log("sync/chaintip", block);

      return block;
    }

    return currentTip;
  }
);

export const syncClearAddresses = createAction("sync/clearAddresses");

export const syncSetSaving = createAction<boolean>("sync/saving");

export const syncComplete = createAsyncThunk(
  "sync/complete",
  async (payload, thunkApi) => {
    const { syncPending, isSyncComplete, isSaving } = selectSyncState(
      thunkApi.getState()
    );

    if (
      syncPending.subscription === 0 &&
      syncPending.addressState === 0 &&
      syncPending.utxo === 0 &&
      syncPending.history === 0 &&
      syncPending.txHistory === 0 &&
      syncPending.chaintip === 0 &&
      syncPending.hotRefresh === 0
    ) {
      if (!isSyncComplete && !isSaving) {
        Log.debug("sync complete", syncPending);
        thunkApi.dispatch(syncSetSaving(true));
        const wallet = selectActiveWallet(thunkApi.getState());
        await WalletManagerService().saveWallet(wallet.walletHash);
        thunkApi.dispatch(syncSetSaving(false));
      }
      return true;
    }

    return false;
  }
);
syncMiddleware.startListening({
  actionCreator: syncAddressState.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: syncAddressHistory.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: syncAddressUtxos.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: syncChaintip.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: syncHotRefresh.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});
syncMiddleware.startListening({
  actionCreator: txHistoryFetch.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(syncComplete());
  },
});

const initialPending = {
  utxo: 0,
  history: 0,
  addressState: 0,
  subscription: 0,
  chaintip: 0,
  rebuild: 0,
  hotRefresh: 0,
  txHistory: 0,
};
const initialState = {
  isConnected: false,
  server: "",
  syncPending: { ...initialPending },
  isSyncComplete: true,
  isSaving: false,
  chaintip: {
    ...block_checkpoints.first2023,
  },
  addresses: {},
  lastRefresh: Date.now(),
};

export const syncReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(syncConnect.fulfilled, (state, action) => {
      state.isConnected = action.payload;
    })
    .addCase(syncDisconnect.fulfilled, (state) => {
      state.isConnected = false;
    })
    .addCase(syncConnectionUp.fulfilled, (state: RootState, action) => {
      state.isConnected = true;
      state.server = action.payload;
    })
    .addCase(syncConnectionDown.pending, (state: RootState) => {
      state.isConnected = false;
    })
    .addCase(syncReconnect.pending, (state: RootState) => {
      state.isConnected = false;
    })
    .addCase(syncAddressState.pending, (state: RootState) => {
      state.syncPending.addressState += 1;
    })
    .addCase(syncAddressState.fulfilled, (state: RootState, action) => {
      const [address] = action.payload;
      state.addresses[address.address] = address;
      state.syncPending.addressState -= 1;
    })
    .addCase(syncAddressState.rejected, (state: RootState) => {
      state.syncPending.addressState -= 1;
    })
    .addCase(syncAddressUtxos.pending, (state: RootState) => {
      state.syncPending.utxo += 1;
    })
    .addCase(syncAddressUtxos.fulfilled, (state: RootState) => {
      state.syncPending.utxo -= 1;
    })
    .addCase(syncAddressUtxos.rejected, (state: RootState) => {
      state.syncPending.utxo -= 1;
    })
    .addCase(syncAddressHistory.pending, (state: RootState) => {
      state.syncPending.history += 1;
    })
    .addCase(syncAddressHistory.fulfilled, (state: RootState) => {
      state.syncPending.history -= 1;
    })
    .addCase(syncAddressHistory.rejected, (state: RootState) => {
      state.syncPending.history -= 1;
    })
    .addCase(txHistoryFetch.pending, (state: RootState) => {
      state.syncPending.txHistory += 1;
      state.isSyncComplete = false;
    })
    .addCase(txHistoryFetch.fulfilled, (state: RootState) => {
      state.syncPending.txHistory -= 1;
    })
    .addCase(txHistoryFetch.rejected, (state: RootState) => {
      state.syncPending.txHistory -= 1;
    })
    .addCase(syncSubscriptionCount, (state, action) => {
      state.syncPending.subscription += action.payload;
    })
    .addCase(syncChaintip.pending, (state) => {
      state.syncPending.chaintip += 1;
    })
    .addCase(syncChaintip.fulfilled, (state, action) => {
      state.syncPending.chaintip -= 1;
      state.chaintip = action.payload;
    })
    .addCase(syncHotRefresh.pending, (state: RootState) => {
      state.syncPending.hotRefresh += 1;
      state.isSyncComplete = false;
    })
    .addCase(syncHotRefresh.fulfilled, (state: RootState, action) => {
      state.lastRefresh = action.payload;
      state.syncPending.hotRefresh -= 1;
    })
    .addCase(syncClearAddresses, (state) => {
      state.addresses = initialState.addresses;
      state.isSyncComplete = false;
    })
    .addCase(syncWalletAddresses.pending, (state) => {
      state.isSyncComplete = false;
    })
    .addCase(syncWalletAddresses.rejected, (state) => {
      state.syncPending.subscription = 0;
    })
    .addCase(syncComplete.fulfilled, (state, action) => {
      state.isSyncComplete = action.payload;
    })
    .addCase(syncSetSaving, (state, action) => {
      state.isSaving = action.payload;
    });
});

export const selectSyncState = createSelector(
  (state: RootState) => state.sync,
  (sync) => ({
    ...sync,
    isSyncing: Object.keys(sync.syncPending).reduce(
      (isSyncing, pending) =>
        sync.syncPending[pending] > 0 || isSyncing || sync.isSaving,
      false
    ),
    syncCount: Object.keys(sync.syncPending).reduce(
      (syncCount, pending) => syncCount + sync.syncPending[pending],
      0
    ),
  })
);

export const selectMyAddresses = createSelector(
  (state: RootState) => state.sync,
  (sync) => sync.addresses
);

export const selectChaintip = createSelector(
  (state) => state.sync,
  (sync) => sync.chaintip
);
