import React, { useState, useEffect } from "react";
import axios from "axios";
import miniUp from "../../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../../assets/vendors/dashboard/icons/miniDown.svg";

/**
 * bookings: array of warehouse booking objects with fields like:
 *  { id, bookingDate, clientName, contactPerson, warehouseName, purpose,
 *    startDate, endDate, totalPrice, paymentStatus, status, 
 *    paymentStatusColor, paymentStatusBg, statusBg, statusText, ... }
 */
const WarehouseBookingTable = ({ bookings = [], setBookings, statusColors }) => {
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const perPageOptions = [5, 10, 20, 50];

    const totalPages = Math.max(1, Math.ceil(bookings.length / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentBookings = bookings.slice(startIdx, endIdx);

    // Modal/Popup state
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailView, setIsDetailView] = useState(false);
    
    // Edit fields
    const [newPaymentStatus, setNewPaymentStatus] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

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

    const handleRowClick = (booking, index) => {
        setSelectedBooking({ ...booking, index: startIdx + index });
        setNewPaymentStatus(booking.paymentStatus);
        setNewStatus(booking.status);
        setRejectionReason("");
        setIsDetailView(true);
        setIsPopupOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedBooking || selectedBooking.status?.toLowerCase() !== "pending") {
            alert("Only pending bookings can be approved");
            return;
        }

        try {
            const response = await axios.patch(
                `/vendors/warehouse/api/bookings/${selectedBooking.id}/approve`
            );

            if (response.data.success) {
                // Update local state
                const updated = [...bookings];
                updated[selectedBooking.index] = {
                    ...selectedBooking,
                    status: "confirmed",
                    statusBg: statusColors?.confirmed?.bg || "#0955AC",
                    statusText: statusColors?.confirmed?.text || "#FFFFFF",
                };
                setBookings(updated);
                setIsPopupOpen(false);
                alert("Booking approved successfully!");
            }
        } catch (error) {
            console.error("Error approving booking:", error);
            alert(error.response?.data?.message || "Failed to approve booking");
        }
    };

    const handleReject = async () => {
        if (!selectedBooking || selectedBooking.status?.toLowerCase() !== "pending") {
            alert("Only pending bookings can be rejected");
            return;
        }

        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        try {
            const response = await axios.patch(
                `/vendors/warehouse/api/bookings/${selectedBooking.id}/reject`,
                { rejection_reason: rejectionReason }
            );

            if (response.data.success) {
                // Update local state
                const updated = [...bookings];
                updated[selectedBooking.index] = {
                    ...selectedBooking,
                    status: "cancelled",
                    statusBg: statusColors?.cancelled?.bg || "#FF6060",
                    statusText: statusColors?.cancelled?.text || "#FFFFFF",
                };
                setBookings(updated);
                setIsPopupOpen(false);
                alert("Booking rejected successfully!");
            }
        } catch (error) {
            console.error("Error rejecting booking:", error);
            alert(error.response?.data?.message || "Failed to reject booking");
        }
    };

    const handleComplete = async () => {
        if (!selectedBooking) return;

        const currentStatus = selectedBooking.status?.toLowerCase();
        if (!["confirmed", "active"].includes(currentStatus)) {
            alert("Only confirmed or active bookings can be completed");
            return;
        }

        try {
            const response = await axios.patch(
                `/vendors/warehouse/api/bookings/${selectedBooking.id}/complete`
            );

            if (response.data.success) {
                // Update local state
                const updated = [...bookings];
                updated[selectedBooking.index] = {
                    ...selectedBooking,
                    status: "completed",
                    paymentStatus: "paid",
                    statusBg: statusColors?.completed?.bg || "#3B8F31",
                    statusText: statusColors?.completed?.text || "#FFCD29",
                };
                setBookings(updated);
                setIsPopupOpen(false);
                alert("Booking marked as completed!");
            }
        } catch (error) {
            console.error("Error completing booking:", error);
            alert(error.response?.data?.message || "Failed to complete booking");
        }
    };

    const handleUpdate = async () => {
        if (!selectedBooking) return;

        try {
            const response = await axios.put(
                `/vendors/warehouse/api/bookings/${selectedBooking.id}`,
                { payment_status: newPaymentStatus }
            );

            if (response.data.success) {
                const paymentStatusColors = {
                    paid: { color: "#3B8F31", bg: "#ACE199" },
                    pending: { color: "#FF6060", bg: "#FF60608C" },
                    failed: { color: "#FF0000", bg: "#FF00004D" },
                };

                // Update local state
                const updated = [...bookings];
                updated[selectedBooking.index] = {
                    ...selectedBooking,
                    paymentStatus: newPaymentStatus,
                    paymentStatusColor:
                        paymentStatusColors[newPaymentStatus?.toLowerCase()]?.color ||
                        "#7B7B7A",
                    paymentStatusBg:
                        paymentStatusColors[newPaymentStatus?.toLowerCase()]?.bg ||
                        "#E8E8EF",
                };
                setBookings(updated);
                setIsPopupOpen(false);
                alert("Booking updated successfully!");
            }
        } catch (error) {
            console.error("Error updating booking:", error);
            alert(error.response?.data?.message || "Failed to update booking");
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
                    "Booking ID",
                    "Booking Date",
                    "Client Name",
                    "Warehouse",
                    "Purpose",
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
            {currentBookings.length === 0 ? (
                <div className="flex justify-center items-center py-20 text-[#7B7B7A]">
                    No bookings found
                </div>
            ) : (
                currentBookings.map((booking, idx) => (
                    <div
                        key={startIdx + idx}
                        className={`grid grid-cols-8 ${
                            startIdx + idx !== bookings.length - 1
                                ? "border-b-[1.5px] border-[#00000033]"
                                : ""
                        } h-[100px] items-center text-[15px] font-[500] px-10 cursor-pointer hover:bg-gray-100`}
                        onClick={() => handleRowClick(booking, idx)}
                    >
                        {/* Booking ID */}
                        <div className="truncate">{booking.id}</div>

                        {/* Booking Date */}
                        <div>{booking.bookingDate}</div>

                        {/* Client Name */}
                        <div className="truncate">{booking.clientName}</div>

                        {/* Warehouse */}
                        <div className="flex flex-col">
                            <div className="truncate">{booking.warehouseName}</div>
                            <div className="text-[12px] text-[#7B7B7A] truncate">
                                {booking.warehouseUnit}
                            </div>
                        </div>

                        {/* Purpose/Goods Type */}
                        <div className="truncate">{booking.purpose}</div>

                        {/* Date Range */}
                        <div className="text-[14px] font-[500] text-[#939392]">
                            <div className="flex gap-2 items-center">
                                <span>Start</span>
                                <div className="w-[92px] h-[22px] bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[11px] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                    {booking.startDate}
                                </div>
                            </div>
                            <div className="flex gap-3 items-center mt-1">
                                <span>End</span>
                                <div className="w-[92px] h-[22px] bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[11px] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                    {booking.endDate}
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="flex flex-col items-center">
                            <div className="truncate">{booking.totalPrice}</div>
                            <div
                                className="w-[80px] h-[20px] border rounded-[4px] text-[11px] text-[#00000099] font-[600] flex justify-center items-center"
                                style={{
                                    borderColor: booking.paymentStatusColor,
                                    background: booking.paymentStatusBg,
                                }}
                            >
                                {booking.paymentStatus}
                            </div>
                        </div>

                        {/* Status */}
                        <div
                            className="w-[86px] h-[22px] border rounded-[4px] flex justify-center items-center text-[11px] font-[700]"
                            style={{
                                background: booking.statusBg,
                                borderColor: "#0000004D",
                                color: booking.statusText,
                            }}
                        >
                            {booking.status}
                        </div>
                    </div>
                ))
            )}

            {/* Detail/Edit Modal */}
            {isPopupOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-[600px] shadow-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-[20px] font-[700] mb-4">
                            Booking Details
                        </h2>

                        {/* Booking Information */}
                        <div className="space-y-3 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Booking Reference
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.id}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Booking Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.bookingDate}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Client Name
                                </label>
                                <div className="text-[14px] font-[600]">
                                    {selectedBooking.clientName}
                                </div>
                            </div>

                            {selectedBooking.contactPerson && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Contact Person
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.contactPerson}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {selectedBooking.email && (
                                    <div>
                                        <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                            Email
                                        </label>
                                        <div className="text-[14px] font-[600]">
                                            {selectedBooking.email}
                                        </div>
                                    </div>
                                )}
                                {selectedBooking.phone && (
                                    <div>
                                        <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                            Phone
                                        </label>
                                        <div className="text-[14px] font-[600]">
                                            {selectedBooking.phone}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Warehouse
                                </label>
                                <div className="text-[14px] font-[600]">
                                    {selectedBooking.warehouseName} (
                                    {selectedBooking.warehouseUnit})
                                </div>
                            </div>

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Purpose / Goods Type
                                </label>
                                <div className="text-[14px] font-[600]">
                                    {selectedBooking.purpose}
                                </div>
                            </div>

                            {selectedBooking.specialRequirements && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Special Requirements
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.specialRequirements}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Start Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.startDate}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        End Date
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.endDate}
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.durationValue && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Duration
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.durationValue}{" "}
                                        {selectedBooking.durationUnit}
                                    </div>
                                </div>
                            )}

                            {selectedBooking.quantity && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Required Space
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.quantity}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                    Total Amount
                                </label>
                                <div className="text-[16px] font-[700]">
                                    {selectedBooking.totalPrice}
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <div>
                                    <label className="text-[12px] font-[500] text-[#7B7B7A]">
                                        Notes
                                    </label>
                                    <div className="text-[14px] font-[600]">
                                        {selectedBooking.notes}
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

                        {/* Rejection Reason (only for pending) */}
                        {selectedBooking.status?.toLowerCase() === "pending" && (
                            <div className="mb-4">
                                <label className="block text-[14px] font-[500] mb-1">
                                    Rejection Reason (if rejecting)
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0"
                                    rows="3"
                                    placeholder="Enter reason for rejection..."
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

                            {selectedBooking.status?.toLowerCase() === "pending" && (
                                <>
                                    <button
                                        onClick={handleReject}
                                        className="px-4 py-2 bg-red-500 text-white rounded-[5px] text-[14px] font-[700]"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="px-4 py-2 bg-green-600 text-white rounded-[5px] text-[14px] font-[700]"
                                    >
                                        Approve
                                    </button>
                                </>
                            )}

                            {["confirmed", "active"].includes(
                                selectedBooking.status?.toLowerCase()
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

export default WarehouseBookingTable;
