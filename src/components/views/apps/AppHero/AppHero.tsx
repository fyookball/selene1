import { ReactNode, useState } from "react";
import { UpSquareOutlined, DownSquareOutlined } from "@ant-design/icons";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  callToAction?: string;
  callToActionUrl?: string;
  expandableTitle?: string;
  expandableContent?: ReactNode;
}

export default function AppHero({
  icon,
  title,
  description,
  callToAction,
  callToActionUrl,
  expandableTitle,
  expandableContent,
}: Props) {
  const [isExpandableOpen, setIsExpandableOpen] = useState(false);

  return (
    <div className="shadow rounded-lg m-2 p-2 bg-zinc-900 flex-column justify-center items-center">
      <div className="w-full">
        <div className="flex justify-center items-center">
          <span className="pr-1 flex justify-center items-center">{icon}</span>
          <span className="font-bold text-xl text-center text-zinc-300 px-1">
            {title}
          </span>
          <span className="pl-1 flex justify-center items-center">{icon}</span>
        </div>

        <div className="text-md text-center text-zinc-300">{description}</div>
      </div>

      {callToAction && callToActionUrl && (
        <div className="p-1">
          <a
            href={callToActionUrl}
            target="_blank"
            className="flex justify-center m-4 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
          >
            {callToAction}
          </a>
        </div>
      )}

      {expandableTitle && expandableContent && (
        <div
          className={`${!callToAction && "mt-2"} p-1 w-full bg-zinc-200 text-lg text-center text-zinc-800`}
        >
          <div
            className={"flex justify-center items-center"}
            onClick={() => {
              setIsExpandableOpen(!isExpandableOpen);
            }}
          >
            <span className="pr-1">{expandableTitle}</span>
            <span className="flex justify-center items-center">
              {!isExpandableOpen && (
                <DownSquareOutlined className="my-auto text-xl" />
              )}
              {isExpandableOpen && (
                <UpSquareOutlined className="my-auto text-xl" />
              )}
            </span>
          </div>

          {isExpandableOpen && expandableContent}
        </div>
      )}
    </div>
  );
}
