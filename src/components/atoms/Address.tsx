import { useSelector } from "react-redux";
import { selectWalletAddresses } from "@/redux/wallet";
import { truncate } from "@/util/string";

interface AddressProps {
  address: string;
  short?: boolean;
  maxLength?: number;
  withPrefix?: boolean;
  color?: string;
}

export default function Address({
  address = "-",
  short = false,
  maxLength = 0,
  withPrefix = false,
  color = "",
}: AddressProps) {
  const PREFIX_LENGTH = 5;
  const SUFFIX_LENGTH = 5;

  const formattedAddress = (() => {
    const split = address.split(":");
    if (split.length > 1) {
      return withPrefix ? split[0].concat(":").concat(split[1]) : split[1];
    }
    return split[0];
  })();

  const truncatedAddress = truncate(formattedAddress, maxLength);

  const prefix = truncatedAddress.substring(0, PREFIX_LENGTH);
  const middle = truncatedAddress.substring(
    PREFIX_LENGTH,
    truncatedAddress.length - SUFFIX_LENGTH
  );
  const suffix = truncatedAddress.substring(
    truncatedAddress.length - SUFFIX_LENGTH
  );

  const myAddresses = useSelector(selectWalletAddresses);
  const myAddress = myAddresses.find((addr) => addr.address === address);

  const isMyAddress = myAddress !== undefined;

  const myAddressStyle =
    color === "" && isMyAddress && myAddress.change === 0
      ? "text-secondary"
      : "";

  const myChangeStyle =
    color === "" && isMyAddress && myAddress.change === 1
      ? "text-yellow-600"
      : "";

  return (
    <span
      className={`tracking-tighter ${color} ${myAddressStyle} ${myChangeStyle}`}
    >
      <span className="font-bold">{prefix}</span>
      {short ? "-" : middle}
      <span className="font-bold">{suffix}</span>
    </span>
  );
}
