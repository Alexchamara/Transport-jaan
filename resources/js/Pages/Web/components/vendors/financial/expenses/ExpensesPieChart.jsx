import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import miniArrow from "../../../../assets/financial/expenses/miniArrow.svg";

const data = [
    { name: "Vehicle Maintenance", value: 3000, percent: 65, color: "#344B8E" },
    { name: "Hired", value: 2500, percent: 25, color: "#3DD0FF" },
    { name: "Pending", value: 2000, percent: 30, color: "#0955AC" },
    { name: "Cancelled", value: 500, percent: 30, color: "#8CA9E6" },
];

const total = data.reduce((sum, item) => sum + item.value, 0);

const ExpensesPieChart = () => (
    <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="flex flex-row items-center justify-center w-full mb-2">
            <PieChart width={140} height={140}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
            <div>
                <div className="flex flex-col items-center justify-center w-full px-5">
                    <div className="text-[14px] font-[500] text-[#00000080] w-[114px] h-[33px] gap-3 bg-[#D9D9D94F] flex justify-center items-center rounded-[6px] px-3 py-1">
                        This Week
                        <img src={miniArrow} />
                    </div>
                    <div className="text-[14px] font-[500] text-[#00000080]">
                        Total Expenses
                    </div>

                    <div className="text-[26px] font-[700] text-[#000000] w-full text-center pr-2 leading-tight">
                        ${total.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
        <div className="w-[287px] h-[0.8px] bg-[#00000080] mt-10" />
        <div className="flex flex-col w-full mt-4">
            {data.map((item, idx) => (
                <div
                    className={`flex flex-row items-center justify-between w-full px-2 py-1 ${
                        idx !== data.length - 1 ? "mb-1" : ""
                    }`}
                    key={item.name + "-row"}
                >
                    <div className="flex flex-row items-center">
                        <span
                            className="w-[32px] h-[20px] rounded-[4px] mr-3 flex items-center justify-center"
                            style={{ backgroundColor: item.color }}
                        >
                            <span className="text-[10px] font-[700] text-[#FFFFFF]">
                                {item.percent}%
                            </span>
                        </span>
                        <span className="text-[16px] font-[600] text-[#00000080]">
                            {item.name}
                        </span>
                    </div>
                    <span className="text-[15px] font-[600] text-[#000000]">
                        ${item.value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

export default ExpensesPieChart;
