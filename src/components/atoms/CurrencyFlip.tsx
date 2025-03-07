/* eslint-disable react/jsx-props-no-spreading */
import { useDispatch, useSelector } from "react-redux";
import { TransactionOutlined } from "@ant-design/icons";
import { selectCurrencySettings, setPreference } from "@/redux/preferences";

interface Props {
  className: string;
}

export default function CurrencyFlip({ className = "", ...rest }: Props) {
  const dispatch = useDispatch();
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const handleFlipLocalCurrency = () => {
    dispatch(
      setPreference({
        key: "preferLocalCurrency",
        value: shouldPreferLocalCurrency ? "false" : "true",
      })
    );
  };

  return (
    <TransactionOutlined
      className={`cursor-pointer ${className}`}
      onClick={handleFlipLocalCurrency}
      {...rest}
    />
  );
}
