import { useState } from "react";
import "react-vertical-timeline-component/style.min.css";
import { ProfileOutlined } from "@ant-design/icons";
import AppHero from "@/apps/AppHero/AppHero";
import TIMELINE_ITEMS, { CATEGORIES } from "./timelineItems";
import FilterPanel from "./FilterPanel";
import Timeline from "./Timeline";

import { translate } from "@/util/translations";
import translations from "./translations";

const { chronology, description } = translations;

export default function ExploreChronologyView() {
  const [isDisplayUpcoming, setIsDisplayUpcoming] = useState(true);
  const [isDisplayHardForks, setIsDisplayHardForks] = useState(true);
  const [isDisplaySoftForks, setIsDisplaySoftForks] = useState(true);
  const [isDisplayConferences, setIsDisplayConferences] = useState(true);
  const [isDisplayProjectLaunches, setIsDisplayProjectLaunches] =
    useState(true);
  const [isDisplayInfrastructure, setIsDisplayInfrastructure] = useState(true);
  const [isDisplayHistoricEvent, setIsDisplayHistoricEvent] = useState(true);

  const timelineItems = TIMELINE_ITEMS.reverse().filter((item) => {
    if (item.category === CATEGORIES.FORK.HARD_FORK && !isDisplayHardForks) {
      return false;
    }

    if (item.category === CATEGORIES.FORK.SOFT_FORK && !isDisplaySoftForks) {
      return false;
    }

    if (item.category === CATEGORIES.CONFERENCE && !isDisplayConferences) {
      return false;
    }

    if (
      item.category === CATEGORIES.PROJECT_LAUNCH &&
      !isDisplayProjectLaunches
    ) {
      return false;
    }

    if (
      item.category === CATEGORIES.INFRASTRUCTURE &&
      !isDisplayInfrastructure
    ) {
      return false;
    }

    if (item.category === CATEGORIES.UPCOMING && !isDisplayUpcoming) {
      return false;
    }

    if (
      item.category === CATEGORIES.HISTORIC_EVENT &&
      !isDisplayHistoricEvent
    ) {
      return false;
    }

    return true;
  });

  return (
    <div>
      <AppHero
        title={translate(chronology)}
        description={translate(description)}
        icon={<ProfileOutlined className="text-xl my-auto text-zinc-200" />}
      />

      <hr />

      <FilterPanel
        isDisplayUpcoming={isDisplayUpcoming}
        isDisplayHardForks={isDisplayHardForks}
        isDisplaySoftForks={isDisplaySoftForks}
        isDisplayConferences={isDisplayConferences}
        isDisplayProjectLaunches={isDisplayProjectLaunches}
        isDisplayInfrastructure={isDisplayInfrastructure}
        isDisplayHistoricEvent={isDisplayHistoricEvent}
        setIsDisplayUpcoming={setIsDisplayUpcoming}
        setIsDisplayHardForks={setIsDisplayHardForks}
        setIsDisplaySoftForks={setIsDisplaySoftForks}
        setIsDisplayConferences={setIsDisplayConferences}
        setIsDisplayProjectLaunches={setIsDisplayProjectLaunches}
        setIsDisplayInfrastructure={setIsDisplayInfrastructure}
        setIsDisplayHistoricEvent={setIsDisplayHistoricEvent}
      />

      <hr />

      <Timeline timelineItems={timelineItems} />
    </div>
  );
}
