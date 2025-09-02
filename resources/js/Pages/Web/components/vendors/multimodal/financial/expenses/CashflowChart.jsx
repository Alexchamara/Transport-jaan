import React, { useRef } from "react";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Filler,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Filler,
    Legend
);

const months = [
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
];

const incomeData = [
    4000, 5000, 4500, 7000, 6000, 6500, 9000, 12000, 11000, 13000, 15000, 12000,
];
const expensesData = [
    15000, 17000, 16000, 19000, 17000, 18000, 18500, 18200, 17000, 17500, 20000,
    22000,
];



const highlightIndex = 7; // August (0-based)
const highlightIncome = 18450;
const highlightExpenses = 14200;

const data = {
    labels: months,
    datasets: [
        {
            label: "Income",
            data: incomeData,
            fill: true,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "#C4E0FF");
                gradient.addColorStop(0.7539, "rgba(9, 85, 172, 0.4)");
                gradient.addColorStop(1, "rgba(9, 85, 172, 0.4)");
                return gradient;
            },
            borderColor: "#0955AC",
            pointBackgroundColor: "#0955AC",
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 3,
            pointHoverRadius: 7,
            order: 2,
        },
        {
            label: "Expenses",
            data: expensesData,
            fill: true,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(217, 217, 217, 0.5)");
                gradient.addColorStop(0.274, "rgba(217, 217, 217, 0.5)");
                gradient.addColorStop(0.6971, "rgba(115, 115, 115, 0.2)");
                gradient.addColorStop(1, "rgba(115, 115, 115, 0.2)");
                return gradient;
            },
            borderColor: "#000000",
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 7,
            pointBackgroundColor: "#000000",
            tension: 0.4,
            order: 1,
        },
    ],
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: false,
            external: function (context) {
                // Custom tooltip handled in React below
            },
        },
    },
    interaction: {
        mode: "nearest",
        intersect: false,
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                font: {
                    family: "Figtree",
                    size: 14,
                    weight: 500,
                },
                color: "#00000040",
            },
        },
        y: {
            grid: {
                color: "#00000040",
                drawBorder: false,
            },
            ticks: {
                callback: (value) => `$${value / 1000}K`,
                font: {
                    family: "Figtree",
                    size: 14,
                    weight: 500,
                },
                color: "#7B7B7A",
                stepSize: 6000,
                maxTicksLimit: 5,
            },
            min: 0,
            max: 24000,
        },
    },
    elements: {
        point: {
            hoverRadius: 4,
        },
    },
};

const CashflowChart = () => {
    const chartRef = useRef();
    const [tooltip, setTooltip] = React.useState({
        x: null, // Will be set after chart renders
        y: null,
        month: months[highlightIndex],
        income: incomeData[highlightIndex],
        expenses: expensesData[highlightIndex],
    });

    const customTooltip = (context) => {
        const { chart, tooltip } = context;
        if (!tooltip.opacity) {
            setTooltip(null);
            return;
        }
        const dataIndex = tooltip.dataPoints?.[0]?.dataIndex;
        if (dataIndex !== undefined) {
            setTooltip({
                x: chart.scales.x.getPixelForValue(months[dataIndex]),
                y: chart.scales.y.getPixelForValue(expensesData[dataIndex]),
                month: months[dataIndex],
                income: incomeData[dataIndex],
                expenses: expensesData[dataIndex],
            });
        } else {
            setTooltip(null);
        }
    };

    React.useEffect(() => {
        const chart = chartRef.current;
        if (chart) {
            chart.options.plugins.tooltip.external = customTooltip;
            // Set initial tooltip position after chart is ready
            setTooltip((prev) => ({
                ...prev,
                x: chart.scales.x.getPixelForValue(months[highlightIndex]),
                y: chart.scales.y.getPixelForValue(expensesData[highlightIndex]),
            }));
        }
    }, [chartRef]);

    return (
        <div className="relative w-full h-full">
            {/* Custom Legends */}
            <div className="flex flex-row gap-8 items-center mt-7 mb-2 ml-2 px-12">
                <h1 className="figtree text-[24px] font-[700]">
                    Cashflow
                </h1>
                <div className="ml-auto">
                    <button className="bg-[#F6F8FA] rounded-[8px] px-5 py-2 text-[14px] font-[600] text-[#00000080]">
                        Last 8 months <span className="ml-2">▼</span>
                    </button>
                </div>
            </div>
            <div className="flex flex-row gap-6 items-center ml-20 mb-2 px-10">
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-[22px] h-[4px] bg-[#0A56AD]" />
                    <span className="figtree text-[20px] font-[600] text-[#00000080]">
                        Income
                    </span>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-[22px] h-[4px] bg-[#000000]" />
                    <span className="figtree text-[20px] font-[600] text-[#00000080]">
                        Expenses
                    </span>
                </div>
            </div>
            <div className="w-full h-[320px] bg-transparent px-10 pb-10 mt-5">
                <Line ref={chartRef} data={data} options={options} />
                {/* Custom Tooltip */}
                {tooltip && (
                    <div
                        className="absolute z-10 bg-[#D8E4F2] rounded-[10px] px-2 py-2 shadow-lg flex flex-col items-center"
                        style={{
                            left: tooltip.x - 20,
                            top: tooltip.y - 20,
                            minWidth: 180,
                            width: 152,
                            height: 73,
                        }}
                    >
                        <div className="figtree text-[14px] font-[600]">
                            {`${tooltip.month} 2025`}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-row items-center gap-4">
                                <span className="text-[#000000] text-[10px] font-[500]">
                                    Income
                                </span>
                                <span className="text-[#000000] text-[13px] font-[700]">
                                    ${tooltip.income.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex flex-row items-center gap-4">
                                <span className="text-[#000000] text-[10px] font-[500]">
                                    Expenses
                                </span>
                                <span className="text-[#000000] text-[13px] font-[700]">
                                    ${tooltip.expenses.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashflowChart;
