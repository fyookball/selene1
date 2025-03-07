import { Preferences } from "@capacitor/preferences";
import {
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { RootState } from "@/redux";
import { electrum_servers, ValidBchNetwork } from "@/util/electrum_servers";
import { languageList } from "@/util/translations";
import { currencyList } from "@/util/currency";
import { VALID_DENOMINATIONS } from "@/util/sats";
import CurrencyService from "@/services/CurrencyService";
import { AuthActions } from "@/services/SecurityService";

const defaultPreferences = {
  activeWalletHash: "",
  bchNetwork: "mainnet",
  languageCode: languageList[0].code,
  enableExperimental: "false",
  enablePrerelease: "false",
  lastCheckIn: "",
  lastExchangeRate: "1", // TODO #423: save exchange rates per block
  // --------
  authMode: "none",
  pinHash: "",
  authActions: "Any;Debug;RevealPrivateKeys;RevealBalance;SendTransaction",
  // --------
  localCurrency: currencyList[0].currency,
  preferLocalCurrency: "false",
  denomination: "bch",
  // --------
  allowInstantPay: "false",
  instantPayThreshold: "2000000", // 0.02 BCH (~$9 USD @ $450)
  instantPayThresholdFiat: "10", // $10 USD (default)
  // --------
  qrCodeLogo: "Selene",
  qrCodeBackground: "#ffffff",
  qrCodeForeground: "#000000",
  // --------
  displayExploreTab: "true",
  displayExchangeRate: "false",
  displaySyncCounter: "true",
  // --------
  // TODO #420: electrum peer db
  electrumServer: electrum_servers.mainnet[0],
  offlineMode: "false",
  // --------
  hideAvailableBalance: "false",
  enableDailyCheckIn: "true",
};

type ValidPreferences = typeof defaultPreferences;

// validatePreferences: ensures loaded preferences object won't lead to broken app state on load
// returns true/false
function validatePreferences(preferences: ValidPreferences): boolean {
  // lastExchangeRate must be numeric
  if (Number.isNaN(Number.parseFloat(preferences.lastExchangeRate))) {
    return false;
  }

  // languageCode must be in list of language codes
  if (!languageList.find((lang) => lang.code === preferences.languageCode)) {
    return false;
  }

  // localCurrency must be in list of currencies
  if (
    !currencyList.find(
      (currency) => currency.currency === preferences.localCurrency
    )
  ) {
    return false;
  }

  // ensure selected denomination is valid
  if (
    !VALID_DENOMINATIONS.map((d) => d.toLowerCase()).find(
      (d) => d === preferences.denomination
    )
  ) {
    return false;
  }

  // all authActions must be in AuthActions enum
  const authActions = preferences.authActions.split(";");
  if (
    authActions
      .map((a) =>
        Object.values(AuthActions)
          .map((aa) => aa.toString())
          .includes(a)
      )
      .filter((b) => b === false).length > 0
  ) {
    return false;
  }

  // force boolean strings
  const boolKeys = [
    "preferLocalCurrency",
    "hideAvailableBalance",
    "allowInstantPay",
    "enableExperimental",
    "enablePrerelease",
    "displayExchangeRate",
    "displayExploreTab",
    "displaySyncCounter",
    "enableDailyCheckIn",
    "offlineMode",
  ];

  const invalidBools = boolKeys.filter(
    (key) => preferences[key] !== "true" && preferences[key] !== "false"
  );

  if (invalidBools.length > 0) {
    return false;
  }

  return true;
}

// cleanupPreferences: removes all unknown/invalid preferences
async function cleanupPreferences(): Promise<void[]> {
  const knownKeys = (await Preferences.keys()).keys;
  const validKeys = Object.keys(defaultPreferences);

  const invalidKeys = knownKeys.filter(
    (known) => validKeys.indexOf(known) === -1
  );

  return Promise.all(
    invalidKeys.map(async (key) => {
      await Preferences.remove({ key });
    })
  );
}

async function retrievePreferences(): Promise<ValidPreferences> {
  // Preferences.clear();

  // remove any unused preferences first
  await cleanupPreferences();

  const keys = Object.keys(defaultPreferences);

  const preferences = (
    await Promise.all(
      keys.map(async (key) => {
        const current = (await Preferences.get({ key })).value;
        if (current === null) {
          await Preferences.set({ key, value: defaultPreferences[key] });
          const newest = (await Preferences.get({ key })).value;
          return { [key]: newest };
        }
        return { [key]: current };
      })
    )
  ).reduce((acc, cur) => {
    return { ...acc, ...cur };
  }, {}) as ValidPreferences;

  const isValidPreferences = await validatePreferences(preferences);
  if (!isValidPreferences) {
    await Preferences.clear();
    return retrievePreferences();
  }

  return preferences;
}

const initialState = await retrievePreferences();

export const setPreference = createAsyncThunk(
  "preferences/set",
  async (payload: { key: string; value: string }) => {
    // force string value
    const fixedPayload = { ...payload, value: payload.value.toString() };
    await Preferences.set(fixedPayload);

    // ensure redux state stays consistent with device state
    const result = {
      key: payload.key,
      value: (await Preferences.get({ key: payload.key })).value,
    };

    return result;
  }
);

export const resetPreferences = createAsyncThunk(
  "preferences/reset",
  async () => {
    // do not reset authMode or pinHash as that would allow adversaries to trivially bypass SecurityService
    const authMode =
      (await Preferences.get({ key: "authMode" })).value ||
      defaultPreferences.authMode;
    const pinHash =
      (await Preferences.get({ key: "pinHash" })).value ||
      defaultPreferences.pinHash;

    await Preferences.clear();

    await Preferences.set({ key: "authMode", value: authMode });
    await Preferences.set({ key: "pinHash", value: pinHash });

    const preferences = await retrievePreferences();
    return preferences;
  }
);

export const preferencesReducer = createReducer(initialState, (builder) => {
  builder.addCase(setPreference.fulfilled, (state, action) => {
    state[action.payload.key] = action.payload.value;
  });
  builder.addCase(resetPreferences.fulfilled, (state, action) => {
    return action.payload;
  });
});

export const selectPreferences = createSelector(
  (state: RootState) => state,
  (state) => state.preferences
);

export const selectActiveWalletHash = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => preferences.activeWalletHash
);

