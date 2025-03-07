import { useNavigate } from "react-router-dom";
import { PlusCircleOutlined, ImportOutlined } from "@ant-design/icons";

import Button from "@/atoms/Button";

import WalletManagerService from "@/services/WalletManagerService";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function SettingsWalletWizardInit() {
  const navigate = useNavigate();

  const handleCreateWallet = async () => {
    const wallet = await WalletManagerService().createWallet(
      translate(translations.newWallet)
    );
    navigate(`/settings/wallet/${wallet.walletHash}`, { replace: true });
  };

  const handleImportWallet = () => {
    navigate(`/settings/wallet/wizard/import`, { replace: true });
  };

  return (
    <div className="flex flex-col gap-y-8">
      <Button
        label={translate(translations.createNewWallet)}
        labelSize="lg"
        icon={PlusCircleOutlined}
        iconSize="2xl"
        borderClasses=""
        rounded
        onClick={handleCreateWallet}
        fullWidth
        inverted
      />
      <Button
        label={translate(translations.importWalletFromPhrase)}
        labelSize="lg"
        icon={ImportOutlined}
        iconSize="2xl"
        rounded
        bgColor="secondary"
        onClick={handleImportWallet}
        fullWidth
      />
    </div>
  );
}
