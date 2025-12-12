import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { API_BASE_URL } from "../../../../../../config/api";

import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";
import miniUp from "../../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../../assets/vendors/dashboard/icons/miniDown.svg";

import icon1 from "../../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/booking/icons/icon4.svg";

import ReservationBarChart from "./ReservationBarChart";
import WarehouseReservationTable from "./WarehouseReservationTable";

import UserDropdown from "../../../vendors/UserDropdown";


const ReservationContent = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [newPaymentStatus, setNewPaymentStatus] = useState("");
    const [cancellationReason, setCancellationReason] = useState("");

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    const perPageOptions = [5, 10, 20, 50];

    // Status colors configuration
    const statusColors = {
        pending: { bg: "#FF6060", text: "#FFFFFF" },
        confirmed: { bg: "#0955AC", text: "#FFFFFF" },
        active: { bg: "#FFCD29", text: "#000000" },
        completed: { bg: "#3B8F31", text: "#FFCD29" },
        cancelled: { bg: "#FF6060", text: "#FFFFFF" },
        expired: { bg: "#7B7B7A", text: "#FFFFFF" },
    };

    // Fetch reservations data
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}vendors/warehouse/api/reservations`);
                
                if (response.data.success) {
                    console.log("Fetched reservations:", response.data.data);
                    
                    // Decorate reservations with display properties
                    const decorated = response.data.data.map(res => {
                        const paymentStatusColors = {
                            paid: { color: "#3B8F31", bg: "#ACE199" },
                            pending: { color: "#FF6060", bg: "#FF60608C" },
                            failed: { color: "#FF0000", bg: "#FF00004D" },
                        };
                        
                        const status = res.status?.toLowerCase() || "pending";
                        const paymentStatus = res.payment_status?.toLowerCase() || "pending";
                        
                        return {
                            ...res,
                            paymentStatusColor: paymentStatusColors[paymentStatus]?.color || "#7B7B7A",
                            paymentStatusBg: paymentStatusColors[paymentStatus]?.bg || "#E8E8EF",
                            statusBg: statusColors[status]?.bg || "#E8E8EF",
                            statusText: statusColors[status]?.text || "#000000",
                        };
                    });
                    
                    setReservations(decorated);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    // Filter reservations based on all filter criteria
    const filteredReservations = reservations.filter((reservation) => {
        // Search filter (reservation ID or client name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesId = (reservation.booking_reference || reservation.id.toString()).toLowerCase().includes(query);
            const matchesClient = (reservation.company_name || "").toLowerCase().includes(query);
            if (!matchesId && !matchesClient) return false;
        }

        // Status filter
        if (statusFilter !== "all") {
            if ((reservation.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;
        }

        // Payment filter
        if (paymentFilter !== "all") {
            if ((reservation.payment_status || "").toLowerCase() !== paymentFilter.toLowerCase()) return false;
        }

        // Start date filter
        if (startDateFilter && reservation.start_date) {
            if (reservation.start_date < startDateFilter) return false;
        }

        // End date filter
        if (endDateFilter && reservation.end_date) {
            if (reservation.end_date > endDateFilter) return false;
        }

        return true;
    });

    // Reset current page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, paymentFilter, startDateFilter, endDateFilter]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredReservations.length / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentReservations = filteredReservations.slice(startIdx, endIdx);

    const goToPage = (p) => {
        if (p < 1 || p > totalPages) return;
        setCurrentPage(p);
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
        return pages;
    };

    const handleRowClick = (reservation, index) => {
        setSelectedReservation({ ...reservation, index: startIdx + index });
        setNewPaymentStatus(reservation.payment_status || "pending");
        setCancellationReason("");
        setIsPopupOpen(true);
    };

    const handleConfirm = async () => {
        if (!selectedReservation || selectedReservation.status?.toLowerCase() !== "pending") {
            alert("Only pending reservations can be confirmed");
            return;
        }

        try {
            const reservationId = selectedReservation.booking_reference || selectedReservation.id;
            const response = await axios.patch(
                `${API_BASE_URL}vendors/warehouse/api/reservations/${reservationId}/confirm`
            );

            if (response.data.success) {
                const updated = [...reservations];
                updated[selectedReservation.index] = {
                    ...selectedReservation,
                    status: "confirmed",
                    statusBg: statusColors?.confirmed?.bg || "#0955AC",
                    statusText: statusColors?.confirmed?.text || "#FFFFFF",
                };
                setReservations(updated);
                setIsPopupOpen(false);
                alert("Reservation confirmed successfully!");
            }
        } catch (error) {
            console.error("Error confirming reservation:", error);
            alert(error.response?.data?.message || "Failed to confirm reservation");
        }
    };

    const handleCancel = async () => {
        if (!selectedReservation) return;

        const currentStatus = selectedReservation.status?.toLowerCase();
        if (["cancelled", "expired"].includes(currentStatus)) {
            alert("This reservation is already cancelled or expired");
            return;
        }

        if (!cancellationReason.trim()) {
            alert("Please provide a cancellation reason");
            return;
        }

        try {
            const reservationId = selectedReservation.booking_reference || selectedReservation.id;
            const response = await axios.patch(
                `${API_BASE_URL}vendors/warehouse/api/reservations/${reservationId}/cancel`,
                { cancellation_reason: cancellationReason }
            );

            if (response.data.success) {
                const updated = [...reservations];
                updated[selectedReservation.index] = {
                    ...selectedReservation,
                    status: "cancelled",
                    statusBg: statusColors?.cancelled?.bg || "#FF6060",
                    statusText: statusColors?.cancelled?.text || "#FFFFFF",
                };
                setReservations(updated);
                setIsPopupOpen(false);
                alert("Reservation cancelled successfully!");
            }
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            alert(error.response?.data?.message || "Failed to cancel reservation");
        }
    };

    const handleComplete = async () => {
        if (!selectedReservation) return;

        const currentStatus = selectedReservation.status?.toLowerCase();
        if (!["confirmed", "active"].includes(currentStatus)) {
            alert("Only confirmed or active reservations can be completed");
            return;
        }

        try {
            const reservationId = selectedReservation.booking_reference || selectedReservation.id;
            const response = await axios.patch(
                `${API_BASE_URL}vendors/warehouse/api/reservations/${reservationId}/complete`
            );

            if (response.data.success) {
                const updated = [...reservations];
                updated[selectedReservation.index] = {
                    ...selectedReservation,
                    status: "completed",
                    payment_status: "paid",
                    statusBg: statusColors?.completed?.bg || "#3B8F31",
                    statusText: statusColors?.completed?.text || "#FFCD29",
                };
                setReservations(updated);
                setIsPopupOpen(false);
                alert("Reservation marked as completed!");
            }
        } catch (error) {
            console.error("Error completing reservation:", error);
            alert(error.response?.data?.message || "Failed to complete reservation");
        }
    };

    const handleUpdate = async () => {
        if (!selectedReservation) return;

        try {
            const reservationId = selectedReservation.booking_reference || selectedReservation.id;
            const response = await axios.put(
                `${API_BASE_URL}vendors/warehouse/api/reservations/${reservationId}`,
                { payment_status: newPaymentStatus }
            );

            if (response.data.success) {
                const paymentStatusColors = {
                    paid: { color: "#3B8F31", bg: "#ACE199" },
                    pending: { color: "#FF6060", bg: "#FF60608C" },
                    failed: { color: "#FF0000", bg: "#FF00004D" },
                };

                const updated = [...reservations];
                updated[selectedReservation.index] = {
                    ...selectedReservation,
                    payment_status: newPaymentStatus,
                    paymentStatusColor: paymentStatusColors[newPaymentStatus?.toLowerCase()]?.color || "#7B7B7A",
                    paymentStatusBg: paymentStatusColors[newPaymentStatus?.toLowerCase()]?.bg || "#E8E8EF",
                };
                setReservations(updated);
                setIsPopupOpen(false);
                alert("Reservation updated successfully!");
            }
        } catch (error) {
            console.error("Error updating reservation:", error);
            alert(error.response?.data?.message || "Failed to update reservation");
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div className="w-full h-auto lg:pr-5 px-5 lg:px-0 py-10">
            {/* Header */}
            <div className="flex lg:flex-row flex-col gap-5 justify-between items-center mt-10">
                <h1 className="figtree text-[35px] font-[700] text-center">
                    Warehouse Reservations
                </h1>
                {/* <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div> */}
            </div>

            {/* Filters Section */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-[12px] font-[500] text-[#7B7B7A] mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Reservation ID or Client Name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-[#F7F7F7] rounded-[5px] text-[14px] outline-none border-0 focus:ring-1 focus:ring-[#0955AC]"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-[12px] font-[500] text-[#7B7B7A] mb-1">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-[#F7F7F7] rounded-[5px] text-[14px] outline-none border-0 focus:ring-1 focus:ring-[#0955AC]"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                        <label className="block text-[12px] font-[500] text-[#7B7B7A] mb-1">
                            Payment Status
                        </label>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-[#F7F7F7] rounded-[5px] text-[14px] outline-none border-0 focus:ring-1 focus:ring-[#0955AC]"
                        >
                            <option value="all">All Payments</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    {/* Start Date Filter */}
                    <div>
                        <label className="block text-[12px] font-[500] text-[#7B7B7A] mb-1">
                            Start Date From
                        </label>
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-[#F7F7F7] rounded-[5px] text-[14px] outline-none border-0 focus:ring-1 focus:ring-[#0955AC]"
                        />
                    </div>

                    {/* End Date Filter */}
                    <div>
                        <label className="block text-[12px] font-[500] text-[#7B7B7A] mb-1">
                            End Date To
                        </label>
                        <input
                            type="date"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-[#F7F7F7] rounded-[5px] text-[14px] outline-none border-0 focus:ring-1 focus:ring-[#0955AC]"
                        />
                    </div>
                </div>

                {/* Filter Summary and Clear */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#00000033]">
                    <div className="text-[14px] text-[#7B7B7A]">
                        Showing {currentReservations.length} of {filteredReservations.length} reservations
                        {filteredReservations.length !== reservations.length && (
                            <span className="text-[#0955AC] font-[600]"> (filtered from {reservations.length} total)</span>
                        )}
                    </div>
                    {(searchQuery || statusFilter !== "all" || paymentFilter !== "all" || startDateFilter || endDateFilter) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setPaymentFilter("all");
                                setStartDateFilter("");
                                setEndDateFilter("");
                            }}
                            className="px-4 py-2 bg-[#FF6060] text-white rounded-[5px] text-[14px] font-[600] hover:bg-[#FF4040] transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table Display */}
            <div className="mt-10">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-[16px] text-[#7B7B7A]">
                            Loading reservations...
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="bg-white rounded-lg shadow overflow-hidden hidden xl:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#D8E4F2]">
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Reservation ID</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Reserved Date</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Client Name</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Warehouse</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Storage Type</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Start Date</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">End Date</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Amount</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Payment</th>
                                        <th className="px-4 py-3 text-left text-[14px] font-[600]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentReservations.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="px-4 py-20 text-center text-[#7B7B7A]">
                                                No reservations found
                                            </td>
                                        </tr>
                                    ) : (
                                        currentReservations.map((reservation, idx) => (
                                            <tr
                                                key={startIdx + idx}
                                                className="border-b border-[#00000033] hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleRowClick(reservation, idx)}
                                            >
                                                <td className="px-4 py-4 text-[14px] font-[500]">
                                                    {reservation.booking_reference || reservation.id}
                                                </td>
                                                <td className="px-4 py-4 text-[14px] font-[500]">
                                                    {reservation.reservation_date || reservation.created_at?.split('T')[0] || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 text-[14px] font-[500]">
                                                    {reservation.company_name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 text-[14px] font-[500]">
                                                    <div>{reservation.warehouse_name || 'N/A'}</div>
                                                    <div className="text-[12px] text-[#7B7B7A]">
                                                        {reservation.warehouse_location || ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-[14px] font-[500]">
                                                    <div>{reservation.storage_type || "N/A"}</div>
                                                    <div className="text-[12px] text-[#7B7B7A]">
                                                        {reservation.quantity ? `${reservation.quantity} units` : ""}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-[14px] font-[500]">
                                                    {reservation.start_date || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 text-[14px] font-[500]">
                                                    {reservation.end_date || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 text-[14px] font-[500]">
                                                    {reservation.total_amount ? `Rs ${reservation.total_amount}` : 'N/A'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className="px-3 py-1 rounded-[4px] text-[11px] font-[600] inline-block"
                                                        style={{
                                                            color: reservation.paymentStatusColor,
                                                            background: reservation.paymentStatusBg,
                                                        }}
                                                    >
                                                        {reservation.payment_status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className="px-3 py-1 rounded-[4px] text-[11px] font-[700] inline-block"
                                                        style={{
                                                            background: reservation.statusBg,
                                                            color: reservation.statusText,
                                                        }}
                                                    >
                                                        {reservation.status || 'pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex justify-between items-center gap-2 px-6 py-4 border-t border-[#00000033]">
                                <div className="flex items-center">
                                    <span className="mr-3 text-[#00000080] text-[15px]">
                                        Results per page
                                    </span>
                                    <select
                                        className="rounded px-3 py-2 font-[600] text-[16px] bg-[#F4F3F3] border border-[#BEBEBE] w-[90px] h-[40px] focus:outline-none"
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    >
                                        {perPageOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        className="size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        &lt;
                                    </button>

                                    {getPageNumbers().map((num, i) =>
                                        num === "..." ? (
                                            <span key={`dots-${i}`} className="px-2">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={`p-${num}`}
                                                className={`size-[40px] rounded-[4px] text-[16px] font-[600] ${
                                                    currentPage === num
                                                        ? "bg-white border-2 border-[#0955AC] text-[#0955AC]"
                                                        : "bg-[#F4F3F3]"
                                                }`}
                                                onClick={() => goToPage(num)}
                                            >
                                                {num}
                                            </button>
                                        )
                                    )}

                                    <button
                                        className="size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="block xl:hidden space-y-4">
                            {currentReservations.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-8 text-center text-[#7B7B7A]">
                                    No reservations found
                                </div>
                            ) : (
                                currentReservations.map((reservation, idx) => (
                                    <div
                                        key={startIdx + idx}
                                        className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleRowClick(reservation, idx)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="text-[16px] font-[600] text-[#0955AC]">
                                                    {reservation.booking_reference || reservation.id}
                                                </div>
                                                <div className="text-[12px] text-[#7B7B7A]">
                                                    Reserved: {reservation.reservation_date || reservation.created_at?.split('T')[0] || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span
                                                    className="px-2 py-1 rounded-[4px] text-[10px] font-[600] inline-block"
                                                    style={{
                                                        color: reservation.paymentStatusColor,
                                                        background: reservation.paymentStatusBg,
                                                    }}
                                                >
                                                    {reservation.payment_status || 'pending'}
                                                </span>
                                                <span
                                                    className="px-2 py-1 rounded-[4px] text-[10px] font-[700] inline-block"
                                                    style={{
                                                        background: reservation.statusBg,
                                                        color: reservation.statusText,
                                                    }}
                                                >
                                                    {reservation.status || 'pending'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[12px] text-[#7B7B7A]">Client:</span>
                                                <span className="text-[14px] font-[500]">{reservation.company_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[12px] text-[#7B7B7A]">Warehouse:</span>
                                                <span className="text-[14px] font-[500]">{reservation.warehouse_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[12px] text-[#7B7B7A]">Storage Type:</span>
                                                <span className="text-[14px] font-[500]">{reservation.storage_type || "N/A"} {reservation.quantity ? `(${reservation.quantity} units)` : ""}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[12px] text-[#7B7B7A]">Period:</span>
                                                <span className="text-[14px] font-[500]">{reservation.start_date || 'N/A'} - {reservation.end_date || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[12px] text-[#7B7B7A]">Amount:</span>
                                                <span className="text-[14px] font-[500]">{reservation.total_amount ? `Rs ${reservation.total_amount}` : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Mobile Pagination */}
                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex xl:flex-row flex-col justify-between items-center gap-2">
                                    <div className="flex items-center">
                                        <span className="mr-3 text-[#00000080] text-[15px]">
                                            Results per page
                                        </span>
                                        <select
                                            className="rounded px-3 py-2 font-[600] text-[16px] bg-[#F4F3F3] border border-[#BEBEBE] w-[90px] h-[40px] focus:outline-none"
                                            value={itemsPerPage}
                                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        >
                                            {perPageOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            className="size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            &lt;
                                        </button>

                                        {getPageNumbers().map((num, i) =>
                                            num === "..." ? (
                                                <span key={`dots-${i}`} className="px-2">
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={`p-${num}`}
                                                    className={`size-[40px] rounded-[4px] text-[16px] font-[600] ${
                                                        currentPage === num
                                                            ? "bg-white border-2 border-[#0955AC] text-[#0955AC]"
                                                            : "bg-[#F4F3F3]"
                                                    }`}
                                                    onClick={() => goToPage(num)}
                                                >
                                                    {num}
                                                </button>
                                            )
                                        )}

                                        <button
                                            className="size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Detail/Edit Modal */}
            {isPopupOpen && selectedReservation && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-[600px] shadow-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-[20px] font-[700] mb-4">
                            Reservation Details
                        </h2>

                        {/* Reservation Information */}
                        <div className="space-y-3 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Reservation Reference
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.booking_reference || selectedReservation.id}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Reserved Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.reservation_date || selectedReservation.created_at?.split('T')[0] || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Client Name
                                </label>
                                <div className="text-[14px] font-[600]">
                                    {selectedReservation.company_name}
                                </div>
                            </div>

                            {selectedReservation.contact_person && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Contact Person
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.contact_person}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {selectedReservation.contact_email && (
                                    <div>
                                        <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                            Email
                                        </label>
                                        <div className="text-[14px] font-[600]">
                                            {selectedReservation.contact_email}
                                        </div>
                                    </div>
                                )}
                                {selectedReservation.contact_phone && (
                                    <div>
                                        <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                            Phone
                                        </label>
                                        <div className="text-[14px] font-[600]">
                                            {selectedReservation.contact_phone}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Warehouse
                                </label>
                                <div className="text-[14px] font-[600]">
                                    {selectedReservation.warehouse_name}
                                    {selectedReservation.warehouse_location && ` (${selectedReservation.warehouse_location})`}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Storage Type
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.storage_type || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Quantity
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.quantity ? `${selectedReservation.quantity} units` : "N/A"}
                                    </div>
                                </div>
                            </div>

                            {selectedReservation.goods_type && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Goods Type
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.goods_type}
                                    </div>
                                </div>
                            )}

                            {selectedReservation.special_requirements && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Special Requirements
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.special_requirements}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Start Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.start_date}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        End Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.end_date}
                                    </div>
                                </div>
                            </div>

                            {selectedReservation.duration && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Duration
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.duration}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Total Amount
                                </label>
                                <div className="text-[16px] font-[700]">
                                    Rs {selectedReservation.total_amount}
                                </div>
                            </div>

                            {selectedReservation.notes && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Notes
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.notes}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Edit Payment Status */}
                        <div className="mb-4 border-t pt-4">
                            <label className="block text-[14px] font-[500] mb-1">
                                Payment Status
                            </label>
                            <select
                                value={newPaymentStatus}
                                onChange={(e) => setNewPaymentStatus(e.target.value)}
                                className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0"
                            >
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Cancellation Reason */}
                        {!["cancelled", "expired"].includes(
                            selectedReservation.status?.toLowerCase()
                        ) && (
                            <div className="mb-4">
                                <label className="block text-[14px] font-[500] mb-1">
                                    Cancellation Reason (if cancelling)
                                </label>
                                <textarea
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0"
                                    rows="3"
                                    placeholder="Enter reason for cancellation..."
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 flex-wrap">
                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded-[5px] text-[14px] font-[700]"
                            >
                                Close
                            </button>

                            {!["cancelled", "expired"].includes(
                                selectedReservation.status?.toLowerCase()
                            ) && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-red-500 text-white rounded-[5px] text-[14px] font-[700]"
                                >
                                    Cancel
                                </button>
                            )}

                            {selectedReservation.status?.toLowerCase() === "pending" && (
                                <button
                                    onClick={handleConfirm}
                                    className="px-4 py-2 bg-green-600 text-white rounded-[5px] text-[14px] font-[700]"
                                >
                                    Confirm
                                </button>
                            )}

                            {["confirmed", "active"].includes(
                                selectedReservation.status?.toLowerCase()
                            ) && (
                                <button
                                    onClick={handleComplete}
                                    className="px-4 py-2 bg-[#3B8F31] text-white rounded-[5px] text-[14px] font-[700]"
                                >
                                    Mark as Completed
                                </button>
                            )}

                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-[#0955AC] text-white rounded-[5px] text-[14px] font-[700]"
                            >
                                Update Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationContent;
