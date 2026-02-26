import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import ServiceNavBar from "../../../../../../Components/vendors/ServiceNavBar";
import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../../assets/vendors/dashboard/logOutLogo.svg"; // Added

import proPicTwo from "../../../../assets/vendors/tracking/proPic.svg";
import car1 from "../../../../assets/vendors/dashboard/icons/car1.svg";

import leftArrow from "../../../../assets/vendors/calendar/leftArrow.svg";
import miniDownArrow from "../../../../assets/vendors/calendar/miniDown.svg";

import CalendarMonthPicker from "./CalendarMonthPicker";
import CalendarGrid from "./CalendarGrid";

import UserDropdown from "../../UserDropdown";

// Define days, times, and events for the calendar
const days = [
    { label: "Mon", date: 14 },
    { label: "Tue", date: 15 },
    { label: "Wed", date: 16 },
    { label: "Thu", date: 17 },
    { label: "Fri", date: 18 },
    { label: "Sat", date: 19 },
    { label: "Sun", date: 20 },
];

const times = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
];

const events = [
    // Monday
    {
        day: 0,
        time: "8:00 AM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
    {
        day: 0,
        time: "12:00 PM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
    {
        day: 0,
        time: "3:00 PM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
    // Tuesday
    {
        day: 1,
        time: "9:00 AM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "cancelled",
    },
    {
        day: 1,
        time: "1:00 PM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "cancelled",
    },
    // Wednesday
    {
        day: 2,
        time: "8:00 AM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
    // Thursday
    {
        day: 3,
        time: "9:30 AM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
    {
        day: 3,
        time: "9:30 AM",
        title: "Toyota Vezel",
        person: "Steve Gibson",
        status: "done",
    },
    {
        day: 3,
        time: "12:30 PM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
    {
        day: 3,
        time: "1:00 PM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "cancelled",
    },
    // {
    //     day: 3,
    //     time: "1:00 PM",
    //     title: "Toyota Vezel",
    //     person: "Steve Gibson",
    //     status: "cancelled",
    // },
    // Friday
    {
        day: 4,
        time: "8:00 AM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
    {
        day: 4,
        time: "11:00 AM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "cancelled",
    },
    // Saturday
    {
        day: 5,
        time: "9:00 AM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
    // Sunday
    {
        day: 6,
        time: "8:00 AM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "cancelled",
    },
    {
        day: 6,
        time: "1:00 PM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "cancelled",
    },
    {
        day: 6,
        time: "4:00 PM",
        title: "BMW LX3",
        person: "Steve Gibson",
        status: "done",
    },
];

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const CalendarContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.status === 'verified' || user?.status === 'Verified';
    const activeService = 'Ticket Booking';
    const services = [
        { name: "All Bookings", route: route("vendorAllBookings") },
        { name: "Vehicle Rental", route: route("vendors.dashboard") },
        { name: "Ticket Booking", route: route("ticketBooking.dashboard") },
        { name: "Courier Service", route: route("courierService.dashboard") },
        { name: "Warehousing", route: route("vendors.warehouse.dashboard") },
        { name: "Freight", route: route("freight.dashboard") },
        { name: "Multimodal", route: route("multiModelHomepage.home") },
    ];

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentDay, setCurrentDay] = useState(today.getDate());
    const [currentView, setCurrentView] = useState("day"); // 'day', 'week', 'month', 'year'

    const handlePrev = () => {
        switch (currentView) {
            case "day":
                const prevDay = new Date(
                    currentYear,
                    currentMonth,
                    currentDay - 1
                );
                setCurrentDay(prevDay.getDate());
                setCurrentMonth(prevDay.getMonth());
                setCurrentYear(prevDay.getFullYear());
                break;
            case "week":
                const prevWeek = new Date(
                    currentYear,
                    currentMonth,
                    currentDay - 7
                );
                setCurrentDay(prevWeek.getDate());
                setCurrentMonth(prevWeek.getMonth());
                setCurrentYear(prevWeek.getFullYear());
                break;
            case "month":
                setCurrentMonth((prev) => {
                    if (prev === 0) {
                        setCurrentYear((y) => y - 1);
                        return 11;
                    }
                    return prev - 1;
                });
                break;
            case "year":
                setCurrentYear((y) => y - 1);
                break;
        }
    };

    const handleNext = () => {
        switch (currentView) {
            case "day":
                const nextDay = new Date(
                    currentYear,
                    currentMonth,
                    currentDay + 1
                );
                setCurrentDay(nextDay.getDate());
                setCurrentMonth(nextDay.getMonth());
                setCurrentYear(nextDay.getFullYear());
                break;
            case "week":
                const nextWeek = new Date(
                    currentYear,
                    currentMonth,
                    currentDay + 7
                );
                setCurrentDay(nextWeek.getDate());
                setCurrentMonth(nextWeek.getMonth());
                setCurrentYear(nextWeek.getFullYear());
                break;
            case "month":
                setCurrentMonth((prev) => {
                    if (prev === 11) {
                        setCurrentYear((y) => y + 1);
                        return 0;
                    }
                    return prev + 1;
                });
                break;
            case "year":
                setCurrentYear((y) => y + 1);
                break;
        }
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDay(today.getDate());
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const getHeaderTitle = () => {
        switch (currentView) {
            case "day":
                const dayDate = new Date(currentYear, currentMonth, currentDay);
                return `${monthNames[currentMonth]} ${currentDay}`;
            case "week":
                const weekDate = new Date(
                    currentYear,
                    currentMonth,
                    currentDay
                );
                const dayOfWeek = weekDate.getDay();
                const monday = new Date(weekDate);
                monday.setDate(weekDate.getDate() - ((dayOfWeek + 6) % 7));
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                return `${
                    monthNames[monday.getMonth()]
                } ${monday.getDate()} - ${sunday.getDate()}`;
            case "month":
                return `${monthNames[currentMonth]} ${currentYear}`;
            case "year":
                return `${currentYear}`;
            default:
                return `${monthNames[currentMonth]} ${currentYear}`;
        }
    };

    return (
        <>
        <div className="sticky top-0 z-30">
            <ServiceNavBar services={services} isVerified={isVerified} activeService={activeService} settingsRoute={route("ticketBooking.settingsPage")} />
        </div>
        <div className="w-full h-auto px-5 lg:pr-5 lg:px-0 py-5 lg:py-10 pt-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-5 justify-between lg:items-start items-center">
                <h1 className="figtree text-[24px] lg:text-[35px] font-[700]">
                    Ticket Booking Calendar
                </h1>
                <div className="flex flex-row gap-5 relative items-center">
                    {/* <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={search} alt="Search" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={settings} alt="Settings" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={bell} alt="Notifications" />
          </div> */}

                        {/* <div className="flex flex-row gap-5 relative items-center">
                            <UserDropdown
                                settingsRoute={route("ticketBooking.settingsPage")}
                            />
                        </div> */}
                </div>
            </div>
            {/* end of header section */}

            <div className="mt-10 flex flex-col xl:flex-row gap-5 w-full justify-between">
                <div
                    className="w-full h-auto bg-[#FFFFFF] rounded-[10px] flex flex-col gap-5 justify-between px-5 lg:px-8 py-10"
                    style={{
                        boxShadow: "4px 4px 4px #0000001A",
                    }}
                >
                    <div className="flex flex-col xl:flex-row gap-2 justify-center items-center w-full h-auto bg-[#E5E5E5] rounded-[10px] px-5 py-5">
                        <img
                            src={proPicTwo}
                            className="size-[90px]"
                            alt="Client"
                        />
                        <div className="flex flex-col gap-3 items-center text-center lg:items-start lg:text-start">
                            <h1 className="text-[18px] font-[700]">
                                Steve Gibson
                            </h1>
                            <div className="flex flex-row md:gap-10 gap-5 text-[16px] font-[500]">
                                <div className="flex flex-col gap-3 text-[#00000080]">
                                    <h1>Start Date</h1>
                                    <h1>End Date</h1>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h1>25th June 2025</h1>
                                    <h1>27th June 2025</h1>
                                </div>
                            </div>
                            <h1 className="text-[16px] font-[600] text-[#0955AC]">
                                Client request a child safety seat.
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-2 justify-center items-center w-full h-auto bg-[#E5E5E5] rounded-[10px] px-5 py-5">
                        <img src={car1} className="size-[90px]" alt="Car" />
                        <div className="flex flex-col gap-2 items-center text-center lg:items-start lg:text-start">
                            <h1 className="text-[18px] font-[700]">BMW LX3</h1>
                            <div className="flex flex-row md:gap-10 gap-5 text-[16px] font-[500]">
                                <div className="flex flex-col gap-2 text-[#00000080]">
                                    <h1>Car Type</h1>
                                    <h1>Car Number</h1>
                                    <h1>Transmission</h1>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h1>SUV</h1>
                                    <h1>CBL 3245</h1>
                                    <h1>Automatic</h1>
                                </div>
                            </div>
                            <h1 className="text-[16px] font-[600] text-[#0955AC]">
                                Client request a child safety seat.
                            </h1>
                        </div>
                    </div>
                </div>
                <div
                className="xl:max-w-[300px] xl:min-w-[349px] w-full h-auto xl:min-h-[428px] bg-[#FFFFFF] rounded-[10px] px-5 lg:px-10 py-10"
                style={{
                    boxShadow: "4px 4px 4px #0000001A",
                }}
                >
                    {/* Reminder section  */}
                    <div className="flex flex-row items-center justify-between w-full">
                        <h1 className="text-[24px] font-[700]">Reminders</h1>
                        <div className="w-[39px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex justify-center items-center gap-3 text-[#00000080] font-[600] text-[30px]">
                            +
                        </div>
                    </div>
                    <div className="py-5 flex flex-col justify-center items-center gap-5">
                        <div className="w-full xl:w-[286px] md:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                            <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                !
                            </div>
                            <h1 className="text-[14px] font-[500] xl:w-[199px]">
                                Update the car rental plans for the upcoming
                                sessions.
                            </h1>
                        </div>
                        <div className="w-full xl:w-[286px] md:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                            <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                !
                            </div>
                            <h1 className="text-[14px] font-[500] xl:w-[199px]">
                                Update the car rental plans for the upcoming
                                sessions.
                            </h1>
                        </div>
                        <div className="w-full xl:w-[286px] md:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                            <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                !
                            </div>
                            <h1 className="text-[14px] font-[500] xl:w-[199px]">
                                Update the car rental plans for the upcoming
                                sessions.
                            </h1>
                        </div>
                        <div className="w-full xl:w-[286px] md:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                            <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                !
                            </div>
                            <h1 className="text-[14px] font-[500] xl:w-[199px]">
                                Update the car rental plans for the upcoming
                                sessions.
                            </h1>
                        </div>
                    </div>
                    {/* end */}
                </div>
                <div
                    className="w-full h-auto mx-auto xl:min-h-[428px] bg-[#FFFFFF] rounded-[10px] flex justify-center items-center px-5 py-5"
                    style={{
                        boxShadow: "4px 4px 4px #0000001A",
                    }}
                >
                    <CalendarMonthPicker />
                </div>
            </div>

            <div
                className="w-full h-auto bg-[#FFFFFF] rounded-[10px] mt-10 py-10"
                style={{
                    boxShadow: "4px 4px 4px #0000001A",
                }}
            >
                <div className="px-5 lg:px-20 flex flex-col xl:flex-row items-center justify-between">
                    <div className="flex md:flex-row flex-col justify-center items-center gap-3">
                        <div
                            className="md:w-[75px] md:h-[35px] p-2 bg-[#F3F3F3] rounded-[6px] text-[14px] font-[500] text-[#00000080] flex justify-center items-center cursor-pointer hover:bg-[#E0E0E0] transition-colors"
                            onClick={handleToday}
                        >
                            Today
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <div
                                className="md:w-[35px] md:h-[35px] p-2 bg-[#F3F3F3] rounded-[6px] flex justify-center items-center cursor-pointer hover:bg-[#E0E0E0] transition-colors"
                                onClick={handlePrev}
                            >
                                <img src={leftArrow} alt="Previous" />
                            </div>
                            <div
                                className="md:w-[35px] md:h-[35px] p-2 bg-[#F3F3F3] rounded-[6px] flex justify-center items-center cursor-pointer hover:bg-[#E0E0E0] transition-colors"
                                onClick={handleNext}
                            >
                                <img
                                    src={leftArrow}
                                    className="rotate-180"
                                    alt="Next"
                                />
                            </div>
                        </div>
                        <h1 className="text-[18px] font-[700]">
                            {getHeaderTitle()}
                        </h1>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-5 mt-5 xl:mt-0">
                        <div className="flex flex-row justify-center items-center text-[#0955AC] text-[14px] font-[700]">
                            <div className="md:w-[85px] md:h-[35px] p-2 bg-[#F3F3F3] rounded-l-[6px] flex justify-center items-center">
                                All
                            </div>
                            <div className="md:w-[85px] md:h-[35px] p-2 bg-[#F3F3F3] flex justify-center items-center">
                                Pickup
                            </div>
                            <div className="md:w-[85px] md:h-[35px] p-2 bg-[#F3F3F3] rounded-r-[6px] flex justify-center items-center">
                                Return
                            </div>
                        </div>
                        <div className="flex flex-row justify-center items-center text-[14px] font-[600]">
                            <div
                                className={`md:w-[70px] md:h-[35px] rounded-l-[6px] flex justify-center px-2 py-2 items-center cursor-pointer transition-colors ${
                                    currentView === "day"
                                        ? "bg-[#0955AC] text-white"
                                        : "bg-[#F3F3F3] text-[#00000080] hover:bg-[#E0E0E0]"
                                }`}
                                onClick={() => setCurrentView("day")}
                            >
                                Day
                            </div>
                            <div
                                className={`md:w-[70px] md:h-[35px] px-2 py-2 flex justify-center items-center cursor-pointer transition-colors ${
                                    currentView === "week"
                                        ? "bg-[#0955AC] text-white"
                                        : "bg-[#F3F3F3] text-[#00000080] hover:bg-[#E0E0E0]"
                                }`}
                                onClick={() => setCurrentView("week")}
                            >
                                Week
                            </div>
                            <div
                                className={`md:w-[70px] md:h-[35px] px-2 py-2 flex justify-center items-center cursor-pointer transition-colors ${
                                    currentView === "month"
                                        ? "bg-[#0955AC] text-white"
                                        : "bg-[#F3F3F3] text-[#00000080] hover:bg-[#E0E0E0]"
                                }`}
                                onClick={() => setCurrentView("month")}
                            >
                                Month
                            </div>
                            <div
                                className={`md:w-[70px] md:h-[35px] px-2 py-2 rounded-r-[6px] flex justify-center items-center cursor-pointer transition-colors ${
                                    currentView === "year"
                                        ? "bg-[#0955AC] text-white"
                                        : "bg-[#F3F3F3] text-[#00000080] hover:bg-[#E0E0E0]"
                                }`}
                                onClick={() => setCurrentView("year")}
                            >
                                Year
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-5 md:gap-10 justify-start items-center px-5 lg:px-20 py-5">
                    <div className="flex flex-row justify-start items-center gap-5 ">
                        <div className="size-[16px] bg-[#C5E6F9] rounded-[4px]" />
                        <h1 className=" text-[#00000080] font-[600] text-[16px]">
                            Done
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-5">
                        <div className="size-[16px] bg-[#FFDBDF] rounded-[4px]" />
                        <h1 className=" text-[#00000080] font-[600] text-[16px]">
                            Cancelled
                        </h1>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <CalendarGrid
                        days={days}
                        times={times}
                        events={events}
                        proPicTwo={proPicTwo}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        currentDay={currentDay}
                        currentView={currentView}
                    />
                </div>
            </div>
        </div>
        </>
    );
};

export default CalendarContent;
