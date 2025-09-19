import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import exportIcon from "../../../assets/superAdmin/Export-icon.png";

const WebsiteVisitors = () => {
    const data = [
        { name: "Direct", value: 20 },
        { name: "Organic", value: 30 },
        { name: "Social", value: 50 },
    ];

    const COLORS = ["#00C2FF", "#0E43FB", "#ffffff"]; // Distinct colors for each layer

    return (
        <div className="rounded-[10px] bg-[#0B1739] shadow-lg min-w-[341px] h-[460px] flex flex-col justify-center px-4 py-4">
            <div className="flex flex-row justify-between items-center">
                <h1 className="text-white text-[16px] font-500">
                    Website Visitors
                </h1>
                <div className="flex flex-row gap-2 md:gap-4">
                    <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0A1330] bg-[#0A1330] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                        <h1>Export data</h1>
                        <img
                            src={exportIcon}
                            className="size-[12px] md:w-[10px] md:h-[10px]"
                        />
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    {/* Social (outermost ring) */}
                    <Pie
                        data={data.filter((item) => item.name === "Social")}
                        cx="50%"
                        cy="50%"
                        innerRadius={110}
                        outerRadius={120}
                        fill="#ffffff"
                        dataKey="value"
                        startAngle={270}
                        endAngle={30}
                        isAnimationActive={true}
                    >
                        {data
                            .filter((item) => item.name === "Social")
                            .map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[2]} />
                            ))}
                    </Pie>
                    {/* Organic (middle ring) */}
                    <Pie
                        data={data.filter((item) => item.name === "Organic")}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={100}
                        fill="#0E43FB"
                        dataKey="value"
                        startAngle={250}
                        endAngle={50}
                        isAnimationActive={true}
                    >
                        {data
                            .filter((item) => item.name === "Organic")
                            .map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[1]} />
                            ))}
                    </Pie>
                    {/* Direct (innermost ring) */}
                    <Pie
                        data={data.filter((item) => item.name === "Direct")}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={80}
                        fill="#00C2FF"
                        dataKey="value"
                        startAngle={225}
                        endAngle={10}
                        isAnimationActive={true}
                    >
                        {data
                            .filter((item) => item.name === "Direct")
                            .map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[0]} />
                            ))}
                    </Pie>
                </PieChart>
                <div className="text-center -mt-[170px]">
                    <h1 className="text-white text-[32px] font-bold">150k</h1>
                </div>
            </ResponsiveContainer>
            <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-[#ffffff] rounded-full"></span>
                    <span className="text-[#AEB9E1] text-sm">Organic</span>
                    <span className="text-white ml-auto">50%</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-[#0E43FB] rounded-full"></span>
                    <span className="text-[#AEB9E1] text-sm">Social</span>
                    <span className="text-white ml-auto">30%</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#00C2FF] rounded-full"></span>
                    <span className="text-[#AEB9E1] text-sm">Direct</span>
                    <span className="text-white ml-auto">20%</span>
                </div>
            </div>
        </div>
    );
};

export default WebsiteVisitors;
