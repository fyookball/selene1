import { useContext } from "react";
import { useSelector } from "react-redux";
import {
  AreaChartOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { selectPrivacySettings } from "@/redux/preferences";
import Accordion from "@/atoms/Accordion";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import { translate } from "@/util/translations";
import translations from "./translations";
import { SettingsContext } from "./SettingsContext";

const { privacySettings, sendDailyCheckIn } = translations;

export default function PrivacySettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { shouldHideBalance, isDailyCheckInEnabled } = useSelector(
    selectPrivacySettings
  );

  return (
    <Accordion icon={EyeInvisibleOutlined} title={translate(privacySettings)}>
      <Accordion.Child
        icon={shouldHideBalance ? EyeInvisibleOutlined : EyeOutlined}
        label={translate(translations.hideAvailableBalance)}
      >
        <input
          type="checkbox"
          checked={shouldHideBalance}
          onChange={async (event) => {
            const { checked: isChecked } = event.target;
            const isAuthorized =
              shouldHideBalance === false ||
              (await SecurityService().authorize(AuthActions.RevealBalance));

            if (isAuthorized) {
              handleSettingsUpdate("hideAvailableBalance", isChecked);
            }
          }}
        />
      </Accordion.Child>
      <Accordion.Child
        icon={AreaChartOutlined}
        label={translate(sendDailyCheckIn)}
      >
        <input
          type="checkbox"
          checked={isDailyCheckInEnabled}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            handleSettingsUpdate("enableDailyCheckIn", isChecked);
          }}
        />
      </Accordion.Child>
    </Accordion>
  );
}
