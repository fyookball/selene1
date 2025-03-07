import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "@capacitor/dialog";
import {
  BugOutlined,
  ExceptionOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { selectSecuritySettings } from "@/redux/preferences";
import ViewHeader from "@/layout/ViewHeader";
import Button from "@/atoms/Button";

import LogService from "@/services/LogService";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import { translate } from "@/util/translations";
import translations from "./translations";

import DebugSettings from "./DebugSettings";
import DebugConsole from "./DebugConsole";

const Log = LogService("DebugView");

export default function DebugView() {
  const { authMode, authActions } = useSelector(selectSecuritySettings);

  const [shouldThrowFakeError, setShouldThrowFakeError] = useState(false);

  // throw the fake error in an effect so that it's caught by the react-router error boundary
  useEffect(
    function throwFakeErrorOnRender() {
      if (shouldThrowFakeError) {
        setShouldThrowFakeError(false);
        throw new Error("all ur base are belong to us");
      }
    },
    [shouldThrowFakeError]
  );

  const handleThrowFakeError = () => {
    setShouldThrowFakeError(true);
  };

  const handleAuthorize = async () => {
    const isAuthorized = await SecurityService().authorize(AuthActions.Debug);
    Log.log("SecurityService authorize", isAuthorized);
    Dialog.alert({
      title: "SecurityService",
      message: `Security mode: ${authMode}\nisAuthorized ${isAuthorized}\nauthActions ${authActions.join(";")}`,
    });
  };

  return (
    <>
      <ViewHeader icon={BugOutlined} title={translate(translations.debug)} />
      <div className="p-1">
        <DebugSettings />
        <DebugConsole />
        <div className="m-1">
          <div className="flex">
            <Button
              icon={UnlockOutlined}
              label="AuthAction"
              onClick={handleAuthorize}
            />
            <Button
              icon={ExceptionOutlined}
              label={translate(translations.throwAnError)}
              onClick={handleThrowFakeError}
            />
          </div>
        </div>
      </div>
    </>
  );
}
