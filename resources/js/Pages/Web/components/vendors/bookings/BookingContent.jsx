import React from "react";

import search from "../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../assets/vendors/dashboard/bell.svg"
import proPic from "../../../assets/vendors/dashboard/proPic.svg";

import upArrow from "../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../assets/vendors/booking/icons/icon4.svg";

import filterIcon from "../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

import CarBookingTableTwo from "../../../components/vendors/bookings/CarBookingTableTwo";
import BookingBarChart from "./BookingBarChart";

const BookingContent = () => {
    return (
        <div className="w-full h-auto pr-10 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Bookings</h1>
                <div className="flex flex-row gap-5">
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={search} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={settings} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={bell} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={proPic} />
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

            <div className="flex flex-row gap-10 py-20">
                {/* mini left */}
                <div className="flex flex-col gap-8">
                    {/* card 1 */}
                    <div
                        className="w-full h-auto bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon1} />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
                                    Upcoming Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">145</h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img src={upArrow} className="size-[19px]" />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 1 */}
                    {/* card 2 */}
                    <div
                        className="w-full h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon2} />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
                                    Pending Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">234</h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img src={upArrow} className="size-[19px]" />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 2 */}
                    {/* card 3 */}
                    <div
                        className="w-full h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon3} />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
                                    Cancelled Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">24</h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img src={upArrow} className="size-[19px]" />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 3 */}
                    {/* card 4 */}
                    <div
                        className="w-full h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon4} />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
                                    Completed Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">145</h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img src={upArrow} className="size-[19px]" />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 4 */}
                </div>

                {/* mini right */}
                <div
                    className="w-[712px] h-[437px] bg-[#FFFFFF] rounded-[10px] flex items-center justify-center"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <BookingBarChart />
                </div>
            </div>

            {/* car booking section */}

            <div
                className="w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-10"
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex flex-row justify-between">
                    <h1 className="text-[24px] font-[700]">Car Booking</h1>
                    <div className="flex flex-row gap-5">
                        <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                            <img src={miniSearchIcon} />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search client name, car, etc."
                            />
                        </div>
                        <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <img src={filterIcon} className="size-[12px]" />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Car type
                            </h1>
                            <img src={miniDownArrow} />
                        </div>
                        <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <img src={filterIcon} className="size-[12px]" />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Status
                            </h1>
                            <img src={miniDownArrow} />
                        </div>
                        <button className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]">Add Booking</button>
                    </div>
                </div>

                <CarBookingTableTwo />
            </div>
            {/* end */}
        </div>
    );
};

export default BookingContent;
