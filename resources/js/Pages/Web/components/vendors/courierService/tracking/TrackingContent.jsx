import React from "react";
import map from "../../../../assets/vendors/tracking/map.svg";
import {
  Search,
  Settings,
  Bell,
  UserCircle2,
  SlidersHorizontal,
  Truck,
  Package,
  CheckCircle2,
  Calendar,
  CalendarDays,
  Clock,
  Route,
} from "lucide-react";

const TrackingContent = () => {
    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Courier Service Tracking</h1>
                <div className="flex flex-row gap-5">
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <Search size={28} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <Settings size={28} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <Bell size={28} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <UserCircle2 size={28} />
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

            <div className="flex flex-row gap-4 w-full py-10">
                <div
                    className="w-full h-auto bg-[#FFFFFF] rounded-[10px] px-10 py-10"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <h1 className="text-[24px] font-[700]">Fleet & Couriers</h1>
                    <div className="flex flex-row justify-between items-center gap-8">
                        {" "}
                        <div className="w-full h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5 my-5">
                            <Search size={16} />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search driver, vehicle, order..."
                            />
                        </div>
                        <div className="size-[35px] bg-[#F3F3F3] rounded-[6px] flex justify-center items-center">
                            <SlidersHorizontal size={18} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {/* card 1 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* card 2 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* card 3 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* card 4 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* card 5 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* card 6 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* card 7 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* card 8 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* card 9 */}
                        <div className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-5">
                            <div className="grid grid-cols-3 justify-center items-center">
                                <div className="h-[104px] w-full flex items-center justify-center text-[#0955AC]">
                                    <Truck size={64} />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-8">
                                    <h1 className="text-[20px] font-[700]">
                                        Fiona Brown
                                    </h1>
                                    <div className="flex flex-row justify-start items-center text-[16px] font-[500] text-[#00000080] gap-2">
                                        <Package size={16} />
                                        <h1>Express Delivery</h1>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <div className=" w-[101px] h-[33px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[16px] font-[700] text-[#50AE31] flex justify-center items-center">
                                        On Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full min-w-[479px] min-h-[51px] bg-[#0955AC] rounded-[6px] text-[18px] font-[700] text-[#FFFFFF] my-12">
                            Check Availability
                        </button>
                    </div>
                </div>
                <div className="w-full h-auto flex flex-col gap-4">
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col gap-4 w-full">
                            <div
                                className="min-w-[265px] w-full min-h-[128px] bg-[#FFFFFF] rounded-[10px] px-5 py-5"
                                style={{ boxShadow: "4px 4px 4px #0000001A" }}
                            >
                                <div className="flex flex-row gap-5">
                                    <div className="size-[64px] rounded-full bg-[#E8EBEF] flex items-center justify-center text-[#0955AC]"><UserCircle2 size={36} /></div>
                                    <div className="flex flex-col justify-center items-start gap-1">
                                        {" "}
                                        <h1 className="text-[16px] font-[600]">
                                            Steve Gibson
                                        </h1>
                                        <h1 className="text-[14px] font-[500] text-[#616161]">
                                            steve@example.com
                                        </h1>
                                        <h1 className="text-[13px] font-[500] text-[#00000080]">
                                            +94 77 301 1345
                                        </h1>
                                        <div className="flex justify-center items-center">
                                            <div className=" w-[76px] h-[24px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[12px] font-[700] text-[#50AE31] flex justify-center items-center">
                                                On Delivery
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="min-w-[265px] w-full min-h-[102px] bg-[#FFFFFF] rounded-[10px] px-5 py-5"
                                style={{ boxShadow: "4px 4px 4px #0000001A" }}
                            >
                                <div className="flex flex-row gap-3">
                                    <div className="h-[72px] w-[104px] flex items-center justify-center text-[#0955AC]"><Truck size={48} /></div>
                                    <div className="text-[13px] font-[500]">
                                        <h1 className="text-[16px] font-[600]">
                                            BMW LX3
                                        </h1>
                                        <div className="flex flex-row gap-3">
                                            <h1 className="text-[#00000080]">
                                                Vehicle
                                            </h1>
                                            <h1>Van</h1>
                                        </div>
                                        <div className="flex flex-row gap-3">
                                            <h1 className="text-[#00000080]">
                                                Reg No
                                            </h1>
                                            <h1>CBK 2324</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="min-w-[277px] w-full min-h-[241px] bg-[#FFFFFF] rounded-[10px] px-5 py-5"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <h1 className="text-[24px] font-[700]">
                                Delivery Info
                            </h1>
                            <div className="flex flex-row justify-between items-center py-7">
                                <div className="flex flex-col gap-7 justify-center items-start text-[14px] font-[500]">
                                    <div className="flex flex-row gap-2">
                                        <Calendar size={16} />
                                        <h1 className="text-[#00000080]">
                                            Start Date
                                        </h1>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <CalendarDays size={16} />
                                        <h1 className="text-[#00000080]">
                                            End Date
                                        </h1>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <Clock size={16} />
                                        <h1 className="text-[#00000080]">
                                            Transit Time
                                        </h1>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <Route size={16} />
                                        <h1 className="text-[#00000080]">
                                            Route Distance
                                        </h1>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-7 justify-center items-start text-[14px] font-[500]">
                                    <h1>25 Aug 2025</h1>
                                    <h1>26 Aug 2025</h1>
                                    <h1>22 hr 34 mins</h1>
                                    <h1>210 km</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img
                        src={map}
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TrackingContent;
