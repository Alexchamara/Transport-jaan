import React, { useState } from "react";
import miniUp from "../../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../../assets/vendors/dashboard/icons/miniDown.svg";

const CarBookingTableTwo = ({ bookings, setBookings, statusColors }) => {

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const perPageOptions = [5, 10, 20, 50];
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentBookings = bookings.slice(startIdx, endIdx);

    // State for popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [newPayment, setNewPayment] = useState('');
    const [newPaymentStatus, setNewPaymentStatus] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
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
        if (selectedBooking) {
            const updatedBookings = [...bookings];
            const paymentStatusColors = {
                Paid: { color: "#3B8F314D", bg: "#ACE19957" },
                Pending: { color: "#FF6060", bg: "#FF60608C" },
            };

            updatedBookings[selectedBooking.index] = {
                ...selectedBooking,
                payment: newPayment,
                paymentStatus: newPaymentStatus,
                paymentStatusColor: paymentStatusColors[newPaymentStatus]?.color || "#3B8F314D",
                paymentStatusBg: paymentStatusColors[newPaymentStatus]?.bg || "#ACE19957",
                status: newStatus,
                statusBg: statusColors[newStatus]?.bg || "#FFCD29", // Use statusColors prop
                statusText: statusColors[newStatus]?.text || "#000000", // Use statusColors prop
            };

            setBookings(updatedBookings);
            setIsPopupOpen(false);
            setSelectedBooking(null);
        }
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div className="py-10">
            {/* table headings */}
            <div className="grid grid-cols-8 bg-[#D8E4F2] h-[42px] justify-center items-center rounded-[8px] text-[14px] font-[600] px-10">
                <div className="flex flex-row gap-2 items-center">
                    <h1>Book id</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Booking Date</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Client Name</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Car Model</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Plan</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Date</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center ml-10">
                    <h1>Payment</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Status</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                        <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                    </div>
                </div>
            </div>

            {/* table rows */}
            {currentBookings.map((booking, idx) => (
                <div
                    key={startIdx + idx}
                    className={`grid grid-cols-8 ${(startIdx + idx !== bookings.length - 1) ? 'border-b-[1.5px] border-[#00000033]' : ''} h-[100px] justify-center items-center text-[15px] font-[500] px-10 cursor-pointer hover:bg-gray-100`}
                    onClick={() => handleRowClick(booking, idx)}
                >
                    <div>{booking.id}</div>
                    <div>{booking.bookingDate}</div>
                    <div>{booking.clientName}</div>
                    <div>
                        <h1>{booking.carModel}</h1>
                        <div className="w-[87px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                            {booking.carPlate}
                        </div>
                    </div>
                    <div>{booking.plan}</div>
                    <div className="text-[14px] font-[500] text-[#939392]">
                        <div className="flex flex-row gap-2 justify-start items-center">
                            <h1>Start</h1>
                            <div className="w-[72px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                {booking.startDate}
                            </div>
                        </div>
                        <div className="flex flex-row gap-4 justify-start items-center">
                            <h1>End</h1>
                            <div className="w-[72px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                {booking.endDate}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <h1>{booking.payment}</h1>
                        <div
                            className="w-[66px] h-[19px] border-[0.5px] rounded-[4px] text-[10px] text-[#00000099] font-[500] flex justify-center items-center"
                            style={{ borderColor: booking.paymentStatusColor, background: booking.paymentStatusBg }}
                        >
                            {booking.paymentStatus}
                        </div>
                    </div>
                    <div
                        className="w-[72px] h-[19px] border-[1px] rounded-[4px] flex justify-center items-center text-[10px] font-[700]"
                        style={{ background: booking.statusBg, borderColor: '#0000004D', color: booking.statusText }}
                    >
                        {booking.status}
                    </div>
                </div>
            ))}

            {/* Popup Modal */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 poppins">
                    <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
                        <h2 className="text-[18px] font-[700] mb-4">Edit Booking</h2>
                        <div className="mb-4">
                            <label className="block text-[14px] font-[500] mb-1">Payment Amount</label>
                            <input
                                type="text"
                                value={newPayment}
                                onChange={(e) => setNewPayment(e.target.value)}
                                className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                placeholder="Enter payment amount"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-[14px] font-[500] mb-1">Payment Status</label>
                            <select
                                value={newPaymentStatus}
                                onChange={(e) => setNewPaymentStatus(e.target.value)}
                                className="w-full p-2 border-[1px] focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                            >
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-[14px] font-[500] mb-1">Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                            >
                                <option value="Ongoing">Ongoing</option>
                                <option value="Returned">Returned</option>
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

            {/* Pagination Controls and Results per page inline */}
            <div className="flex justify-between items-center gap-2 mt-20">
                <div className="flex items-center">
                    <span className="mr-3 text-[#00000080] text-[15px]">Results per page</span>
                    <select
                        className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none"
                        value={itemsPerPage}
                        onChange={e => setItemsPerPage(Number(e.target.value))}
                    >
                        {perPageOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <span className="text-lg">&#60;</span>
                    </button>
                    {getPageNumbers().map((num, idx) =>
                        num === '...'
                            ? <span key={idx} className="px-2">...</span>
                            : <button
                                key={num}
                                className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${currentPage === num ? ' text-[#0955AC] font-[600] border-[2px] border-[#0955AC]' : 'bg-[#F4F3F3]'}`}
                                onClick={() => goToPage(num)}
                            >
                                {num}
                            </button>
                    )}
                    <button
                        className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <span className="text-lg">&#62;</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CarBookingTableTwo;
