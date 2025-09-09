import React from "react";

import VehicleImages from "../../../../components/vendors/units/VehicleImages";
import VehicleInfo from "../../../../components/vendors/units/VehicleInfo";

import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import backArrow from "../../../../assets/vendors/units/backArrow.svg";

const UnitDetailsContent = () => {
    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Units</h1>
                <div className="flex flex-row gap-5">
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={search} alt="Search" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={settings} alt="Settings" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={bell} alt="Notifications" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={proPic} alt="Profile" />
                    </div>
                    <div className="figtree flex flex-col justify-center items-start">
                        <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
                        <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                            Vendor
                        </h1>
                    </div>
                </div>
            </div>
            {/* end of header section */}
            <div>
                <div
                    className="flex flex-row gap-5 items-center cursor-pointer"
                    onClick={() => (window.location.href = "/ticketBooking/units")}
                >
                    <img src={backArrow} />
                    <h1 className="text-[22px] font-[500] text-[#00000080]">
                        Units / Unit Details
                    </h1>
                </div>
                <div className="py-10 md:px-10 flex flex-col xl:flex-row justify-center gap-10">
                    <div className="flex flex-col gap-10 justify-start items-center bg-[#FFFFFF] py-20 px-20 rounded-[10px]">
                        <VehicleImages />
                        <VehicleInfo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnitDetailsContent;
