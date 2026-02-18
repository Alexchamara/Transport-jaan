import React, { useEffect, useMemo, useState, useRef } from "react";

import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";
import upArrow from "../../../assets/vendors/dashboard/icons/upArrow.svg";
import NotificationDropdown from "../NotificationDropdown";

import icon1 from "../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../assets/vendors/booking/icons/icon4.svg";

import BookingBarChart from "./BookingBarChart";
import CarBookingTableTwo from "./CarBookingTableTwo";

import UserDropdown from "../UserDropdown";

// ----- color lookups -----
const paymentStatusColors = {
    Paid: { color: "#3B8F31", bg: "#ACE199" },
    Pending: { color: "#FF6060", bg: "#FF60608C" },
};
const statusColors = {
    Ongoing: { bg: "#FFCD29", text: "#000000" },
    Returned: { bg: "#3B8F31", text: "#FFCD29" },
    Cancelled: { bg: "#FF6060", text: "#FFFFFF" },
};

// decorate a booking with table-friendly color fields
const decorateBooking = (b) => ({
    ...b,
    paymentStatusColor:
        paymentStatusColors[b.paymentStatus]?.color ?? "#7B7B7A",
    paymentStatusBg: paymentStatusColors[b.paymentStatus]?.bg ?? "#E8E8EF",
    statusBg: statusColors[b.status]?.bg ?? "#FFCD29",
    statusText: statusColors[b.status]?.text ?? "#000000",
});

