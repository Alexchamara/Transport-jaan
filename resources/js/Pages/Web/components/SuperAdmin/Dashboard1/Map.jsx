import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import externalR from "../../../assets/superAdmin/Arrow External Right.png";
import Wmap from "../../../assets/superAdmin/Wmap.png";

const Map = () => {
    const data = [
        { name: "Australia", value: 1860 }, // 1.86K = 1860
    ];
    return (
        <div>
            <div className="flex flex-row gap-[10px]">
                <div className="w-[300px] h-[294.46875px]">
                    <div className="poppins flex flex-col gap-6">
                        <div className="poppins flex flex-col justify-start h-full flex flex-col">
                            <h1 className="text-white">Users by country </h1>
                            <div className="flex flex-row justify-between items-center gap-2">
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <h1 className="text-white text-[32px] font-bold">
                                        12.4K
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

                                <div className="flex flex-row gap-2 md:gap-4">
                                    <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0A1330] bg-[#0A1330] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                                        <h1>Export</h1>
                                        
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {/* Country 1 */}
                            <div className="flex flex-col">
                                <h1 className="text-white text-[12px] font-[400]">
                                    United States
                                </h1>
                                <div className="flex flex-row justify-between items-center ">
                                    <div className="w-[231px] h-[4.03px]">
                                        <div className="w-[110px] h-[4.03px] bg-[#0077FF] rounded-[2px]" />
                                    </div>
                                    <h1 className="text-[#AEB9E1] text-[12px] font-[400]">
                                        30%
                                    </h1>
                                </div>
                            </div>
                            {/* Country 2 */}
                            <div className="flex flex-col">
                                <h1 className="text-white text-[12px] font-[400]">
                                    United Kingdom
                                </h1>
                                <div className="flex flex-row justify-between items-center ">
                                    <div className="w-[231px] h-[4.03px]">
                                        <div className="w-[60px] h-[4.03px] bg-[#7E89AC] rounded-[2px]" />
                                    </div>
                                    <h1 className="text-[#AEB9E1] text-[12px] font-[400]">
                                        20%
                                    </h1>
                                </div>
                            </div>
                            {/* Country 3 */}
                            <div className="flex flex-col">
                                <h1 className="text-white text-[12px] font-[400]">
                                    Canada
                                </h1>
                                <div className="flex flex-row justify-between items-center ">
                                    <div className="w-[231px] h-[4.03px]">
                                        <div className="w-[70px] h-[4.03px] bg-[#9A91FB] rounded-[2px]" />
                                    </div>
                                    <h1 className="text-[#AEB9E1] text-[12px] font-[400]">
                                        20%
                                    </h1>
                                </div>
                            </div>
                            {/* Country 4 */}
                            <div className="flex flex-col">
                                <h1 className="text-white text-[12px] font-[400]">
                                    Australia
                                </h1>
                                <div className="flex flex-row justify-between items-center ">
                                    <div className="w-[231px] h-[4.03px]">
                                        <div className="w-[40px] h-[4.03px] bg-[#00C2FF] rounded-[2px]" />
                                    </div>
                                    <h1 className="text-[#AEB9E1] text-[12px] font-[400]">
                                        15%
                                    </h1>
                                </div>
                            </div>
                            {/* Country 5 */}
                            <div className="flex flex-col">
                                <h1 className="text-white text-[12px] font-[400]">
                                    Spain
                                </h1>
                                <div className="flex flex-row justify-between items-center ">
                                    <div className="w-[231px] h-[4.03px]">
                                        <div className="w-[20px] h-[4.03px] bg-[#D9E1FA] rounded-[2px]" />
                                    </div>
                                    <h1 className="text-[#AEB9E1] text-[12px] font-[400]">
                                        15%
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <img src={Wmap} alt="World Map" />
                    <div className="bg-[#0B1739] p-5 shadow-lg h-[138px] min-w-[132px] absolute top-16 right-16 rounded-[8px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={45}
                                    fill="#00b4d8"
                                    dataKey="value"
                                    startAngle={180}
                                    endAngle={90}
                                    isAnimationActive={true}
                                >
                                    <Cell fill="#00b4d8" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center -mt-[70px]">
                            <h1 className="text-white text-[16px] font-bold">
                                1.86K
                            </h1>
                            <p className="text-[#AEB9E1] text-[10px]">Australia</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map;
