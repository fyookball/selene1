import { useState, useContext } from "react";
import { useSelector } from "react-redux";
import {
  SendOutlined,
  ThunderboltOutlined,
  PropertySafetyOutlined,
} from "@ant-design/icons";

import {
  selectInstantPaySettings,
  selectCurrencySettings,
} from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";

import CurrencyService from "@/services/CurrencyService";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import Accordion from "@/atoms/Accordion";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import { SatoshiInput } from "@/atoms/SatoshiInput";

export default function PaymentSettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );
  const { localCurrency, shouldPreferLocalCurrency } = useSelector(
    selectCurrencySettings
  );

  const Currency = CurrencyService(localCurrency);

  const [instantPaySatInput, setInstantPaySatInput] =
    useState(instantPayThreshold);

  const handleInstantPayInput = (satInput) => {
    const instantPaySettingsKey = shouldPreferLocalCurrency
      ? "instantPayThresholdFiat"
      : "instantPayThreshold";

    const instantPaySettingsValue = shouldPreferLocalCurrency
      ? Currency.satsToFiat(satInput)
      : satInput;

    setInstantPaySatInput(satInput);
    handleSettingsUpdate(instantPaySettingsKey, instantPaySettingsValue);
  };

  return (
    <Accordion
      icon={SendOutlined}
      title={translate(translations.paymentSettings)}
    >
      <Accordion.Child
        icon={ThunderboltOutlined}
        label={translate(translations.allowInstantPay)}
      >
        <input
          type="checkbox"
          checked={isInstantPayEnabled}
          onChange={async (event) => {
            const { checked: isChecked } = event.target;
            const Security = SecurityService();
            const isAuthorized =
              isInstantPayEnabled === true ||
              (await Security.authorize(AuthActions.InstantPay)) ||
              (await Security.authorize(AuthActions.SendTransaction));

            if (isAuthorized) {
              handleSettingsUpdate("allowInstantPay", isChecked);
            }
          }}
        />
      </Accordion.Child>
      <Accordion.Child
        icon={PropertySafetyOutlined}
        label={translate(translations.instantPayLimit)}
        description={translate(translations.instantPayExplanation)}
      >
        <span className="text-zinc-600 flex items-center">
          <CurrencySymbol className="font-bold text-lg" />
          <SatoshiInput
            satoshis={instantPaySatInput}
            className="p-2 w-28 rounded mx-1 flex-1"
            onChange={handleInstantPayInput}
          />
        </span>
      </Accordion.Child>
    </Accordion>
  );
}
