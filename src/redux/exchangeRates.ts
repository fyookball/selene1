/* eslint-disable @typescript-eslint/no-use-before-define */
import Logger from "js-logger";
import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { Preferences } from "@capacitor/preferences";

import {
  setPreference,
  selectCurrencySettings,
  selectIsOfflineMode,
} from "@/redux/preferences";
import CurrencyService from "@/services/CurrencyService";
import LogService from "@/services/LogService";
import { currencyList } from "@/util/currency";

const Log = LogService("redux/exchangeRates");

export const fetchExchangeRates = createAsyncThunk(
  "exchangeRates/fetch",
  // eslint-disable-next-line @typescript-eslint/default-param-last
  async (attempts: number = 0, thunkApi) => {
    const storedExchangeRates = selectExchangeRates(thunkApi.getState());

    const isOfflineMode = selectIsOfflineMode(thunkApi.getState());
    if (isOfflineMode) {
      Log.debug("exchangeRates/fetch blocked by offline mode");
      return storedExchangeRates;
    }

    const { localCurrency } = selectCurrencySettings(thunkApi.getState());
    const Currency = CurrencyService(localCurrency);

    try {
      const fetchedExchangeRates = await Currency.fetchExchangeRates();

      // persist exchange rate
      // TODO #423: save exchange rates per block
      const currentPrice = Currency.getExchangeRate(
        localCurrency,
        fetchedExchangeRates
      );
      thunkApi.dispatch(
        setPreference({
          key: "lastExchangeRate",
          value: currentPrice,
        })
      );

      return fetchedExchangeRates;
    } catch (e) {
      Logger.error("fetchExchangeRates failed", e);
      setTimeout(
        () => thunkApi.dispatch(fetchExchangeRates(attempts + 1)),
        30000 * (attempts + 1)
      );
      return storedExchangeRates;
    }
  }
);

const lastExchangeRate =
  (await Preferences.get({ key: "lastExchangeRate" })).value || 1;
Log.debug("lastExchangeRate", lastExchangeRate);
const initialState = currencyList.map((currency) => ({
  ...currency,
  price: lastExchangeRate,
}));

export const exchangeRateReducer = createReducer(initialState, (builder) => {
  builder.addCase(fetchExchangeRates.fulfilled, (state, action) => {
    return action.payload;
  });
});

export const selectExchangeRates = createSelector(
  (state) => state,
  (state) => state.exchangeRates
);

export function stripArsPostDecimal(localCurrency, fiatString) {
  // ARS users prefer not to see irrelevant post decimal values
  if (localCurrency === "ARS" && fiatString.includes(".")) {
    return fiatString.split(".")[0];
  }

  return fiatString;
}

export const selectCurrentPrice = createSelector(
  (state) => state,
  (state) => {
    const s = {
      exchangeRates: selectExchangeRates(state),
      currency: state.preferences.localCurrency,
      locale: state.device.locale,
    };

    const relevantCurrency = s.exchangeRates.find(
      (e) => e.currency === s.currency
    );
    const price = relevantCurrency?.price || "1";

    const priceString = `${Number(price).toLocaleString(s.locale, {
      style: "currency",
      currency: s.currency,
    })}`;

    return { price, priceString, currency: s.currency };
  }
);
