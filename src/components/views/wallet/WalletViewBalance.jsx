import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { animated, useSpring } from "@react-spring/web";
import { StockOutlined, SettingFilled, WarningFilled } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import {
  setPreference,
  selectCurrencySettings,
  selectBchNetwork,
  selectUiSettings,
  selectPrivacySettings,
} from "@/redux/preferences";
import { selectCurrentPrice } from "@/redux/exchangeRates";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import Satoshi from "@/atoms/Satoshi";
import CurrencyFlip from "@/atoms/CurrencyFlip";

export default function WalletViewBalance() {
  const dispatch = useDispatch();
  const wallet = useSelector(selectActiveWallet);
  const { walletHash, name: activeWalletName, balance, key_viewed_at } = wallet;
  const price = useSelector(selectCurrentPrice);
  const bchNetwork = useSelector(selectBchNetwork);

  const isKeyViewed = key_viewed_at !== null;

  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const { shouldDisplayExchangeRate } = useSelector(selectUiSettings);

  const { shouldHideBalance } = useSelector(selectPrivacySettings);

  const handleFlipCurrency = () => {
    dispatch(
      setPreference({
        key: "preferLocalCurrency",
        value: shouldPreferLocalCurrency ? "false" : "true",
      })
    );
  };

  const handleHideBalance = async () => {
    if (shouldHideBalance === true) {
      const isAuthorized = await SecurityService().authorize(
        AuthActions.RevealBalance
      );

      if (!isAuthorized) {
        return;
      }
    }

    dispatch(
      setPreference({
        key: "hideAvailableBalance",
        value: shouldHideBalance ? "false" : "true",
      })
    );
  };

  const hiddenBalanceClasses =
    shouldHideBalance && "blur-sm backdrop-opacity-60 opacity-25";

  const [balanceReceivedSpring, receiveSpringApi] = useSpring(() => ({
    from: { color: "#8dc451" },
    to: { color: "#e4e4e7" },
    immediate: true,
    config: {
      tension: 230,
      friction: 100,
      mass: 0.6,
    },
  }));

  useEffect(
    function animateWalletBalanceOnReceive() {
      receiveSpringApi.start({ reset: true });
    },
    [balance, receiveSpringApi]
  );

  return (
    <div className="py-2.5 text-center flex flex-col justify-center items-center">
      <div className="font-bold text-zinc-400 text-md tracking-wide">
        <Link
          to={`/settings/wallet/${walletHash}`}
          className={`flex justify-center items-center ${!isKeyViewed && "text-warning"}`}
        >
          {bchNetwork === "chipnet" && "[CHIP] "}
          {bchNetwork === "testnet3" && "[TEST3] "}
          {bchNetwork === "testnet4" && "[TEST4] "}
          {activeWalletName}{" "}
          {!isKeyViewed && balance > 0 ? (
            <WarningFilled className="text-xs ml-1 text-warning" />
          ) : (
            <SettingFilled className="text-xs ml-1 text-primary/70" />
          )}
        </Link>
      </div>
      <button
        type="button"
        className={`cursor-pointer ${hiddenBalanceClasses}`}
        onClick={shouldHideBalance ? handleHideBalance : handleFlipCurrency}
      >
        <div className="text-2xl text-zinc-200 tabular-nums flex justify-center items-center">
          <animated.span style={{ ...balanceReceivedSpring }}>
            <Satoshi value={balance} />
          </animated.span>
        </div>

        <div className="text-md text-zinc-400 flex items-center justify-center">
          <Satoshi value={balance} flip />
          <CurrencyFlip className="ml-1" />
        </div>
      </button>
      {shouldDisplayExchangeRate && (
        <div className="text-sm text-zinc-400/80 mt-0.5 flex justify-center items-center font-mono">
          <StockOutlined className="mr-1" />
          {price.priceString}
          <span className="mx-0.5 text-sm font-mono">/</span>BCH
        </div>
      )}
    </div>
  );
}
