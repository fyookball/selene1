import { logos } from "@/util/logos";

interface Props {
  className: string;
  onClick: React.MouseEventHandler<HTMLImageElement>;
}

export default function SeleneLogo({
  className = "",
  onClick = () => null,
}: Props) {
  return (
    <img
      src={logos.selene.img}
      className={className}
      onClick={onClick}
      alt="Selene Wallet Logo"
    />
  );
}
