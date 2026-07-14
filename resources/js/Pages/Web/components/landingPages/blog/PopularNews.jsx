import React from "react";
import bNews1 from "../../../assets/landingPages/blog/bNews1.svg";
import bNews2 from "../../../assets/landingPages/blog/bNews2.svg";
import bNews3 from "../../../assets/landingPages/blog/bNews3.svg";
import bNews4 from "../../../assets/landingPages/blog/bNews4.svg";
import bNews5 from "../../../assets/landingPages/blog/bNews5.svg";

import sNews1 from "../../../assets/landingPages/blog/sNews1.svg";
import sNews2 from "../../../assets/landingPages/blog/sNews2.svg";
import sNews3 from "../../../assets/landingPages/blog/sNews3.svg";
import sNews4 from "../../../assets/landingPages/blog/sNews4.svg";
import sNews5 from "../../../assets/landingPages/blog/sNews5.svg";

import clock2 from "../../../assets/landingPages/blog/clock2.svg";
import calendar2 from "../../../assets/landingPages/blog/calendar2.svg";

const PopularNews = () => {
    return (
        <div className="xl:px-40 px-5 py-10">
            <div className="flex lg:flex-row flex-col gap-10">
                {/* left section */}
                <div className="w-full">
                    <div className="flex flex-row justify-center items-center xl:pl-20">
                        <div className="w-[155px] h-[37px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[12px] font-[600] p-3">
                            <h1>Our Popular News</h1>
                        </div>
                        <div className="w-full h-[5px] border-y-[1px] border-[#DFDFDF]"></div>
                    </div>
                    {/* big blog section */}
                    <div className="py-10 flex flex-col lg:items-start gap-2">
                        {/* 1st row */}
                        <div className="flex xl:flex-row items-center flex-col gap-2">
                            {/* big blog 1 */}
                            <div
                                className="md:w-[415px] w-[215px] h-[300px] p-5 flex flex-col rounded-[9px] gap-5 justify-end items-start cursor-pointer bg-no-repeat"
                                style={{ backgroundImage: `url(${bNews1})` }}
                            >
                                <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                    VEHICLE
                                </div>
                                <h1 className="text-[20px] font-[700] break-words manrope">
                                    Lorem Ipsum dolar sit amet, consectetur
                                    lorem ipsum dolor.
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#BACCE1]">
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
                            {/* big blog 2 */}
                            <div
                                className="md:w-[415px] w-[215px] h-[300px] p-5 flex flex-col rounded-[9px] gap-5 justify-end items-start cursor-pointer bg-no-repeat"
                                style={{ backgroundImage: `url(${bNews2})` }}
                            >
                                <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                    VEHICLE
                                </div>
                                <h1 className="text-[20px] font-[700] manrope">
                                    Lorem Ipsum dolar sit amet, consectetur
                                    lorem ipsum dolor.
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#BACCE1]">
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
                        {/* 2nd row */}
                        <div className="flex xl:flex-row flex-col items-center gap-2">
                            {/* big blog 3 */}
                            <div
                                className="md:w-[275px] w-[215px] h-[263px] p-5 flex flex-col rounded-[9px] gap-5 justify-end items-start cursor-pointer"
                                style={{ backgroundImage: `url(${bNews3})` }}
                            >
                                <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                    VEHICLE
                                </div>
                                <h1 className="text-[20px] font-[700] manrope">
                                    Lorem Ipsum dolar sit amet, consectetur .
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#BACCE1]">
                                    <div className="flex flex-row gap-2">
                                        <img src={calendar2} />
                                        <h1>27 August, 2024</h1>
                                    </div>
                                </div>
                            </div>
                            {/* big blog 4 */}
                            <div
                                className="md:w-[275px] w-[215px] h-[263px] p-5 flex flex-col rounded-[9px] gap-5 justify-end items-start cursor-pointer"
                                style={{ backgroundImage: `url(${bNews4})` }}
                            >
                                <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                    VEHICLE
                                </div>
                                <h1 className="text-[20px] font-[700] manrope">
                                    Lorem Ipsum dolar sit amet, consectetur .
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#BACCE1]">
                                    <div className="flex flex-row gap-2">
                                        <img src={calendar2} />
                                        <h1>27 August, 2024</h1>
                                    </div>
                                </div>
                            </div>
                            {/* big blog 5 */}
                            <div
                                className="md:w-[275px] w-[215px] h-[263px] p-5 flex flex-col rounded-[9px] gap-5 justify-end items-start cursor-pointer"
                                style={{ backgroundImage: `url(${bNews5})` }}
                            >
                                <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                    VEHICLE
                                </div>
                                <h1 className="text-[20px] font-[700] manrope">
                                    Lorem Ipsum dolar sit amet, consectetur .
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#BACCE1]">
                                    <div className="flex flex-row gap-2">
                                        <img src={calendar2} />
                                        <h1>27 August, 2024</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* right section */}
                <div className="">
                    <div className="flex flex-row justify-center items-center">
                        <div className="w-[155px] h-[37px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[12px] font-[600]">
                            <h1>Recent Posts</h1>
                        </div>
                        <div className="w-[176px] h-[5px] border-y-[1px] border-[#DFDFDF]"></div>
                    </div>

                    {/* mini blog section */}
                    <div className="py-10 flex flex-col items-center gap-2">
                         {/* small blog 1 */}
                        <div className="flex flex-row gap-3 cursor-pointer">
                            <img src={sNews1} />
                            <div className="flex flex-col gap-2">
                                <div className="w-[72px] h-[26px] border-[1px] border-[#B8C1CD] text-[12px] font-[500] rounded-[3px] flex justify-center items-center uppercase text-[#6D757F]">
                                    Racing
                                </div>
                                <h1 className="text-[18px]/[25px] font-[700] text-[#286BB6]">
                                    The Butter Chocolate Cookies Daily
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                    <div className="flex flex-row gap-2">
                                        <img src={calendar2} />
                                        <h1>27 August, 2024</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* small blog 2 */}
                        <div className="flex flex-row gap-3 cursor-pointer">
                            <img src={sNews2} />
                            <div className="flex flex-col gap-2">
                                <div className="w-[72px] h-[26px] border-[1px] border-[#B8C1CD] text-[12px] font-[500] rounded-[3px] flex justify-center items-center uppercase text-[#6D757F]">
                                    Racing
                                </div>
                                <h1 className="text-[18px]/[25px] font-[700] text-[#286BB6]">
                                    The Butter Chocolate Cookies Daily
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                    <div className="flex flex-row gap-2">
                                        <img src={calendar2} />
                                        <h1>27 August, 2024</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* small blog 3 */}
                        <div className="flex flex-row gap-3 cursor-pointer">
                            <img src={sNews3} />
                            <div className="flex flex-col gap-2">
                                <div className="w-[72px] h-[26px] border-[1px] border-[#B8C1CD] text-[12px] font-[500] rounded-[3px] flex justify-center items-center uppercase text-[#6D757F]">
                                    Racing
                                </div>
                                <h1 className="text-[18px]/[25px] font-[700] text-[#286BB6]">
                                    The Butter Chocolate Cookies Daily
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                    <div className="flex flex-row gap-2">
                                        <img src={calendar2} />
                                        <h1>27 August, 2024</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* small blog 4 */}
                        <div className="flex flex-row gap-3 cursor-pointer">
                            <img src={sNews4} />
                            <div className="flex flex-col gap-2">
                                <div className="w-[72px] h-[26px] border-[1px] border-[#B8C1CD] text-[12px] font-[500] rounded-[3px] flex justify-center items-center uppercase text-[#6D757F]">
                                    Racing
                                </div>
                                <h1 className="text-[18px]/[25px] font-[700] text-[#286BB6]">
                                    The Butter Chocolate Cookies Daily
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                    <div className="flex flex-row gap-2">
                                        <img src={calendar2} />
                                        <h1>27 August, 2024</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* small blog 5 */}
                        <div className="flex flex-row gap-3 cursor-pointer">
                            <img src={sNews5} />
                            <div className="flex flex-col gap-2">
                                <div className="w-[72px] h-[26px] border-[1px] border-[#B8C1CD] text-[12px] font-[500] rounded-[3px] flex justify-center items-center uppercase text-[#6D757F]">
                                    Racing
                                </div>
                                <h1 className="text-[18px]/[25px] font-[700] text-[#286BB6]">
                                    The Butter Chocolate Cookies Daily
                                </h1>
                                <div className="flex flex-row gap-5 text-[13px] font-[600] text-[#6D757F]">
                                    <div className="flex flex-row gap-2">
                                        <img src={calendar2} />
                                        <h1>27 August, 2024</h1>
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

export default PopularNews;
