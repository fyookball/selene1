import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  WalletOutlined,
  WalletFilled,
  CompassOutlined,
  CompassFilled,
  BankOutlined,
  BankFilled,
  SettingOutlined,
  SettingFilled,
} from "@ant-design/icons";

import {
  selectLanguageCode,
  selectIsExperimental,
  selectUiSettings,
} from "@/redux/preferences";
import { selectKeyboardIsOpen, selectScannerIsScanning } from "@/redux/device";

import translations from "./bottomNavigationTranslations";
import { translate } from "@/util/translations";

export default function BottomNavigation() {
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);
  const isExperimental = useSelector(selectIsExperimental);
  const { shouldDisplayExploreTab } = useSelector(selectUiSettings);

  // Ensure component reloads when language preferences are changed
  useSelector(selectLanguageCode);

  return !isKeyboardOpen ? (
    <div
      className={`w-full flex items-center justify-around z-30 ${isScanning ? "opacity-0" : ""}`}
    >
      <NavButton
        to="/wallet"
        activeIcon={WalletFilled}
        icon={WalletOutlined}
        label={translate(translations.wallet)}
      />
      {isExperimental && (
        <NavButton
          to="/assets"
          activeIcon={BankFilled}
          icon={BankOutlined}
          label="Assets"
        />
      )}
      {shouldDisplayExploreTab && (
        <NavButton
          to="/explore"
          activeIcon={CompassFilled}
          icon={CompassOutlined}
          label={translate(translations.explore)}
        />
      )}
      <NavButton
        to="/settings"
        activeIcon={SettingFilled}
        icon={SettingOutlined}
        label={translate(translations.settings)}
      />
    </div>
  ) : null;
}

interface NavButtonProps {
  to: string;
  icon: React.ComponentType;
  activeIcon: React.ComponentType;
  label: string;
}

function NavButton({
  to = "",
  icon = () => null,
  activeIcon = () => null,
  label = "",
}: NavButtonProps) {
  const Icon = icon;
  const ActiveIcon = activeIcon;

  const baseClasses = "bg-zinc-900 text-primary border-primary w-full h-16 p-2";
  const activeClasses = "active border-t-4";
  const iconClasses = "text-2xl";

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
      }
    >
      {({ isActive }) => (
        <>
          <div className="text-center">
            {isActive ? (
              <ActiveIcon className={iconClasses} />
            ) : (
              <Icon className={iconClasses} />
            )}
          </div>
          <div className="text-center text-sm">{label}</div>
        </>
      )}
    </NavLink>
  );
}
