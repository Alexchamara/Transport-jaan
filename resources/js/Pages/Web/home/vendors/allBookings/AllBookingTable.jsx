import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { usePage } from "@inertiajs/react";

const DUMMY_BOOKINGS = [
    {
        id: "BK-001", date: "Feb 20, 2025", customer: "John Doe",
        transport: "Vehicle Rental", details: "CAB-1234", duration: "Economy",
        startDate: "Mar 1, 2025", endDate: "Mar 5, 2025",
        price: "Rs. 5,000", paymentStatus: "Paid", status: "Confirmed",
    },
    {
        id: "BK-002", date: "Feb 19, 2025", customer: "Jane Smith",
        transport: "Ticket Booking", details: "UL315", duration: "Business",
        startDate: "Feb 25, 2025", endDate: "Feb 28, 2025",
        price: "Rs. 15,000", paymentStatus: "Paid", status: "Completed",
    },
    {
        id: "BK-003", date: "Feb 18, 2025", customer: "Ahmed Khan",
        transport: "Warehouse Rental", details: "WH-001", duration: "Monthly",
        startDate: "Mar 1, 2025", endDate: "Mar 31, 2025",
        price: "Rs. 8,500", paymentStatus: "Pending", status: "Pending",
    },
    {
        id: "BK-004", date: "Feb 17, 2025", customer: "Sara Williams",
        transport: "Courier Service", details: "CR-202", duration: "Express",
        startDate: "Feb 20, 2025", endDate: "Feb 21, 2025",
        price: "Rs. 3,200", paymentStatus: "Paid", status: "Completed",
    },
    {
        id: "BK-005", date: "Feb 16, 2025", customer: "Mike Johnson",
        transport: "Freight Rental", details: "FT-505", duration: "Full Load",
        startDate: "Feb 22, 2025", endDate: "Feb 25, 2025",
        price: "Rs. 12,000", paymentStatus: "Paid", status: "Confirmed",
    },
];

const getPaymentStyle = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
        case "paid":    return { paymentBg: "#ACE19957", paymentColor: "#3B8F314D" };
        case "pending": return { paymentBg: "#FF60608C", paymentColor: "#FF6060" };
        default:        return { paymentBg: "#FFF7D1",   paymentColor: "#FFCD29" };
    }
};

const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
        case "confirmed":  return { statusBg: "#D8E4F2",   statusBorder: "#0000004D", statusText: "#000000" };
        case "paid":       return { statusBg: "#ACE19957", statusBorder: "#3B8F314D", statusText: "#3B8F31" };
        case "pending":    return { statusBg: "#FFF7ED",   statusBorder: "#EA580C4D", statusText: "#EA580C" };
        case "completed":  return { statusBg: "#D1FAE5",   statusBorder: "#06B6D44D", statusText: "#059669" };
        case "cancelled":  return { statusBg: "#F87171",   statusBorder: "#B91C1C",   statusText: "#FFFFFF" };
        case "active":     return { statusBg: "#E8F5E9",   statusBorder: "#2E7D324D", statusText: "#2E7D32" };
        case "ongoing":    return { statusBg: "#FFCD29",   statusBorder: "#0000004D", statusText: "#000000" };
        case "returned":   return { statusBg: "transparent", statusBorder: "#FFCD29", statusText: "#FFCD29" };
        default:           return { statusBg: "#D8E4F2",   statusBorder: "#0000004D", statusText: "#000000" };
    }
};

const addStyles = (row) => ({
    ...row,
    ...getPaymentStyle(row.paymentStatus),
    ...getStatusStyle(row.status),
});

