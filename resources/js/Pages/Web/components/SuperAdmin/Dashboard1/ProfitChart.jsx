import React from "react";
import externalR from "../../../assets/superAdmin/Arrow External Right.png";
import sales from "../../../assets/superAdmin/Sales Icon.png";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Pointer } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ProfitChart = () => {
    const data = {
        labels: ["12 AM", "8 AM", "4 PM", "11 PM"],
        datasets: [
            {
                label: "Profit",
                data: [30, 50, 70, 55, 90, 75, 95],
                backgroundColor: "#00c2ff",
                borderRadius: 6,
            },
            {
                label: "Profit",
                data: [40, 60, 50, 80, 20, 85],
                backgroundColor: "#ffffff",
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#0B1739', // Changed tooltip background color
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
                        <img src={sales} className="size-[12px]" alt="Sales Icon" />
                        <h2 className="text-[#AEB9E1] text-[12px] flex flex-row justify-between items-center">
                            Total revenue
                        </h2>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                        <h1 className="text-white text-[32px] font-bold">
                            $144.6K
                        </h1>
                        <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px] ">
                            <h1 className=" flex items-baseline text-green-400 text-[9px] px-1 text-[14px] font-medium">
                                28.5%
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
            <Bar data={data} options={options} />

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

export default ProfitChart;
