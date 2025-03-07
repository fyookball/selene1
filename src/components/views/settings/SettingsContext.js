import { createContext } from "react";

export const SettingsContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleSettingsUpdate: (key, value) => {},
  preferences: {},
  dispatch: () => null,
});