const AllBookingTable = ({ bookings, rows }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.status === "verified" || user?.status === "Verified";

    const raw = bookings ?? rows ?? [];
    const source = (!isVerified && raw.length === 0) ? DUMMY_BOOKINGS : raw;
    const tableData = source.map(addStyles);

    console.log("Table Data:", tableData);

    if (tableData.length === 0) {
        return (
            <div className="py-10 w-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg font-medium">No bookings found</p>
                <p className="text-sm">Try adjusting your filters</p>
            </div>
        );
    }
    return (
        <div className="py-10 w-full">
            {/* DESKTOP/TABLET TABLE (keeps your original layout) */}
            <div className="hidden md:block overflow-auto">
                {/* table headings */}
                <div className="grid bg-[#D8E4F2] min-h-[48px] items-center rounded-[8px] text-[12px] font-[600] px-12 py-3 gap-x-8" style={{gridTemplateColumns:'80px 1fr 1.2fr 1.3fr 1.8fr 1.2fr 1fr'}}>
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
                        <h1>Client Name</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ArrowUp className="w-[6px] h-[10px]" />
                            <ArrowDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Service</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ArrowUp className="w-[6px] h-[10px]" />
                            <ArrowDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    {/* <div className="flex flex-row gap-2 items-center">
                        <h1>Cabin / Duration</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ArrowUp className="w-[6px] h-[10px]" />
                            <ArrowDown className="w-[6px] h-[10px]" />
                        </div>
                    </div> */}
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Travel Dates</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ArrowUp className="w-[6px] h-[10px]" />
                            <ArrowDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
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
                            className="hidden md:grid border-b-[1.5px] border-[#00000033] min-h-[110px] items-center text-[13px] font-[500] px-12 py-4 gap-x-8" style={{gridTemplateColumns:'80px 1fr 1.2fr 1.3fr 1.8fr 1.2fr 1fr'}}
                        >
                            <div>{row.id}</div>
                            <div>{row.date}</div>
                            <div>{row.customer}</div>
                            <div>{row.transport}</div>
                            
                            <div className="text-[14px] font-[500] text-[#939392] space-y-2">
                                <div className="flex flex-row gap-2 justify-start items-center">
                                    <h1>Start</h1>
                                    <div className="px-2 py-1 border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px] min-w-[90px]">
                                        {row.startDate}
                                    </div>
                                </div>
                                <div className="flex flex-row gap-4 justify-start items-center">
                                    <h1>End</h1>
                                    <div className="px-2 py-1 border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px] min-w-[90px]">
                                        {row.endDate}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-start gap-2">
                                <div
                                    className="w-[90px] h-[24px] rounded-[4px] text-[11px] text-[#00000099] font-[500] flex justify-center items-center"
                                    style={{
                                        border: `0.5px solid ${row.paymentColor}`,
                                        backgroundColor: row.paymentBg,
                                    }}
                                >
                                    {row.paymentStatus}
                                </div>
                            </div>
                            <div
                                className="w-[90px] h-[24px] rounded-[4px] flex justify-center items-center text-[11px] font-[700]"
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

            {/* MOBILE VIEW: no side scroll, data stacked nicely */}
            <div className="md:hidden space-y-4">
                {tableData.map((row, index) => (
                    <div
                        key={index}
                        className="border border-[#00000033] rounded-[8px] p-4 text-[14px] font-[500] space-y-2 bg-white"
                    >
                        <div className="flex justify-between">
                            <span className="font-[600]">Booking ID</span>
                            <span className="text-gray-600">{row.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-[600]">Booking Date</span>
                            <span className="text-gray-600">{row.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-[600]">Passenger</span>
                            <span className="text-gray-600">{row.customer}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="font-[600]">Flight</span>
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-600">{row.transport}</span>
                                <div className="w-[120px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                                    {row.details}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-[600]">Duration</span>
                            <span className="text-gray-600">{row.duration}</span>
                        </div>
                        <div className="space-y-1 text-[#939392]">
                            <div className="flex justify-between items-center">
                                <span className="font-[600] text-black">Start</span>
                                <div className="w-[90px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                    {row.startDate}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-[600] text-black">End</span>
                                <div className="w-[90px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                    {row.endDate}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-[600]">Price</span>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-gray-600">{row.price}</span>
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
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-[600]">Status</span>
                            <div
                                className="w-[75px] h-[19px] rounded-[4px] flex justify-center items-center text-[10px] font-[700]"
                                style={{
                                    backgroundColor: row.statusBg,
                                    border: `1px solid ${row.statusBorder}`,
                                    color: row.statusText,
                                }}
                            >
                                {row.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllBookingTable;
