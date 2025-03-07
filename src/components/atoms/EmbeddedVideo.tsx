import ReactPlayer from "react-player/youtube";

interface Props {
  url: string;
}

export default function EmbeddedVideo({ url = "" }: Props) {
  return (
    <div className="w-full flex justify-center">
      <ReactPlayer url={url} width="100%" />
    </div>
  );
}
