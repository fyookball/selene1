import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { SettingOutlined } from "@ant-design/icons";

import {
  selectPreferences,
  setPreference,
  selectActiveWalletHash,
} from "@/redux/preferences";

import ViewHeader from "@/layout/ViewHeader";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";

import { translate } from "@/util/translations";
import translations from "./translations";

import { logos } from "@/util/logos";
import { SELENE_WALLET_VERSION } from "@/util/version";

import { SettingsContext } from "./SettingsContext";

import WalletSettings from "./WalletSettings";
import CurrencySettings from "./CurrencySettings";
import PaymentSettings from "./PaymentSettings";
import QrCodeSettings from "./QrCodeSettings";
import IntlSettings from "./IntlSettings";
import NetworkSettings from "./NetworkSettings";
import SecuritySettings from "./SecuritySettings";
import UiSettings from "./UiSettings";
import PrivacySettings from "./PrivacySettings";

export default function SettingsView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);

  const handleSettingsUpdate = useCallback(
    (key, value) => {
      dispatch(setPreference({ key, value }));
    },
    [dispatch]
  );

  const settingsContext = useMemo(
    () => ({
      handleSettingsUpdate,
      preferences,
      dispatch,
    }),
    [dispatch, preferences, handleSettingsUpdate]
  );

  const activeWalletHash = useSelector(selectActiveWalletHash);

  return (
    <>
      <ViewHeader
        icon={SettingOutlined}
        title={translate(translations.settings)}
      />
      <div className="h-full">
        <div className="p-1">
          <SettingsContext.Provider value={settingsContext}>
            <KeyWarning walletHash={activeWalletHash} />
            <WalletSettings />
            <SecuritySettings />
            <CurrencySettings />
            <PaymentSettings />
            <QrCodeSettings />
            <UiSettings />
            <NetworkSettings />
            <PrivacySettings />
            <IntlSettings />
          </SettingsContext.Provider>
        </div>
        <div className="w-fit mx-auto px-2 py-0.5 shadow-sm rounded-full bg-primary text-white active:bg-white active:text-primary">
          <Link
            to="/credits"
            className="w-fit mx-auto my-2 flex items-center justify-center"
          >
            <img src={logos.selene.img} className="w-11 h-11 mr-1" alt="" />
            <span className="text-sm font-semibold">
              Selene Wallet v{SELENE_WALLET_VERSION}
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
