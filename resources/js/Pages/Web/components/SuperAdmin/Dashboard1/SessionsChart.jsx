import React from "react";
import sessions from "../../../assets/superAdmin/Sessions Icon.png"
import externalR from "../../../assets/superAdmin/Arrow External Right.png";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const SessionsChart = () => {
  const data = {
    labels: ["12 AM", "8 AM", "4 PM", "11 PM"],
    datasets: [
      {
        label: "Sessions",
        data: [50, 120, 90, 140,],
        borderColor: "#ffffff",
        tension: 0,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true, // Explicitly enable tooltip
            backgroundColor: '#0B1739',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#0B1739',
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: "#94a3b8" },
            barPercentage: 0.5,
            categoryPercentage: 0.5,
        },
        y: { grid: { display: false }, ticks: { display: false } },
    },
};
  return (
    <div className=" bg-[#0B1739] p-5 shadow-lg h-[278.4921875px] min-w-[355px] pb-[120px]">
            <div className="flex flex-row justify-center items-center w-full ">
                <div className="flex flex-col w-full">
                    <div className="flex flex-row items-center gap-2  ">
                        <img src={sessions} className="size-[12px]" alt="Sales Icon" />
                        <h2 className="text-[#AEB9E1] text-[12px] flex flex-row justify-between items-center">
                            Total sessions
                        </h2>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                        <h1 className="text-white text-[32px] font-bold">
                          400  
                        </h1>
                        <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px] ">
                            <h1 className=" flex items-baseline text-green-400 text-[9px] px-1 text-[14px] font-medium">
                                16.8%
                            </h1>
                            <img
                                src={externalR}
                                className="size-[9px] md:w-[10px]"
                                alt="external link"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Line data={data} options={options} />
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-[#AEB9E1] text-sm mt-4">
                Last 12 months
              </h1>
              <button className="text-white text-sm mt-4">
                View report
              </button>
            </div>
        </div>
  );
};

export default SessionsChart;