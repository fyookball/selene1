/* eslint-disable no-await-in-loop */
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "@capacitor/dialog";
import {
  LockOutlined,
  PushpinOutlined,
  VerifiedOutlined,
  WalletOutlined,
  EyeInvisibleOutlined,
  SendOutlined,
  ThunderboltOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { setPreference, selectSecuritySettings } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";
import { selectDeviceInfo } from "@/redux/device";
import { SettingsContext } from "./SettingsContext";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import Accordion from "@/atoms/Accordion";
import Button from "@/atoms/Button";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import { sha256 } from "@/util/hash";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function SecuritySettings() {
  const dispatch = useDispatch();
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { authMode, pinHash, authActions } = useSelector(
    selectSecuritySettings
  );
  const { hasBiometric } = useSelector(selectDeviceInfo);

  const handleSetPin = async () => {
    const isAuthorized = await SecurityService().authorize(AuthActions.Any);
    if (isAuthorized || pinHash === "") {
      let pin = "";
      while (!pin) {
        pin = (
          await Dialog.prompt({
            title: translate(translations.enterNewPin),
            message: translate(translations.enterNewPinMessage),
            okButtonTitle: translate(translations.enterNewPinOkButtonTitle),
          })
        ).value;
      }
      const newPinHash = sha256.text(pin);

      const { value: confirmPin } = await Dialog.prompt({
        title: translate(translations.confirmNewPin),
        message: translate(translations.confirmNewPinMessage),
        okButtonTitle: translate(translations.confirmNewPinOkButtonTitle),
      });
      const confirmPinHash = sha256.text(confirmPin);

      if (newPinHash === confirmPinHash) {
        dispatch(setPreference({ key: "pinHash", value: newPinHash }));
      } else {
        await Dialog.alert({
          message: translate(translations.pinConfirmationDidNotMatch),
        });
      }
    }
  };

  const handleSetAuthActions = async (action) => {
    let newAuthActions;

    if (authActions.includes(action)) {
      // require auth to disable any auth setting
      const isAuthorized = await SecurityService().authorize(AuthActions.Any);
      if (!isAuthorized) {
        return;
      }
      newAuthActions = authActions.filter((a) => a !== action);
    } else {
      newAuthActions = [...authActions, action];
    }

    dispatch(
      setPreference({ key: "authActions", value: newAuthActions.join(";") })
    );
  };

  const activeWallet = useSelector(selectActiveWallet);
  const isWalletKeyViewed = activeWallet.key_viewed_at !== null;

  return (
    <Accordion icon={LockOutlined} title={translate(translations.security)}>
      <Accordion.Child
        icon={VerifiedOutlined}
        label={translate(translations.securityMode)}
        description={translate(translations.securityModeExplanation)}
      >
        {!isWalletKeyViewed ? (
          <KeyWarning walletHash={activeWallet.walletHash} />
        ) : (
          <select
            className="p-2 bg-white rounded h-10 w-fit"
            value={authMode}
            disabled={!isWalletKeyViewed}
            onChange={async (event) => {
              const { value } = event.target;

              let isAuthorized = false;
              const Security = SecurityService();
              // force biometric prompt if switching to bio
              if (hasBiometric && value === "bio") {
                isAuthorized = await Security.authorizeBio(AuthActions.Any);
              } else {
                isAuthorized = await Security.authorize(AuthActions.Any);
              }

              if (isAuthorized) {
                handleSettingsUpdate("authMode", value);
              }
            }}
          >
            <option value="none">{translate(translations.none)}</option>
            <option value="pin">{translate(translations.pin)}</option>
            {hasBiometric && (
              <option value="bio">{translate(translations.biometric)}</option>
            )}
          </select>
        )}
      </Accordion.Child>
      {authMode === "pin" && (
        <Accordion.Child>
          <div className="flex items-center justify-between">
            {pinHash === "" ? (
              <span className="text-error font-semibold">
                {translate(translations.pinNotSet)}
              </span>
            ) : (
              <span className="text-secondary font-semibold">
                {translate(translations.pinSet)}
              </span>
            )}
            <Button
              onClick={handleSetPin}
              icon={PushpinOutlined}
              label={translate(translations.resetPin)}
            />
          </div>
        </Accordion.Child>
      )}
      {authMode !== "none" && (pinHash !== "" || authMode === "bio") && (
        <>
          <div className="text-lg font-semibold bg-zinc-600 text-white p-1">
            Require authorization for:
          </div>
          <Accordion.Child
            icon={WalletOutlined}
            label={translate(translations.authWalletActivate)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.WalletActivate)}
              onChange={() => handleSetAuthActions(AuthActions.WalletActivate)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={EyeInvisibleOutlined}
            label={translate(translations.authRevealBalance)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.RevealBalance)}
              onChange={() => handleSetAuthActions(AuthActions.RevealBalance)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={SendOutlined}
            label={translate(translations.authSendTransaction)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.SendTransaction)}
              onChange={() => handleSetAuthActions(AuthActions.SendTransaction)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={ThunderboltOutlined}
            label={translate(translations.authInstantPay)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.InstantPay)}
              onChange={() => handleSetAuthActions(AuthActions.InstantPay)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={KeyOutlined}
            label={translate(translations.authRevealPrivateKeys)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.RevealPrivateKeys)}
              disabled={authActions.includes(AuthActions.RevealPrivateKeys)}
              onChange={() =>
                handleSetAuthActions(AuthActions.RevealPrivateKeys)
              }
            />
          </Accordion.Child>
        </>
      )}
    </Accordion>
  );
}
