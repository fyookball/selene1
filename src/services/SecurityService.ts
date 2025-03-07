import { Dialog } from "@capacitor/dialog";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import LogService from "@/services/LogService";
import ToastService from "@/services/ToastService";
import { store } from "@/redux";
import { selectSecuritySettings } from "@/redux/preferences";
import { sha256 } from "@/util/hash";

const Log = LogService("SecurityService");

export enum AuthActions {
  Any = "Any",
  Debug = "Debug",
  AppOpen = "AppOpen",
  WalletActivate = "WalletActivate",
  SendTransaction = "SendTransaction",
  InstantPay = "InstantPay",
  RevealBalance = "RevealBalance",
  RevealPrivateKeys = "RevealPrivateKeys",
}

const authText = {
  [AuthActions.Any]: "",
  [AuthActions.Debug]: "Debug",
  [AuthActions.AppOpen]: "Open App",
  [AuthActions.WalletActivate]: "Activate Wallet",
  [AuthActions.SendTransaction]: "Send Transaction",
  [AuthActions.InstantPay]: "Instant Pay",
  [AuthActions.RevealBalance]: "Reveal Balances",
  [AuthActions.RevealPrivateKeys]: "Reveal Private Keys",
};

export default function SecurityService() {
  return {
    authorize,
    authorizeBio,
  };

  // authorize user according to user preference
  async function authorize(
    action: AuthActions = AuthActions.Any
  ): Promise<boolean> {
    const { authMode, authActions } = selectSecuritySettings(store.getState());

    const isAuthRequired = authActions.includes(action);

    if (!isAuthRequired) {
      return true;
    }

    let isAuthorized = false;
    switch (authMode) {
      case "bio":
        isAuthorized = await authorizeBio(action);
        break;

      case "pin":
        isAuthorized = await authorizePin(action);
        break;

      case "none":
        isAuthorized = true;
        break;

      default:
        isAuthorized = false;
        break;
    }

    if (!isAuthorized) {
      ToastService().authFail(authText[action]);
    }

    return isAuthorized;
  }

  async function authorizeBio(
    action: AuthActions = AuthActions.Any
  ): Promise<boolean> {
    let isAuthorized = false;

    const { isAvailable, errorCode } = await NativeBiometric.isAvailable({
      useFallback: false,
    });
    const { isAvailable: isFallbackAvailable } =
      await NativeBiometric.isAvailable({ useFallback: true });

    Log.log("Biometric", isAvailable, errorCode);

    if (isAvailable || isFallbackAvailable) {
      try {
        const isSuccess = await NativeBiometric.verifyIdentity({
          reason: "Authorize this action",
          title: "Selene Wallet",
          subtitle: "Please authorize this action.",
          description: authText[action],
          useFallback: !isAvailable && isFallbackAvailable,
        })
          .then(() => true)
          .catch(() => false);

        isAuthorized = isSuccess;
      } catch (e) {
        Log.warn(e);
      }
    }

    return isAuthorized;
  }

  async function authorizePin(action: AuthActions = AuthActions.Any) {
    let isAuthorized = false;

    const { pinHash: storedPinHash } = selectSecuritySettings(store.getState());

    // if PIN is not set, allow authorization
    if (storedPinHash === "") {
      return true;
    }

    const { value: pin } = await Dialog.prompt({
      title: authText[action] || "Enter PIN",
      message: "Please enter your PIN.",
      okButtonTitle: `Authorize ${authText[action]}`,
    });

    const inputPinHash = sha256.text(pin);

    if (inputPinHash === storedPinHash) {
      isAuthorized = true;
    }

    return isAuthorized;
  }
}
