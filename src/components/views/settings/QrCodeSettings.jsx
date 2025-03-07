import { useContext } from "react";
import {
  QrcodeOutlined,
  BorderOuterOutlined,
  BgColorsOutlined,
  SettingFilled,
  FormatPainterOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";

import Accordion from "@/atoms/Accordion";
import Button from "@/atoms/Button";

import { logos } from "@/util/logos";

export default function QrCodeSettings() {
  const { handleSettingsUpdate, preferences } = useContext(SettingsContext);

  const logoKey = preferences.qrCodeLogo.toLowerCase();

  const handleResetQrColors = () => {
    handleSettingsUpdate("qrCodeLogo", "selene");
    handleSettingsUpdate("qrCodeForeground", "#000000");
    handleSettingsUpdate("qrCodeBackground", "#ffffff");
  };

  return (
    <Accordion
      icon={QrcodeOutlined}
      title={translate(translations.qrCodeSettings)}
    >
      <Accordion.Child
        icon={BorderOuterOutlined}
        label={translate(translations.logo)}
      >
        <div className="flex items-center">
          {logoKey !== "none" && (
            <img src={logos[logoKey].img} className="w-8 h-8 mx-2" alt="" />
          )}
          <select
            className="rounded h-10 w-24 p-2 flex-1 bg-white"
            value={preferences.qrCodeLogo || ""}
            onChange={(event) =>
              handleSettingsUpdate("qrCodeLogo", event.target.value)
            }
          >
            {Object.keys(logos).map((l) => (
              <option key={l}>{logos[l].name}</option>
            ))}
          </select>
        </div>
      </Accordion.Child>
      <Accordion.Child
        icon={FormatPainterOutlined}
        label={translate(translations.foregroundColor)}
      >
        <div className="flex items-center">
          <SettingFilled
            className="text-3xl px-2"
            style={{ color: preferences.qrCodeForeground }}
          />
          <input
            type="color"
            className="rounded h-10 w-24 m-0 p-2 w-full"
            value={preferences.qrCodeForeground || ""}
            onChange={(event) =>
              handleSettingsUpdate("qrCodeForeground", event.target.value)
            }
          />
        </div>
      </Accordion.Child>
      <Accordion.Child
        icon={BgColorsOutlined}
        label={translate(translations.backgroundColor)}
      >
        <div className="flex items-center">
          <SettingFilled
            className="text-3xl px-2"
            style={{ color: preferences.qrCodeBackground }}
          />
          <input
            type="color"
            className="rounded h-10 w-24 m-0 p-2 w-full"
            value={preferences.qrCodeBackground || ""}
            onChange={(event) =>
              handleSettingsUpdate("qrCodeBackground", event.target.value)
            }
          />
        </div>
      </Accordion.Child>
      <Accordion.Child>
        <div className="text-right">
          <Button
            onClick={handleResetQrColors}
            icon={UndoOutlined}
            label={translate(translations.resetColors)}
          />
        </div>
      </Accordion.Child>
    </Accordion>
  );
}
