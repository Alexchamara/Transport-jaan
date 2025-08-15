import React from "react";

import weekNews1 from "../../../assets/landingPages/blog/weekNews1.svg";
import weekNews2 from "../../../assets/landingPages/blog/weekNews2.svg";
import weekNews3 from "../../../assets/landingPages/blog/weekNews3.svg";
import weekNews4 from "../../../assets/landingPages/blog/weekNews4.svg";
import weekNews5 from "../../../assets/landingPages/blog/weekNews5.svg";

import clock2 from "../../../assets/landingPages/blog/clock2.svg";
import calendar2 from "../../../assets/landingPages/blog/calendar2.svg";

const BestNews = () => {
    return (
        <div>
            <div className="xl:px-40 px-10 py-10">
                <div className="flex lg:flex-row flex-col gap-10">
                    {/* left section */}
                    <div className="w-full">
                        <div className="flex flex-row justify-center items-center xl:pl-20">
                            <div className="xl:w-[198px] xl:h-[37px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[12px] font-[600] p-3">
                                <h1>Weekly Best News</h1>
                            </div>
                            <div className="w-full h-[5px] border-y-[1px] border-[#DFDFDF]"></div>
                        </div>
                        <div className="py-10 flex flex-col gap-5">
                            {/* news 1 */}
                            <div className="flex xl:flex-row flex-col gap-5 cursor-pointer">
                                <img src={weekNews1} />
                                <div className="flex flex-col gap-5">
                                    <div className="w-[72px] h-[26px] bg-[#FF7003] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                        VEHICLE
                                    </div>
                                    <h1 className="text-[22px]/[26px] font-[700] text-[#0955AC]">
                                        Taking The Stress Out Of Design System
                                        Management
                                    </h1>
                                    <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                        <div className="flex flex-row gap-2">
                                            <img src={calendar2} />
                                            <h1>27 August, 2024</h1>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <img src={clock2} />
                                            <h1>20 Mins</h1>
                                        </div>
                                    </div>
                                    <p className="text-[12px]/[33px] text-[#FFFFFFA6] font-[500] mt-3">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit. Donec semper eu risus
                                        ut ornare. In.Lorem ipsum dolor sit
                                        amet, Lorem ipsum dolor sit amet,
                                        consectetur adipiscing elit. Donec
                                        semper{" "}
                                    </p>
                                </div>
                            </div>
                            {/* news 2 */}
                            <div className="flex xl:flex-row flex-col gap-5 cursor-pointer">
                                <img src={weekNews2} />
                                <div className="flex flex-col gap-5">
                                    <div className="w-[72px] h-[26px] bg-[#FF7003] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                        VEHICLE
                                    </div>
                                    <h1 className="text-[22px]/[26px] font-[700] text-[#0955AC]">
                                        Taking The Stress Out Of Design System
                                        Management
                                    </h1>
                                    <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                        <div className="flex flex-row gap-2">
                                            <img src={calendar2} />
                                            <h1>27 August, 2024</h1>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <img src={clock2} />
                                            <h1>20 Mins</h1>
                                        </div>
                                    </div>
                                    <p className="text-[12px]/[33px] text-[#FFFFFFA6] font-[500] mt-3">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit. Donec semper eu risus
                                        ut ornare. In.Lorem ipsum dolor sit
                                        amet, Lorem ipsum dolor sit amet,
                                        consectetur adipiscing elit. Donec
                                        semper{" "}
                                    </p>
                                </div>
                            </div>
                            {/* news 3 */}
                            <div className="flex xl:flex-row flex-col gap-5 cursor-pointer">
                                <img src={weekNews3} />
                                <div className="flex flex-col gap-5">
                                    <div className="w-[72px] h-[26px] bg-[#FF7003] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                        VEHICLE
                                    </div>
                                    <h1 className="text-[22px]/[26px] font-[700] text-[#0955AC]">
                                        Taking The Stress Out Of Design System
                                        Management
                                    </h1>
                                    <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                        <div className="flex flex-row gap-2">
                                            <img src={calendar2} />
                                            <h1>27 August, 2024</h1>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <img src={clock2} />
                                            <h1>20 Mins</h1>
                                        </div>
                                    </div>
                                    <p className="text-[12px]/[33px] text-[#FFFFFFA6] font-[500] mt-3">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit. Donec semper eu risus
                                        ut ornare. In.Lorem ipsum dolor sit
                                        amet, Lorem ipsum dolor sit amet,
                                        consectetur adipiscing elit. Donec
                                        semper{" "}
                                    </p>
                                </div>
                            </div>
                            {/* news 4 */}
                            <div className="flex xl:flex-row flex-col gap-5 cursor-pointer">
                                <img src={weekNews4} />
                                <div className="flex flex-col gap-5">
                                    <div className="w-[72px] h-[26px] bg-[#FF7003] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                        VEHICLE
                                    </div>
                                    <h1 className="text-[22px]/[26px] font-[700] text-[#0955AC]">
                                        Taking The Stress Out Of Design System
                                        Management
                                    </h1>
                                    <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                        <div className="flex flex-row gap-2">
                                            <img src={calendar2} />
                                            <h1>27 August, 2024</h1>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <img src={clock2} />
                                            <h1>20 Mins</h1>
                                        </div>
                                    </div>
                                    <p className="text-[12px]/[33px] text-[#FFFFFFA6] font-[500] mt-3">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit. Donec semper eu risus
                                        ut ornare. In.Lorem ipsum dolor sit
                                        amet, Lorem ipsum dolor sit amet,
                                        consectetur adipiscing elit. Donec
                                        semper{" "}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* right section */}
                    <div className="xl:w-[330px]">
                        <div className="flex flex-row justify-center items-center">
                            <div className="w-[155px] h-[37px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[12px] font-[600]">
                                <h1>Recent Posts</h1>
                            </div>
                            <div className="xl:w-[176px] w-full h-[5px] border-y-[1px] border-[#DFDFDF]"></div>
                        </div>

                        <div className="py-10">
                            <div className="cursor-pointer flex flex-col xl:items-start items-center">
                                <img src={weekNews5} />
                                <div className="flex flex-col xl:items-start items-center gap-5 mt-5">
                                    <div className="w-[80px] h-[26px] border-[1px] border-[#FFFFFF] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                        VEHICLE
                                    </div>
                                    <h1 className="text-[18px]/[26px] font-[700] xl:text-start text-center text-[#0955AC]">
                                        Racing Games Browned Buttadert Cookies
                                        Daily Breakfast
                                    </h1>
                                    <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                        <div className="flex flex-row gap-2">
                                            <img src={calendar2} />
                                            <h1>27 August, 2024</h1>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <img src={clock2} />
                                            <h1>20 Mins</h1>
                                        </div>
                                    </div>
                                </div>
                                 <div className="flex flex-col xl:items-start items-center gap-5 mt-5">
                                    <div className="w-[80px] h-[26px] border-[1px] border-[#FFFFFF] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                        VEHICLE
                                    </div>
                                    <h1 className="text-[18px]/[26px] font-[700] xl:text-start text-center text-[#0955AC]">
                                        Racing Games Browned Buttadert Cookies
                                        Daily Breakfast
                                    </h1>
                                    <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                        <div className="flex flex-row gap-2">
                                            <img src={calendar2} />
                                            <h1>27 August, 2024</h1>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <img src={clock2} />
                                            <h1>20 Mins</h1>
                                        </div>
                                    </div>
                                </div>
                                 <div className="flex flex-col xl:items-start items-center gap-5 mt-5">
                                    <div className="w-[80px] h-[26px] border-[1px] border-[#FFFFFF] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                        VEHICLE
                                    </div>
                                    <h1 className="text-[18px]/[26px] font-[700] xl:text-start text-center text-[#0955AC]">
                                        Racing Games Browned Buttadert Cookies
                                        Daily Breakfast
                                    </h1>
                                    <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                        <div className="flex flex-row gap-2">
                                            <img src={calendar2} />
                                            <h1>27 August, 2024</h1>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <img src={clock2} />
                                            <h1>20 Mins</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BestNews;
