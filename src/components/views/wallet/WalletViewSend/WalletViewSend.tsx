import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { Dialog } from "@capacitor/dialog";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";

import { selectActiveWallet } from "@/redux/wallet";
import {
  selectCurrencySettings,
  selectInstantPaySettings,
  setPreference,
  selectIsExperimental,
} from "@/redux/preferences";

import { selectSyncState, selectMyAddresses } from "@/redux/sync";

import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import ToastService from "@/services/ToastService";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import LogService from "@/services/LogService";

import { SatoshiInput } from "@/atoms/SatoshiInput";
import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Editable from "@/atoms/Editable";
import Address from "@/atoms/Address";
import CurrencySymbol from "@/atoms/CurrencySymbol";
import CurrencyFlip from "@/atoms/CurrencyFlip";

import { Haptic } from "@/util/haptic";
import { bchToSats } from "@/util/sats";
import { validateBchUri, navigateOnValidUri } from "@/util/uri";
import { translate } from "@/util/translations";
import translations from "./translations";

const Log = LogService("WalletViewSend");

export default function WalletViewSend() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isExperimental = useSelector(selectIsExperimental);

  const inputRef = useRef<HTMLInputElement>(null);

  const wallet = useSelector(selectActiveWallet);
  const sync = useSelector(selectSyncState);

  const { address, isBase58Address } = validateBchUri(params.address || "");

  const myAddresses = useSelector(selectMyAddresses);
  const isMyAddress = myAddresses[address] !== undefined;

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const querySats = searchParams.get("amount")
    ? bchToSats(searchParams.get("amount"))
    : new Decimal(0);

  const [satoshiInput, setSatoshiInput] = useState(querySats);
  // used to force re-render of SatoshiInput component with MAX button
  const [satoshiInputKey, setSatoshiInputKey] = useState("satoshiInputKey");

  const isInsufficientFunds = new Decimal(wallet.balance).lessThan(
    satoshiInput
  );

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );

  const [isInstantPayCanceled, setIsInstantPayCanceled] = useState(false);

  const handleAmountInput = (satInput) => {
    setSatoshiInput(satInput);
    setSatoshiInputKey("satoshiInputKey");
    setMessage("");
  };

  const handleInsufficientFunds = async () => {
    await Haptic.warn();
    const insufficientFundsTranslation = translate(
      translations.insufficientFunds
    );
    setMessage(insufficientFundsTranslation);
  };

  const confirmSend = async (isInstantPay: boolean = false) => {
    if (isSending) {
      return;
    }

    setIsSending(true);

    const authAction = isInstantPay
      ? AuthActions.InstantPay
      : AuthActions.SendTransaction;

    const isAuthorized = await SecurityService().authorize(authAction);
    if (!isAuthorized) {
      setIsSending(false);

      if (isInstantPay) {
        setIsInstantPayCanceled(true);
      }
      return;
    }

    if (isInsufficientFunds) {
      await handleInsufficientFunds();
      setIsSending(false);
      return;
    }

    if (!sync.isConnected) {
      ToastService().disconnected();
      setIsSending(false);
      return;
    }

    if (isBase58Address) {
      await Haptic.warn();
      const { value: isLegacyAddressConfirmed } = await Dialog.confirm({
        title: translate(translations.base58WarningTitle),
        message: translate(translations.base58WarningMessage),
        okButtonTitle: translate(translations.base58WarningOk),
      });

      if (!isLegacyAddressConfirmed) {
        setIsSending(false);
        return;
      }
    }

    const TransactionManager = TransactionManagerService();
    const TransactionBuilder = TransactionBuilderService(wallet);

    const transaction = TransactionBuilder.buildP2pkhTransaction([
      { address, amount: satoshiInput },
    ]);

    if (transaction === null) {
      Log.warn(transaction);
      //setMessage(translate(translations.notEnoughFee));
      setMessage("Transaction Failed: Wallet out of sync?");
      setIsSending(false);
      await Haptic.warn();
      return;
    }

    if (typeof transaction === "number") {
      await handleInsufficientFunds();
      setIsSending(false);
      return;
    }

    const { isSuccess, result } = await TransactionManager.sendTransaction(
      transaction,
      wallet
    );

    if (isSuccess) {
      const tx = await TransactionManager.resolveTransaction(result);
      await Haptic.success();
      navigate("/wallet/send/success", {
        state: { tx },
        replace: true,
      });
    } else {
      //setMessage(translate(translations.transactionFailed));
      setMessage(
        isExperimental ? `${result}` : translate(translations.transactionFailed)
      );
      await Haptic.error();
    }

    setIsSending(false);
  };

  useEffect(function handleInstantPay() {
    if (!isInstantPayEnabled) {
      return;
    }
    if (isInstantPayCanceled) {
      navigate(-1);
      return;
    }

    const requestAmount = bchToSats(searchParams.get("amount") || 0);

    if (
      requestAmount.greaterThan(0) &&
      requestAmount.lessThanOrEqualTo(instantPayThreshold)
    ) {
      //Log.debug("instapay!", threshold, requestAmount);
      confirmSend(true);
    }
  });

  const handleSendMax = () => {
    let amount = new Decimal(wallet.balance);

    const TransactionBuilder = TransactionBuilderService(wallet);

    let transaction = TransactionBuilder.buildP2pkhTransaction([
      { address, amount },
    ]);

    while (typeof transaction !== "object") {
      amount = new Decimal(transaction);
      transaction = TransactionBuilder.buildP2pkhTransaction([
        { address, amount },
      ]);
    }

    const clampedAmount = new Decimal(Math.max(0, amount.toNumber()));
    setSatoshiInput(clampedAmount);
    // force re-render of SatoshiInput component
    setSatoshiInputKey(clampedAmount.toString());
  };

  const handleFlipCurrency = () => {
    dispatch(
      setPreference({
        key: "preferLocalCurrency",
        value: shouldPreferLocalCurrency ? "false" : "true",
      })
    );

    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  };

  const handleAddressInput = async (input) => {
    const navTo = await navigateOnValidUri(input);
    if (navTo !== "") {
      navigate(navTo, { replace: true });
    }
  };

  return (
    <>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary px-2 py-1">
            <div className="text-lg font-bold">
              {translate(translations.sendingTo)}
              {isMyAddress && <span>&nbsp;{translate(translations.self)}</span>}
            </div>
            <div className="text-sm py-1 font-mono tracking-tight">
              {address === "" ? (
                <Editable
                  value={address}
                  onConfirm={handleAddressInput}
                  onBlur={handleAddressInput}
                  open
                />
              ) : (
                <Address address={address} />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-error p-2">
            <div className="text-xl font-bold">{message}</div>
          </div>
        )}
      </div>

      {isSending ? (
        <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
          <SyncOutlined className="text-7xl" spin />
        </div>
      ) : (
        <div className="flex flex-col h-full justify-evenly">
          <div className="p-2 w-full grow flex flex-col justify-center ">
            <div className="py-4 px-2 rounded-md shadow-md bg-primary/95 text-white">
              <div className="flex items-center justify-center">
                <CurrencySymbol className="font-bold text-4xl mr-2" />
                <SatoshiInput
                  key={satoshiInputKey}
                  onChange={handleAmountInput}
                  satoshis={satoshiInput}
                  size={1}
                  className={`mr-1.5 p-1 flex-1 text-3xl rounded shadow-inner ${
                    isInsufficientFunds ? "text-error" : "text-black/70"
                  }`}
                  autoFocus={address !== ""}
                  ref={inputRef}
                />
                <Button
                  label="MAX"
                  className="spacing-wide text-bold text-zinc-800 rounded-full border border-zinc-200 bg-zinc-100"
                  onClick={handleSendMax}
                />
              </div>
            </div>

            <div
              className="p-2 relative text-center w-full"
              onClick={handleFlipCurrency}
            >
              <span className="text-2xl font-semibold text-center w-full text-zinc-800/80 flex justify-center items-center">
                <Satoshi value={satoshiInput} flip />
                <CurrencyFlip className="text-3xl ml-2" />
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-end shrink my-6">
            <div className="flex w-full justify-around items-center px-2 gap-x-2">
              <div className="mx-2">
                <Button
                  icon={ArrowLeftOutlined}
                  iconSize="lg"
                  label={translate(translations.back)}
                  onClick={() => navigate(-1)}
                />
              </div>
              <div className="flex-1">
                <span className="font-bold">
                  <Button
                    label={translate(translations.confirm)}
                    inverted
                    fullWidth
                    onClick={() => confirmSend(false)}
                    disabled={address === "" || isSending}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