export const selectCurrencySettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    localCurrency: preferences.localCurrency,
    denomination: preferences.denomination,
    shouldPreferLocalCurrency: preferences.preferLocalCurrency === "true",
  })
);

export const selectInstantPaySettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    isInstantPayEnabled: preferences.allowInstantPay === "true",
    // always in sats
    instantPayThreshold:
      preferences.preferLocalCurrency === "true"
        ? CurrencyService(preferences.localCurrency).fiatToSats(
            preferences.instantPayThresholdFiat
          )
        : preferences.instantPayThreshold,
  })
);

export const selectQrCodeSettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    foreground: preferences.qrCodeForeground,
    background: preferences.qrCodeBackground,
    logo: preferences.qrCodeLogo,
  })
);

export const selectLanguageCode = createSelector(
  (state: RootState) => state.preferences,
  (preferences): string => preferences.languageCode
);

export const selectElectrumServer = createSelector(
  (state: RootState) => state.preferences,
  (preferences): string => preferences.electrumServer
);

export const selectBchNetwork = createSelector(
  (state: RootState) => state.preferences,
  (preferences): ValidBchNetwork => preferences.bchNetwork
);

export const selectIsOfflineMode = createSelector(
  (state) => state.preferences,
  (preferences): boolean => preferences.offlineMode === "true"
);

export const selectSecuritySettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    authMode: preferences.authMode,
    pinHash: preferences.pinHash,
    authActions: preferences.authActions.split(";"),
  })
);

export const selectUiSettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    shouldDisplayExchangeRate: preferences.displayExchangeRate === "true",
    shouldDisplayExploreTab: preferences.displayExploreTab === "true",
    shouldDisplaySyncCounter: preferences.displaySyncCounter === "true",
  })
);

export const selectPrivacySettings = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => ({
    shouldHideBalance: preferences.hideAvailableBalance === "true",
    isDailyCheckInEnabled: preferences.enableDailyCheckIn === "true",
  })
);

export const selectIsExperimental = createSelector(
  (state: RootState) => state.preferences,
  (preferences): boolean => preferences.enableExperimental === "true"
);

export const selectIsPrerelease = createSelector(
  (state: RootState) => state.preferences,
  (preferences): boolean =>
    preferences.enablePrerelease === "true" ||
    selectIsExperimental({ preferences })
);

export const selectLastCheckIn = createSelector(
  (state: RootState) => state.preferences,
  (preferences) => preferences.lastCheckIn
);
