import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../../../../config/api";
import miniUp from "../../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../../assets/vendors/dashboard/icons/miniDown.svg";

/**
 * reservations: array of warehouse reservation objects with fields like:
 *  { id, reservationDate, clientName, contactPerson, warehouseName, unitType,
 *    unitSize, startDate, endDate, totalPrice, paymentStatus, status, 
 *    paymentStatusColor, paymentStatusBg, statusBg, statusText, ... }
 */
const WarehouseReservationTable = ({ reservations = [], setReservations, statusColors }) => {
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const perPageOptions = [5, 10, 20, 50];

    const totalPages = Math.max(1, Math.ceil(reservations.length / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentReservations = reservations.slice(startIdx, endIdx);

    // Modal/Popup state
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isDetailView, setIsDetailView] = useState(false);
    
    // Edit fields
    const [newPaymentStatus, setNewPaymentStatus] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [cancellationReason, setCancellationReason] = useState("");

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
            pages.push(
                1,
                "...",
                currentPage - 1,
                currentPage,
                currentPage + 1,
                "...",
                totalPages
            );
        }
        return pages;
    };

    const handleRowClick = (reservation, index) => {
        setSelectedReservation({ ...reservation, index: startIdx + index });
        setNewPaymentStatus(reservation.paymentStatus);
        setNewStatus(reservation.status);
        setCancellationReason("");
        setIsDetailView(true);
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
                // Update local state
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
                // Update local state
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
                // Update local state
                const updated = [...reservations];
                updated[selectedReservation.index] = {
                    ...selectedReservation,
                    status: "completed",
                    paymentStatus: "paid",
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

                // Update local state
                const updated = [...reservations];
                updated[selectedReservation.index] = {
                    ...selectedReservation,
                    paymentStatus: newPaymentStatus,
                    paymentStatusColor:
                        paymentStatusColors[newPaymentStatus?.toLowerCase()]?.color ||
                        "#7B7B7A",
                    paymentStatusBg:
                        paymentStatusColors[newPaymentStatus?.toLowerCase()]?.bg ||
                        "#E8E8EF",
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
        <div className="py-10">
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
                            <img
                                src={miniDown}
                                className="w-[6px] h-[4px]"
                                alt="Down"
                            />
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
                        <div className="truncate">{reservation.id}</div>

                        {/* Reserved Date */}
                        <div>{reservation.reservationDate}</div>

                        {/* Client Name */}
                        <div className="truncate">{reservation.clientName}</div>

                        {/* Warehouse */}
                        <div className="flex flex-col">
                            <div className="truncate">{reservation.warehouseName}</div>
                            <div className="text-[12px] text-[#7B7B7A] truncate">
                                {reservation.warehouseUnit}
                            </div>
                        </div>

                        {/* Unit Details (Type & Size) */}
                        <div className="flex flex-col">
                            <div className="text-[13px] font-[600] truncate">
                                {reservation.unitType || "N/A"}
                            </div>
                            <div className="text-[11px] text-[#7B7B7A] truncate">
                                {reservation.unitSize || "N/A"}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="text-[14px] font-[500] text-[#939392]">
                            <div className="flex gap-2 items-center">
                                <span>Start</span>
                                <div className="w-[92px] h-[22px] bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[11px] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                    {reservation.startDate}
                                </div>
                            </div>
                            <div className="flex gap-3 items-center mt-1">
                                <span>End</span>
                                <div className="w-[92px] h-[22px] bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[11px] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                    {reservation.endDate}
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="flex flex-col items-center">
                            <div className="truncate">{reservation.totalPrice}</div>
                            <div
                                className="w-[80px] h-[20px] border rounded-[4px] text-[11px] text-[#00000099] font-[600] flex justify-center items-center"
                                style={{
                                    borderColor: reservation.paymentStatusColor,
                                    background: reservation.paymentStatusBg,
                                }}
                            >
                                {reservation.paymentStatus}
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
                            {reservation.status}
                        </div>
                    </div>
                ))
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
                                        {selectedReservation.id}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Reserved Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.reservationDate}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Client Name
                                </label>
                                <div className="text-[14px] font-[600]">
                                    {selectedReservation.clientName}
                                </div>
                            </div>

                            {selectedReservation.contactPerson && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Contact Person
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.contactPerson}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {selectedReservation.email && (
                                    <div>
                                        <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                            Email
                                        </label>
                                        <div className="text-[14px] font-[600]">
                                            {selectedReservation.email}
                                        </div>
                                    </div>
                                )}
                                {selectedReservation.phone && (
                                    <div>
                                        <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                            Phone
                                        </label>
                                        <div className="text-[14px] font-[600]">
                                            {selectedReservation.phone}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Warehouse
                                </label>
                                <div className="text-[14px] font-[600]">
                                    {selectedReservation.warehouseName} (
                                    {selectedReservation.warehouseUnit})
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Unit Type
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.unitType || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Unit Size
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.unitSize || "N/A"}
                                    </div>
                                </div>
                            </div>

                            {selectedReservation.purpose && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Purpose / Goods Type
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.purpose}
                                    </div>
                                </div>
                            )}

                            {selectedReservation.specialRequirements && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Special Requirements
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.specialRequirements}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Start Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.startDate}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        End Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.endDate}
                                    </div>
                                </div>
                            </div>

                            {selectedReservation.durationValue && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Duration
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.durationValue}{" "}
                                        {selectedReservation.durationUnit}
                                    </div>
                                </div>
                            )}

                            {selectedReservation.quantity && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Required Space
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedReservation.quantity}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Total Amount
                                </label>
                                <div className="text-[16px] font-[700]">
                                    {selectedReservation.totalPrice}
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
    );
};

export default WarehouseReservationTable;
