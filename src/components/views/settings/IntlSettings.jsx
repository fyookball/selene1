import { useContext } from "react";
import { GlobalOutlined, FlagOutlined } from "@ant-design/icons";

import { translate, languageList } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";

import Accordion from "@/atoms/Accordion";

export default function IntlSettings() {
  const { handleSettingsUpdate, preferences } = useContext(SettingsContext);
  return (
    <Accordion
      icon={GlobalOutlined}
      title={translate(translations.localizationSettings)}
    >
      <Accordion.Child
        icon={FlagOutlined}
        label={translate(translations.language)}
      >
        <select
          className="p-2 bg-white rounded h-10 w-48 w-full"
          value={preferences.languageCode || ""}
          onChange={(event) => {
            handleSettingsUpdate("languageCode", event.target.value);
          }}
        >
          {languageList.map(({ flag, code, name }) => (
            <option key={code} value={code}>
              {flag} {code.toUpperCase()} - {name}
            </option>
          ))}
        </select>
      </Accordion.Child>
    </Accordion>
  );
}
