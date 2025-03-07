import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";

import {
  WalletOutlined,
  LoginOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  WarningFilled,
  ToolOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  ExportOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import {
  selectActiveWalletHash,
  selectBchNetwork,
  selectIsExperimental,
} from "@/redux/preferences";
import { walletBoot, walletSetName } from "@/redux/wallet";
import { selectLocale } from "@/redux/device";

import ViewHeader from "@/layout/ViewHeader";

import DatabaseService from "@/services/DatabaseService";
import WalletManagerService from "@/services/WalletManagerService";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import ShowMnemonic from "@/atoms/ShowMnemonic";
import Accordion from "@/atoms/Accordion";
import Satoshi from "@/atoms/Satoshi";
import Editable from "@/atoms/Editable";
import Button from "@/atoms/Button";

import WalletSettings from "@/views/settings/WalletSettings";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function SettingsWalletView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const bchNetwork = useSelector(selectBchNetwork);

  const { walletHash } = useParams();

  const WalletManager = useMemo(() => WalletManagerService(), []);
  const [wallet, setWallet] = useState(WalletManager.getWalletMeta(walletHash));

  useEffect(
    function setWalletMeta() {
      setWallet(WalletManager.getWalletMeta(walletHash));
    },
    [walletHash, WalletManager, wallet.name]
  );

  const activeWalletHash = useSelector(selectActiveWalletHash);
  const isActiveWallet = wallet.walletHash === activeWalletHash;

  const locale = useSelector(selectLocale);

  const shouldShowAdvancedOptions =
    wallet.key_viewed_at !== null && isActiveWallet;

  const isExperimental = useSelector(selectIsExperimental);

  const [isActivating, setIsActivating] = useState(false);

  // user must tap "delete wallet" button multiple times to confirm
  const [deleteConfirm, setDeleteConfirm] = useState(0);
  const deleteRef = useRef(setTimeout(() => {}, 0));
  const isDeleteDisabled = deleteConfirm === 2 && wallet.key_viewed_at === null;

  // handler for "Delete Wallet" button
  const handleDeleteWallet = async () => {
    setDeleteConfirm((deleteConfirm + 1) % 4);

    // on 4th press, delete wallet and "reboot" app
    if (deleteConfirm === 3) {
      const isAuthorized = await SecurityService().authorize();
      if (!isAuthorized) {
        return;
      }

      await WalletManager.deleteWallet(wallet.walletHash);
      dispatch(walletBoot({ walletHash: "", network: bchNetwork })).then(() =>
        navigate("/")
      );
    } else {
      // if user hesitates, reset the counter
      clearTimeout(deleteRef.current);
      deleteRef.current = setTimeout(
        () => {
          setDeleteConfirm(0);
        },
        3250 + deleteConfirm * 600
      ); // give them time to read the prompts though
    }
  };

  // handler for "Activate Wallet" button
  const handleActivateWallet = async () => {
    const isAuthorized = await SecurityService().authorize(
      AuthActions.WalletActivate
    );

    if (!isAuthorized) {
      return;
    }

    setIsActivating(true);

    dispatch(
      walletBoot({ walletHash: wallet.walletHash, network: bchNetwork })
    ).then(async () => {
      await DatabaseService().flushHandles(true);
      navigate("/");
    });
  };

  // handler for wallet name edit button
  const handleEditConfirm = async (input) => {
    await WalletManager.setWalletName(walletHash, input);

    if (walletHash === activeWalletHash) {
      dispatch(walletSetName(input));
    }

    setWallet(WalletManager.getWalletMeta(walletHash));
  };

  // handler for "rebuild wallet" button
  const handleRebuildWallet = () => {
    navigate(`/settings/wallet/wizard/import/build/${wallet.walletHash}`);
  };

  const handleExportWallet = async () => {
    const { uri } = await Filesystem.getUri({
      path: `/selene/wallets/${wallet.walletHash}.wallet.json`,
      directory: Directory.Library,
    });

    await Share.share({
      dialogTitle: `Export Wallet (${wallet.name})`,
      url: uri,
    });
  };

  /*
   const handleImportWallet = () => {
    // spawn file picker
  };
  */

  const activateButtonIcon = useCallback(() => {
    let Icon;
    if (isActivating) {
      Icon = LoadingOutlined;
    } else if (wallet.walletHash === activeWalletHash) {
      Icon = CheckCircleOutlined;
    } else {
      Icon = LoginOutlined;
    }

    return <Icon className="text-white text-2xl mr-2" />;
  }, [wallet.walletHash, activeWalletHash, isActivating]);

  const activateButtonLabel = isActiveWallet
    ? translate(translations.walletActive)
    : translate(translations.activateWallet);

  const deleteButtonIcon = useCallback(() => {
    return deleteConfirm > 0 ? (
      <WarningFilled className="text-2xl mr-1 text-yellow-300" />
    ) : (
      <DeleteOutlined className="text-2xl mr-1" />
    );
  }, [deleteConfirm]);

  const deleteButtonLabel =
    /* eslint-disable no-nested-ternary */
    deleteConfirm === 0
      ? translate(translations.deleteWallet)
      : deleteConfirm === 1
        ? translate(translations.areYouSure)
        : deleteConfirm === 2
          ? translate(translations.ensureRecoveryPhrase)
          : `${translate(translations.confirmDelete)} "${wallet.name}"`;
  /* eslint-enable no-nested-ternary */

  return (
    <>
      <ViewHeader
        icon={WalletOutlined}
        title={translate(translations.walletSettings)}
      />
      <div className="p-2">
        <div className="p-3 rounded-lg bg-zinc-200">
          <div className="text-2xl">
            <Editable onConfirm={handleEditConfirm} value={wallet.name} />
          </div>
          <div className="text-lg text-center text-zinc-600">
            {translate(translations.created)}{" "}
            {new Date(wallet.created_at).toLocaleString(locale)}
          </div>
          {wallet.balance > 0 && (
            <div className="text-lg text-center text-zinc-500">
              {translate(translations.lastKnownBalance)}:{" "}
              <Satoshi value={wallet.balance} />
            </div>
          )}
        </div>

        <div className="my-2 flex gap-x-2">
          <div className="text-center flex-1">
            <Button
              icon={activateButtonIcon}
              label={activateButtonLabel}
              labelColor={`zinc-50 ${isActiveWallet ? "saturate-[.60]" : ""}`}
              bgColor="primary"
              rounded="lg"
              fullWidth
              onClick={handleActivateWallet}
              disabled={isActiveWallet}
            />
          </div>
          <div className="text-center flex-1">
            <Button
              icon={deleteButtonIcon}
              label={deleteButtonLabel}
              labelColor={`zinc-50 ${isDeleteDisabled ? "saturate-[.60]" : ""}`}
              bgColor="error"
              activeBgColor="error"
              borderClasses="border border-2 border-error"
              rounded="lg"
              fullWidth
              onClick={handleDeleteWallet}
              disabled={isDeleteDisabled}
            />
          </div>
        </div>

        <WalletSettings />
        <KeyWarning walletHash={wallet.walletHash} />
        <ShowMnemonic walletHash={wallet.walletHash} />
        {
          /* Only show "Advanced Options" if user has viewed (TODO: verified) their recovery phrase */
          shouldShowAdvancedOptions && (
            <Accordion
              icon={ToolOutlined}
              title={translate(translations.advancedOptions)}
            >
              <Accordion.Child icon={null} label="">
                <Link
                  className="w-full text-left flex items-center"
                  to={`/settings/wallet/${wallet.walletHash}/additionalInformation`}
                >
                  <InfoCircleOutlined className="text-xl mr-1" />
                  {translate(translations.additionalWalletInformation)}
                </Link>
              </Accordion.Child>
              {isExperimental && (
                <Accordion.Child icon={null} label="">
                  <Link
                    className="w-full text-left flex items-center"
                    to="scan"
                  >
                    <SyncOutlined className="text-xl mr-1" />
                    {translate(translations.addressScanTool)}
                  </Link>
                </Accordion.Child>
              )}
              <Accordion.Child icon={null} label="">
                <button
                  type="button"
                  className="w-full text-left flex items-center"
                  onClick={handleRebuildWallet}
                >
                  <MedicineBoxOutlined className="text-xl mr-1" />
                  {translate(translations.rebuildWallet)}
                </button>
              </Accordion.Child>
              {/*isExperimental && (
                <Accordion.Child icon={null} label="">
                  <button
                    type="button"
                    className="w-full text-left flex items-center"
                    onClick={handleImportWallet}
                  >
                    <ImportOutlined className="text-xl mr-1" />
                    {translate(translations.importWallet)}
                  </button>
                </Accordion.Child>
              )*/}
              {isExperimental && (
                <Accordion.Child icon={null} label="">
                  <button
                    type="button"
                    className="w-full text-left flex items-center"
                    onClick={handleExportWallet}
                  >
                    <ExportOutlined className="text-xl mr-1" />
                    {translate(translations.exportWallet)}
                  </button>
                </Accordion.Child>
              )}
            </Accordion>
          )
        }
      </div>
    </>
  );
}
