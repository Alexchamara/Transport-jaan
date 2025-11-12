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

import UserDropdown from "../../../components/vendors/Userdropdown";

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
    vendorUser = { name: "Vendor", role: "Vendor" },
    unreadNotifications = 0, // NEW
}) => {
    const [bookings, setBookings] = useState(() =>
        (initialBookings || []).map(decorateBooking)
    );

    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const wrapperRef = useRef(null);

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
        <div className="w-full h-auto pr-5 py-10">
            {/* Header */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Vehicle Rental Bookings</h1>
                <div className="flex flex-row gap-5 relative items-center">
                    <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div>
                </div>
            </div>

            {/* KPI row */}
            <div className="flex flex-row gap-10 justify-between py-20 w-full">
                <div className="flex flex-col gap-8 w-full">
                    {/* Upcoming */}
                    <div
                        className="w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-3 shadow-sm"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon1} alt="Upcoming Bookings" />
                            </div>
                            <div>
                                <div className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Upcoming Bookings
                                </div>
                                <div className="text-[26px] font-[700]">
                                    {kpis.upcoming}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt=""
                                />
                                <span>+2.86%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Pending */}
                    <div
                        className="w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon2} alt="Pending Bookings" />
                            </div>
                            <div>
                                <div className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Pending Bookings
                                </div>
                                <div className="text-[26px] font-[700]">
                                    {kpis.pending}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt=""
                                />
                                <span>+2.86%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Cancelled */}
                    <div
                        className="w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon3} alt="Cancelled Bookings" />
                            </div>
                            <div>
                                <div className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Cancelled Bookings
                                </div>
                                <div className="text-[26px] font-[700]">
                                    {kpis.cancelled}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt=""
                                />
                                <span>+2.86%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Completed */}
                    <div
                        className="w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon4} alt="Completed Bookings" />
                            </div>
                            <div>
                                <div className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Completed Bookings
                                </div>
                                <div className="text-[26px] font-[700]">
                                    {kpis.completed}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt=""
                                />
                                <span>+2.86%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Chart */}
                <div
                    className="min-w-[712px] w-full min-h-[437px] bg-white rounded-[10px] flex items-center justify-center"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <BookingBarChart bookingData={bookingData} />
                </div>
            </div>

            {/* Table */}
            <div
                className="w-full bg-white rounded-[10px] py-10 px-10"
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex flex-row justify-between">
                    <h2 className="text-[24px] font-[700]">Car Booking</h2>
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
