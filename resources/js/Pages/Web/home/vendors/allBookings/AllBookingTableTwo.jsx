import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import miniUp from "../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../assets/vendors/dashboard/icons/miniDown.svg";
import { Trash2 } from "lucide-react";
import VendorCancellationModal from "../../../components/vendors/bookings/VendorCancellationModal";

const DUMMY_BOOKINGS = [
  {
    id: "BK-0001",
    bookingDate: "2025-01-10",
    clientName: "Ahmed Hassan",
    carModel: "Toyota Corolla",
    carPlate: "ABC-1234",
    plan: "Daily",
    startDate: "2025-01-12",
    endDate: "2025-01-15",
    payment: "PKR 12,000",
    paymentStatus: "Paid",
    paymentStatusColor: "#3B8F31",
    paymentStatusBg: "#ACE199",
    status: "Completed",
    statusBg: "#ACE199",
    statusText: "#3B8F31",
  },
  {
    id: "BK-0002",
    bookingDate: "2025-01-18",
    clientName: "Sara Khan",
    carModel: "Honda Civic",
    carPlate: "XYZ-5678",
    plan: "Weekly",
    startDate: "2025-01-20",
    endDate: "2025-01-27",
    payment: "PKR 28,000",
    paymentStatus: "Pending",
    paymentStatusColor: "#FF6060",
    paymentStatusBg: "#FF60608C",
    status: "Confirmed",
    statusBg: "#D8E4F2",
    statusText: "#0955AC",
  },
  {
    id: "BK-0003",
    bookingDate: "2025-02-02",
    clientName: "Ali Raza",
    carModel: "Suzuki Swift",
    carPlate: "LMN-9012",
    plan: "Monthly",
    startDate: "2025-02-05",
    endDate: "2025-03-05",
    payment: "PKR 75,000",
    paymentStatus: "Paid",
    paymentStatusColor: "#3B8F31",
    paymentStatusBg: "#ACE199",
    status: "Active",
    statusBg: "#FFF3CD",
    statusText: "#856404",
  },
  {
    id: "BK-0004",
    bookingDate: "2025-02-14",
    clientName: "Fatima Malik",
    carModel: "Hyundai Tucson",
    carPlate: "PQR-3456",
    plan: "Daily",
    startDate: "2025-02-16",
    endDate: "2025-02-18",
    payment: "PKR 18,000",
    paymentStatus: "Pending",
    paymentStatusColor: "#FF6060",
    paymentStatusBg: "#FF60608C",
    status: "Pending",
    statusBg: "#FFF3CD",
    statusText: "#856404",
  },
  {
    id: "BK-0005",
    bookingDate: "2025-03-01",
    clientName: "Usman Tariq",
    carModel: "KIA Sportage",
    carPlate: "-",
    plan: "Weekly",
    startDate: "2025-03-03",
    endDate: "2025-03-10",
    payment: "PKR 35,000",
    paymentStatus: "Paid",
    paymentStatusColor: "#3B8F31",
    paymentStatusBg: "#ACE199",
    status: "Cancelled",
    statusBg: "#FFE0E0",
    statusText: "#CC0000",
  },
];

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
const AllBookingTableTwo = ({ bookings: bookingsProp = [], setBookings, statusColors }) => {
  const { auth } = usePage().props;
  const user = auth?.user;
  const isVerified = user?.status === "verified" || user?.status === "Verified";
  const bookings = !isVerified ? DUMMY_BOOKINGS : bookingsProp;

  console.log("Rendering AllBookingTableTwo with bookings:", bookings);

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

  // Cancellation Modal
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

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
    const sourceIndex = Number.isInteger(booking?.__sourceIndex)
      ? booking.__sourceIndex
      : startIdx + index;

    setSelectedBooking({ ...booking, index: sourceIndex });
    setNewPayment(booking.payment);
    setNewPaymentStatus(booking.paymentStatus);
    setNewStatus(booking.status);
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = async () => {
    if (!selectedBooking) return;
    
    try {
      // Map UI status to backend status
      const backendStatus = newStatus.toLowerCase();
      
      // Call backend API to update booking
      const response = await axios.patch(`/vendors/api/bookings/${selectedBooking.id}`, {
        status: backendStatus,
        payment_status: newPaymentStatus.toLowerCase(),
        total_amount: parseFloat(newPayment)
      });
      
      if (response.data.success) {
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
          statusBg: statusColors?.[newStatus]?.bg || "#FF9800",
          statusText: statusColors?.[newStatus]?.text || "#FFFFFF",
        };

        setBookings(updated);
        setIsPopupOpen(false);
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update booking. Please try again.';
      alert(errorMessage);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="py-6 sm:py-10">
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[900px] lg:min-w-[1200px]">
          {/* headings */}
          <div className="grid bg-[#D8E4F2] h-[42px] items-center rounded-[8px] text-[12px] sm:text-[14px] font-[600] px-4 sm:px-10" style={{gridTemplateColumns:'100px 1.2fr 1.4fr 1.4fr 2fr 1.2fr 1.2fr'}}>
            {[
              "Bookd id",
              "Booking Date",
              "Client Name",
              "Service",
              "Date",
              "Payment",
              "Status",
            ].map((h, i) => (
              <div key={i} className={`flex items-center gap-2 ${i === 6 || i === 7 ? "sm:ml-10" : ""}`}>
                <span>{h}</span>
                <div className="flex flex-col items-center">
                  <img src={miniUp} className="w-[6px] h-[4px]" alt="Up" />
                  <img src={miniDown} className="w-[6px] h-[4px]" alt="Down" />
                </div>
              </div>
            ))}
          </div>

      {/* rows */}
      {currentBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-[64px] bg-[#F3F3F3] rounded-full flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BEBEBE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3 className="text-[16px] font-[600] text-[#3C3C3A] mb-1">No records found</h3>
          <p className="text-[13px] text-[#7B7B7A]">There are no bookings matching your current filters.</p>
        </div>
      ) : currentBookings.map((booking, idx) => (
        <div
          key={startIdx + idx}
          className={`grid ${
            startIdx + idx !== bookings.length - 1 ? "border-b-[1.5px] border-[#00000033]" : ""
          } h-[100px] items-center text-[13px] sm:text-[15px] font-[500] px-4 sm:px-10 hover:bg-gray-100`}
          style={{gridTemplateColumns:'100px 1.2fr 1.4fr 1.4fr 2fr 1.2fr 1.2fr'}}
        >
          <div className="cursor-pointer" onClick={() => handleRowClick(booking, idx)}>{booking.id}</div>
          <div className="cursor-pointer" onClick={() => handleRowClick(booking, idx)}>{booking.booking_date}</div>
          <div className="cursor-pointer" onClick={() => handleRowClick(booking, idx)}>{booking.customer_name}</div>
          <div className="cursor-pointer" onClick={() => handleRowClick(booking, idx)}>{booking.service_name}</div>

          {/* <div className="cursor-pointer" onClick={() => handleRowClick(booking, idx)}>{booking.plan}</div> */}

          <div className="text-[12px] sm:text-[14px] font-[500] text-[#939392] cursor-pointer" onClick={() => handleRowClick(booking, idx)}>
            <div className="flex gap-2 items-center">
              <span>Start</span>
              <div className="w-[80px] sm:w-[105px] h-[22px] bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[10px] sm:text-[11px] text-[#00000099] flex justify-center items-center rounded-[4px]">
                {booking.start_date}
              </div>
            </div>
            <div className="flex gap-3 items-center mt-1">
              <span>End</span>
              <div className="w-[80px] sm:w-[105px] h-[22px] bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[10px] sm:text-[11px] text-[#00000099] flex justify-center items-center rounded-[4px]">
                {booking.end_date}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start cursor-pointer" onClick={() => handleRowClick(booking, idx)}>
            <div
              className="w-[80px] sm:w-[100px] h-[24px] border rounded-[4px] text-[10px] sm:text-[12px] text-[#00000099] font-[600] flex justify-center items-center"
              style={{ borderColor: booking.paymentStatusColor, background: booking.paymentStatusBg }}
            >
              {booking.payment_status}
            </div>
          </div>

          <div
            className="w-[80px] sm:w-[100px] h-[24px] border rounded-[4px] flex justify-center items-center text-[10px] sm:text-[12px] font-[700] cursor-pointer"
            style={{ background: booking.statusBg, borderColor: "#0000004D", color: booking.statusText }}
            onClick={() => handleRowClick(booking, idx)}
          >
            {booking.status}
          </div>
        </div>
      ))}
        </div>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="lg:hidden space-y-4">
        {currentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-[64px] bg-[#F3F3F3] rounded-full flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BEBEBE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3 className="text-[16px] font-[600] text-[#3C3C3A] mb-1">No records found</h3>
            <p className="text-[13px] text-[#7B7B7A]">There are no bookings matching your current filters.</p>
          </div>
        ) : currentBookings.map((booking, idx) => (
          <div
            key={startIdx + idx}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            style={{ boxShadow: "2px 2px 8px #0000001A" }}
            onClick={() => handleRowClick(booking, idx)}
          >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-[10px] text-[#7B7B7A] font-[500]">Book ID</div>
                <div className="text-[16px] font-[700] text-[#0955AC]">{booking.id}</div>
              </div>
              <div
                className="px-3 py-1 rounded-[4px] text-[11px] font-[700]"
                style={{ background: booking.statusBg, color: booking.statusText }}
              >
                {booking.status}
              </div>
            </div>

            {/* Client & Date Info */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-[12px] text-[#7B7B7A]">Client:</span>
                <span className="text-[13px] font-[600]">{booking.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-[#7B7B7A]">Booking Date:</span>
                <span className="text-[13px] font-[500]">{booking.bookingDate}</span>
              </div>
            </div>

            {/* Car Info */}
            <div className="bg-[#F9FAFB] rounded-md p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] text-[#7B7B7A]">Car Model:</span>
                <span className="text-[13px] font-[600]">{booking.carModel}</span>
              </div>
              {hasRealPlate(booking.carPlate) && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] text-[#7B7B7A]">Plate:</span>
                  <div className="px-2 py-1 rounded-[4px] bg-[#D9D9D957] border border-[#0000004D] text-[11px] text-[#00000099]">
                    {booking.carPlate}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#7B7B7A]">Plan:</span>
                <span className="text-[13px] font-[600]">{booking.plan}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[11px] text-[#7B7B7A] mb-1">Start Date</div>
                <div className="px-2 py-1 bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[11px] text-[#00000099] rounded-[4px] text-center">
                  {booking.startDate}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#7B7B7A] mb-1">End Date</div>
                <div className="px-2 py-1 bg-[#D9D9D957] border-[0.5px] border-[#0000004D] text-[11px] text-[#00000099] rounded-[4px] text-center">
                  {booking.endDate}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <div>
                <div className="text-[11px] text-[#7B7B7A]">Payment</div>
                <div className="text-[16px] font-[700]">{booking.payment}</div>
              </div>
              <div
                className="px-3 py-1 border rounded-[4px] text-[11px] font-[600]"
                style={{ borderColor: booking.paymentStatusColor, background: booking.paymentStatusBg, color: booking.paymentStatusColor }}
              >
                {booking.paymentStatus}
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleRowClick(booking, idx)}
                className="flex-1 py-2 px-3 bg-[#0955AC] text-white rounded-lg text-[13px] font-[600] hover:bg-[#0744a0] transition-colors"
              >
                View Details
              </button>
              {booking.status !== "Cancelled" && (
                <button
                  onClick={() => {
                    setBookingToCancel(booking);
                    setShowCancellationModal(true);
                  }}
                  className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg text-[13px] font-[600] hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[420px] shadow-lg">
            <h2 className="text-[16px] sm:text-[18px] font-[700] mb-4">Edit Booking</h2>

            {/* Show cancellation reason if booking is cancelled */}
            {selectedBooking?.status === 'Cancelled' && selectedBooking?.cancellationReason && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[5px]">
                <div className="text-[12px] font-[600] text-red-700 mb-1">BOOKING CANCELLED</div>
                <div className="text-[13px] text-red-600">
                  <span className="font-[500]">Reason:</span> {selectedBooking.cancellationReason}
                </div>
                {selectedBooking.cancelledAt && (
                  <div className="text-[11px] text-red-500 mt-1">
                    Cancelled at: {selectedBooking.cancelledAt}
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[13px] sm:text-[14px] font-[500] mb-1">Payment Amount</label>
              <input
                type="text"
                value={newPayment}
                onChange={(e) => setNewPayment(e.target.value)}
                disabled={selectedBooking?.status === 'Cancelled'}
                className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter payment amount"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[13px] sm:text-[14px] font-[500] mb-1">Payment Status</label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                disabled={selectedBooking?.status === 'Cancelled'}
                className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-[13px] sm:text-[14px] font-[500] mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={selectedBooking?.status === 'Cancelled'}
                className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 focus:ring-0 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-3 sm:px-4 py-2 bg-gray-200 rounded-[5px] text-[13px] sm:text-[14px] font-[700]"
              >
                {selectedBooking?.status === 'Cancelled' ? 'Close' : 'Cancel'}
              </button>
              {selectedBooking?.status !== 'Cancelled' && (
                <button
                  onClick={handlePopupSubmit}
                  className="px-3 sm:px-4 py-2 bg-[#0955AC] text-white rounded-[5px] text-[13px] sm:text-[14px] font-[700]"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-2 mt-6 sm:mt-10">
        <div className="flex items-center">
          <span className="mr-2 sm:mr-3 text-[#00000080] text-[13px] sm:text-[15px]">Results per page</span>
          <select
            className="rounded px-2 sm:px-3 py-2 font-[600] text-[14px] sm:text-[16px] bg-[#F4F3F3] border border-[#BEBEBE] w-[70px] sm:w-[90px] h-[36px] sm:h-[40px] focus:outline-none"
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

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full">
          <button
            className="size-[36px] sm:size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50 flex-shrink-0"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {getPageNumbers().map((num, i) =>
            num === "..." ? (
              <span key={`dots-${i}`} className="px-1 sm:px-2">...</span>
            ) : (
              <button
                key={`p-${num}`}
                className={`size-[36px] sm:size-[40px] rounded-[4px] text-[14px] sm:text-[16px] font-[600] flex-shrink-0 ${
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
            className="size-[36px] sm:size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50 flex-shrink-0"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Cancellation Modal */}
      <VendorCancellationModal
        booking={bookingToCancel}
        isOpen={showCancellationModal}
        onClose={() => {
          setShowCancellationModal(false);
          setBookingToCancel(null);
        }}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

export default AllBookingTableTwo;
