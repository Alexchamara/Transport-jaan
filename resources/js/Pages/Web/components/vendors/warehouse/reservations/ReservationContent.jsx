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

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(reservations.length / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentReservations = reservations.slice(startIdx, endIdx);

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
            const response = await axios.patch(
                `${API_BASE_URL}vendors/warehouse/api/reservations/${selectedReservation.id}/confirm`
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
            const response = await axios.patch(
                `${API_BASE_URL}vendors/warehouse/api/reservations/${selectedReservation.id}/cancel`,
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
            const response = await axios.patch(
                `${API_BASE_URL}vendors/warehouse/api/reservations/${selectedReservation.id}/complete`
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
            const response = await axios.put(
                `${API_BASE_URL}vendors/warehouse/api/reservations/${selectedReservation.id}`,
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

            {/* Table Display */}
            <div className="mt-10">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-[16px] text-[#7B7B7A]">
                            Loading reservations...
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-6 shadow">
                        {/* Table headings */}
                        <div className="grid grid-cols-8 bg-[#D8E4F2] h-[42px] items-center rounded-[8px] text-[14px] font-[600] px-10">
                            {[
                                "Reservation ID",
                                "Reserved Date",
                                "Client Name",
                                "Warehouse",
                                "Unit Details",
                                "Date Range",
                                "Payment",
                                "Status",
                            ].map((h, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-2 ${
                                        i === 6 ? "ml-10" : ""
                                    }`}
                                >
                                    <span>{h}</span>
                                    <div className="flex flex-col items-center">
                                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Up" />
                                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Down" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table rows */}
                        {currentReservations.length === 0 ? (
                            <div className="flex justify-center items-center py-20 text-[#7B7B7A]">
                                No reservations found
                            </div>
                        ) : (
                            currentReservations.map((reservation, idx) => (
                                <div
                                    key={startIdx + idx}
                                    className={`grid grid-cols-8 ${
                                        startIdx + idx !== reservations.length - 1
                                            ? "border-b-[1.5px] border-[#00000033]"
                                            : ""
                                    } h-[100px] items-center text-[15px] font-[500] px-10 cursor-pointer hover:bg-gray-100`}
                                    onClick={() => handleRowClick(reservation, idx)}
                                >
                                    {/* Reservation ID */}
                                    <div className="truncate">{reservation.booking_reference || reservation.id}</div>

                                    {/* Reserved Date */}
                                    <div>{reservation.reservation_date || reservation.created_at?.split('T')[0] || 'N/A'}</div>

                                    {/* Client Name */}
                                    <div className="truncate">{reservation.company_name || 'N/A'}</div>

                                    {/* Warehouse */}
                                    <div className="flex flex-col">
                                        <div className="truncate">{reservation.warehouse_name || 'N/A'}</div>
                                        <div className="text-[12px] text-[#7B7B7A] truncate">
                                            {reservation.warehouse_location || ''}
                                        </div>
                                    </div>

                                    {/* Unit Details (Type & Size) */}
                                    <div className="flex flex-col">
                                        <div className="text-[13px] font-[600] truncate">
                                            {reservation.storage_type || "N/A"}
                                        </div>
                                        <div className="text-[11px] text-[#7B7B7A] truncate">
                                            {reservation.quantity ? `${reservation.quantity} units` : "N/A"}
                                        </div>
                                    </div>

                                    {/* Date Range */}
                                    <div className="text-[14px] font-[500] text-[#939392]">
                                        <div className="flex gap-2 items-center">
                                            <span>Start</span>
                                            <div className="w-[92px] h-[22px] bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[11px] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                                {reservation.start_date || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-center mt-1">
                                            <span>End</span>
                                            <div className="w-[92px] h-[22px] bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[11px] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                                {reservation.end_date || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div className="flex flex-col items-center">
                                        <div className="truncate">{reservation.total_amount ? `Rs ${reservation.total_amount}` : 'N/A'}</div>
                                        <div
                                            className="w-[80px] h-[20px] border rounded-[4px] text-[11px] text-[#00000099] font-[600] flex justify-center items-center"
                                            style={{
                                                borderColor: reservation.paymentStatusColor,
                                                background: reservation.paymentStatusBg,
                                            }}
                                        >
                                            {reservation.payment_status || 'pending'}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div
                                        className="w-[86px] h-[22px] border rounded-[4px] flex justify-center items-center text-[11px] font-[700]"
                                        style={{
                                            background: reservation.statusBg,
                                            borderColor: "#0000004D",
                                            color: reservation.statusText,
                                        }}
                                    >
                                        {reservation.status || 'pending'}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination */}
                        <div className="flex justify-between items-center gap-2 mt-10">
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
                )}
            </div>

            {/* Raw Data Display */}
            {!loading && reservations.length > 0 && (
                <div className="mt-10 bg-white rounded-lg p-6 shadow">
                    <h2 className="text-[24px] font-[700] mb-4">Raw Data</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px] text-sm">
                        {JSON.stringify(reservations, null, 2)}
                    </pre>
                    <div className="mt-4 text-[14px] text-[#7B7B7A]">
                        Total Records: {reservations.length}
                    </div>
                </div>
            )}

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
