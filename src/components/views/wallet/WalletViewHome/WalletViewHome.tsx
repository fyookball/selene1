import { useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";

import { Clipboard } from "@capacitor/clipboard";
import { QRCode } from "react-qrcode-logo";
import {
  FormOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  CloseOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import { selectActiveWallet } from "@/redux/wallet";
import { selectSyncState } from "@/redux/sync";
import { selectBchNetwork, selectQrCodeSettings } from "@/redux/preferences";
import { selectScannerIsScanning, selectKeyboardIsOpen } from "@/redux/device";

import AddressManagerService from "@/services/AddressManagerService";
import ToastService from "@/services/ToastService";

import { SatoshiInput } from "@/atoms/SatoshiInput";
import Address from "@/atoms/Address";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import WalletViewButtons from "../WalletViewButtons/WalletViewButtons";
import ScannerOverlay from "../ScannerOverlay";

import { logos } from "@/util/logos";
import { satsToBch } from "@/util/sats";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function WalletViewHome() {
  const wallet = useSelector(selectActiveWallet);
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);

  const qrCodeSettings = useSelector(selectQrCodeSettings);
  const bchNetwork = useSelector(selectBchNetwork);

  const { isSyncing } = useSelector(selectSyncState);

  // reload unused addresses when wallet data changes
  const AddressManager = AddressManagerService(wallet);
  const unusedAddressesRef = useRef(AddressManager.getUnusedAddresses());
  const getUnusedAddresses = useCallback(() => {
    if (!isSyncing) {
      unusedAddressesRef.current = AddressManager.getUnusedAddresses();
    }

    return unusedAddressesRef.current;
  }, [AddressManager, isSyncing]);

  const unusedAddresses = getUnusedAddresses();

  // currently displayed address
  const address = unusedAddresses.length > 0 ? unusedAddresses[0].address : "";

  // "Request Amount" state
  const [shouldShowRequestAmount, setShouldShowRequestAmount] = useState(false);
  const [satoshiInput, setSatoshiInput] = useState(0);

  const handleRequestAmountChange = (satInput) => {
    setSatoshiInput(satInput);
  };

  // generate bip21 uri for QR code
  const qrRequest =
    shouldShowRequestAmount && satoshiInput > 0
      ? `${address}?amount=${satsToBch(satoshiInput).bch}`
      : address;

  const getQrLogoImage = (logo) => logos[logo.toLowerCase()].img;

  const copyAddressToClipboard = async () => {
    //const titleTranslation = translate(copiedAddress);

    await Clipboard.write({ string: qrRequest });
    ToastService().clipboardCopy("Address", qrRequest);
  };

  // force red QR code border if connected to chipnet
  const qrCodeBorder =
    bchNetwork !== "mainnet" ? "border-[#ff0000]" : "border-primary";
  const addressColor =
    bchNetwork !== "mainnet" ? "text-[#ff0000]" : "text-white/80";

  return (
    <div className="flex flex-col justify-between h-full">
      {isScanning ? (
        <div>
          <ScannerOverlay />
        </div>
      ) : (
        <div className="font-mono text-white/90">
          <div className="w-full mx-auto bg-primary/90">
            <div className="py-1 flex justify-center items-center text-sm text-center uppercase">
              Receive
            </div>
            <div className="w-fit mx-auto">
              <button
                type="button"
                className={`border-4 cursor-pointer active:bg-primary shadow-inner shadow-lg active:shadow-none active:shadow-inner active:scale-[0.98] ${qrCodeBorder}`}
                onClick={copyAddressToClipboard}
              >
                <QRCode
                  value={qrRequest}
                  size={232}
                  quietZone={12}
                  bgColor={
                    bchNetwork !== "mainnet"
                      ? "#ffffff"
                      : qrCodeSettings.background
                  }
                  fgColor={
                    bchNetwork !== "mainnet"
                      ? "#000000"
                      : qrCodeSettings.foreground
                  }
                  logoImage={getQrLogoImage(qrCodeSettings.logo)}
                  logoWidth={64}
                  logoHeight={64}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={copyAddressToClipboard}
              className="flex items-center justify-center w-full py-2 text-xs text-center cursor-pointer slashed-zero select-none active:bg-secondary active:shadow-inner"
            >
              <CopyOutlined className={`mr-0.5 ${addressColor}`} />
              <Address address={address} color={addressColor} />
            </button>
          </div>
          <div
            className={`font-sans bg-primary w-full mx-auto text-sm py-1.5 rounded-b-sm ${!shouldShowRequestAmount ? "active:bg-secondary active:shadow-inner" : ""}`}
            onClick={() =>
              !shouldShowRequestAmount && setShouldShowRequestAmount(true)
            }
          >
            {shouldShowRequestAmount ? (
              <div className="flex w-full justify-between items-center">
                <CloseOutlined
                  className="p-1 font-bold text-lg"
                  onClick={() => setShouldShowRequestAmount(false)}
                />
                <span className="flex text-center grow items-center ml-1">
                  <CurrencySymbol className="text-lg bg-white/60 rounded-l px-1 text-zinc-500/80 font-semibold font-mono" />
                  <SatoshiInput
                    satoshis={satoshiInput}
                    onChange={handleRequestAmountChange}
                    className="p-1 mr-1 w-full text-black/70 font-mono rounded-r "
                    autoFocus
                  />
                  <div className="flex items-center justify-center">
                    <CurrencyFlip className="text-xl p-1" />
                  </div>
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center cursor-pointer">
                <FormOutlined className="mr-1 font-bold" />
                <span>{translate(translations.requestAmount)}</span>
                {shouldShowRequestAmount ? (
                  <CaretDownOutlined className="ml-1" />
                ) : (
                  <CaretRightOutlined className="ml-1" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {!isKeyboardOpen && (
        <div className="w-full">
          <WalletViewButtons />
        </div>
      )}
    </div>
  );
}
