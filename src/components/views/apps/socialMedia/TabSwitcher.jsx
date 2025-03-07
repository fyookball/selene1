import { YoutubeOutlined, TwitterOutlined } from "@ant-design/icons";
import { OPTIONS } from "./ExploreSocialMediaView";

export const TabSwitcher = ({ selected, setSelected }) => {
  return (
    <div className="flex mx-2 rounded-md">
      <div
        className={`flex-1 py-1 my-2 ml-2 text-center rounded-md bg-${selected === OPTIONS.YOUTUBE ? "red-400" : "zinc-200"}`}
      >
        <button
          className={
            "w-full flex flex-col justify-center items-center text-sm cursor-pointer select-none focus:outline-none font-bold text-blue-gray-900"
          }
          onClick={() => {
            setSelected(OPTIONS.YOUTUBE);
          }}
        >
          <span>
            <YoutubeOutlined className="text-xl my-auto text-zinc-800" />
          </span>
          <span>{OPTIONS.YOUTUBE}</span>
        </button>
      </div>
      <div
        className={`flex-1 py-1 my-2 ml-2 text-center rounded-md bg-${selected === OPTIONS.TWITTER ? "red-400" : "zinc-200"}`}
      >
        <button
          className={
            "w-full flex flex-col justify-center items-center text-sm cursor-pointer select-none focus:outline-none font-bold text-blue-gray-900"
          }
          onClick={() => {
            setSelected(OPTIONS.TWITTER);
          }}
        >
          <span>
            <TwitterOutlined className="text-xl my-auto text-zinc-800" />
          </span>
          <span>X ({OPTIONS.TWITTER})</span>
        </button>
      </div>
    </div>
  );
};
