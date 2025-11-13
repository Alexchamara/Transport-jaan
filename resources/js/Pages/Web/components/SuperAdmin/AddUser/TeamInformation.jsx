import React from "react";
import Phone from "../../../assets/superAdmin/Phone IconW.svg";
import Bag from "../../../assets/superAdmin/Bag Simple IconW.svg";
import Location from "../../../assets/superAdmin/Map Pin IconW.svg";
import Website from "../../../assets/superAdmin/Web IconW.svg";
import Dropdown from "../../../assets/superAdmin/DropdownB.svg";

const TeamInformation = () => {
    return (
        <div className="poppins flex flex-col gap-6">
            <div className="flex flex-col">
                <h1 className="text-white text-[16px] font-500">
                    Team Information
                </h1>
                <h1 className="text-[#AEB9E1] text-[14px] font-500">
                    Lorem ipsum dolor sit amet consectetur adipiscing.
                </h1>
            </div>

            <div className="w-[600px] h-[480px] border border-[#343B4F] bg-[#0B1739] rounded-[5px] flex justify-center items-center">
                <div className="w-[533px] h-auto flex flex-col gap-8">
                    {/* Phone */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img
                                    src={Phone}
                                    className="size-[12px]"
                                    alt=""
                                />
                                <h1 className="text-white text-[12px] font-500">
                                    Team name
                                </h1>
                            </div>
                            <input
                                placeholder="(123) 456 - 7890"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Position */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img src={Bag} className="size-[12px]" alt="" />
                                <h1 className="text-white text-[12px] font-500">
                                    Rank
                                </h1>
                            </div>
                            <div className="w-[365px] flex flex-row justify-between items-center border border-[#343B4F] bg-[#0B1739]">
                                <input
                                    placeholder="CEO & Founder"
                                    className=" text-[12px] text-[#ffffff]  bg-transparent border-none outline-none focus:border-[#343B4F] focus:ring-0"
                                />
                                <img src={Dropdown} className="px-2"/>
                            </div>
                        </div>
                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img
                                    src={Location}
                                    className="size-[12px]"
                                    alt=""
                                />
                                <h1 className="text-white text-[12px] font-500">
                                    Office
                                </h1>
                            </div>
                            <input
                                placeholder="New York, NY"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Website */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img
                                    src={Website}
                                    className="size-[12px]"
                                    alt=""
                                />
                                <h1 className="text-white text-[12px] font-500">
                                    Mail
                                </h1>
                            </div>
                            <input
                                placeholder="dashdark.com"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamInformation;
