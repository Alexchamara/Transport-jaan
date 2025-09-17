import React from "react";
import calender from "../../../assets/superAdmin/Calendar Icon.png";
import dropD from "../../../assets/superAdmin/Chevron Down.png";
import Cards from "../Cards";
import TotalRevenueChart from "./TotalRevenueChart";
import ProfitChart from "./ProfitChart";
import SessionsChart from "./SessionsChart";
import UsersByDevices from "./UsersByDevices";
import RecentOrders from "./RecentOrders";
import Map from "./Map";

const RightSide = ({ userStats }) => {
    return (
        <div>
            {/* Header */}
            <div className="xl:w-[1125px] xl:h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                    Welcome back, Jhon
                </h1>

                <div className="flex flex-row gap-2 md:gap-4">
                    <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0A1330] bg-[#0A1330] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                        <h1>Export data</h1>
                    </button>
                    <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0955AC] bg-[#0955AC] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                        <h1>Create report</h1>
                    </button>
                </div>
            </div>

            {/* Cards */}

            <div>
                <Cards />
            </div>

            <div className=" xl:w-[1125px] xl:h-[556.984375px] px-12 mt-[70px]">
                <div className=" h-full bg-[#0B1739] flex flex-row justify-between">
                    <div className=" border-[#ffffff] border-r-[1px]">
                        <TotalRevenueChart />
                    </div>

                    <div className="flex flex-col">
                        <div className=" border-[#ffffff] border-b-[1px]">
                            <ProfitChart />
                        </div>
                        <SessionsChart />
                    </div>
                </div>
            </div>

            <div className="xl:w-[1125px] h-full flex flex-col gap-2 px-4 md:px-12 lg:px-47 mt-[50px]">
                <h1 className="xl:w-[1125px] xl:h-[42px] text-white text-[24px] font-[600] ">
                    Reports overview
                </h1>
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-center items-center gap-2 w-[110px] h-[30px] border border-[#0A1330] bg-[#0A1330] ">
                        <img src={calender} />
                        <h1 className="text-[#AEB9E1] text-[10px] font-medium ">
                            Select date
                        </h1>
                        <img src={dropD} alt="dropdown" />
                    </div>
                    <div className="flex flex-row gap-2 md:gap-4">
                        <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0A1330] bg-[#0A1330] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                            <h1>Export data</h1>
                        </button>
                        <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0955AC] bg-[#0955AC] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                            <h1>Create report</h1>
                        </button>
                    </div>
                </div>
            </div>
            <div className="xl:w-[1125px] xl:h-[392.470703125px] px-12 my-[20px] flex flex-row gap-4 ">
                <UsersByDevices />
                <RecentOrders />
            </div>
            <div className="xl:w-[1125px] xl:h-[500px] px-4 md:px-12 lg:px-47 mt-[50px]">
                <div className="w-[1030px] h-[400px] bg-[#0B1739] px-5 py-10">
                    <Map />
                </div>
            </div>
        </div>
    );
};

export default RightSide;