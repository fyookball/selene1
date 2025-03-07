import {
  ContactsOutlined,
  //EnvironmentOutlined,
  QuestionCircleOutlined,
  ProductOutlined,
  ReadOutlined,
} from "@ant-design/icons";

import { useSelector } from "react-redux";
import { selectIsExperimental, selectIsPrerelease } from "@/redux/preferences";
import ExploreApp from "./ExploreApp";
import ExploreStatWidget from "./ExploreStatWidget";
import ExploreLegacyView from "./ExploreLegacyView";

export default function ExploreViewHome() {
  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);

  return isPrerelease ? (
    <div className="p-1.5">
      <ExploreStatWidget />
      {isPrerelease && (
        <ExploreApp icon={ProductOutlined} name="Apps" to="/apps" />
      )}
      {isExperimental && (
        <ExploreApp
          icon={ContactsOutlined}
          name="Contacts"
          to="/explore/contacts"
        />
      )}
      {/*{isExperimental && (
        <ExploreApp icon={EnvironmentOutlined} name="Map" to="/explore/map" />
      )}*/}
      {isPrerelease && (
        <ExploreApp
          icon={ReadOutlined}
          name="Encyclopedia"
          to="/explore/info"
        />
      )}
      {isExperimental && (
        <ExploreApp
          icon={QuestionCircleOutlined}
          name="Help"
          to="/explore/help"
        />
      )}
    </div>
  ) : (
    <ExploreLegacyView />
  );
}
