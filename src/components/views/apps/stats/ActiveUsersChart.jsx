/* eslint-disable react/prop-types */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DateTime } from "luxon";
import { translate } from "@/util/translations";
import translations from "./ActiveUsersChartTranslations";
import { Period } from "@/util/time";

const { activeSeleneUsers } = translations;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ActiveUsersChart({ data, period }) {
  const labels = data.activeBitcoiners.map(({ date }) => {
    switch (period) {
      case Period.Weekly:
        return `${DateTime.fromISO(date).toLocaleString({
          month: "short",
          day: "numeric",
        })} - ${DateTime.fromISO(date).plus({ days: 6 }).toLocaleString({
          month: "short",
          day: "numeric",
        })}`;
      case Period.Monthly:
        return DateTime.fromISO(date).toLocaleString({
          month: "short",
        });
      case Period.Yearly:
        return DateTime.fromISO(date).toLocaleString({
          year: "numeric",
        });
      default: // Period.Daily
        return DateTime.fromISO(date).toLocaleString({
          month: "short",
          day: "numeric",
        });
    }
  });

  const dataPoints = data.activeBitcoiners.map(({ count }) => count);

  const maxCount = Math.max(
    ...data.activeBitcoiners.map(({ count }) => parseInt(count, 10))
  );
  const maxCountRoundedUpToNearest10 = Math.ceil(maxCount / 10) * 10;

  const chartData = {
    labels,
    datasets: [
      {
        label: translate(activeSeleneUsers),
        data: dataPoints,
        borderColor: "#478559",
        backgroundColor: "#478559",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: false,
      },
      title: {
        display: false,
        text: "Chart.js Line Chart",
      },
    },
    scales: {
      y: {
        min: 0,
        max: maxCountRoundedUpToNearest10,
      },
    },
  };

  return (
    <div className="flex justify-center items-center">
      <Line options={options} data={chartData} />
    </div>
  );
}

export default ActiveUsersChart;