const BookingContent = ({
    initialBookings = [],
    bookingData = [], // [{name:'Jan', done:120, cancelled:12}, ...]
    vendorUser = { name: "Service Provider", role: "Service Provider" },
    unreadNotifications = 0, // NEW
}) => {
    const [bookings, setBookings] = useState(() =>
        (initialBookings || []).map(decorateBooking)
    );

    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const wrapperRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // // Close dropdown when clicking outside or pressing Escape
    // useEffect(() => {
    //     const handleClickOutside = (e) => {
    //         if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
    //             setShowUserDropdown(false);
    //         }
    //     };

    //     const handleKey = (e) => {
    //         if (e.key === "Escape") setShowUserDropdown(false);
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);
    //     document.addEventListener("keydown", handleKey);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //         document.removeEventListener("keydown", handleKey);
    //     };
    // }, []);

    useEffect(() => {
        setBookings((initialBookings || []).map(decorateBooking));
    }, [initialBookings]);

    // KPIs derived from current bookings
    const kpis = useMemo(() => {
        const today = new Date();
        const parse = (s) => (s ? new Date(s) : null);

        const upcoming = bookings.filter((b) => {
            const sd = parse(b.startDate);
            return sd && sd > today && b.status !== "Cancelled";
        }).length;

        const pending = bookings.filter(
            (b) => b.paymentStatus === "Pending"
        ).length;
        const cancelled = bookings.filter(
            (b) => b.status === "Cancelled"
        ).length;
        const completed = bookings.filter(
            (b) => b.status === "Returned"
        ).length;

        return { upcoming, pending, cancelled, completed };
    }, [bookings]);

    return (
        <div className="w-full h-auto px-5 lg:px-0 lg:pr-5 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-5 justify-between items-center mb-4 sm:mb-0">
                <h1 className="figtree text-[20px] sm:text-[24px] lg:text-[28px] xl:text-[35px] font-[700]">
                    Vehicle Rental Bookings
                </h1>
                <div className="flex flex-row gap-3 sm:gap-5 relative items-center">
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div>
            </div>{" "}
            {/* KPI row */}
            <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 justify-between py-6 sm:py-10 w-full">
                <div className="flex flex-col gap-3 sm:gap-4 lg:gap-8">
                    {/* Upcoming */}
                    <div
                        className="w-full xl:min-w-[300px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-3 sm:px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-3 sm:gap-5 items-center">
                            <div className="size-[40px] sm:size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center flex-shrink-0">
                                <img
                                    src={icon1}
                                    alt="Upcoming Bookings"
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                />
                            </div>
                            <div>
                                <div className="text-[12px] sm:text-[16px] font-[500] text-[#7B7B7A]">
                                    Upcoming Bookings
                                </div>
                                <div className="text-[20px] sm:text-[26px] font-[700]">
                                    {kpis.upcoming}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 items-end text-[12px] sm:text-[14px] font-[500]">
                            <div className="w-[70px] sm:w-[81px] h-[24px] sm:h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[16px] sm:size-[19px]"
                                    alt=""
                                />
                                <span>+2.86%</span>
                            </div>
                            <span className="text-[#7B7B7A] hidden sm:inline">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Pending */}
                    <div
                        className="w-full xl:min-w-[300px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-3 sm:px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-3 sm:gap-5 items-center">
                            <div className="size-[40px] sm:size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center flex-shrink-0">
                                <img
                                    src={icon2}
                                    alt="Pending Bookings"
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                />
                            </div>
                            <div>
                                <div className="text-[12px] sm:text-[16px] font-[500] text-[#7B7B7A]">
                                    Pending Bookings
                                </div>
                                <div className="text-[20px] sm:text-[26px] font-[700]">
                                    {kpis.pending}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 items-end text-[12px] sm:text-[14px] font-[500]">
                            <div className="w-[70px] sm:w-[81px] h-[24px] sm:h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[16px] sm:size-[19px]"
                                    alt=""
                                />
                                <span>+2.86%</span>
                            </div>
                            <span className="text-[#7B7B7A] hidden sm:inline">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Cancelled */}
                    <div
                        className="w-full xl:min-w-[300px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-3 sm:px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-3 sm:gap-5 items-center">
                            <div className="size-[40px] sm:size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center flex-shrink-0">
                                <img
                                    src={icon3}
                                    alt="Cancelled Bookings"
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                />
                            </div>
                            <div>
                                <div className="text-[12px] sm:text-[16px] font-[500] text-[#7B7B7A]">
                                    Cancelled Bookings
                                </div>
                                <div className="text-[20px] sm:text-[26px] font-[700]">
                                    {kpis.cancelled}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 items-end text-[12px] sm:text-[14px] font-[500]">
                            <div className="w-[70px] sm:w-[81px] h-[24px] sm:h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[16px] sm:size-[19px]"
                                    alt=""
                                />
                                <span>+2.86%</span>
                            </div>
                            <span className="text-[#7B7B7A] hidden sm:inline">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Completed */}
                    <div
                        className="w-full xl:min-w-[300px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-3 sm:px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-3 sm:gap-5 items-center">
                            <div className="size-[40px] sm:size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center flex-shrink-0">
                                <img
                                    src={icon4}
                                    alt="Completed Bookings"
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                />
                            </div>
                            <div>
                                <div className="text-[12px] sm:text-[16px] font-[500] text-[#7B7B7A]">
                                    Completed Bookings
                                </div>
                                <div className="text-[20px] sm:text-[26px] font-[700]">
                                    {kpis.completed}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 items-end text-[12px] sm:text-[14px] font-[500]">
                            <div className="w-[70px] sm:w-[81px] h-[24px] sm:h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[16px] sm:size-[19px]"
                                    alt=""
                                />
                                <span>+2.86%</span>
                            </div>
                            <span className="text-[#7B7B7A] hidden sm:inline">
                                from last week
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Chart */}
                <div
                    className="w-full min-w-[280px] lg:min-w-[495px] xl:max-w-[700px] min-h-[250px] sm:min-h-[300px] lg:min-h-[437px] bg-white rounded-[8px] sm:rounded-[10px] flex items-center justify-center overflow-x-auto"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    {isMobile ? (
                        <div className="w-full p-4">
                            <div className="flex flex-col gap-2">
                                {/* Placeholder data for mobile since we can't access the chart's state */}
                                {[
                                    { name: "Jan", done: 320, cancelled: 220 },
                                    { name: "Feb", done: 380, cancelled: 270 },
                                    { name: "Mar", done: 250, cancelled: 150 },
                                    { name: "Apr", done: 500, cancelled: 230 },
                                    { name: "May", done: 310, cancelled: 410 },
                                    { name: "Jun", done: 370, cancelled: 180 },
                                    { name: "Jul", done: 420, cancelled: 210 },
                                    { name: "Aug", done: 480, cancelled: 380 },
                                ].map((item, index) => (
                                    <div key={index} className="bg-gray-50 rounded-md p-3">
                                        <div className="font-medium text-gray-700 mb-2">{item.name}</div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-blue-600 text-sm">{item.done} done</span>
                                            <span className="font-bold text-red-600 text-sm">{item.cancelled} cancelled</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <BookingBarChart bookingData={bookingData} />
                    )}
                </div>
            </div>
            {/* Table */}
            <div
                className="w-full bg-white rounded-[8px] sm:rounded-[10px] py-4 sm:py-6 lg:py-10 px-3 sm:px-4 lg:px-10 overflow-x-auto mt-6 sm:mt-0"
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex flex-row justify-between mb-3 sm:mb-4">
                    <h2 className="text-[16px] sm:text-[18px] lg:text-[24px] font-[700]">
                        Car Booking
                    </h2>
                </div>

                <CarBookingTableTwo
                    bookings={Array.isArray(bookings) ? bookings : []}
                    setBookings={setBookings}
                    statusColors={statusColors}
                />
            </div>
        </div>
    );
};

export default BookingContent;
