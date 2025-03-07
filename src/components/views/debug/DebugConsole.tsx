import { useState, useEffect } from "react";
import { ExportOutlined } from "@ant-design/icons";
import ConsoleService from "@/services/ConsoleService";
import Button from "@/atoms/Button";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function DebugConsole() {
  const [consoleLines, setConsoleLines] = useState<Array<string>>([]);

  useEffect(function reloadConsoleLines() {
    const interval = setInterval(() => {
      const lines = ConsoleService().getLines();
      setConsoleLines(lines);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleExportLogs = async () => {
    await ConsoleService().exportLogs();
  };

  return (
    <div>
      <div className="font-mono h-[50vh] overflow-y-auto border border-black rounded text-wrap break-words">
        <ul className="h-full text-sm">
          {consoleLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <div className="p-1">
        <Button
          icon={ExportOutlined}
          label={translate(translations.exportLogs)}
          onClick={handleExportLogs}
        />
      </div>
    </div>
  );
}
