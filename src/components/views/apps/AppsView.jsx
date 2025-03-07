import {
  ProductOutlined,
  LaptopOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import ExploreApp from "@/views/explore/ExploreApp";

import { translate } from "@/util/translations";
import translations from "@/views/explore/translations";

export default function AppsView() {
  return (
    <>
      <ViewHeader icon={ProductOutlined} title="Apps" />
      <div className="p-1">
        <ExploreApp
          icon={LaptopOutlined}
          name="A Fifth Of Gaming"
          to="/apps/afog"
        />
        <ExploreApp
          icon={LineChartOutlined}
          name={translate(translations.statistics)}
          to="/apps/stats"
        />
      </div>
    </>
  );
}
