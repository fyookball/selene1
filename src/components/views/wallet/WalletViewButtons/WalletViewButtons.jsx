import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Clipboard } from "@capacitor/clipboard";
import {
  SendOutlined,
  HistoryOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { selectScannerIsScanning } from "@/redux/device";
import translations from "./translations";
import { translate } from "@/util/translations";

import Button from "@/atoms/Button";
import ScannerButton from "../ScannerButton/ScannerButton";
import TorchButton from "../TorchButton/TorchButton";
import ImageSelectButton from "../ImageSelectButton/ImageSelectButton";

import ToastService from "@/services/ToastService";
import { navigateOnValidUri } from "@/util/uri";

export default function WalletViewButtons() {
  const navigate = useNavigate();
  const isScanning = useSelector(selectScannerIsScanning);

  const forwardOnValidAddress = async (input) => {
    const navTo = await navigateOnValidUri(input);
    if (navTo) {
      navigate(navTo);
    }
  };

  const pasteAddressFromClipboard = async () => {
    const Toast = ToastService();
    let navTo = "";
    try {
      // NOTE: Firefox does not support the Clipboard.read browser API yet!
      // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard#clipboard_availability
      // Error: Reading from clipboard not supported in this browser
      // Firefox users must set "dom.events.asyncClipboard.read" to "true" in about:config
      const paste = (await Clipboard.read()).value;
      navTo = await navigateOnValidUri(paste);
      if (navTo !== "") {
        Toast.spawn({
          icon: <SnippetsOutlined className="text-primary text-4xl" />,
          header: translate(translations.pastedFromClipboard),
          body: <span className="flex break-all text-sm">{paste}</span>,
        });
        navigate(navTo);
      }
    } catch (e) {
      //console.warn(e);
    } finally {
      if (navTo === "") {
        navigate("/wallet/send/");
      }
    }
  };

  const handleHistoryButton = () => {
    navigate("/wallet/history");
  };

  return (
    <div className="flex items-center w-auto mx-4 justify-evenly my-4 relative z-40">
      {isScanning ? (
        <ImageSelectButton
          iconSize="2xl"
          outerLabelColor="white opacity-80"
          onSelection={forwardOnValidAddress}
        />
      ) : (
        <Button
          icon={HistoryOutlined}
          outerLabel={translate(translations.history)}
          onClick={handleHistoryButton}
          iconSize="2xl"
        />
      )}
      <ScannerButton />
      {isScanning ? (
        <TorchButton iconSize="2xl" outerLabelColor="white opacity-80" />
      ) : (
        <Button
          icon={SendOutlined}
          outerLabel={translate(translations.send)}
          onClick={pasteAddressFromClipboard}
          iconSize="2xl"
        />
      )}
    </div>
  );
}
