import React from "react";
import Cards from "../Cards";
import dropD from "../../../assets/superAdmin/Chevron Down.png";
import WebsiteVisitors from "./WebsiteVisitors";
import CustomerTypeChart from "./CustomerTypeChart";
import SecondRow from "./SecondRow";
import OrderStatus from "./OrderStatus";

const RightSide = () => {
    return (
        <div className="mx-[48px] my-6 md:my-10 lg:my-[25px]">
            <div className="w-[1125px] max-w-full flex flex-col gap-6">
                <div className="w-full min-h-[42px] flex flex-row justify-between items-center gap-3">
                    <h1 className="text-white text-2xl font-semibold font-poppins">
                        Dashboard
                    </h1>
                    <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0955AC] bg-[#0955AC] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                        <h1>May 2023</h1>
                        <img src={dropD} alt="icon" />
                    </button>
                </div>
                <div className="w-full">
                    <Cards />
                </div>
                <div className="w-full grid grid-cols-1 xl:grid-cols-[341px_minmax(0,1fr)] gap-4 xl:gap-[40px]">
                    <div className="w-full xl:w-[341px]">
                        <WebsiteVisitors />
                    </div>
                    <div className="h-[460px] min-w-0">
                        <CustomerTypeChart />
                    </div>
                </div>
                <div className="w-full h-full">
                    <SecondRow />
                </div>
                <div className="w-full max-w-full h-[480px] py-6">
                    <div className="h-full">
                        <OrderStatus />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RightSide;
