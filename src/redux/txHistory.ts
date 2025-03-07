/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectCurrencySettings } from "@/redux/preferences";

import LogService from "@/services/LogService";
import TransactionHistoryService from "@/services/TransactionHistoryService";

const Log = LogService("redux/txHistory");

export const txHistoryFetch = createAsyncThunk(
  "txHistory/fetch",
  async (payload, thunkApi) => {
    const wallet = selectActiveWallet(thunkApi.getState());
    const { localCurrency } = selectCurrencySettings(thunkApi.getState());

    const txHistory = await TransactionHistoryService(
      wallet,
      localCurrency
    ).resolveTransactionHistory();

    Log.debug("txHistory resolved", txHistory);
    return txHistory;
  }
);

const initialState = { history: [] };

export const txHistoryReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(txHistoryFetch.pending, (state) => {
      state.history = initialState.history;
    })
    .addCase(txHistoryFetch.fulfilled, (state: RootState, action) => {
      state.history = action.payload;
    });
});

export const selectTransactionHistory = createSelector(
  (state) => state.txHistory,
  (txHistory) => txHistory.history
);
