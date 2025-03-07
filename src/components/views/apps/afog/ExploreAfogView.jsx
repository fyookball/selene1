import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { LaptopOutlined } from "@ant-design/icons";
import AppHero from "@/apps/AppHero/AppHero";
import { translate } from "@/util/translations";
import translations from "./ExploreAfogViewTranslations";
import EmbeddedVideo from "@/atoms/EmbeddedVideo";

const {
  upcomingTournaments,
  startsIn,
  underway,
  prizePool,
  playersText,
  description,
  signUp,
  loadingText,
  learnMore,
} = translations;

const AFOG_BASE_URL = "https://afifthofgaming.com";

const AFOG_SESSION_PATH = "/Session/Detail/";

export default function ExploreAfogView() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const AFOG_ENDPOINT = `${AFOG_BASE_URL}/Session/GetTournaments`;

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(AFOG_ENDPOINT);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const tournamentData = data?.data;
        const sortedData = tournamentData.sort((a, b) => {
          const dateA = DateTime.fromISO(a.date);
          const dateB = DateTime.fromISO(b.date);
          const res = dateA > dateB;
          return res ? 1 : -1;
        });
        setTournaments(sortedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleClick = (href) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const Table = () => {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div>
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              {translate(upcomingTournaments)}
            </h1>
          </div>
        </div>
        <div className="mt-1 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <tbody className="divide-y divide-gray-200">
                  {tournaments &&
                    tournaments.map(
                      ({
                        id,
                        game,
                        prize,
                        players,
                        date,
                        timeUntilStartDisplay,
                        ...data
                      }) => {
                        const title = data.cycle.game.title;
                        const guild = data.cycle.guild.name;
                        const formattedDatePart1 =
                          DateTime.fromISO(date).toFormat("ccc dd LLL yyyy");
                        const formattedDatePart2 =
                          DateTime.fromISO(date).toFormat("HH:mm ZZZZ");
                        const imageUrl = data.cycle.game.igdbImageUrl;

                        const sessionUrl = `${AFOG_BASE_URL}${AFOG_SESSION_PATH}${id}`;

                        return (
                          <tr
                            key={id}
                            className="flex justify-left"
                            onClick={() => handleClick(sessionUrl)}
                          >
                            <td className="px-2 min-w-2 my-auto">
                              <img
                                src={imageUrl}
                                alt="Game image"
                                width="100"
                                height="100"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <b>{title}</b>
                              <br />(<i>{guild}</i>)
                              <br />
                              <br />
                              {formattedDatePart1}
                              <br />
                              {formattedDatePart2}
                              <br />
                              {timeUntilStartDisplay && (
                                <span>
                                  {translate(startsIn)} {timeUntilStartDisplay}
                                </span>
                              )}
                              {!timeUntilStartDisplay && (
                                <span>{translate(underway)}</span>
                              )}
                              <br />
                              <br />
                              {translate(prizePool)}: $
                              {data?.walletValue.toFixed(2)} (
                              {data?.walletBalance} sats)
                              <br />
                              {translate(playersText)}:{" "}
                              {data?.attendance?.length}
                            </td>
                          </tr>
                        );
                      }
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <AppHero
        title={"A Fifth Of Gaming"}
        icon={<LaptopOutlined className="text-xl my-auto text-zinc-200" />}
        description={translate(description)}
        callToAction={translate(signUp)}
        callToActionUrl={AFOG_BASE_URL}
        expandableTitle={translate(learnMore)}
        expandableContent={
          <div>
            <EmbeddedVideo
              url={"https://www.youtube.com/watch?v=6cn4dcdN7d4"}
            />
            <EmbeddedVideo
              url={"https://www.youtube.com/watch?v=yadskoNfbwI"}
            />
            <EmbeddedVideo
              url={"https://www.youtube.com/watch?v=-3iXgm-0Gik"}
            />
          </div>
        }
      />

      {loading && <div>{`${translate(loadingText)}...`}</div>}
      {!loading && !error && <Table />}
    </div>
  );
}
