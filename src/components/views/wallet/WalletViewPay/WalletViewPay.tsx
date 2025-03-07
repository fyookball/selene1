import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";

import { selectActiveWallet } from "@/redux/wallet";
import { selectSyncState } from "@/redux/sync";
import {
  setPreference,
  selectCurrencySettings,
  selectInstantPaySettings,
  selectIsOfflineMode,
} from "@/redux/preferences";

import TransactionManagerService from "@/services/TransactionManagerService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import ToastService from "@/services/ToastService";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import LogService from "@/services/LogService";

import Button from "@/atoms/Button";
import CountdownTimer from "@/components/atoms/CountdownTimer";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import Satoshi from "@/atoms/Satoshi";

import { Haptic } from "@/util/haptic";

import { PaymentRequestResponse, JppV2Client } from "@/util/payment_protocol";
import { translate } from "@/util/translations";
import translations from "@/components/views/wallet/WalletViewPay/translations";

const Log = LogService("WalletViewPay");
const jppClient = new JppV2Client();

export default function WalletViewPay() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sync = useSelector(selectSyncState);
  const wallet = useSelector(selectActiveWallet);
  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);
  const isOfflineMode = useSelector(selectIsOfflineMode);

  const [message, setMessage] = useState("");
  const [detailedMessage, setDetailedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentRequestResponse | null>(
    null
  );
  const [isInstantPayCanceled, setIsInstantPayCanceled] = useState(false);

  // Calculate the total satoshi amount required.
  const calculateTotalSats = () => {
    if (!paymentData) {
      return 0;
    }

    return paymentData.instructions[0].outputs.reduce((total, output) => {
      return total + output.amount;
    }, 0);
  };

  const totalSats = calculateTotalSats();

  // Get the request URL from our query parameters.
  const requestUri = searchParams.get("r");
  if (!requestUri) {
    throw new Error("Invalid or missing request URI");
  }

  const isInsufficientFunds = new Decimal(wallet.balance).lessThanOrEqualTo(0);
  const handleFlipCurrency = () => {
    dispatch(
      setPreference({
        key: "preferLocalCurrency",
        value: shouldPreferLocalCurrency ? "false" : "true",
      })
    );
  };

  const handleExpire = () => {
    setMessage(translate(translations.invalidInvoice));
    setDetailedMessage(translate(translations.invoiceExpired));
  };

  const confirmSend = useCallback(
    async (isInstantPay: boolean = false) => {
      // We want to support two different error messages
      // 1. One succinct one for the top bar (always "Transaction Failed").
      // 2. One more detailed one which *may* not have translations (this comes from the thrown error).
      try {
        if (isSending || !paymentData) {
          return;
        }

        setIsSending(true);

        const Security = SecurityService();
        const authAction = isInstantPay
          ? AuthActions.InstantPay
          : AuthActions.SendTransaction;

        const isAuthorized = await Security.authorize(authAction);

        if (!isAuthorized) {
          if (isInstantPay) {
            setIsInstantPayCanceled(true);
          }
          return;
        }

        if (isInsufficientFunds) {
          throw new Error(translate(translations.insufficientFunds));
        }

        if (!sync.isConnected) {
          ToastService().disconnected();
          throw new Error(translate(translations.walletDisconnected));
        }

        // Format the outputs into correct format for the Transaction Builder.
        // NOTE: This is more to satisfy Typescript as Tx Builder expects Decimal type.
        const outputsFormatted = paymentData.instructions[0].outputs.map(
          (out) => {
            return {
              address: out.address,
              amount: new Decimal(out.amount),
            };
          }
        );

        // Build the transaction.
        const TransactionBuilder = TransactionBuilderService(wallet);
        const transaction =
          TransactionBuilder.buildP2pkhTransaction(outputsFormatted);

        // Handle wallet out of sync error.
        if (transaction === null) {
          throw new Error("Transaction Failed: Wallet out of sync?");
        }

        // Handle insufficient funds error.
        if (typeof transaction === "number") {
          throw new Error(translate(translations.insufficientFunds));
        }

        // Respond to the payment URL with the signed transaction.
        const paymentResponse = await jppClient.payment(
          paymentData.paymentUrl,
          {
            chain: "BCH",
            transactions: [{ tx: transaction.hex }],
          }
        );

        // Wait until we actually see the transaction on our node.
        const TransactionManager = TransactionManagerService();
        const tx = await TransactionManager.waitForTransactionToResolve(
          transaction.txid
        );

        // Show a success notification and route the user to the success page.
        await Haptic.success();
        navigate("/wallet/send/success", {
          state: { tx, prefillMemo: paymentResponse.memo || "" },
          replace: true,
        });
      } catch (error) {
        await Haptic.error();
        Log.debug(error);
        setMessage(translate(translations.transactionFailed));
        setDetailedMessage(`${error}`);
      } finally {
        setIsSending(false);
      }
    },
    [
      isInsufficientFunds,
      isSending,
      navigate,
      paymentData,
      sync.isConnected,
      wallet,
    ]
  );

  // Handle instant pay.
  // NOTE: Some of the logic below is to prevent a race-condition whereby a user can land on this page prior to Electrum being connected.
  //       The intent is to allow Selene to be invoked by a "bitcoincash:?r=${url}" URL and "wait" for connection before triggering instant pay.
  useEffect(
    function handleInstantPay() {
      // If instant pay is not enabled, return to prevent further execution.
      if (!isInstantPayEnabled) {
        return;
      }

      if (isInstantPayCanceled) {
        navigate(-1);
        return;
      }

      // If we are already sending, return to prevent further execution.
      if (isSending) {
        return;
      }

      // If we are not yet synced, return to prevent further execution.
      if (!sync.isConnected) {
        return;
      }

      // If the payment data is not yet available, return to prevent further execution.
      if (!paymentData) {
        return;
      }

      // If we are within the instant pay threshold, send the tx.
      if (totalSats > 0 && totalSats <= instantPayThreshold) {
        confirmSend(true);
      }
    },
    [
      isInstantPayEnabled,
      isInstantPayCanceled,
      isSending,
      sync.isConnected,
      paymentData,
      totalSats,
      instantPayThreshold,
      confirmSend,
      navigate,
    ]
  );

  // Fetch the payment request.
  useEffect(
    function handlePaymentRequest() {
      const fetchPaymentRequest = async () => {
        try {
          if (isOfflineMode) {
            ToastService().disconnected();
            navigate("/");
            return;
          }

          setIsLoading(true);
          setPaymentData(await jppClient.paymentRequest(requestUri));
        } catch (error) {
          setMessage("Invalid invoice");
          setDetailedMessage(`${error}`);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPaymentRequest();
    },
    [requestUri, isOfflineMode, navigate]
  );

  return (
    <div className="flex flex-col justify-start h-full">
      <div className="tracking-wide text-center text-white">
        {message !== "" ? (
          <div className="bg-error p-2">
            <div className="text-xl font-bold">{message}</div>
          </div>
        ) : (
          <div className="bg-primary px-2 py-1">
            <div className="text-lg font-bold">
              {translate(translations.paymentTo)}
            </div>
            <div className="text-sm py-1">
              <span>{new URL(requestUri).hostname}</span>
            </div>
          </div>
        )}
      </div>

      {isLoading || isSending || !paymentData ? (
        <div className="mb-32 flex items-center justify-center w-full h-full text-center">
          <SyncOutlined className="text-7xl" spin />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="w-full text-center text-zinc-700 p-2 my-2">
            Expires in&nbsp;
            <CountdownTimer
              expiryDate={paymentData.expires}
              onExpire={handleExpire}
            />
          </div>
          <div className="flex flex-col mx-2 justify-center">
            <div className="h-full bg-primary/80 text-zinc-900 rounded-md p-4">
              {!message ? (
                <>
                  <div className="p-2 bg-zinc-100 rounded-md mb-3 text-center font-semibold">
                    {paymentData.memo}
                  </div>
                  <div
                    className="p-4 text-center bg-zinc-100 rounded-md cursor-pointer"
                    onClick={handleFlipCurrency}
                  >
                    <div className="font-semibold text-xl mb-1 text-zinc-900">
                      <Satoshi value={totalSats} />
                    </div>
                    <div className="text-lg flex items-center justify-center gap-x-2 text-zinc-800">
                      <Satoshi value={totalSats} flip />
                      <CurrencyFlip className="text-xl" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 px-2">
                  <div className="flex items-center justify-center">
                    {detailedMessage || message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
                disabled={!!message || !paymentData}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
