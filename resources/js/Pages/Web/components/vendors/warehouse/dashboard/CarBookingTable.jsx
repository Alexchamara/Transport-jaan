import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const tableData = [
    {
        id: "V-1001",
        createdAt: "Aug 28, 2025",
        vendor: "Steve Gibson",
        company: "Acme Warehousing",
        unit: "Unit B-12",
        term: "1 year",
        startDate: "Sep 01, 2025",
        endDate: "Aug 31, 2026",
        rate: "$1,200/mo",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Active",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "V-1002",
        createdAt: "Aug 20, 2025",
        vendor: "Bob Smith",
        company: "Orion Logistics",
        unit: "Unit A-07",
        term: "6 months",
        startDate: "Sep 05, 2025",
        endDate: "Mar 04, 2026",
        rate: "$900/mo",
        paymentStatus: "Pending",
        paymentColor: "#FF6060",
        paymentBg: "#FF60608C",
        status: "Pending",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "V-1003",
        createdAt: "Aug 12, 2025",
        vendor: "Alice Johnson",
        company: "Meta Traders",
        unit: "Unit C-03",
        term: "3 months",
        startDate: "Aug 15, 2025",
        endDate: "Nov 14, 2025",
        rate: "$750/mo",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Ended",
        statusBg: "transparent",
        statusBorder: "#FFCD29",
        statusText: "#FFCD29",
    },
    {
        id: "V-1004",
        createdAt: "Aug 10, 2025",
        vendor: "Nimal Perera",
        company: "Ceylon Fresh Exports",
        unit: "Unit D-15",
        term: "1 year",
        startDate: "Aug 20, 2025",
        endDate: "Aug 19, 2026",
        rate: "$1,050/mo",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Active",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "V-1005",
        createdAt: "Aug 04, 2025",
        vendor: "Kavindi Silva",
        company: "Island Movers",
        unit: "Unit E-22",
        term: "9 months",
        startDate: "Aug 06, 2025",
        endDate: "May 05, 2026",
        rate: "$980/mo",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Active",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
];

const CarBookingTable = () => {
    return (
        <div className="py-10">
            {/* table headings */}
            <div className="grid grid-cols-8 bg-[#D8E4F2] h-[42px] justify-center items-center rounded-[8px] text-[14px] font-[600] px-10">
                <div className="flex flex-row gap-2 items-center">
                    <h1>Vendor ID</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ChevronUp className="w-[10px] h-[10px]" />
                        <ChevronDown className="w-[10px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Created Date</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ChevronUp className="w-[10px] h-[10px]" />
                        <ChevronDown className="w-[10px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Vendor Name</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ChevronUp className="w-[10px] h-[10px]" />
                        <ChevronDown className="w-[10px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Company / Unit</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ChevronUp className="w-[10px] h-[10px]" />
                        <ChevronDown className="w-[10px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Term</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ChevronUp className="w-[10px] h-[10px]" />
                        <ChevronDown className="w-[10px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Dates</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ChevronUp className="w-[10px] h-[10px]" />
                        <ChevronDown className="w-[10px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center ml-10">
                    <h1>Payment</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ChevronUp className="w-[10px] h-[10px]" />
                        <ChevronDown className="w-[10px] h-[10px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Status</h1>
                    <div className="flex flex-col justify-center items-center">
                        <ChevronUp className="w-[10px] h-[10px]" />
                        <ChevronDown className="w-[10px] h-[10px]" />
                    </div>
                </div>
            </div>

            <div>
                {tableData.map((row, index) => (
                    <div
                        key={index}
                        className={`grid grid-cols-8 border-b-[1.5px] border-[#00000033] h-[100px] justify-center items-center text-[15px] font-[500] px-10`}
                    >
                        <div>{row.id}</div>
                        <div>{row.createdAt}</div>
                        <div>{row.vendor}</div>
                        <div>
                            <h1>{row.company}</h1>
                            <div className="w-[77px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                                {row.unit}
                            </div>
                        </div>
                        <div>{row.term}</div>
                        <div className="text-[14px] font-[500] text-[#939392]">
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
                        <div className="flex flex-col justify-center items-center">
                            <h1>{row.rate}</h1>
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
