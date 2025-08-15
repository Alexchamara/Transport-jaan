import React from "react";
import img1 from "../../assets/flight/img1.svg";
import img2 from "../../assets/flight/img2.svg";
import img3 from "../../assets/flight/img3.svg";
import img4 from "../../assets/flight/img4.svg";
import heart from "../../assets/flight/heart.svg";
import clock from "../../assets/flight/clock.svg";
import route from "../../assets/flight/route.svg";
import leftArrow from "../../assets/flight/arrowLeft.svg";

const ContentOne = () => {
    return (
        <div className="flex flex-col justify-center items-center px-10 py-10 bg-[#DCDCDC]">
            <h1 className="bebas-neue text-[52px]/[76px] font-[400]">
                Flight Offer Deals
            </h1>
            <p className="text-[#737373] font-[500] text-[20px]/[32px]">
                Competitive fares for your route-specific searches.
            </p>

            <div className="py-10 flex flex-col gap-10">
                {/* 1st row */}
                <div className="flex flex-col xl:flex-row gap-10">
                    {/* card 1 */}
                    <div className="relative flex flex-col xl:flex-row">
                        <div className="absolute top-5 left-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer">
                            <img src={heart} />{" "}
                        </div>
                        <img
                            src={img1}
                            className="xl:rounded-l-[24px] -mr-[80px]"
                        />
                        <div className="xl:w-[389px] h-[311px] bg-[#FFFFFF] xl:rounded-[24px] px-10 py-10">
                            <div className="pr-10">
                                <div className="flex flex-row justify-between">
                                    <div className="flex justify-center items-center gap-3 text-[16px] text-[#737373] font-[500]">
                                        <img src={clock} />
                                        <h1>09 Jun 2024</h1>
                                    </div>
                                    <div className="flex justify-center items-center gap-3 text-[16px] text-[#737373] font-[500]">
                                        <img src={clock} />
                                        <h1>09 Jun 2024</h1>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between text-[24px]/[32px] font-[800]">
                                    <h1>Denmark</h1>
                                    <img src={route} />
                                    <h1>New York</h1>
                                </div>

                                <div className="flex justify-between items-center gap-3 text-[24px]/[32px] font-[800] mt-5">
                                    <div className="flex flex-col">
                                        <h1 className="text-[16px] text-[#737373] font-[500]">
                                            Business
                                        </h1>
                                        <h1>$288.15</h1>
                                    </div>

                                    <div className="w-[1px] h-[42px] bg-[#E4E6E8]" />

                                    <div className="flex flex-col">
                                        <h1 className="text-[16px] text-[#737373] font-[500]">
                                            Business
                                        </h1>
                                        <h1>$288.15</h1>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between items-center mt-10">
                                <h1 className="text-[16px] text-[#737373] font-[500]">
                                    18 Seats left
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] border-[1px] border-[#E4E6E8] text-[14px] font-[800] flex justify-center items-center cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="relative flex flex-col xl:flex-row">
                        <div className="absolute top-5 left-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer">
                            <img src={heart} />{" "}
                        </div>
                        <img
                            src={img2}
                            className="xl:rounded-l-[24px] -mr-[80px]"
                        />
                        <div className="xl:w-[389px] h-[311px] bg-[#FFFFFF] xl:rounded-[24px] px-10 py-10">
                            <div className="pr-10">
                                <div className="flex flex-row justify-between">
                                    <div className="flex justify-center items-center gap-3 text-[16px] text-[#737373] font-[500]">
                                        <img src={clock} />
                                        <h1>09 Jun 2024</h1>
                                    </div>
                                    <div className="flex justify-center items-center gap-3 text-[16px] text-[#737373] font-[500]">
                                        <img src={clock} />
                                        <h1>09 Jun 2024</h1>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between text-[24px]/[32px] font-[800]">
                                    <h1>Denmark</h1>
                                    <img src={route} />
                                    <h1>New York</h1>
                                </div>

                                <div className="flex justify-between items-center gap-3 text-[24px]/[32px] font-[800] mt-5">
                                    <div className="flex flex-col">
                                        <h1 className="text-[16px] text-[#737373] font-[500]">
                                            Business
                                        </h1>
                                        <h1>$288.15</h1>
                                    </div>

                                    <div className="w-[1px] h-[42px] bg-[#E4E6E8]" />

                                    <div className="flex flex-col">
                                        <h1 className="text-[16px] text-[#737373] font-[500]">
                                            Business
                                        </h1>
                                        <h1>$288.15</h1>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between items-center mt-10">
                                <h1 className="text-[16px] text-[#737373] font-[500]">
                                    18 Seats left
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] border-[1px] border-[#E4E6E8] text-[14px] font-[800] flex justify-center items-center cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2nd row */}
                <div className="flex flex-col xl:flex-row gap-10">
                    {/* card 1 */}
                    <div className="relative flex flex-col xl:flex-row">
                        <div className="absolute top-5 left-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer">
                            <img src={heart} />{" "}
                        </div>
                        <img
                            src={img3}
                            className="xl:rounded-l-[24px] -mr-[80px]"
                        />
                        <div className="xl:w-[389px] h-[311px] bg-[#FFFFFF] xl:rounded-[24px] px-10 py-10">
                            <div className="pr-10">
                                <div className="flex flex-row justify-between">
                                    <div className="flex justify-center items-center gap-3 text-[16px] text-[#737373] font-[500]">
                                        <img src={clock} />
                                        <h1>09 Jun 2024</h1>
                                    </div>
                                    <div className="flex justify-center items-center gap-3 text-[16px] text-[#737373] font-[500]">
                                        <img src={clock} />
                                        <h1>09 Jun 2024</h1>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between text-[24px]/[32px] font-[800]">
                                    <h1>Denmark</h1>
                                    <img src={route} />
                                    <h1>New York</h1>
                                </div>

                                <div className="flex justify-between items-center gap-3 text-[24px]/[32px] font-[800] mt-5">
                                    <div className="flex flex-col">
                                        <h1 className="text-[16px] text-[#737373] font-[500]">
                                            Business
                                        </h1>
                                        <h1>$288.15</h1>
                                    </div>

                                    <div className="w-[1px] h-[42px] bg-[#E4E6E8]" />

                                    <div className="flex flex-col">
                                        <h1 className="text-[16px] text-[#737373] font-[500]">
                                            Business
                                        </h1>
                                        <h1>$288.15</h1>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between items-center mt-10">
                                <h1 className="text-[16px] text-[#737373] font-[500]">
                                    18 Seats left
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] border-[1px] border-[#E4E6E8] text-[14px] font-[800] flex justify-center items-center cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="relative flex flex-col xl:flex-row">
                        <div className="absolute top-5 left-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer">
                            <img src={heart} />{" "}
                        </div>
                        <img
                            src={img4}
                            className="xl:rounded-l-[24px] -mr-[30px]"
                        />
                        <div className="xl:w-[389px] h-[311px] bg-[#FFFFFF] xl:rounded-[24px] px-10 py-10">
                            <div className="pr-10">
                                <div className="flex flex-row justify-between">
                                    <div className="flex justify-center items-center gap-3 text-[16px] text-[#737373] font-[500]">
                                        <img src={clock} />
                                        <h1>09 Jun 2024</h1>
                                    </div>
                                    <div className="flex justify-center items-center gap-3 text-[16px] text-[#737373] font-[500]">
                                        <img src={clock} />
                                        <h1>09 Jun 2024</h1>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between text-[24px]/[32px] font-[800]">
                                    <h1>Denmark</h1>
                                    <img src={route} />
                                    <h1>New York</h1>
                                </div>

                                <div className="flex justify-between items-center gap-3 text-[24px]/[32px] font-[800] mt-5">
                                    <div className="flex flex-col">
                                        <h1 className="text-[16px] text-[#737373] font-[500]">
                                            Business
                                        </h1>
                                        <h1>$288.15</h1>
                                    </div>

                                    <div className="w-[1px] h-[42px] bg-[#E4E6E8]" />

                                    <div className="flex flex-col">
                                        <h1 className="text-[16px] text-[#737373] font-[500]">
                                            Business
                                        </h1>
                                        <h1>$288.15</h1>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between items-center mt-10">
                                <h1 className="text-[16px] text-[#737373] font-[500]">
                                    18 Seats left
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] border-[1px] border-[#E4E6E8] text-[14px] font-[800] flex justify-center items-center cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-3 w-full justify-center items-center mt-10">
                    <div className="size-[40px] bg-[#E4E6E8] rounded-full flex justify-center items-center cursor-pointer">
                        <img src={leftArrow} />
                    </div>
                    <div className="size-[40px] bg-[#E4E6E8] rounded-full flex justify-center items-center cursor-pointer ">
                        <img src={leftArrow} className="rotate-180" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentOne;
