import React, { useState } from "react";
import miniUp from "../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../assets/vendors/dashboard/icons/miniDown.svg";

const CarBookingTableTwo = () => {
    const bookings = [
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$50",
            paymentStatus: "Pending",
            paymentStatusColor: "#FF6060",
            paymentStatusBg: "#FF60608C",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Returned",
            statusBg: "#FFCD29",
            statusText: "#FFCD29",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
        {
            id: "C-JV1001",
            bookingDate: "May 4, 2025",
            clientName: "Steve Gibson",
            carModel: "Honda Civic",
            carPlate: "CBK - 1475",
            plan: "7 days",
            startDate: "May 10, 2025",
            endDate: "May 17, 2025",
            payment: "$450",
            paymentStatus: "Paid",
            paymentStatusColor: "#3B8F314D",
            paymentStatusBg: "#ACE19957",
            status: "Ongoing",
            statusBg: "#FFCD29",
            statusText: "#000000",
        },
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const perPageOptions = [5, 10, 20, 50];
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentBookings = bookings.slice(startIdx, endIdx);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Helper for pagination numbers with ellipsis
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

    // Reset to first page when itemsPerPage changes
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
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Booking Date</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Client Name</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Car Model</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Plan</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Date</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center ml-10">
                    <h1>Payment</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Status</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
            </div>

            {/* table rows */}
            {currentBookings.map((booking, idx) => (
                <div
                    key={startIdx + idx}
                    className={`grid grid-cols-8 ${(startIdx + idx !== bookings.length - 1) ? 'border-b-[1.5px] border-[#00000033]' : ''} h-[100px] justify-center items-center text-[15px] font-[500] px-10`}
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

            {/* Pagination Controls and Results per page inline */}
            <div className="flex justify-between items-center gap-2 mt-20">
                {/* Left: Results per page */}
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
                {/* Right: Pagination */}
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
