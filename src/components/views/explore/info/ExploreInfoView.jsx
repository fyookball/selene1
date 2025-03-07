import {
  ProfileOutlined,
  LikeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import SeleneLogo from "@/atoms/SeleneLogo";
import ExploreApp from "@/views/explore/ExploreApp";

import { translate } from "@/util/translations";
import translations from "@/views/explore/translations";

export default function ExploreInfoView() {
  return (
    <div className="p-1">
      <div className="flex justify-center items-center text-xl font-bold">
        <SeleneLogo className="w-12 mr-1" /> Encyclopedia
      </div>
      <div>
        <ExploreApp
          icon={InfoCircleOutlined}
          name={translate(translations.faqs)}
          to="/apps/faqs"
        />
        <ExploreApp
          icon={ProfileOutlined}
          name={translate(translations.chronology)}
          to="/apps/chronology"
        />
        <ExploreApp
          icon={LikeOutlined}
          name={translate(translations.socialMedia)}
          to="/apps/socialMedia"
        />
      </div>
    </div>
  );
}
