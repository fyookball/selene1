import { useSelector } from "react-redux";
import { selectCurrencySettings } from "@/redux/preferences";

import { currencyList } from "@/util/currency";

interface Props {
  currency?: string;
  className?: string;
}

export default function CurrencySymbol({
  currency = "",
  className = "",
}: Props) {
  const { localCurrency, shouldPreferLocalCurrency } = useSelector(
    selectCurrencySettings
  );

  let findCurrency = currency;
  if (!findCurrency) {
    findCurrency = shouldPreferLocalCurrency ? localCurrency : "BCH";
  }

  const currencyObj =
    currencyList.find((c) => c.currency === findCurrency) || currencyList[0];
  const { symbol } = currencyObj;

  return <span className={className}>{symbol}</span>;
}
