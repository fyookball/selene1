import { useState } from "react";
import { useDispatch } from "react-redux";
import { WarningFilled, EyeInvisibleOutlined } from "@ant-design/icons";

import { walletSetKeyViewed } from "@/redux/wallet";
import WalletManagerService from "@/services/WalletManagerService";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import { translate } from "@/util/translations";
import translations from "@/components/views/settings/SettingsWalletView/translations";

export default function ShowMnemonic({ walletHash }: { walletHash: string }) {
  const dispatch = useDispatch();
  const WalletManager = WalletManagerService();

  // toggle visibility for recovery phrase
  const [shouldShowRecoveryPhrase, setShouldShowRecoveryPhrase] =
    useState(false);
  const [mnemonic, setMnemonic] = useState("");

  // handler for mnemonic visibility area
  const handleShowMnemonic = async () => {
    if (shouldShowRecoveryPhrase === false) {
      const isAuthorized = await SecurityService().authorize(
        AuthActions.RevealPrivateKeys
      );
      if (!isAuthorized) {
        return;
      }

      await WalletManager.openWalletDatabase(walletHash);
      const { mnemonic: m } = WalletManager.getWallet(walletHash);

      setShouldShowRecoveryPhrase(true);
      setMnemonic(m);
      dispatch(walletSetKeyViewed({ walletHash }));
    } else {
      setMnemonic("");
      setShouldShowRecoveryPhrase(false);
    }
  };

  const wallet = WalletManager.getWalletMeta(walletHash);

  const isKeyViewed = wallet.key_viewed_at !== null;
  const keyNotViewedClasses = isKeyViewed
    ? "bg-zinc-700"
    : "border border-4 rounded-lg border-primary bg-primary";

  return (
    <button
      type="button"
      className={`w-full flex-col rounded-lg flex items-center justify-center my-2 px-2 py-4 cursor-pointer ${keyNotViewedClasses}`}
      onClick={handleShowMnemonic}
    >
      {shouldShowRecoveryPhrase ? (
        <div className="flex flex-col justify-between items-center">
          <div className="text-center text-error text-xl font-bold">
            <WarningFilled className="mr-2 text-warning" />
            {translate(translations.keepSecret)}
            <WarningFilled className="ml-2 text-warning" />
          </div>
          <div className="text-center text-zinc-50 text-xl font-mono py-4">
            {mnemonic}
          </div>
          <div className="text-center text-error text-xl font-bold">
            <WarningFilled className="mr-2 text-warning" />
            {translate(translations.dontStoreDigitally)}
            <WarningFilled className="ml-2 text-warning" />
          </div>
        </div>
      ) : (
        <>
          <EyeInvisibleOutlined className="text-8xl text-zinc-50" />
          <div className="text-center text-zinc-50 text-xl">
            {translate(translations.viewRecoveryPhrase)}
          </div>
          <div className="text-center text-zinc-200 text-lg opacity-90">
            ({translate(translations.secretAndSecure)})
          </div>
        </>
      )}
    </button>
  );
}
