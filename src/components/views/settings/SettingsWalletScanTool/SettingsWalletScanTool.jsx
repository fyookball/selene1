/* eslint-disable */
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SyncOutlined } from "@ant-design/icons";

import { selectBchNetwork } from "@/redux/preferences";
import { syncHotRefresh } from "@/redux/sync";

import ViewHeader from "@/layout/ViewHeader";

import LogService from "@/services/LogService";
import ElectrumService from "@/services/ElectrumService";
import WalletManagerService from "@/services/WalletManagerService";
import AddressScannerService from "@/services/AddressScannerService";
import HdNodeService from "@/services/HdNodeService";
import AddressManagerService from "@/services/AddressManagerService";

import { DEFAULT_DERIVATION_PATH, DERIVATION_PATHS } from "@/util/derivation";

export default function SettingsWalletScanTool() {
  const { walletHash } = useParams();
  const bchNetwork = useSelector(selectBchNetwork);
  const location = useLocation();

  const dispatch = useDispatch();

  const WalletManager = WalletManagerService();
  const wallet = WalletManager.getWallet(walletHash);

  const AddressManager = AddressManagerService(wallet);

  const receiveAddresses = AddressManager.getReceiveAddresses();
  const changeAddresses = AddressManager.getChangeAddresses();

  const unusedReceiveAddresses = receiveAddresses.filter(
    (a) => a.state === null
  );
  const unusedChangeAddresses = changeAddresses.filter((a) => a.state === null);

  const [foundPath, setFoundPath] = useState("");
  const [scanCount, setScanCount] = useState(0);

  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(1000);
  const [nScanMore, setNScanMore] = useState(1200);

  const [changeMode, setChangeMode] = useState(-1);

  const handleScanDerivationPaths = async () => {
    const found = await AddressScannerService(wallet).scanDerivationPaths();
    setFoundPath(found);
  };

  const handleSetStartIndex = (event) => {
    setStartIndex(Number.parseInt(event.target.value));
  };

  const handleSetEndIndex = (event) => {
    setEndIndex(Number.parseInt(event.target.value));
  };

  const handleSetNScanMore = (event) => {
    setNScanMore(Number.parseInt(event.target.value));
  };

  const handleSelectChangeMode = (event) => {
    setChangeMode(Number.parseInt(event.target.value));
  };

  const handleScan = async () => {
    setScanCount(-1);

    let scannedAddresses = [];
    switch (changeMode) {
      case 0:
      case 1:
        scannedAddresses = await AddressScannerService(wallet).scanAddresses(
          startIndex,
          endIndex,
          changeMode
        );
        break;

      case -1:
      default:
        scannedAddresses = (
          await Promise.all([
            AddressScannerService(wallet).scanAddresses(
              startIndex,
              endIndex,
              0
            ),
            AddressScannerService(wallet).scanAddresses(
              startIndex,
              endIndex,
              1
            ),
          ])
        ).flat();
        break;
    }

    setScanCount(scannedAddresses.length);
  };

  const handleScanMore = async () => {
    setScanCount(-1);
    let scannedAddresses = [];

    switch (changeMode) {
      case 0:
      case 1:
        scannedAddresses = await AddressScannerService(
          wallet
        ).scanMoreAddresses(nScanMore, changeMode);
        break;

      case -1:
      default:
        scannedAddresses = (
          await Promise.all([
            AddressScannerService(wallet).scanMoreAddresses(nScanMore, 0),
            AddressScannerService(wallet).scanMoreAddresses(nScanMore, 1),
          ])
        ).flat();
        break;
    }
    setScanCount(scannedAddresses.length);
  };

  const handleRebuildWallet = async () => {
    setScanCount(-1);
    await AddressScannerService(wallet).rebuildWallet();
    setScanCount(-99);
  };

  return (
    <>
      <ViewHeader icon={SyncOutlined} title="Address Scan Tool" />
      <div className="p-1">
        <div className="flex mb-1">
          <button
            type="button"
            onClick={handleScanDerivationPaths}
            className="border border-primary p-1"
          >
            Scan Derivation Paths
          </button>
          <button
            type="button"
            onClick={handleRebuildWallet}
            className="border border-primary p-1"
          >
            Rebuild Wallet
          </button>
        </div>
        <div>
          <select
            className="text-sm p-2 my-1"
            value={changeMode}
            onChange={handleSelectChangeMode}
          >
            <option value={-1}>Receive/Change</option>
            <option value={0}>Receive Only</option>
            <option value={1}>Change Only</option>
          </select>
        </div>
        <div className="flex justify-between">
          <input
            className="w-32"
            type="number"
            value={startIndex}
            onChange={handleSetStartIndex}
            min="0"
            step="1"
          />
          <input
            className="w-32"
            type="number"
            value={endIndex}
            onChange={handleSetEndIndex}
            min="1"
            step="1"
          />
          <button
            type="button"
            className="p-1 border border-primary grow"
            onClick={handleScan}
          >
            Scan
          </button>
        </div>
        <div>
          <input
            type="number"
            value={nScanMore}
            onChange={handleSetNScanMore}
          />
          <button
            type="button"
            className="p-1 border border-primary"
            onClick={handleScanMore}
          >
            Scan More
          </button>
        </div>
        <ul>
          <li>Receive Addresses: {receiveAddresses.length}</li>
          <li>
            Used Receive Addresses:{" "}
            {receiveAddresses.length - unusedReceiveAddresses.length}
          </li>
          <li>Unused Receive Addresses: {unusedReceiveAddresses.length}</li>
        </ul>
        <ul>
          <li>Change Addresses: {changeAddresses.length}</li>
          <li>
            Used Change Addresses:{" "}
            {changeAddresses.length - unusedChangeAddresses.length}
          </li>
          <li>Unused Change Addresses: {unusedChangeAddresses.length}</li>
        </ul>
      </div>
      {foundPath !== "" && <div>Found addresses on {foundPath}</div>}
      {scanCount !== 0 && <div>Scanned {scanCount} addresses</div>}
    </>
  );
}
