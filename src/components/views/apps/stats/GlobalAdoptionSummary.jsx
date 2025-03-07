/* eslint-disable no-unsafe-optional-chaining */
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import ActiveUsersChart from "./ActiveUsersChart";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { THIRTY_SECONDS, Period } from "@/util/time";
import { translate } from "@/util/translations";
import translations from "./GlobalAdoptionSummaryTranslations";

const { globalAdoption, activeSeleneUsers, daily, weekly, monthly, yearly } =
  translations;

export default function GlobalAdoptionSummary() {
  const [period, setPeriod] = useState(Period.Daily);

  const {
    loading: isLoading,
    data,
    startPolling,
    stopPolling,
  } = useQuery(GET_ACTIVE_BITCOINERS, {
    variables: {
      period,
    },
  });

  useEffect(() => {
    startPolling(THIRTY_SECONDS);

    return stopPolling;
  }, [startPolling, stopPolling]);

  const isReady = !isLoading && data?.activeBitcoiners;

  return (
    <div className="p-2">
      <div className="stats shadow rounded-lg p-3 bg-zinc-100 w-full">
        <div className="text-2xl font-bold text-zinc-800">
          {translate(globalAdoption)}
        </div>
        <div className="stat">
          <div className="stat-title text-zinc-800">
            {translate(activeSeleneUsers)}
          </div>
        </div>

        <div className="bg-zinc-200 mt-3 mb-3">
          {!isReady && <p>Loading chart...</p>}
          {isReady && <ActiveUsersChart data={data} period={period} />}
        </div>

        <div className="w-full flex justify-center items-center">
          <button
            type="button"
            className="p-2 ml-1 mr-1 rounded-full border border-2 border-primary shadow-md opacity-90"
            onClick={() => {
              setPeriod(Period.Daily);
            }}
          >
            <span
              className={`${period === Period.Daily ? "text-primary" : "text-zinc-400"}`}
            >
              {translate(daily)}
            </span>
          </button>
          <button
            type="button"
            className="p-2 ml-1 mr-1 rounded-full border border-2 border-primary shadow-md opacity-90"
            onClick={() => {
              setPeriod(Period.Weekly);
            }}
          >
            <span
              className={`${period === Period.Weekly ? "text-primary" : "text-zinc-400"}`}
            >
              {translate(weekly)}
            </span>
          </button>
          <button
            type="button"
            className="p-2 ml-1 mr-1 rounded-full border border-2 border-primary shadow-md opacity-90"
            onClick={() => {
              setPeriod(Period.Monthly);
            }}
          >
            <span
              className={`${period === Period.Monthly ? "text-primary" : "text-zinc-400"}`}
            >
              {translate(monthly)}
            </span>
          </button>
          <button
            type="button"
            className="p-2 ml-1 mr-1 rounded-full border border-2 border-primary shadow-md opacity-90"
            onClick={() => {
              setPeriod(Period.Yearly);
            }}
          >
            <span
              className={`${period === Period.Yearly ? "text-primary" : "text-zinc-400"}`}
            >
              {translate(yearly)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
