import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { THIRTY_SECONDS } from "@/util/time";
import GET_ACTIVE_BITCOINERS_SUMMARY from "./getActiveBitcoinersSummary";
import DailyTarget from "./DailyTarget";
import { translate } from "@/util/translations";
import translations from "./ExploreStatBlockTranslations";

const { seleneActiveUsers } = translations;

export default function ExploreStatBlock() {
  const {
    loading: isLoading,
    data,
    startPolling,
    stopPolling,
  } = useQuery(GET_ACTIVE_BITCOINERS_SUMMARY);

  useEffect(() => {
    startPolling(THIRTY_SECONDS);

    return stopPolling;
  }, [startPolling, stopPolling]);

  const isDataUnavailable = isLoading || !data;

  const {
    dailyActiveCount,
    dailyActivePreviousCount,
    weeklyActiveCount,
    weeklyActivePreviousCount,
    monthlyActiveCount,
    monthlyActivePreviousCount,
    yearlyActiveCount,
    yearlyActivePreviousCount,
  } = data?.activeBitcoinersSummary || {};

  const dailyChange = dailyActiveCount - dailyActivePreviousCount;
  const dailyChangePercentage =
    ((100 / dailyActivePreviousCount) * dailyChange)?.toFixed(1) || 0;
  const isDailyActiveIncrease = dailyChange >= 0;

  const weeklyChange = weeklyActiveCount - weeklyActivePreviousCount;
  const weeklyChangePercentage =
    ((100 / weeklyActivePreviousCount) * weeklyChange)?.toFixed(1) || 0;
  const isWeeklyActiveIncrease = weeklyChange >= 0;

  const monthlyChange = monthlyActiveCount - monthlyActivePreviousCount;
  const monthlyChangePercentage =
    ((100 / monthlyActivePreviousCount) * monthlyChange)?.toFixed(1) || 0;
  const isMonthlyActiveIncrease = monthlyChange >= 0;

  const yearlyChange = yearlyActiveCount - yearlyActivePreviousCount;
  const yearlyChangePercentage =
    ((100 / yearlyActivePreviousCount) * yearlyChange)?.toFixed(1) || 0;
  const isYearlyActiveIncrease = yearlyChange >= 0;

  return (
    <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex-column justify-between items-center">
      <div className="w-full flex justify-center items-center">
        <span className="font-bold text-xl text-zinc-300">
          {translate(seleneActiveUsers)}
        </span>
      </div>

      <DailyTarget />

      <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex justify-between items-center">
        <div className="p-1 mx-1">
          <div className="font-bold text-zinc-300">24h</div>
          <div
            className={`${isDailyActiveIncrease ? "text-primary" : "text-red-500"} text-lg font-semibold`}
          >
            {isDataUnavailable ? "-" : dailyActiveCount}
          </div>
          <div
            className={`text-xs ${isDailyActiveIncrease ? "text-primary" : "text-red-500"}`}
          >
            {isDailyActiveIncrease ? "↑" : "↓"} {isDailyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : dailyChange} (
            {isDailyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : dailyChangePercentage}%)
          </div>
        </div>

        <div className="p-1 mx-1">
          <div className="font-bold text-zinc-300">7d</div>
          <div
            className={`${isWeeklyActiveIncrease ? "text-primary" : "text-red-500"} text-lg font-semibold`}
          >
            {isDataUnavailable ? "-" : weeklyActiveCount}
          </div>
          <div
            className={`text-xs ${isWeeklyActiveIncrease ? "text-primary" : "text-red-500"}`}
          >
            {isWeeklyActiveIncrease ? "↑" : "↓"} {isWeeklyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : weeklyChange} (
            {isWeeklyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : weeklyChangePercentage}%)
          </div>
        </div>

        <div className="p-1 mx-1">
          <div className="font-bold text-zinc-300">30d</div>
          <div
            className={`${isMonthlyActiveIncrease ? "text-primary" : "text-red-500"} text-lg font-semibold`}
          >
            {isDataUnavailable ? "-" : monthlyActiveCount}
          </div>
          <div
            className={`text-xs ${isMonthlyActiveIncrease ? "text-primary" : "text-red-500"}`}
          >
            {isMonthlyActiveIncrease ? "↑" : "↓"}{" "}
            {isMonthlyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : monthlyChange} (
            {isMonthlyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : monthlyChangePercentage}%)
          </div>
        </div>

        <div className="p-1 mx-1">
          <div className="font-bold text-zinc-300">1y</div>
          <div
            className={`${isYearlyActiveIncrease ? "text-primary" : "text-red-500"} text-lg font-semibold`}
          >
            {isDataUnavailable ? "-" : yearlyActiveCount}
          </div>
          <div
            className={`text-xs ${isYearlyActiveIncrease ? "text-primary" : "text-red-500"}`}
          >
            {isYearlyActiveIncrease ? "↑" : "↓"} {isYearlyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : yearlyChange} (
            {isYearlyActiveIncrease && "+"}
            {isDataUnavailable ? "-" : yearlyChangePercentage}%)
          </div>
        </div>
      </div>
    </div>
  );
}
