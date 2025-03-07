import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface Props {
  title: string;
  icon?: React.ComponentType;
  small?: boolean;
  className?: string;
}

export default function ViewHeader({
  title = "",
  icon = () => null,
  small = false,
  className = "",
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldShowBackButton = location.pathname.split("/").length > 1;

  const Icon = icon;

  const sizeClasses = small
    ? "bg-zinc-800 text-lg py-1 font-semibold text-zinc-200"
    : "bg-zinc-800 text-xl text-zinc-200 font-bold py-3";

  const iconClasses = small ? "text-lg" : "text-2xl";

  return (
    <div
      className={`sticky top-0 z-50 w-full grid grid-cols-6 ${sizeClasses} ${className}`}
    >
      {shouldShowBackButton ? (
        <button
          type="button"
          className="col-span-1 flex items-center justify-center cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftOutlined className="text-xl" />
        </button>
      ) : (
        <div className="col-span-1">&nbsp;</div>
      )}
      <div className="text-center col-span-4 flex items-center justify-center">
        <Icon className={`mr-2 ${iconClasses}`} />
        {title}
      </div>
      <div className="col-span-1">&nbsp;</div>
    </div>
  );
}
