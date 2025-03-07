import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Dialog } from "@capacitor/dialog";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";

import { ScanOutlined, CloseOutlined } from "@ant-design/icons";
import { Haptic } from "@/util/haptic";
import {
  selectDeviceInfo,
  setScannerIsScanning,
  selectScannerIsScanning,
} from "@/redux/device";

import Button from "@/atoms/Button";

import { validateBchUri } from "@/util/uri";

import translations from "./translations";
import { translate } from "@/util/translations";

const { permissionTitle, permissionMessage, scan, close } = translations;

export default function ScannerButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deviceInfo = useSelector(selectDeviceInfo);
  const isScanning = useSelector(selectScannerIsScanning);

  const closeScanner = useCallback(async () => {
    if (deviceInfo.platform === "web") {
      return;
    }

    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();
  }, [deviceInfo.platform]);

  const handleScanContent = useCallback(
    async (content) => {
      dispatch(setScannerIsScanning(false));

      const {
        isValid,
        isPaymentProtocol,
        isWif,
        address,
        query,
        requestUri,
        wif,
      } = validateBchUri(content);

      if (isValid) {
        await Haptic.success();

        let navTo;
        if (isPaymentProtocol) {
          navTo = `/wallet/pay/?r=${requestUri}`;
        } else if (isWif) {
          navTo = `/wallet/sweep/${wif}`;
        } else {
          navTo = `/wallet/send/${address}${query}`;
        }

        navigate(navTo);
      } else {
        await Haptic.error();
      }
    },
    [dispatch, navigate]
  );

  const startScan = useCallback(async () => {
    if (deviceInfo.platform === "web") {
      return;
    }

    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.denied) {
      // we hit this code path if user says "never ask again or Ask Every Time"
      const { value: hasConsent } = await Dialog.confirm({
        title: translate(permissionTitle),
        message: translate(permissionMessage),
      });

      if (hasConsent) {
        BarcodeScanner.openAppSettings();
        return;
      }
    }

    BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan({
      targetedFormats: [SupportedFormat.QR_CODE],
    });

    if (result.hasContent) {
      handleScanContent(result.content);
    }
  }, [deviceInfo.platform, handleScanContent]);

  useEffect(
    function cleanupScanner() {
      return () => {
        closeScanner();
      };
    },
    [closeScanner]
  );

  useEffect(
    function resetScanner() {
      if (isScanning) {
        startScan();
      } else {
        closeScanner();
      }
    },
    [isScanning, closeScanner, startScan]
  );

  const toggleScanner = () => {
    dispatch(setScannerIsScanning(!isScanning));
  };

  const ScanIcon = isScanning ? CloseOutlined : ScanOutlined;
  const closeTranslation = translate(close);
  const scanTranslation = translate(scan);
  const scanLabel = isScanning ? closeTranslation : scanTranslation;
  const scanLabelColor = isScanning ? "white opacity-80" : undefined;

  return (
    <Button
      icon={ScanIcon}
      outerLabel={scanLabel}
      outerLabelColor={scanLabelColor}
      iconSize="4xl"
      onClick={toggleScanner}
    />
  );
}
