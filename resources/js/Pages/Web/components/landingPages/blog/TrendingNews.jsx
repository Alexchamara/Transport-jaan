import React from "react";

import clock2 from "../../../assets/landingPages/blog/clock2.svg";
import calendar2 from "../../../assets/landingPages/blog/calendar2.svg";

import tNews1 from "../../../assets/landingPages/blog/tNews1.svg";
import tNews2 from "../../../assets/landingPages/blog/tNews2.svg";
import tNews3 from "../../../assets/landingPages/blog/tNews3.svg";
import tNews4 from "../../../assets/landingPages/blog/tNews4.svg";

const TrendingNews = () => {
    return (
        <div
            className="h-auto w-full bg-cover bg-center"
            style={{
                background:
                    "radial-gradient(closest-side at center, #32261D 0%, #000000 100%)",
            }}
        >
            <div className="xl:px-40 px-10 py-20">
                <div className="flex flex-row justify-center items-center">
                    <div className="xl:w-[198px] xl:h-[37px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[12px] font-[600] p-3">
                        <h1>Trending Travelling News</h1>
                    </div>
                    <div className="w-full h-[5px] border-y-[1px] border-[#DFDFDF]"></div>
                </div>

                <div className="flex md:flex-row gap-10 flex-col justify-between py-10">
                    {/* big video */}
                    <div className="flex flex-col xl:items-start items-center gap-10 xl:justify-center xl:w-1/2 cursor-pointer">
                        {/* <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            controls
                            autoPlay
                            loop
                            muted
                            className="w-[630px] h-[380px] rounded-[9px] shadow-lg"
                        /> */}
                        <img src={tNews1} className="" />
                        <div className="flex flex-col xl:items-start items-center gap-5">
                            <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                VEHICLE
                            </div>
                            <h1 className="text-[20px]/[26px] font-[700] xl:text-start text-center manrope">
                                Lorem Ipsum dolar sit amet, lorem ipsum <br />
                                dolorconsectetur lorem ipsum dolor.
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

                    <div className="w-[2px] h-auto bg-[#32261D] mx-10 hidden xl:block" />

                    <div className="flex flex-col gap-5">
                        {/* small video 1 */}
                        <div className="flex xl:flex-row flex-col gap-5 justify-center rounded-[9px] cursor-pointer">
                            {/* <video
                                src="https://www.w3schools.com/html/mov_bbb.mp4"
                                controls
                                autoPlay
                                loop
                                muted
                                className="w-[190px] h-[160px] rounded-[9px] shadow-lg"
                            /> */}
                            <img src={tNews2} />
                            <div className="flex flex-col xl:items-start items-center gap-2">
                                <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                    VEHICLE
                                </div>
                                <h1 className="text-[20px]/[26px] font-[700] xl:text-start text-center manrope">
                                    Lorem Ipsum dolar sit amet, lorem <br />{" "}
                                    ipsum dolorconsectetur lorem ipsum dolor.
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

                        {/* small video 2 */}
                        <div className="flex xl:flex-row flex-col xl:items-start items-center gap-5 justify-center rounded-[9px] cursor-pointer">
                            {/* <video
                                src="https://www.w3schools.com/html/mov_bbb.mp4"
                                controls
                                autoPlay
                                loop
                                muted
                                className="w-[190px] h-[160px] rounded-[9px] shadow-lg"
                            /> */}
                            <img src={tNews3} />
                            <div className="flex flex-col xl:items-start items-center gap-2">
                                <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                    VEHICLE
                                </div>
                                <h1 className="text-[20px]/[26px] font-[700] xl:text-start text-center manrope">
                                    Lorem Ipsum dolar sit amet, lorem <br />{" "}
                                    ipsum dolorconsectetur lorem ipsum dolor.
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

                        {/* small video 3 */}
                        <div className="flex xl:flex-row flex-col xl:items-start items-center gap-5 justify-center rounded-[9px] cursor-pointer">
                            {/* <video
                                src="https://www.w3schools.com/html/mov_bbb.mp4"
                                controls
                                autoPlay
                                loop
                                muted
                                className="w-[190px] h-[160px] rounded-[9px] shadow-lg"
                            /> */}
                            <img src={tNews4} />
                            <div className="flex flex-col xl:items-start items-center gap-2">
                                <div className="w-[72px] h-[26px] bg-[#FFFFFF4D] text-[12px] font-[500] rounded-[3px] flex justify-center items-center">
                                    VEHICLE
                                </div>
                                <h1 className="text-[20px]/[26px] font-[700] xl:text-start text-center manrope">
                                    Lorem Ipsum dolar sit amet, lorem <br />{" "}
                                    ipsum dolorconsectetur lorem ipsum dolor.
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingNews;
