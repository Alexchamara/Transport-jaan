import React from "react";
import { usePage } from "@inertiajs/react";

import VehicleImages from "../../../../components/vendors/units/VehicleImages";
import VehicleInfo from "../../../../components/vendors/units/VehicleInfo";

import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import backArrow from "../../../../assets/vendors/units/backArrow.svg";

const UnitDetailsContent = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

    return (
        <div className="w-full h-auto pr-5 py-5 md:py-10 px-4 md:px-0">
            {/* Header section */}
            <div className="flex flex-col md:flex-row gap-5 justify-between md:items-start items-center">
                <h1 className="figtree text-[28px] md:text-[35px] font-[700]">Units</h1>
                <div className="flex flex-row gap-3 md:gap-5">
                    <div className="size-[40px] md:size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={search} alt="Search" />
                    </div>
                    <div className="size-[40px] md:size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={settings} alt="Settings" />
                    </div>
                    <div className="size-[40px] md:size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={bell} alt="Notifications" />
                    </div>
                    <div className="size-[40px] md:size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={proPic} alt="Profile" />
                    </div>
                    <div className="figtree flex flex-col justify-center items-start">
                        <h1 className="text-[16px] md:text-[20px] font-[700]">{user?.name || 'Vendor'}</h1>
                        <h1 className="text-[14px] md:text-[16px] font-[600] text-[#7B7B7A]">
                            Vendor
                        </h1>
                    </div>
                </div>
            </div>
            {/* end of header section */}
            <div>
                <div
                    className="flex flex-row gap-3 md:gap-5 items-center cursor-pointer"
                    onClick={() => (window.location.href = "/freight/units")}
                >
                    <img src={backArrow} />
                    <h1 className="text-[16px] md:text-[22px] font-[500] text-[#00000080]">
                        Units / Unit Details
                    </h1>
                </div>
                <div className="py-5 md:py-10 px-5 md:px-10 flex flex-col xl:flex-row justify-center gap-5 md:gap-10">
                    <div className="flex flex-col gap-5 md:gap-10 justify-start items-center bg-[#FFFFFF] py-10 px-5 md:py-20 md:px-20 rounded-[10px]">
                        <VehicleImages />
                        <VehicleInfo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnitDetailsContent;
