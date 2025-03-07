import { useDispatch, useSelector } from "react-redux";
import {
  BugOutlined,
  ExperimentOutlined,
  RocketOutlined,
  ForkOutlined,
} from "@ant-design/icons";

import {
  setPreference,
  selectIsExperimental,
  selectIsPrerelease,
  selectBchNetwork,
} from "@/redux/preferences";
import Accordion from "@/atoms/Accordion";
import { translate } from "@/util/translations";
import translations from "./translations";

export default function DebugSettings() {
  const dispatch = useDispatch();

  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);

  const bchNetwork = useSelector(selectBchNetwork);

  const handleSelectBchNetwork = (event) => {
    const newNetwork = event.target.value;
    dispatch(setPreference({ key: "bchNetwork", value: newNetwork }));
    window.location.assign("/");
  };

  const handleIsExperimental = (event) => {
    const value = event.target.checked ? "true" : "false";
    dispatch(setPreference({ key: "enableExperimental", value }));
  };

  const handleIsPrerelease = (event) => {
    const value = event.target.checked ? "true" : "false";
    dispatch(setPreference({ key: "enablePrerelease", value }));
  };

  return (
    <Accordion icon={BugOutlined} title={translate(translations.debugOptions)}>
      <Accordion.Child
        icon={ExperimentOutlined}
        label={translate(translations.bchNetwork)}
      >
        <select onChange={handleSelectBchNetwork} value={bchNetwork}>
          <option value="mainnet">Mainnet</option>
          <option value="chipnet">Chipnet</option>
          <option value="testnet3">Testnet3</option>
          <option value="testnet4">Testnet4</option>
        </select>
      </Accordion.Child>
      <Accordion.Child
        icon={ForkOutlined}
        label={translate(translations.enablePrereleaseFeatures)}
        description={translate(translations.prereleaseDescription)}
      >
        <div>
          <input
            type="checkbox"
            checked={isPrerelease}
            onChange={handleIsPrerelease}
          />
        </div>
      </Accordion.Child>
      <Accordion.Child
        icon={RocketOutlined}
        label={translate(translations.enableExperimentalFeatures)}
        description={translate(translations.experimentalDescription)}
      >
        <input
          type="checkbox"
          checked={isExperimental}
          onChange={handleIsExperimental}
        />
      </Accordion.Child>
    </Accordion>
  );
}
