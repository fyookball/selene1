import { useSelector } from "react-redux";
import { QrcodeOutlined } from "@ant-design/icons";
import { selectInstantPaySettings } from "@/redux/preferences";

import Satoshi from "@/atoms/Satoshi";

export default function ScannerOverlay() {
  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );

  return (
    <div className="fixed top-0 w-full h-screen z-40 flex items-center justify-center bg-transparent">
      <div className="text-center">
        {isInstantPayEnabled && (
          <div className="relative bottom-4 bg-black/50 text-white/80 rounded-sm z-10">
            <div className="text-3xl font-bold">Instant Pay Enabled</div>
            <div className="text-xl font-semibold">
              Threshold: <Satoshi value={instantPayThreshold} />
            </div>
          </div>
        )}
        <div
          className="w-80 h-80 rounded-xl flex items-center justify-center border border-4 border-primary opacity-90 mb-32"
          style={{ boxShadow: "0 0 0 100vh #232323" }}
        >
          <QrcodeOutlined
            className="text-4xl opacity-80 text-primary border-2 border-primary rounded-sm"
            style={{ filter: "drop-shadow(0 0 4px #8dc351)" }}
          />
        </div>
      </div>
    </div>
  );
}
