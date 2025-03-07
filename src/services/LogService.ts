import Logger from "js-logger";
import { SELENE_WALLET_VERSION } from "@/util/version";
import ConsoleService from "@/services/ConsoleService";

// eslint-disable-next-line react-hooks/rules-of-hooks
Logger.useDefaults();
const jsConsoleHandler = Logger.createDefaultHandler();
const seleneConsoleHandler = (messages, context) =>
  ConsoleService().registerLine(messages, context);

Logger.setHandler((messages, context) => {
  jsConsoleHandler(messages, context);
  seleneConsoleHandler(messages, context);
});

Logger.setLevel(Logger.DEBUG);
Logger.info(
  `** Selene Wallet v${SELENE_WALLET_VERSION} :: https://selene.cash **`
);

function LogService(name: string) {
  const Log = Logger.get(name);
  return Log;
}

export default LogService;
