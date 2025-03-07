import { Outlet } from "react-router-dom";
import { PlusCircleOutlined } from "@ant-design/icons";

import ViewHeader from "@/layout/ViewHeader";
import { logos } from "@/util/logos";
import { translate } from "@/util/translations";
import translations from "./translations";

const { createImportWallet } = translations;

export default function SettingsWalletWizard() {
  return (
    <>
      <ViewHeader
        icon={PlusCircleOutlined}
        title={translate(createImportWallet)}
      />
      <div className="flex items-center justify-center p-4 h-40 bg-zinc-800">
        <img src={logos.selene.img} className="h-full" alt="" />
      </div>
      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
}
