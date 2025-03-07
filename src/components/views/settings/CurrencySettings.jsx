import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  DollarCircleOutlined,
  EuroCircleOutlined,
  TransactionOutlined,
  AccountBookOutlined,
} from "@ant-design/icons";

import { selectCurrencySettings } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";
import { currencyList } from "@/util/currency";
import { VALID_DENOMINATIONS } from "@/util/sats";

import Accordion from "@/atoms/Accordion";

export default function CurrencySettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);

  const { shouldPreferLocalCurrency, localCurrency, denomination } =
    useSelector(selectCurrencySettings);

  return (
    <Accordion
      icon={DollarCircleOutlined}
      title={translate(translations.currencySettings)}
    >
      <Accordion.Child
        icon={EuroCircleOutlined}
        label={translate(translations.localCurrency)}
      >
        <select
          className="p-2 bg-white rounded h-10 w-fit"
          value={localCurrency || ""}
          onChange={(event) =>
            handleSettingsUpdate("localCurrency", event.target.value)
          }
        >
          {currencyList
            .filter((c) => c.currency !== "BCH")
            .map((c) => (
              <option key={c.currency} value={c.currency}>
                {c.currency} {c.symbol}
              </option>
            ))}
        </select>
      </Accordion.Child>
      <Accordion.Child
        icon={TransactionOutlined}
        label={translate(translations.preferLocalCurrency)}
      >
        <input
          type="checkbox"
          checked={shouldPreferLocalCurrency}
          onChange={(event) =>
            handleSettingsUpdate("preferLocalCurrency", event.target.checked)
          }
        />
      </Accordion.Child>
      <Accordion.Child
        icon={AccountBookOutlined}
        label={translate(translations.denominateInSats)}
      >
        <select
          className="p-2 bg-white rounded h-10 w-24"
          value={denomination}
          onChange={(event) =>
            handleSettingsUpdate(
              "denomination",
              event.target.value.toLowerCase()
            )
          }
        >
          {VALID_DENOMINATIONS.map((d) => (
            <option key={d} id={d} value={d.toLowerCase()}>
              {d}
            </option>
          ))}
        </select>
      </Accordion.Child>
    </Accordion>
  );
}
