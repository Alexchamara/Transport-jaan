import React from "react";
import Cards from "../Cards";
import dropD from "../../../assets/superAdmin/Chevron Down.png";
import WebsiteVisitors from "./WebsiteVisitors";
import CustomerTypeChart from "./CustomerTypeChart";
import SecondRow from "./SecondRow";
import OrderStatus from "./OrderStatus";

const RightSide = () => {
    return (
        <div>
            <div className="flex flex-col gap-5">
                <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                    <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                        Analytics
                    </h1>
                    <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0955AC] bg-[#0955AC] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                        <h1>May 2023</h1>
                        <img src={dropD} alt="icon" />
                    </button>
                </div>
                <div>
                    <Cards />
                </div>
                <div className="w-[1125px] h-[460px] flex flex-row gap-[55px]">
                    <div className="w-[341px] px-12">
                        <WebsiteVisitors />
                    </div>
                    <div className="w-[680px] h-[460px]">
                        <CustomerTypeChart />
                    </div>
                </div>
                <div className="w-[1125px] h-full">
                    <SecondRow />
                </div>
                <div className="w-[1060px] h-[480px] py-6">
                    <div className="h-full">
                        <OrderStatus />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RightSide;
