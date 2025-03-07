/* eslint-disable react/jsx-props-no-spreading */
import { useSelector, useDispatch } from "react-redux";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { selectPrivacySettings, setPreference } from "@/redux/preferences";
import SecurityService, { AuthActions } from "@/services/SecurityService";

interface Props {
  className?: string;
}

export default function BalanceHideButton({ className = "", ...rest }: Props) {
  const dispatch = useDispatch();
  const { shouldHideBalance } = useSelector(selectPrivacySettings);
  const Icon = shouldHideBalance ? EyeInvisibleOutlined : EyeOutlined;

  const hiddenClasses = shouldHideBalance ? "opacity-60" : "opacity-40";

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
        value: (!shouldHideBalance).toString(),
      })
    );
  };

  return (
    <Icon
      className={`cursor-pointer w-12 h-12 flex justify-center items-center ${className} ${hiddenClasses}`}
      onClick={handleHideBalance}
      {...rest}
    />
  );
}
