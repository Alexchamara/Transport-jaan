import React, { useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";

import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/booking/icons/icon4.svg";

import BookingBarChart from "../../../vendors/bookings/BookingBarChart";
import WarehouseBookingTable from "./WarehouseBookingTable";

import UserDropdown from "../../../vendors/UserDropdown";

// Status color mappings
const paymentStatusColors = {
    paid: { color: "#3B8F31", bg: "#ACE199" },
    pending: { color: "#FF6060", bg: "#FF60608C" },
    failed: { color: "#FF0000", bg: "#FF00004D" },
};

const statusColors = {
    confirmed: { bg: "#0955AC", text: "#FFFFFF" },
    active: { bg: "#50AE31", text: "#FFFFFF" },
    pending: { bg: "#FFCD29", text: "#000000" },
    completed: { bg: "#3B8F31", text: "#FFCD29" },
    cancelled: { bg: "#FF6060", text: "#FFFFFF" },
};

// Decorate a booking with table-friendly color fields
const decorateBooking = (b) => ({
    ...b,
    paymentStatusColor:
        paymentStatusColors[b.paymentStatus?.toLowerCase()]?.color ?? "#7B7B7A",
    paymentStatusBg:
        paymentStatusColors[b.paymentStatus?.toLowerCase()]?.bg ?? "#E8E8EF",
    statusBg: statusColors[b.status?.toLowerCase()]?.bg ?? "#FFCD29",
    statusText: statusColors[b.status?.toLowerCase()]?.text ?? "#000000",
});

const BookingContent = () => {
    const { auth } = usePage().props;
    const [bookings, setBookings] = useState([]);
    const [bookingData, setBookingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcoming: 0,
        pending: 0,
        cancelled: 0,
        completed: 0,
        upcomingGrowth: 0,
        pendingGrowth: 0,
        cancelledGrowth: 0,
        completedGrowth: 0,
    });

    // Fetch bookings data
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await axios.get("https://transport.jaan.lk/vendors/warehouse/api/bookings");
                
                if (response.data.success) {
                    const decorated = response.data.data.map(decorateBooking);
                    setBookings(decorated);
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/vendors/warehouse/api/bookings/stats");
                
                if (response.data.success) {
                    const data = response.data.data;
                    
                    // Calculate growth percentages
                    const calculateGrowth = (current, previous) => {
                        if (previous === 0) return current > 0 ? 100 : 0;
                        return ((current - previous) / previous * 100).toFixed(2);
                    };
                    
                    setStats({
                        upcoming: data.upcoming_bookings || 0,
                        pending: data.pending_bookings || 0,
                        cancelled: data.cancelled_bookings || 0,
                        completed: data.completed_bookings || 0,
                        upcomingGrowth: calculateGrowth(
                            data.upcoming_bookings || 0, 
                            data.previous_upcoming_bookings || 0
                        ),
                        pendingGrowth: calculateGrowth(
                            data.pending_bookings || 0, 
                            data.previous_pending_bookings || 0
                        ),
                        cancelledGrowth: calculateGrowth(
                            data.cancelled_bookings || 0, 
                            data.previous_cancelled_bookings || 0
                        ),
                        completedGrowth: calculateGrowth(
                            data.completed_bookings || 0, 
                            data.previous_completed_bookings || 0
                        ),
                    });
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, []);

    // Fetch chart data
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await axios.get("/vendors/warehouse/api/bookings/chart-data");
                
                if (response.data.success) {
                    setBookingData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
        };

        fetchChartData();
    }, []);

    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">
                    Warehouse Bookings
                </h1>
                <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div>
            </div>

            {/* KPI row */}
            <div className="flex flex-row gap-10 justify-between py-20 w-full">
                <div className="flex flex-col gap-8 w-full">
                    {/* Upcoming Bookings */}
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
                                    {stats.upcoming}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt=""
                                    style={{
                                        transform: stats.upcomingGrowth < 0 ? 'rotate(180deg)' : 'none'
                                    }}
                                />
                                <span>{stats.upcomingGrowth >= 0 ? '+' : ''}{stats.upcomingGrowth}%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Pending Bookings */}
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
                                    {stats.pending}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt=""
                                    style={{
                                        transform: stats.pendingGrowth < 0 ? 'rotate(180deg)' : 'none'
                                    }}
                                />
                                <span>{stats.pendingGrowth >= 0 ? '+' : ''}{stats.pendingGrowth}%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Cancelled Bookings */}
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
                                    {stats.cancelled}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt=""
                                    style={{
                                        transform: stats.cancelledGrowth < 0 ? 'rotate(180deg)' : 'none'
                                    }}
                                />
                                <span>{stats.cancelledGrowth >= 0 ? '+' : ''}{stats.cancelledGrowth}%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div>

                    {/* Completed Bookings */}
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
                                    {stats.completed}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt=""
                                    style={{
                                        transform: stats.completedGrowth < 0 ? 'rotate(180deg)' : 'none'
                                    }}
                                />
                                <span>{stats.completedGrowth >= 0 ? '+' : ''}{stats.completedGrowth}%</span>
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
                    <h2 className="text-[24px] font-[700]">
                        Warehouse Bookings
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-[16px] text-[#7B7B7A]">
                            Loading bookings...
                        </div>
                    </div>
                ) : (
                    <WarehouseBookingTable
                        bookings={Array.isArray(bookings) ? bookings : []}
                        setBookings={setBookings}
                        statusColors={statusColors}
                    />
                )}
            </div>
        </div>
    );
};

export default BookingContent;
