import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  BranchesOutlined,
  LockOutlined,
  ContainerOutlined,
  KeyOutlined,
} from "@ant-design/icons";

import * as bip39 from "bip39";
import {
  deriveHdPrivateNodeFromSeed,
  encodeHdPrivateKey,
  deriveHdPublicNode,
  encodeHdPublicKey,
  deriveHdPath,
} from "@bitauth/libauth";

import WalletManagerService from "@/services/WalletManagerService";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import ViewHeader from "@/layout/ViewHeader";
import Accordion from "@/atoms/Accordion";

import { selectBchNetwork } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./translations";
import { DEFAULT_DERIVATION_PATH } from "@/util/derivation";

export default function SettingsWalletAdditionalInformation() {
  const { walletHash } = useParams();

  const [isShowXpub, setIsShowXpub] = useState(false);
  const [isShowXprv, setIsShowXprv] = useState(false);

  const network = useSelector(selectBchNetwork);

  const WalletManager = WalletManagerService();
  const wallet = WalletManager.getWallet(walletHash);

  const derivationPath = wallet.derivation;

  const seed = bip39.mnemonicToSeedSync(wallet.mnemonic, wallet.passphrase);
  const hdMaster = deriveHdPrivateNodeFromSeed(seed);

  const hdPrivate = deriveHdPath(hdMaster, `${derivationPath}`);
  const xPrv = encodeHdPrivateKey({ node: hdPrivate, network });

  const hdPublic = deriveHdPublicNode(hdPrivate);
  const xPub = encodeHdPublicKey({ node: hdPublic, network });

  return (
    <>
      <ViewHeader
        icon={InfoCircleOutlined}
        title={translate(translations.additionalWalletInformation)}
      />
      <div className="p-2">
        <div className="flex flex-col justify-center items-center font-mono text-zinc-600 text-xs break-all text-center px-1 mb-2">
          <div>Wallet Hash</div>
          <div className="text-zinc-400 select-all">{wallet.walletHash}</div>
        </div>
        {wallet.passphrase !== "" && (
          <Accordion icon={KeyOutlined} title="Passphrase">
            <Accordion.Child>
              <div className="text-left font-mono font-bold">
                {wallet.passphrase}
              </div>
            </Accordion.Child>
          </Accordion>
        )}

        <Accordion
          icon={BranchesOutlined}
          title={translate(translations.derivationPathTitle)}
        >
          <Accordion.Child>
            <div className="text-left font-mono font-bold">
              {derivationPath}
            </div>
          </Accordion.Child>
          <Accordion.Child>
            <div className="text-left">
              {translate(translations.derivationPathExplanation)}{" "}
              <span className="font-mono text-sm">
                {DEFAULT_DERIVATION_PATH}
              </span>
            </div>
          </Accordion.Child>
        </Accordion>

        <Accordion icon={ContainerOutlined} title="xPub">
          <Accordion.Child>
            <div className="flex flex-col gap-y-2 text-left">
              {translate(translations.xPubDescription1)}{" "}
              <span className="font-bold text-underline">
                {translate(translations.xPubDescription2)}{" "}
                {translate(translations.xPubDescription3)}
              </span>
            </div>
          </Accordion.Child>
          <Accordion.Child>
            <div className="flex flex-col gap-y-1 w-full">
              <button
                type="button"
                onClick={async () => {
                  const isAuthorized =
                    isShowXpub ||
                    (await SecurityService().authorize(
                      AuthActions.RevealPrivateKeys
                    ));
                  if (!isAuthorized) {
                    return;
                  }
                  setIsShowXpub(!isShowXpub);
                }}
                className="rounded-lg p-3 bg-primary text-zinc-50 shadow-sm"
              >
                <div className="flex items-center">
                  {isShowXpub ? (
                    <EyeInvisibleOutlined className="text-2xl mr-1" />
                  ) : (
                    <EyeOutlined className="text-2xl mr-1" />
                  )}
                  <div className="text-lg font-medium flex-1 text-center">
                    {isShowXpub
                      ? translate(translations.hideXpub)
                      : translate(translations.revealXpub)}
                  </div>
                </div>
              </button>

              {isShowXpub && (
                <div className="mt-2 p-2 rounded-md border-2 border-zinc-300 text-left">
                  <div className="break-all font-mono select-all">{xPub}</div>
                </div>
              )}
            </div>
          </Accordion.Child>
        </Accordion>

        <Accordion icon={LockOutlined} title="xPrv">
          <Accordion.Child>
            <div className="flex flex-col gap-y-2 text-left">
              {translate(translations.xPrvDescription1)}{" "}
              <span className="font-bold text-underline">
                {translate(translations.xPrvDescription2)}{" "}
                <span className="text-red-500">
                  {translate(translations.xPrvDescription3)}
                </span>
              </span>
            </div>
          </Accordion.Child>

          <Accordion.Child>
            <div className="flex flex-col gap-y-1 w-full">
              <button
                type="button"
                onClick={async () => {
                  const isAuthorized =
                    isShowXprv ||
                    (await SecurityService().authorize(
                      AuthActions.RevealPrivateKeys
                    ));
                  if (!isAuthorized) {
                    return;
                  }

                  setIsShowXprv(!isShowXprv);
                }}
                className="rounded-lg p-3 bg-primary text-zinc-50 w-full shadow-sm"
              >
                <div className="flex items-center">
                  {isShowXprv && (
                    <EyeInvisibleOutlined className="text-2xl mr-1" />
                  )}
                  {!isShowXprv && <EyeOutlined className="text-2xl mr-1" />}
                  <div className="text-lg font-medium flex-1 text-center">
                    {isShowXprv
                      ? translate(translations.hideXprv)
                      : translate(translations.revealXprv)}
                  </div>
                </div>
              </button>

              {isShowXprv && (
                <div className="mt-2 p-2 rounded-md border-2 border-zinc-300 text-left">
                  <div className="break-all font-mono select-all">{xPrv}</div>
                </div>
              )}
            </div>
          </Accordion.Child>
        </Accordion>
      </div>
    </>
  );
}
