import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../../assets/vendors/dashboard/logOutLogo.svg"; // Add this import
import { ChevronDown } from "lucide-react";
import dollarIcon from "../../../../assets/vendors/dashboard/icons/dollarIcon.svg";
import carIcon from "../../../../assets/vendors/dashboard/icons/carIcon.svg";
import icon from "../../../../assets/vendors/dashboard/icons/icon.svg";
import icon2 from "../../../../assets/vendors/dashboard/icons/icon2.svg";
import bookingIcon from "../../../../assets/vendors/dashboard/icons/bookingIcon.svg";
import wheelIcon from "../../../../assets/vendors/dashboard/icons/wheelIcon.svg";
import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";
import BookingOverviewBarChart from "./BookingOverviewBarChart";
import EarningSummaryChart from "./EarningSummaryChart";
import RealStatusPieChart from "./RealStatusPieChart";
import CarBookingTable from "./CarBookingTable";

import UserDropdown from "../../UserDropdown";

import {
    Plane,
    Ticket,
    TicketCheck,
    DollarSign,
    Search as SearchIcon,
    Settings as SettingsIcon,
    Bell as BellIcon,
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    Filter as FilterIcon,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

const getTransportIcon = (name, size = 18) => {
    return <Plane size={size} />;
};

const transportTypes = [
    { name: "Economy", percent: 45 },
    { name: "Business", percent: 35 },
    { name: "First Class", percent: 20 },
    { name: "Economy", percent: 55 },
    { name: "Business", percent: 65 },
    { name: "First Class", percent: 40 },
];

const DashContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640); // sm breakpoint
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className="w-full max-w-full lg:pr-5 px-5 lg:px-0 py-10">
            {/* Header section */}
            <div className="flex xl:flex-row flex-col gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] sm:text-[28px] font-[700] text-center
                ">
                    Flight Booking Dashboard
                </h1>
                <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown
                        settingsRoute={route("ticketBooking.settingsPage")}
                    />
                </div>
            </div>
            {/* end of header section */}

            {/* === REST OF THE DASHBOARD (UNCHANGED) === */}
            <div className="flex flex-col gap-5 py-10">
                <div className="flex flex-col xl:flex-row gap-5">
                    {/* mini left section */}
                    <div className="flex flex-col gap-5">
                        {/* mini 4 cards */}
                        <div className="flex flex-col gap-5">
                            <div className="flex xl:flex-row flex-col gap-5 justify-between w-full">
                                {/* card 1 */}
                                <div
                                    className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <img src={dollarIcon} />
                                        </div>
                                        <div>
                                            <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                                Total Revenue
                                            </h1>
                                            <h1 className="text-[20px] font-[700]">
                                                $8,450
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[19px]"
                                            />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 1 */}

                                {/* card 2 */}
                                <div
                                    className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <img src={bookingIcon} />
                                        </div>
                                        <div>
                                            <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                                New Bookings
                                            </h1>
                                            <h1 className="text-[20px] font-[700]">
                                                350
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[19px]"
                                            />
                                            <h1 className="">+1.73%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 2 */}
                            </div>
                            <div className="flex xl:flex-row flex-col gap-5 w-full">
                                {/* card 3 */}
                                <div
                                    className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <img src={wheelIcon} />
                                        </div>
                                        <div>
                                            <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                                Rented Cars
                                            </h1>
                                            <h1 className="text-[20px] font-[700]">
                                                24 Units
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#FF888880] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[19px] rotate-180"
                                            />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 3 */}
                                {/* card 4 */}
                                <div
                                    className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <img src={carIcon} />
                                        </div>
                                        <div>
                                            <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                                Total Revenue
                                            </h1>
                                            <h1 className="text-[20px] font-[700]">
                                                89 Units
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[19px]"
                                            />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 4 */}
                            </div>
                        </div>
                        {/* end of 4 mini cards */}

                        <div className="overflow-x-auto w-full">
                            {/* booking chart */}
                            <div
                                className="w-full mx-auto overflow-auto h-auto bg-[#FFFFFF] flex flex-col justify-center items-center rounded-[10px] py-8 px-3"
                                style={{ boxShadow: "4px 4px 4px #0000001A" }}
                            >
                                {isMobile ? (
                                    <div className="w-full">
                                        <div className="figtree text-[24px] font-[700] mb-4">
                                            Flight Booking Overview
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {[
                                                { name: "Jan", bookings: 450 },
                                                { name: "Feb", bookings: 670 },
                                                { name: "Mar", bookings: 540 },
                                                { name: "Apr", bookings: 900 },
                                                { name: "May", bookings: 800 },
                                                { name: "Jun", bookings: 200 },
                                                { name: "Jul", bookings: 340 },
                                                { name: "Aug", bookings: 859 },
                                                { name: "Sep", bookings: 670 },
                                                { name: "Oct", bookings: 570 },
                                                { name: "Nov", bookings: 400 },
                                                { name: "Dec", bookings: 900 },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md"
                                                >
                                                    <span className="font-medium text-gray-700">
                                                        {item.name} 2025
                                                    </span>
                                                    <span className="font-bold text-blue-600">
                                                        {item.bookings} bookings
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <BookingOverviewBarChart />
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto w-full mx-auto">
                            <div
                                className="w-full xl:h-[381px] bg-[#FFFFFF] rounded-[10px] py-10 px-5 sm:px-10"
                                style={{ boxShadow: "4px 4px 4px #0000001A" }}
                            >
                                <div className="flex flex-col xl:flex-row items-center justify-between mb-12 w-full">
                                    <h1 className="text-[24px] font-[700]">
                                        Earnings Summary
                                    </h1>
                                    <div className="xl:w-[132px] xl:h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3 p-2">
                                        <h1 className="text-[#00000080] font-[600] text-[14px]">
                                            Last 8 months
                                        </h1>
                                        <ChevronDown />
                                    </div>
                                </div>
                                {isMobile ? (
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { name: "Jan", value: 5000 },
                                            { name: "Feb", value: 7000 },
                                            { name: "Mar", value: 6000 },
                                            { name: "Apr", value: 23456 },
                                            { name: "May", value: 8000 },
                                            { name: "Jun", value: 4000 },
                                            { name: "Jul", value: 9000 },
                                            { name: "Aug", value: 12000 },
                                            { name: "Sep", value: 10000 },
                                            { name: "Oct", value: 9500 },
                                            { name: "Nov", value: 15000 },
                                            { name: "Dec", value: 21000 },
                                        ].map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md"
                                            >
                                                <span className="font-medium text-gray-700">
                                                    {item.name} 2025
                                                </span>
                                                <span className="font-bold text-green-600">
                                                    $
                                                    {Number(
                                                        item.value
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EarningSummaryChart />
                                )}
                            </div>
                        </div>
                    </div>
                    {/* mini right section */}
                    <div className="flex flex-col items-center gap-5">
                        <div
                            className="w-full xl:h-[206px] bg-[#D8E4F2] flex flex-col px-5 py-5 justify-center items-center rounded-[10px]"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <h1 className="text-[24px] font-[700] mb-3">
                                Seat Availability
                            </h1>

                            <div className="flex flex-col gap-3">
                                <div className="w-full xl:max-w-[283px] xl:h-[35px] flex flex-row justify-center items-center gap-2 rounded-[6px] px-3 py-2 bg-[#FFFFFF] placeholder:text-[#7B7B7ACC] placeholder:text-[14px] placeholder:font-[500]">
                                    <Plane size={20} />
                                    <input
                                        type="text"
                                        className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                        placeholder="Flight"
                                    />
                                    <ChevronDown />
                                </div>

                                <div className="flex flex-row gap-3">
                                    <div className="w-full xl:max-w-[137px] xl:h-[35px] bg-[#FFFFFF] rounded-[6px] flex flex-row justify-center items-center gap-2 py-2 px-3">
                                        <CalendarIcon size={20} />
                                        <input
                                            type="text"
                                            className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                            placeholder="Date"
                                        />
                                    </div>
                                    <div className="w-full xl:max-w-[137px] xl:h-[35px] bg-[#FFFFFF] rounded-[6px]">
                                        <div className="w-full xl:h-[35px] bg-[#FFFFFF] rounded-[6px] flex flex-row justify-center gap-2 items-center py-2 px-3">
                                            <ClockIcon size={16} />
                                            <input
                                                type="text"
                                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                                placeholder="Time"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full xl:max-w-[283px] xl:h-[40px] bg-[#0955AC] rounded-[6px] flex justify-center items-center text-[16px] font-[700] text-[#FFFFFF] cursor-pointer py-2 px-4">
                                    Check Availability
                                </button>
                            </div>
                        </div>
                        <div
                            className="xl:w-[339px] w-full xl:min-h-[427px] bg-[#FFFFFF] rounded-[10px] py-5 px-5"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-col xl:flex-row items-center justify-between w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Flight Status
                                </h1>
                                <div className="xl:w-[120px] xl:h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3 p-2">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        This Week
                                    </h1>
                                    <ChevronDown />
                                </div>
                            </div>
                            {isMobile ? (
                                <div className="flex flex-col gap-2 mt-4">
                                    {[
                                        {
                                            name: "Hired",
                                            value: 46,
                                            color: "#3DD0FF",
                                        },
                                        {
                                            name: "Pending",
                                            value: 27,
                                            color: "#0955AC",
                                        },
                                        {
                                            name: "Cancelled",
                                            value: 14,
                                            color: "#C4C4C4",
                                        },
                                    ].map((item, index) => {
                                        const total = 46 + 27 + 14;
                                        const percent = Math.round(
                                            (item.value / total) * 100
                                        );
                                        return (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-4 h-4 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                item.color,
                                                        }}
                                                    ></span>
                                                    <span className="font-medium text-gray-700">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-gray-800">
                                                    {percent}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <RealStatusPieChart />
                            )}
                        </div>

                        {/* Reminder section  */}
                        <div
                            className="xl:w-[339px] w-full xl:h-[335px] bg-[#FFFFFF] rounded-[10px] py-5 px-5"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row items-center justify-between w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Reminders
                                </h1>
                                <div className="w-[39px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex justify-center items-center gap-3 text-[#00000080] font-[600] text-[30px]">
                                    +
                                </div>
                            </div>
                            <div className="py-5 flex flex-col justify-center items-center gap-2">
                                <div className="w-full xl:max-w-[286px] xl:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] flex-1">
                                        Confirm airline allotments for next
                                        week.
                                    </h1>
                                </div>
                                <div className="w-full xl:max-w-[286px] xl:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] flex-1">
                                        Update fare rules for partner airlines.
                                    </h1>
                                </div>
                                <div className="w-full xl:max-w-[286px] xl:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] flex-1">
                                        Reconcile August flight invoices.
                                    </h1>
                                </div>
                            </div>
                        </div>
                        {/* end */}
                    </div>
                </div>

                <div className="overflow-hidden">
                    {/* flight booking section */}
                    <div
                        className="w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-5 sm:px-10"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex md:flex-row flex-col justify-between">
                            <h1 className="text-[24px] font-[700]">
                                Flight Bookings
                            </h1>
                            <div className="flex md:flex-row flex-col gap-5 mt-5 lg:mt-0">
                                <div className="xl:w-[253px] xl:h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                                    <SearchIcon className="size-[16px]" />
                                    <input
                                        type="text"
                                        className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                        placeholder="Search passenger, flight no., route..."
                                    />
                                </div>
                                <div className="xl:w-[125px] xl:h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                                    <FilterIcon className="size-[12px]" />
                                    <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                        Filter
                                    </h1>
                                    <ChevronDown />
                                </div>
                            </div>
                        </div>

                        <CarBookingTable />
                    </div>
                    {/* end */}
                </div>

                <div className="flex flex-col xl:flex-row gap-5 justify-between">
                    <div
                        className="xl:w-[500px] w-full h-auto xl:h-[858px] bg-[#FFFFFF] rounded-[10px] px-5 sm:px-10 py-10 flex flex-col gap-5"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-[24px] font-[700]">
                                Cabin classes
                            </h1>
                            <h1 className="text-[24px] font-[700]">...</h1>
                        </div>

                        {transportTypes.map((type, idx) => (
                            <div
                                key={idx}
                                className="w-full h-[107px] border-[1px] border-[#00000080] rounded-[9px] flex flex-row"
                            >
                                <div className="h-[107px] w-[80px] sm:w-[172px] flex items-center justify-center">
                                    {getTransportIcon(type.name, 36)}
                                </div>
                                <div className="flex flex-col justify-center gap-3 flex-1 px-5">
                                    <div className="flex flex-col md:flex-row justify-between items-center text-[15px] font-[500]">
                                        <h1 className="text-[#00000080] flex items-center gap-2">
                                            {type.name}
                                        </h1>
                                        <h1 className="pr-5">
                                            {type.percent}%
                                        </h1>
                                    </div>
                                    <div className="w-full h-[20px] rounded-[4px] bg-[#D8E4F2] relative overflow-hidden">
                                        <div
                                            className="h-full rounded-[4px] absolute top-0 left-0"
                                            style={{
                                                width: `${type.percent}%`,
                                                backgroundColor:
                                                    type.percent <= 20
                                                        ? "#F51D1D"
                                                        : "#0955AC",
                                                transition: "width 0.5s",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div
                        className="w-full h-auto xl:w-[553px] xl:h-[858px] bg-[#0F0F0F08] rounded-[10px] px-5 md:px-10 py-10"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-[22px] font-[700]">
                                Recent Activities
                            </h1>
                            <h1 className="text-[22px] font-[700]">...</h1>
                        </div>
                        <h1 className="text-[18px] font-[600] text-[#0F0F0F80] py-3">
                            Today
                        </h1>

                        <div className="flex flex-row justify-center items-start gap-5 md:gap-10">
                            <div className="flex flex-col items-center py-5">
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <CalendarIcon />
                                </div>
                                <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                            </div>
                            <div className="flex flex-col py-5 gap-10 md:text-[20px] text-[16px] font-[700]">
                                <div>
                                    <h1>
                                        Alice Johnson completed a flight booking
                                        (UL 215, CMB → DXB)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        10:45 AM
                                    </h1>
                                </div>
                                <div>
                                    <h1>
                                        Bob Smith's flight booking (UL 123, CMB
                                        → SIN) is pending payment
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        15:45 PM
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <h1 className="text-[20px] font-[600] text-[#0F0F0F80] py-3">
                            Yesterday
                        </h1>
                        <div className="flex flex-row justify-center items-start gap-5 sm:gap-10">
                            <div className="flex flex-col items-center py-5">
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                                <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                                <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                            </div>
                            <div className="flex flex-col py-5 gap-10 md:text-[20px] text-[16px] font-[700]">
                                <div>
                                    <h1>
                                        Priya Perera completed a flight booking
                                        (UL 404, CMB → BKK)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        10:45 AM
                                    </h1>
                                </div>
                                <div>
                                    <h1>
                                        Ahmed Khan rescheduled a flight (QR 669,
                                        CMB → DOH)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        15:45 PM
                                    </h1>
                                </div>
                                <div>
                                    <h1>
                                        Chen Li confirmed a flight booking (SQ
                                        469, CMB → SIN)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        15:45 PM
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashContent;
