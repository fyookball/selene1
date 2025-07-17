import { configureStore } from "@reduxjs/toolkit";
import LogService from "@/services/LogService";
import {
  preferencesReducer,
  selectActiveWalletHash,
  selectBchNetwork,
} from "./preferences";
import { walletReducer, walletBoot, addressReducer } from "./wallet";
import { syncReducer, syncMiddleware } from "./sync";
import { deviceReducer } from "./device";
import { txHistoryReducer } from "./txHistory";
import { exchangeRateReducer, fetchExchangeRates } from "./exchangeRates";
import { triggerCheckIn } from "./stats";

const Log = LogService("redux");

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    preferences: preferencesReducer,
    wallet: walletReducer,
    sync: syncReducer,
    exchangeRates: exchangeRateReducer,
    txHistory: txHistoryReducer,
    addresses: addressReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(syncMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// run actions needed to fire on app load
export function redux_init() {
  Log.debug("redux_init");
  store.dispatch(
    walletBoot({
      walletHash: selectActiveWalletHash(store.getState()),
      network: selectBchNetwork(store.getState()),
    })
  );
}

export function redux_post_init() {
  Log.debug("redux_post_init");
  store.dispatch(triggerCheckIn());
  store.dispatch(fetchExchangeRates(0));
}

export function redux_resume() {
  Log.debug("redux_resume");
  //store.dispatch(syncReconnect());
  store.dispatch(fetchExchangeRates(0));
}
