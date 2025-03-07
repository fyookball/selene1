import TIMELINE_ITEMS, { CATEGORIES } from "./timelineItems";
import { mapCategoryToColour } from "./utils";

export default function FilterPanel({
  isDisplayUpcoming,
  isDisplayHardForks,
  isDisplaySoftForks,
  isDisplayConferences,
  isDisplayProjectLaunches,
  isDisplayInfrastructure,
  isDisplayHistoricEvent,
  setIsDisplayUpcoming,
  setIsDisplayHardForks,
  setIsDisplaySoftForks,
  setIsDisplayConferences,
  setIsDisplayProjectLaunches,
  setIsDisplayInfrastructure,
  setIsDisplayHistoricEvent,
}) {
  const hardForksCount = TIMELINE_ITEMS.filter(
    (item) => item.category === CATEGORIES.FORK.HARD_FORK
  ).length;
  const softForksCount = TIMELINE_ITEMS.filter(
    (item) => item.category === CATEGORIES.FORK.SOFT_FORK
  ).length;
  const conferencesCount = TIMELINE_ITEMS.filter(
    (item) => item.category === CATEGORIES.CONFERENCE
  ).length;
  const projectLaunchesCount = TIMELINE_ITEMS.filter(
    (item) => item.category === CATEGORIES.PROJECT_LAUNCH
  ).length;
  const infrastructureCount = TIMELINE_ITEMS.filter(
    (item) => item.category === CATEGORIES.INFRASTRUCTURE
  ).length;
  const upcomingCount = TIMELINE_ITEMS.filter(
    (item) => item.category === CATEGORIES.UPCOMING
  ).length;
  const historicEventCount = TIMELINE_ITEMS.filter(
    (item) => item.category === CATEGORIES.HISTORIC_EVENT
  ).length;

  return (
    <div className="px-6 pb-1">
      <span className="text-lg font-bold">Categories</span>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayUpcoming}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayUpcoming(isChecked);
          }}
        />
        <span
          className={`${mapCategoryToColour(CATEGORIES.UPCOMING).className} pr-1`}
        >
          &#9632;
        </span>
        <span>
          {upcomingCount}x {CATEGORIES.UPCOMING}
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayHardForks}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayHardForks(isChecked);
          }}
        />
        <span
          className={`${mapCategoryToColour(CATEGORIES.FORK.HARD_FORK).className} pr-1`}
        >
          &#9632;
        </span>
        <span>
          {hardForksCount}x {CATEGORIES.FORK.FORK} ({CATEGORIES.FORK.HARD_FORK})
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplaySoftForks}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplaySoftForks(isChecked);
          }}
        />
        <span
          className={`${mapCategoryToColour(CATEGORIES.FORK.SOFT_FORK).className} pr-1`}
        >
          &#9632;
        </span>
        <span>
          {softForksCount}x {CATEGORIES.FORK.FORK} ({CATEGORIES.FORK.SOFT_FORK})
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayConferences}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayConferences(isChecked);
          }}
        />
        <span
          className={`${mapCategoryToColour(CATEGORIES.CONFERENCE).className} pr-1`}
        >
          &#9632;
        </span>
        <span>
          {conferencesCount}x {CATEGORIES.CONFERENCE}
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayProjectLaunches}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayProjectLaunches(isChecked);
          }}
        />
        <span
          className={`${mapCategoryToColour(CATEGORIES.PROJECT_LAUNCH).className} pr-1`}
        >
          &#9632;
        </span>
        <span>
          {projectLaunchesCount}x {CATEGORIES.PROJECT_LAUNCH}
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayInfrastructure}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayInfrastructure(isChecked);
          }}
        />
        <span
          className={`${mapCategoryToColour(CATEGORIES.INFRASTRUCTURE).className} pr-1`}
        >
          &#9632;
        </span>
        <span>
          {infrastructureCount}x {CATEGORIES.INFRASTRUCTURE}
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayHistoricEvent}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayHistoricEvent(isChecked);
          }}
        />
        <span
          className={`${mapCategoryToColour(CATEGORIES.HISTORIC_EVENT).className} pr-1`}
        >
          &#9632;
        </span>
        <span>
          {historicEventCount}x {CATEGORIES.HISTORIC_EVENT}
        </span>
      </div>
    </div>
  );
}
