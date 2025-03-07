interface Props {
  src: string;
}

export default function EmbeddedIframe({ src = "" }: Props) {
  return (
    <div className="h-full">
      <iframe
        src={src}
        title="Embedded Web Page"
        width="100%"
        height="100%"
        allowFullScreen
      />
    </div>
  );
}
