import { Link } from "react-router-dom";
import { WarningFilled } from "@ant-design/icons";

import WalletManagerService from "@/services/WalletManagerService";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function KeyWarning({ walletHash }: { walletHash: string }) {
  const wallet = WalletManagerService().getWalletMeta(walletHash);

  return wallet.key_viewed_at ? null : (
    <div className="mb-2 p-2">
      <Link to={`/settings/wallet/${wallet.walletHash}`}>
        <div className="alert alert-warning p-2 shadow-lg bg-warning text-black rounded-lg text-center border-primary border-2">
          <div className="text-xl flex items-center justify-center">
            <WarningFilled className="text-error text-4xl ml-2" />
            {translate(translations.backUpWallet)}
          </div>
        </div>
      </Link>
    </div>
  );
}
