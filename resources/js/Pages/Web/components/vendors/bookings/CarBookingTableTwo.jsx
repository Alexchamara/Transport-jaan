import React, { useState, useEffect } from "react";
import miniUp from "../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../assets/vendors/dashboard/icons/miniDown.svg";

/** Hide the plate chip if it's empty or just a dash */
const hasRealPlate = (p) => {
  if (p === null || p === undefined) return false;
  const t = String(p).trim();
  return t !== "" && t !== "-" && t !== "—";
};

/**
 * bookings: array of
 *  { id, bookingDate, clientName, carModel, carPlate, plan, startDate, endDate,
 *    payment, paymentStatus, status, paymentStatusColor, paymentStatusBg,
 *    statusBg, statusText }
 */
const CarBookingTableTwo = ({ bookings = [], setBookings, statusColors }) => {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const perPageOptions = [5, 10, 20, 50];

  const totalPages = Math.max(1, Math.ceil(bookings.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentBookings = bookings.slice(startIdx, endIdx);

  // Popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newPayment, setNewPayment] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [newStatus, setNewStatus] = useState("");

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

  const handleRowClick = (booking, index) => {
    setSelectedBooking({ ...booking, index: startIdx + index });
    setNewPayment(booking.payment);
    setNewPaymentStatus(booking.paymentStatus);
    setNewStatus(booking.status);
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = () => {
    if (!selectedBooking) return;
    const updated = [...bookings];
    const paymentStatusColors = {
      Paid: { color: "#3B8F31", bg: "#ACE199" },
      Pending: { color: "#FF6060", bg: "#FF60608C" },
    };

    updated[selectedBooking.index] = {
      ...selectedBooking,
      payment: newPayment,
      paymentStatus: newPaymentStatus,
      paymentStatusColor: paymentStatusColors[newPaymentStatus]?.color || "#7B7B7A",
      paymentStatusBg: paymentStatusColors[newPaymentStatus]?.bg || "#E8E8EF",
      status: newStatus,
      statusBg: statusColors?.[newStatus]?.bg || "#FFCD29",
      statusText: statusColors?.[newStatus]?.text || "#000000",
    };

    setBookings(updated);
    setIsPopupOpen(false);
    setSelectedBooking(null);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="py-10">
      {/* headings */}
      <div className="grid grid-cols-8 bg-[#D8E4F2] h-[42px] items-center rounded-[8px] text-[14px] font-[600] px-10">
        {[
          "Book id",
          "Booking Date",
          "Client Name",
          "Car Model",
          "Plan",
          "Date",
          "Payment",
          "Status",
        ].map((h, i) => (
          <div key={i} className={`flex items-center gap-2 ${i === 6 ? "ml-10" : ""}`}>
            <span>{h}</span>
            <div className="flex flex-col items-center">
              <img src={miniUp} className="w-[6px] h-[4px]" alt="Up" />
              <img src={miniDown} className="w-[6px] h-[4px]" alt="Down" />
            </div>
          </div>
        ))}
      </div>

      {/* rows */}
      {currentBookings.map((booking, idx) => (
        <div
          key={startIdx + idx}
          className={`grid grid-cols-8 ${
            startIdx + idx !== bookings.length - 1 ? "border-b-[1.5px] border-[#00000033]" : ""
          } h-[100px] items-center text-[15px] font-[500] px-10 cursor-pointer hover:bg-gray-100`}
          onClick={() => handleRowClick(booking, idx)}
        >
          <div>{booking.id}</div>
          <div>{booking.bookingDate}</div>
          <div>{booking.clientName}</div>

          {/* Car Model (no blank space if plate is missing) */}
          <div className="flex flex-col">
            {booking.carModel ? <div>{booking.carModel}</div> : null}

            {hasRealPlate(booking.carPlate) && (
              <div
                className={`inline-flex ${booking.carModel ? "mt-1" : ""} w-[87px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] justify-center items-center text-[#00000099] text-[13px]`}
              >
                {booking.carPlate}
              </div>
            )}
          </div>

          <div>{booking.plan}</div>

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

          <div className="flex flex-col items-center">
            <div>{booking.payment}</div>
            <div
              className="w-[80px] h-[20px] border rounded-[4px] text-[11px] text-[#00000099] font-[600] flex justify-center items-center"
              style={{ borderColor: booking.paymentStatusColor, background: booking.paymentStatusBg }}
            >
              {booking.paymentStatus}
            </div>
          </div>

          <div
            className="w-[86px] h-[22px] border rounded-[4px] flex justify-center items-center text-[11px] font-[700]"
            style={{ background: booking.statusBg, borderColor: "#0000004D", color: booking.statusText }}
          >
            {booking.status}
          </div>
        </div>
      ))}

      {/* Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[420px] shadow-lg">
            <h2 className="text-[18px] font-[700] mb-4">Edit Booking</h2>

            <div className="mb-4">
              <label className="block text-[14px] font-[500] mb-1">Payment Amount</label>
              <input
                type="text"
                value={newPayment}
                onChange={(e) => setNewPayment(e.target.value)}
                className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0"
                placeholder="Enter payment amount"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[14px] font-[500] mb-1">Payment Status</label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-[14px] font-[500] mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Returned">Returned</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-[5px] text-[14px] font-[700]"
              >
                Cancel
              </button>
              <button
                onClick={handlePopupSubmit}
                className="px-4 py-2 bg-[#0955AC] text-white rounded-[5px] text-[14px] font-[700]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center gap-2 mt-10">
        <div className="flex items-center">
          <span className="mr-3 text-[#00000080] text-[15px]">Results per page</span>
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
              <span key={`dots-${i}`} className="px-2">...</span>
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

export default CarBookingTableTwo;
