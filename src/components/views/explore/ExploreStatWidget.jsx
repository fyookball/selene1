import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { selectCurrentPrice } from "@/redux/exchangeRates";
import { THIRTY_SECONDS } from "@/util/time";
import GET_ACTIVE_BITCOINERS_SUMMARY from "@/apps/stats/getActiveBitcoinersSummary";

export default function ExploreStatWidget() {
  const price = useSelector(selectCurrentPrice);

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
    monthlyActiveCount,
    monthlyActivePreviousCount,
  } = data?.activeBitcoinersSummary || {};

  const dailyChange = dailyActiveCount - dailyActivePreviousCount;
  const dailyChangePercentage =
    ((100 / dailyActivePreviousCount) * dailyChange)?.toFixed(1) || 0;
  const isDailyActiveIncrease = dailyChange >= 0;

  const monthlyChange = monthlyActiveCount - monthlyActivePreviousCount;
  const monthlyChangePercentage =
    ((100 / monthlyActivePreviousCount) * monthlyChange)?.toFixed(1) || 0;
  const isMonthlyActiveIncrease = monthlyChange >= 0;

  return (
    <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex justify-between items-center">
      <Link to="/apps/stats/#d">
        <div className="p-1 mx-1">
          <div className="font-bold text-zinc-300">Daily Users</div>
          <div className="text-primary text-lg font-semibold">
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
      </Link>

      <Link to="/apps/stats/#m">
        <div className="p-1 mx-1">
          <div className="font-bold text-zinc-300">Monthly Users</div>
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
      </Link>

      {/*<Link to="/apps/price">*/}
      <div className="p-1 mx-1">
        <div className="font-bold text-zinc-300">BCH/{price.currency}</div>
        <div className="text-primary text-lg font-semibold">
          {price.priceString}
        </div>
        <div className="text-xs text-zinc-400">&nbsp;</div>
      </div>
      {/*</Link>*/}
    </div>
  );
}
