import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SyncOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import { selectScannerIsScanning } from "@/redux/device";
import { selectSyncState } from "@/redux/sync";
import WalletViewBalance from "./WalletViewBalance";
import SyncIndicator from "./SyncIndicator";
import BalanceHideButton from "./BalanceHideButton";

export default function WalletView() {
  const wallet = useSelector(selectActiveWallet);
  const isScanning = useSelector(selectScannerIsScanning);
  const { isConnected } = useSelector(selectSyncState);

  if (wallet.walletHash === "") {
    return (
      <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
        <SyncOutlined className="text-4xl" />
      </div>
    );
  }

  if (wallet.genesis_height === null && isConnected) {
    return (
      <Navigate
        to={`/settings/wallet/wizard/import/build/${wallet.walletHash}`}
      />
    );
  }

  return (
    <div className="flex flex-col justify-start h-full">
      {!isScanning && (
        <div className="flex bg-zinc-900 justify-between">
          <div className="flex flex-col justify-center px-5">
            <BalanceHideButton className="text-xl text-primary" />
          </div>
          <WalletViewBalance />
          <div className="flex flex-col justify-center px-5">
            <SyncIndicator />
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
}
