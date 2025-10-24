import { App } from "@capacitor/app";
import ReactDOM from "react-dom/client";
import { SplashScreen } from "@capacitor/splash-screen";

import LogService from "@/services/LogService";
import JanitorService from "@/services/JanitorService";
import DatabaseService from "@/services/DatabaseService";
import { redux_init, redux_post_init, redux_resume } from "@/redux";

import Main from "@/Main";

// Top-Level execution for entire app starts here!
// eslint-disable-next-line react-refresh/only-export-components
const Log = LogService("init");

// big green START button for the whole app
async function initialize_app() {
  Log.time("INIT");
  await pre_init();
  await app_init();
  await post_init();
  Log.timeEnd("INIT");
} // end initialize_app()

await initialize_app();

// ----------------

// initialize app state and render UI
function app_init() {
  Log.log("* APP_INIT *");
  App.addListener("resume", app_resume);
  redux_init();

  Log.debug("render <Main>");
  ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
}

// actions to perform before initializing app state or rendering UI
async function pre_init() {
  Log.log("* PRE_INIT *");
  const Janitor = JanitorService();
  const Database = DatabaseService();
  await Janitor.fsck();
  await Database.initAppDatabase();
  await Janitor.migrateLegacyDatabases();
  await Janitor.recoverWalletFiles();
}

// actions to perform after UI is rendered
// actions to perform after UI is rendered
async function post_init() {
  Log.log("* POST_INIT *");
  await SplashScreen.hide();
  redux_post_init();

  queueMicrotask(() => {
    const Janitor = JanitorService();
    Janitor.purgeStaleData();
  });
}

// actions to perform after app is resumed from sleep state
function app_resume() {
  Log.time("APP_RESUME");
  redux_resume();
  Log.timeEnd("APP_RESUME");
}
