import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

const tableData = [
    {
        id: "BKG-1001",
        date: "Aug 28, 2025",
        customer: "Alice Johnson",
        transport: "UL 215 (CMB → DXB)",
        details: "Economy Class",
        duration: "5h 10m",
        startDate: "Aug 30, 2025",
        endDate: "Aug 30, 2025",
        price: "$350",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Confirmed",
        statusBg: "#D8E4F2",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "BKG-1002",
        date: "Sep 01, 2025",
        customer: "Bob Smith",
        transport: "UL 123 (CMB → SIN)",
        details: "Business Class",
        duration: "3h 35m",
        startDate: "Sep 03, 2025",
        endDate: "Sep 03, 2025",
        price: "$520",
        paymentStatus: "Pending",
        paymentColor: "#FF6060",
        paymentBg: "#FF60608C",
        status: "Confirmed",
        statusBg: "#D8E4F2",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "BKG-1003",
        date: "Sep 05, 2025",
        customer: "Clara Lee",
        transport: "SQ 469 (CMB → SIN)",
        details: "Economy Flexi",
        duration: "3h 45m",
        startDate: "Sep 07, 2025",
        endDate: "Sep 07, 2025",
        price: "$410",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Completed",
        statusBg: "transparent",
        statusBorder: "#D8E4F2",
        statusText: "#3B82F6",
    },
    {
        id: "BKG-1004",
        date: "Sep 10, 2025",
        customer: "David Kim",
        transport: "QR 669 (CMB → DOH)",
        details: "Business Class",
        duration: "5h 15m",
        startDate: "Sep 12, 2025",
        endDate: "Sep 12, 2025",
        price: "$780",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Confirmed",
        statusBg: "#D8E4F2",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "BKG-1005",
        date: "Sep 15, 2025",
        customer: "Eva Green",
        transport: "UL 403 (CMB → BKK)",
        details: "Premium Economy",
        duration: "3h 20m",
        startDate: "Sep 17, 2025",
        endDate: "Sep 17, 2025",
        price: "$460",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Cancelled",
        statusBg: "#F87171",
        statusBorder: "#B91C1C",
        statusText: "#FFFFFF",
    },
];

const CarBookingTable = () => {
    return (
        <div className="overflow-auto py-10 w-full">
            {/* table headings */}
            <div className="grid grid-cols-8 bg-[#D8E4F2] min-h-[48px] items-center rounded-[8px] text-[14px] font-[600] px-12 py-3 gap-x-6 min-w-[1200px]">
                <div className="flex flex-row gap-2 items-center">
                    <h1>Booking ID</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ArrowUp className="w-[6px] h-[10px]" />
                        <ArrowDown className="w-[6px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Booking Date</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ArrowUp className="w-[6px] h-[10px]" />
                        <ArrowDown className="w-[6px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Passenger Name</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ArrowUp className="w-[6px] h-[10px]" />
                        <ArrowDown className="w-[6px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Flight (No. & Route)</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ArrowUp className="w-[6px] h-[10px]" />
                        <ArrowDown className="w-[6px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Cabin / Duration</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ArrowUp className="w-[6px] h-[10px]" />
                        <ArrowDown className="w-[6px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Travel Dates</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ArrowUp className="w-[6px] h-[10px]" />
                        <ArrowDown className="w-[6px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center ml-10">
                    <h1>Payment Status</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ArrowUp className="w-[6px] h-[10px]" />
                        <ArrowDown className="w-[6px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Status</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ArrowUp className="w-[6px] h-[10px]" />
                        <ArrowDown className="w-[6px] h-[10px]" />
                    </div>
                </div>
            </div>

            <div>
                {tableData.map((row, index) => (
                    <div
                        key={index}
                        className={`grid grid-cols-8 border-b-[1.5px] border-[#00000033] min-h-[110px] items-center text-[15px] font-[500] px-12 py-4 gap-x-6 min-w-[1200px]`}
                    >
                        <div>{row.id}</div>
                        <div>{row.date}</div>
                        <div>{row.customer}</div>
                        <div className="flex flex-col gap-2">
                            <h1>{row.transport}</h1>
                            <div className="w-[120px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                                {row.details}
                            </div>
                        </div>
                        <div>{row.duration}</div>
                        <div className="text-[14px] font-[500] text-[#939392] space-y-2">
                            <div className="flex flex-row gap-2 justify-start items-center">
                                <h1>Start</h1>
                                <div className="w-[62px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                    {row.startDate}
                                </div>
                            </div>
                            <div className="flex flex-row gap-4 justify-start items-center">
                                <h1>End</h1>
                                <div className="w-[62px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                    {row.endDate}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-2">
                            <h1>{row.price}</h1>
                            <div
                                className="w-[66px] h-[19px] rounded-[4px] text-[10px] text-[#00000099] font-[500] flex justify-center items-center"
                                style={{
                                    border: `0.5px solid ${row.paymentColor}`,
                                    backgroundColor: row.paymentBg,
                                }}
                            >
                                {row.paymentStatus}
                            </div>
                        </div>
                        <div
                            className="w-[52px] h-[19px] rounded-[4px] flex justify-center items-center text-[10px] font-[700]"
                            style={{
                                backgroundColor: row.statusBg,
                                border: `1px solid ${row.statusBorder}`,
                                color: row.statusText,
                            }}
                        >
                            {row.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarBookingTable;
