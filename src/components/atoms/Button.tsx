type ValidSizes =
  | "xs"
  | "sm"
  | "base"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl";

type ValidRounded =
  | true
  | "full"
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

export interface ButtonProps {
  label?: string;
  labelSize?: ValidSizes;
  labelColor?: string;
  activeLabelColor?: string;
  icon?: React.ComponentType;
  iconSize?: ValidSizes;
  outerLabel?: string;
  outerLabelSize?: ValidSizes;
  outerLabelColor?: string;
  borderClasses?: string;
  rounded?: ValidRounded;
  bgColor?: string;
  activeBgColor?: string;
  inverted?: boolean;
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
}

export default function Button({
  label = "",
  labelSize = "sm",
  labelColor = "zinc-600",
  activeLabelColor = "white",
  icon = () => null,
  iconSize = "2xl",
  outerLabel = "",
  outerLabelSize = "sm",
  outerLabelColor = "zinc-700",
  borderClasses = "border border-2 border-primary",
  rounded = "full",
  bgColor = "white",
  activeBgColor = "primary",
  inverted = false,
  fullWidth = false,
  onClick = () => null,
  disabled = false,
}: ButtonProps) {
  const Icon = icon;
  const colors = `bg-${bgColor} text-${labelColor} active:bg-${activeBgColor} active:text-${activeLabelColor}`;
  const invertedColors = `bg-${activeBgColor} text-${activeLabelColor} active:bg-${bgColor} active:text-${labelColor}`;
  const colorClasses = inverted ? invertedColors : colors;

  const roundedClass = rounded === true ? "rounded" : `rounded-${rounded}`;
  const disabledClasses = disabled ? `opacity-[.5]` : "";

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={onClick}
        className={`
          cursor-pointer 
          flex items-center justify-center
          p-3 mx-auto
          ${fullWidth ? " w-full " : ""}
          ${borderClasses} 
          ${colorClasses}
          text-${labelSize}
          ${roundedClass}
          ${disabledClasses}
          shadow-md opacity-90 
          active:shadow-none active:shadow-inner
        `}
        disabled={disabled}
      >
        <Icon className={`text-${iconSize} ${label ? "mr-1" : ""}`} />
        <span>{label}</span>
      </button>
      {outerLabel && (
        <div
          className={`text-${outerLabelSize} text-${outerLabelColor} mt-1 select-none text-center`}
        >
          {outerLabel}
        </div>
      )}
    </div>
  );
}
