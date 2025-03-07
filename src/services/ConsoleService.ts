import { DateTime } from "luxon";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

let lines: Array<string> = [];
const timers = {};
const denyLoggers = ["WalletManager"];

function ConsoleService() {
  return {
    registerLine,
    getLines,
    clearLines,
    exportLogs,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function registerLine(messages, context) {
    const line: Array<string> = [];

    //console.log(context);

    if (context.name) {
      line.push(`[${context.name}]`);

      // exclude some lines from exported log (i.e. ones that contain secrets)
      if (denyLoggers.includes(context.name)) {
        return;
      }
    }

    switch (context.level.value) {
      case 4:
        if (messages[1] === "start") {
          timers[messages[0]] = Date.now();
          line.push(messages[0]);
        }

        if (messages[1] === "end") {
          line.push(messages[0]);
          line.push(`${Date.now() - timers[messages[0]]}msec`);
        }

        break;

      default:
        line.push(
          Object.values(messages)
            .map((val) => JSON.stringify(val))
            .join(" ")
        );
        break;
    }

    line.unshift(DateTime.now().toFormat("HH:mm:ss.SSS"));
    lines.push(line.join(" "));
  }

  function getLines() {
    return lines;
  }

  function clearLines() {
    lines = [];
  }

  async function exportLogs() {
    const filename = `selene/selene.log.${Date.now()}.txt`;
    const data = lines.join("\n~ ");

    await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    const { uri } = await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    await Share.share({
      dialogTitle: "Export Selene Logs",
      url: uri,
    });
  }
}

export default ConsoleService;
