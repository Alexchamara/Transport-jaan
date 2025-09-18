import React from "react";
import externalR from "../../../assets/superAdmin/Arrow External Right.png";
import sales from "../../../assets/superAdmin/Sales Icon.png";
import dotW from "../../../assets/superAdmin/dotW.png";
import dotDB from "../../../assets/superAdmin/dotDB.png";
import dotB from "../../../assets/superAdmin/dotB.png";
import calendar from "../../../assets/superAdmin/Calendar Icon.png";
import dropD from "../../../assets/superAdmin/Chevron Down.png";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CustomerTypeChart = () => {
    const data = {
        labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ],
        datasets: [
            {
                label: "Current Clients",
                data: [20, 30, 40, 25, 50, 35, 55, 40, 25, 30, 55, 40], // Example data
                backgroundColor: "#ffffff", // White
                borderRadius: 6,
            },
            {
                label: "Subscribers",
                data: [30, 50, 70, 55, 90, 75, 95, 80, 65, 70, 95, 80], // Example data
                backgroundColor: "#0E43FB", // Light blue
                borderRadius: 6,
            },
            {
                label: "New Customers",
                data: [10, 20, 30, 25, 40, 35, 45, 40, 35, 30, 45, 40], // Example data
                backgroundColor: "#00C2FF", // Green
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
                backgroundColor: "#0B1739",
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "#94a3b8" },
                barPercentage: 0.1,
                categoryPercentage: 0.1,
                stacked: true, // Enable stacking on x-axis
            },
            y: {
                grid: { display: false },
                ticks: { color: "#94a3b8" },
                stacked: true, // Enable stacking on y-axis
            },
        },
    };

    return (
        <div className="bg-[#0B1739] p-5 shadow-lg h-[460px] min-w-[689px] pb-[120px] rounded-[10px] poppins">
            <div className="flex flex-row justify-center items-center w-full ">
                <div className="flex flex-col w-full gap-2">
                    <div className="flex flex-row items-center gap-2.5">
                        <h2 className="text-[#AEB9E1] text-[12px] flex flex-row justify-between items-center">
                            Revenue by customer type
                        </h2>
                    </div>

                    <div className="flex flex-row justify-between items-center">
                        <h1 className="text-white text-[24px] font-600">
                            $240K
                        </h1>
                        <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px] ">
                            <h1 className="flex items-baseline text-green-400 text-[9px] text-[14px] font-medium">
                                34.8%
                            </h1>
                            <img
                                src={externalR}
                                className="size-[9px] md:w-[10px]"
                                alt="external link"
                            />
                        </div>
                        <div className="flex flex-row w-[430px] gap-1">
                            <div className="flex flex-row gap-2.5">
                                <div className="flex flex-row items-center gap-1 ">
                                    <img src={dotW} alt="dot" />
                                    <h1 className="text-[#AEB9E1] text-[10px]">
                                        Current Clients
                                    </h1>
                                </div>

                                <div className="flex flex-row items-center gap-1 ">
                                    <img src={dotDB} alt="dot" />
                                    <h1 className="text-[#AEB9E1] text-[10px]">
                                        Subscribers
                                    </h1>
                                </div>
                                <div className="flex flex-row items-center gap-1 ">
                                    <img src={dotB} alt="dot" />
                                    <h1 className="text-[#AEB9E1] text-[10px]">
                                        New Customers
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-row justify-center items-center gap-1 w-[155px] h-[30px] border border-[#0A1330] bg-[#0A1330] ">
                                <img src={calendar} alt="calendar" />
                                <h1 className="text-[#AEB9E1] text-[10px] font-medium ">
                                    Jan 2024 - Dec 2024
                                </h1>
                                <img src={dropD} alt="dropdown" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Bar data={data} options={options} className="mt-10" />
        </div>
    );
};

export default CustomerTypeChart;