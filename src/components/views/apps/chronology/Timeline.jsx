import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import EmbeddedVideo from "@/atoms/EmbeddedVideo";
import { CATEGORIES } from "./timelineItems";
import { mapCategoryToColour } from "./utils";
import { useNavigate } from "react-router-dom";

import { translate } from "@/util/translations";
import translations from "./translations";

const { noItems, readMore, tryItInSelene } = translations;

export default function Timeline({ timelineItems }) {
  const isTimelineItemsEmpty = timelineItems.length === 0;
  const navigate = useNavigate();

  if (isTimelineItemsEmpty) {
    return (
      <div className="m-2">
        <div className="flex justify-center items-center h-full">
          {translate(noItems)}
        </div>
      </div>
    );
  }

  return (
    <VerticalTimeline lineColor={"black"} layout={"1-column-left"}>
      {timelineItems.map(
        ({
          title,
          date,
          subtitle,
          category,
          videoUrl,
          graphicUrl,
          description,
          readMoreUrl,
          appUrl,
        }) => {
          const formattedDate = date.toFormat("dd LLL yyyy");

          const specificColour = mapCategoryToColour(category).rgb;

          return (
            <VerticalTimelineElement
              key={`${title}-${formattedDate}`}
              contentStyle={{
                background: `${specificColour}`,
                color: "#fff",
                paddingTop: 0,
                paddingBottom: 0,
              }}
              contentArrowStyle={{
                borderRight: `7px solid  ${specificColour}`,
              }}
              iconStyle={{ background: `${specificColour}`, color: "#fff" }}
              icon={null}
            >
              <div className="pb-1">
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xl font-bold">{title}</span>
                  <span className={"text text-zinc-200 pt-0 mt-2"}>
                    {formattedDate}
                  </span>
                </div>
                {subtitle && (
                  <span className="text-md text-white-800 pt-6">
                    {subtitle}
                  </span>
                )}
              </div>
              <div className="pb-2">
                {category ===
                  (CATEGORIES.FORK.HARD_FORK || CATEGORIES.FORK.SOFT_FORK) && (
                  <span className={"text text-zinc-200 pb-2"}>
                    {CATEGORIES.FORK.FORK} -{" "}
                  </span>
                )}
                <span className={"text text-zinc-200 pb-2"}>{category}</span>
              </div>

              {graphicUrl && (
                <div className="flex justify-center pb-2">
                  <img
                    src={graphicUrl}
                    height={300}
                    width={300}
                    alt={`${title} graphic`}
                  />
                </div>
              )}

              {videoUrl && <EmbeddedVideo url={videoUrl} />}

              {description &&
                description.map((text) => (
                  <div className={"py-1"} key={text.substring(1, 25)}>
                    <span className={"text italic"}>{text}</span>
                  </div>
                ))}

              {readMoreUrl && (
                <div>
                  <a
                    href={readMoreUrl}
                    target="_blank"
                    className="flex justify-center m-1 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
                  >
                    {translate(readMore)}
                  </a>
                </div>
              )}

              {appUrl && (
                <div>
                  <span
                    onClick={() => navigate(appUrl)}
                    className="flex justify-center m-1 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
                  >
                    {translate(tryItInSelene)}
                  </span>
                </div>
              )}
            </VerticalTimelineElement>
          );
        }
      )}
    </VerticalTimeline>
  );
}
