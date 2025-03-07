import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  WalletOutlined,
  PlusCircleFilled,
  RightCircleOutlined,
  CheckCircleFilled,
  WarningFilled,
} from "@ant-design/icons";

import { selectActiveWalletHash } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./translations";

import Accordion from "@/atoms/Accordion";
import WalletManagerService from "@/services/WalletManagerService";

export default function WalletSettings() {
  const walletList = WalletManagerService().listWallets();
  const activeWalletHash = useSelector(selectActiveWalletHash);

  const { walletHash: selectedWalletHash } = useParams();

  return (
    <Accordion
      icon={WalletOutlined}
      title={translate(translations.walletSettings)}
    >
      <Link
        to="/settings/wallet/wizard"
        className="w-full block p-2 flex items-center"
      >
        <PlusCircleFilled className="text-xl mr-1" />
        {translate(translations.createImportWallet)}
      </Link>
      {walletList.map((w) => (
        <Link
          key={w.walletHash}
          to={`/settings/wallet/${w.walletHash}`}
          className="w-full block p-2 flex items-center"
          replace
        >
          {w.walletHash === selectedWalletHash && (
            <RightCircleOutlined className="text-xl mr-1 text-secondary" />
          )}
          {w.walletHash === activeWalletHash && (
            <CheckCircleFilled className="text-xl mr-1 text-primary" />
          )}

          {w.key_viewed_at === null && (
            <WarningFilled className="text-xl mr-1 text-error" />
          )}
          {w.name}
        </Link>
      ))}
    </Accordion>
  );
}
