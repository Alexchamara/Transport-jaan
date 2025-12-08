import React from "react";
import { usePage } from "@inertiajs/react";
import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import map from "../../../../assets/vendors/tracking/map.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import settingsTwo from "../../../../assets/vendors/tracking/settings.svg";
import { Warehouse, Package, Boxes } from "lucide-react";
import proPicTwo from "../../../../assets/vendors/tracking/proPic.svg";

import cal from "../../../../assets/vendors/tracking/cal.svg";
import cal2 from "../../../../assets/vendors/tracking/cal2.svg";
import time from "../../../../assets/vendors/tracking/time.svg";
import distance from "../../../../assets/vendors/tracking/distance.svg";

import { LucideCalendar, LucideChevronDown, LucideCircleDot, LucideFilter, LucidePlus, LucideSearch } from 'lucide-react';

import UserDropdown from "../../UserDropdown";

const TrackingContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div className="w-full h-auto">
            {/* Header section */}
            {/* Header */}
            <div className="flex flex-col xl:flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[24px] md:text-[35px] font-[700]">Warehouse Tracking</h1>
                <div className="flex flex-row gap-5 relative items-center">
                    <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div>
                </div>
            </div>
            {/* end of header section */}

            <div className="flex flex-col md:flex-row gap-4 w-full py-10">
                <div
                    className="w-full h-auto bg-[#FFFFFF] rounded-[10px] px-4 md:px-10 py-10"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <h1 className="text-[24px] font-[700]">Storage & Assets</h1>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        {" "}
                        <div className="w-full h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5 my-5">
                            <img src={miniSearchIcon} />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search location, asset, etc."
                            />
                        </div>
                        <div className="size-[35px] bg-[#F3F3F3] rounded-[6px] flex justify-center items-center">
                            {" "}
                            <img src={settingsTwo} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {/* card 1 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Rack A1 - Zone 01
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>Pallets (48x40)</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    In Use
                                </div>
                            </div>
                        </div>
                        {/* card 2 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Rack A1 - Zone 01
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>Pallets (48x40)</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    In Use
                                </div>
                            </div>
                        </div>
                        {/* card 3 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Rack A1 - Zone 01
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>Pallets (48x40)</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    In Use
                                </div>
                            </div>
                        </div>
                        {/* card 4 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Rack A1 - Zone 01
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>Pallets (48x40)</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    In Use
                                </div>
                            </div>
                        </div>
                        {/* card 5 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Rack A1 - Zone 01
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>Pallets (48x40)</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    In Use
                                </div>
                            </div>
                        </div>
                        {/* card 6 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Rack A1 - Zone 01
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>Pallets (48x40)</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    In Use
                                </div>
                            </div>
                        </div>
                        {/* card 7 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Rack A1 - Zone 01
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>Pallets (48x40)</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    In Use
                                </div>
                            </div>
                        </div>
                        {/* card 8 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>BMW LX3</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    On Trip
                                </div>
                            </div>
                        </div>
                        {/* card 9 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5 p-3">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Warehouse className="h-12 w-12 sm:h-16 sm:w-16 xl:size-[90px] text-[#2E4683]" />
                                <div className="flex flex-col flex-1">
                                    <h1 className="text-[18px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-start text-[16px] font-[500] text-[#00000080] gap-3">
                                        <Boxes className="h-5 w-5 text-[#7B7B7A]" />
                                        <h1>BMW LX3</h1>
                                    </div>
                                </div>
                                <div className="w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                    On Trip
                                </div>
                            </div>
                        </div>
                        <button className="w-full min-h-[51px] bg-[#0955AC] rounded-[6px] text-[18px] font-[700] text-[#FFFFFF] my-12">
                            Check Slot Availability
                        </button>
                    </div>
                </div>
                <div className="w-full h-auto flex flex-col gap-4">
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex flex-col gap-4 w-full">
                            <div
                                className="w-full bg-[#FFFFFF] rounded-[10px] px-5 py-5"
                                style={{ boxShadow: "4px 4px 4px #0000001A" }}
                            >
                                <div className="flex flex-row items-center justify-center gap-5">
                                    <img src={proPicTwo} className="2xl:size-[70px] size-[50px]" />
                                    <div className="flex flex-col justify-center items-start gap-1">
                                        {" "}
                                        <h1 className="text-[14px] font-[600]">
                                            Steve Gibson
                                        </h1>
                                        <h1 className="text-[12px] font-[500] text-[#616161]">
                                            steve@example.com
                                        </h1>
                                        <h1 className="text-[11px] font-[500] text-[#00000080]">
                                            +94 77 301 1345
                                        </h1>
                                        <div className="flex justify-center items-center">
                                            <div className=" w-[76px] h-[24px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[12px] font-[700] text-[#50AE31] flex justify-center items-center">
                                                In Use
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="w-full bg-[#FFFFFF] rounded-[10px] px-5 py-5"
                                style={{ boxShadow: "4px 4px 4px #0000001A" }}
                            >
                                <div className="flex flex-row gap-5 justify-center items-center">
                                    <Package className="size-[50px] 2xl:size-[70px] text-[#39CEF3]" />
                                    <div className="text-[11px] font-[500]">
                                        <h1 className="text-[14px] font-[600]">
                                            Pallets (48x40)
                                        </h1>
                                        <div className="flex flex-row gap-3">
                                            <h1 className="text-[#00000080]">
                                                Asset Type
                                            </h1>
                                            <h1>SUV</h1>
                                        </div>
                                        <div className="flex flex-row gap-3">
                                            <h1 className="text-[#00000080]">
                                                Asset ID
                                            </h1>
                                            <h1>CBK 2324</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="w-full min-h-[241px] h-auto bg-[#FFFFFF] rounded-[10px] px-5 py-5"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <h1 className="text-[24px] font-[700]">
                                Allocation Info
                            </h1>
                            <div className="flex flex-row justify-between items-start sm:items-center py-7">
                                <div className="flex flex-col gap-4 sm:gap-7 justify-center items-start text-[12px] font-[500]">
                                    <div className="flex flex-row gap-2">
                                        <img src={cal} />
                                        <h1 className="text-[#00000080]">
                                            Start Date{" "}
                                        </h1>
                                    </div>

                                    <div className="flex flex-row gap-2">
                                        <img src={cal2} />
                                        <h1 className="text-[#00000080]">
                                            End Date
                                        </h1>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <img src={time} />
                                        <h1 className="text-[#00000080]">
                                            Shift Time
                                        </h1>
                                    </div>

                                    <div className="flex flex-row gap-2">
                                        <img src={distance} />
                                        <h1 className="text-[#00000080]">
                                            Total Picks
                                        </h1>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 sm:gap-7 justify-center items-start text-[12px] font-[500]">
                                    <h1>25th June 2025</h1>
                                    <h1>27th June 2025</h1>
                                    <h1>22 hr 34 mins</h1>
                                    <h1>350 picks</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img
                        src={map}
                        className="w-full"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TrackingContent;
