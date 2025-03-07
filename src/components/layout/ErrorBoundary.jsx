import { useRouteError, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BugOutlined } from "@ant-design/icons";
import SeleneLogo from "@/components/atoms/SeleneLogo";
import Accordion from "@/components/atoms/Accordion";
import ShowMnemonic from "@/components/atoms/ShowMnemonic";

import LogService from "@/services/LogService";
import ConsoleService from "@/services/ConsoleService";
import WalletManagerService from "@/services/WalletManagerService";

import { selectActiveWallet } from "@/redux/wallet";
import { resetPreferences } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./ErrorBoundaryTranslations";

const Log = LogService("ErrorBoundary");

export default function ErrorBoundary() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = useRouteError();
  Log.error(error.message);

  const wallet = useSelector(selectActiveWallet);

  const handleRestartApp = () => {
    window.location.assign("/");
  };

  const handleRebuildWallet = async () => {
    await WalletManagerService().clearWalletData(wallet.walletHash);

    navigate(`/settings/wallet/wizard/import/build/${wallet.walletHash}`);
  };

  const handleResetPreferences = () => {
    dispatch(resetPreferences());
  };

  const handleSendDiagnosticInfo = () => ConsoleService().exportLogs();

  return (
    <>
      <div className="text-2xl p-1 bg-zinc-900 text-zinc-300 font-bold flex items-center">
        <span>
          <SeleneLogo className="h-14 mr-2" />
        </span>
        <span className="flex-1">{translate(translations.somethingWrong)}</span>
      </div>
      <div className="p-2">
        <div className="bg-zinc-200 p-2 rounded my-1">
          <div className="text-xl font-bold mb-2">
            {translate(translations.hereCanTry)}:
          </div>
          <div className="flex items-center gap-x-1">
            <button
              type="button"
              className="bg-primary rounded text-white p-1 flex-1"
              onClick={handleRestartApp}
            >
              {translate(translations.restartApp)}
            </button>
            <button
              type="button"
              className="bg-primary rounded text-white p-1 flex-1"
              onClick={handleResetPreferences}
            >
              {translate(translations.resetSettings)}
            </button>
            <button
              type="button"
              className="bg-primary rounded text-white p-1 flex-1"
              onClick={handleRebuildWallet}
            >
              {translate(translations.rebuildWallet)}
            </button>
            <button
              type="button"
              className="bg-primary rounded text-white p-1"
              onClick={handleSendDiagnosticInfo}
            >
              Export Logs
            </button>
          </div>
        </div>
        <Accordion
          icon={BugOutlined}
          title={translate(translations.errorMessage)}
        >
          <Accordion.Child icon={null} label="">
            <div className="font-mono bg-zinc-100 p-2 text-left">
              {error.message}
            </div>
            {/*<div className="font-mono">{error.stack}</div>*/}
          </Accordion.Child>
        </Accordion>
        <ShowMnemonic walletHash={wallet.walletHash} />
      </div>
    </>
  );
}
