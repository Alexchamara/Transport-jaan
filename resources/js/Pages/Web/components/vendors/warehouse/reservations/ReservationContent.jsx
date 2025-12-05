import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";

import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/booking/icons/icon4.svg";

import ReservationBarChart from "./ReservationBarChart";
import WarehouseReservationTable from "./WarehouseReservationTable";

import UserDropdown from "../../../vendors/UserDropdown";

// Status color mappings
// const paymentStatusColors = {
//     paid: { color: "#3B8F31", bg: "#ACE199" },
//     pending: { color: "#FF6060", bg: "#FF60608C" },
//     failed: { color: "#FF0000", bg: "#FF00004D" },
// };

// const statusColors = {
//     confirmed: { bg: "#0955AC", text: "#FFFFFF" },
//     active: { bg: "#50AE31", text: "#FFFFFF" },
//     pending: { bg: "#FFCD29", text: "#000000" },
//     completed: { bg: "#6B7280", text: "#FFFFFF" },
//     cancelled: { bg: "#FF6060", text: "#FFFFFF" },
// };

// Decorate a reservation with table-friendly color fields
// const decorateReservation = (r) => ({
//     ...r,
//     paymentStatusColor:
//         paymentStatusColors[r.paymentStatus?.toLowerCase()]?.color ?? "#7B7B7A",
//     paymentStatusBg:
//         paymentStatusColors[r.paymentStatus?.toLowerCase()]?.bg ?? "#E8E8EF",
//     statusBg: statusColors[r.status?.toLowerCase()]?.bg ?? "#FFCD29",
//     statusText: statusColors[r.status?.toLowerCase()]?.text ?? "#000000",
// });

const ReservationContent = () => {
    const { auth } = usePage().props;
    // const [reservations, setReservations] = useState([]);
    const [reservationData, setReservationData] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [stats, setStats] = useState({
    //     active: 0,
    //     pending: 0,
    //     expired: 0,
    //     cancelled: 0,
    //     activeGrowth: 0,
    //     pendingGrowth: 0,
    //     expiredGrowth: 0,
    //     cancelledGrowth: 0,
    // });

    // Fetch reservations data
    // useEffect(() => {
    //     const fetchReservations = async () => {
    //         try {
    //             setLoading(true);
    //             const response = await axios.get("/vendors/warehouse/api/reservations");
                
    //             if (response.data.success) {
    //                 const decorated = response.data.data.map(decorateReservation);
    //                 setReservations(decorated);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching reservations:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchReservations();
    // }, []);

    // Fetch stats
    // useEffect(() => {
    //     const fetchStats = async () => {
    //         try {
    //             const response = await axios.get("/vendors/warehouse/api/reservations/stats");
                
    //             if (response.data.success) {
    //                 const data = response.data.data;
                    
    //                 // Calculate growth percentages
    //                 const calculateGrowth = (current, previous) => {
    //                     if (previous === 0) return current > 0 ? 100 : 0;
    //                     return ((current - previous) / previous * 100).toFixed(2);
    //                 };
                    
    //                 setStats({
    //                     active: data.active_reservations || 0,
    //                     pending: data.pending_reservations || 0,
    //                     expired: data.expired_reservations || 0,
    //                     cancelled: data.cancelled_reservations || 0,
    //                     activeGrowth: calculateGrowth(
    //                         data.active_reservations || 0, 
    //                         data.previous_active_reservations || 0
    //                     ),
    //                     pendingGrowth: calculateGrowth(
    //                         data.pending_reservations || 0, 
    //                         data.previous_pending_reservations || 0
    //                     ),
    //                     expiredGrowth: calculateGrowth(
    //                         data.expired_reservations || 0, 
    //                         data.previous_expired_reservations || 0
    //                     ),
    //                     cancelledGrowth: calculateGrowth(
    //                         data.cancelled_reservations || 0, 
    //                         data.previous_cancelled_reservations || 0
    //                     ),
    //                 });
    //             }
    //         } catch (error) {
    //             console.error("Error fetching stats:", error);
    //         }
    //     };

    //     fetchStats();
    // }, []);

    // Fetch chart data
    // useEffect(() => {
    //     const fetchChartData = async () => {
    //         try {
    //             const response = await axios.get("/vendors/warehouse/api/reservations/chart-data");
                
    //             if (response.data.success) {
    //                 setReservationData(response.data.data);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching chart data:", error);
    //         }
    //     };

    //     fetchChartData();
    // }, []);

    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">
                    Warehouse Reservations
                </h1>
                <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div>
            </div>

            {/* KPI row */}
            <div className="flex flex-row gap-10 justify-between py-20 w-full">
                <div className="flex flex-col gap-8 w-full">
                    {/* Active Reservations */}
                    {/* <div
                        className="w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-3 shadow-sm"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon1} alt="Active Reservations" />
                            </div>
                            <div>
                                <div className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Active Reservations
                                </div>
                                <div className="text-[26px] font-[700]">
                                    {stats.active}
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
                                        transform: stats.activeGrowth < 0 ? 'rotate(180deg)' : 'none'
                                    }}
                                />
                                <span>{stats.activeGrowth >= 0 ? '+' : ''}{stats.activeGrowth}%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div> */}

                    {/* Pending Reservations */}
                    {/* <div
                        className="w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon2} alt="Pending Reservations" />
                            </div>
                            <div>
                                <div className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Pending Reservations
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
                    </div> */}

                    {/* Expired Reservations */}
                    {/* <div
                        className="w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon3} alt="Expired Reservations" />
                            </div>
                            <div>
                                <div className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Expired Reservations
                                </div>
                                <div className="text-[26px] font-[700]">
                                    {stats.expired}
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
                                        transform: stats.expiredGrowth < 0 ? 'rotate(180deg)' : 'none'
                                    }}
                                />
                                <span>{stats.expiredGrowth >= 0 ? '+' : ''}{stats.expiredGrowth}%</span>
                            </div>
                            <span className="text-[#7B7B7A]">
                                from last week
                            </span>
                        </div>
                    </div> */}

                    {/* Cancelled Reservations */}
                    {/* <div
                        className="w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-3"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon4} alt="Cancelled Reservations" />
                            </div>
                            <div>
                                <div className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Cancelled Reservations
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
                    </div> */}
                </div>

                {/* Right: Chart */}
                <div
                    className="min-w-[712px] w-full min-h-[437px] bg-white rounded-[10px] flex items-center justify-center"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <ReservationBarChart reservationData={reservationData} />
                </div>
            </div>

            {/* Table */}
            {/* <div
                className="w-full bg-white rounded-[10px] py-10 px-10"
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex flex-row justify-between">
                    <h2 className="text-[24px] font-[700]">
                        Warehouse Reservations
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-[16px] text-[#7B7B7A]">
                            Loading reservations...
                        </div>
                    </div>
                ) : (
                    <WarehouseReservationTable
                        reservations={Array.isArray(reservations) ? reservations : []}
                        setReservations={setReservations}
                        statusColors={statusColors}
                    />
                )}
            </div> */}
        </div>
    );
};

export default ReservationContent;
