import { Outlet } from "react-router-dom";
import { CompassOutlined } from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
//import ExploreSearchBar from "./ExploreSearchBar";
import { translate } from "@/util/translations";
import translations from "./translations";

export default function ExploreView() {
  return (
    <>
      <ViewHeader
        icon={CompassOutlined}
        title={translate(translations.exploreBch)}
      />
      {/*<ExploreSearchBar />*/}
      <div className="h-full">
        <Outlet />
      </div>
    </>
  );
}
