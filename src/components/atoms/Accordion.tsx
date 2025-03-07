// TODO: refactor this component it kinda sucks too
import { useState } from "react";
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";

interface AccordionProps {
  icon?: React.ComponentType;
  title?: string;
  open?: boolean;
  children: React.ReactNode;
}

export default function Accordion({
  icon = () => null,
  title = "",
  open = false,
  children,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(open);
  const Icon = icon;

  return (
    <div className="bg-zinc-800 rounded-lg p-2 my-1 text-zinc-200">
      <button
        type="button"
        tabIndex={0}
        className="text-lg font-medium p-1 flex items-center w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex-1 flex items-center">
          <Icon className="text-xl text-primary mr-1.5" />
          <span>{title}</span>
        </span>
        {isOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
      </button>
      {isOpen && (
        <div className="mt-1 text-zinc-700 rounded-sm bg-zinc-200 divide-y divide-zinc-300">
          {children}
        </div>
      )}
    </div>
  );
}

interface AccordionChildProps {
  icon?: React.ComponentType;
  label?: string;
  description?: string;
  children: React.ReactNode;
}

function AccordionChild({
  icon = () => null,
  label = "",
  description = "",
  children,
}: AccordionChildProps) {
  const Icon = icon;
  return (
    <div className="p-3">
      <div className="flex justify-between items-center">
        {label && (
          <div className="flex flex-1 items-center flex-nowrap items-center">
            <Icon className="text-xl mr-1" />
            {label}
          </div>
        )}
        <div className="flex-1 text-right">{children}</div>
      </div>
      {description && <div className="pt-2 text-sm">{description}</div>}
    </div>
  );
}

Accordion.Child = AccordionChild;
