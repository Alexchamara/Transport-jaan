import React from "react";
import { usePage } from "@inertiajs/react";
import { ChevronUp, ChevronDown } from "lucide-react";

const tableData = [
    {
        id: "WH-2025-1001",
        createdAt: "Aug 28, 2025",
        vendor: "Steve Gibson",
        company: "Acme Warehousing",
        unit: "Unit B-12",
        term: "1 year",
        startDate: "Sep 01, 2025",
        endDate: "Aug 31, 2026",
        rate: "LKR 1,200/mo",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Active",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "WH-2025-1002",
        createdAt: "Aug 20, 2025",
        vendor: "Bob Smith",
        company: "Orion Logistics",
        unit: "Unit A-07",
        term: "6 months",
        startDate: "Sep 05, 2025",
        endDate: "Mar 04, 2026",
        rate: "LKR 900/mo",
        paymentStatus: "Pending",
        paymentColor: "#FF6060",
        paymentBg: "#FF60608C",
        status: "Pending",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "WH-2025-1003",
        createdAt: "Aug 12, 2025",
        vendor: "Alice Johnson",
        company: "Meta Traders",
        unit: "Unit C-03",
        term: "3 months",
        startDate: "Aug 15, 2025",
        endDate: "Nov 14, 2025",
        rate: "LKR 750/mo",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Ended",
        statusBg: "transparent",
        statusBorder: "#FFCD29",
        statusText: "#FFCD29",
    },
    {
        id: "WH-2025-1004",
        createdAt: "Aug 10, 2025",
        vendor: "Nimal Perera",
        company: "Ceylon Fresh Exports",
        unit: "Unit D-15",
        term: "1 year",
        startDate: "Aug 20, 2025",
        endDate: "Aug 19, 2026",
        rate: "LKR 1,050/mo",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Active",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "WH-2025-1005",
        createdAt: "Aug 04, 2025",
        vendor: "Kavindi Silva",
        company: "Island Movers",
        unit: "Unit E-22",
        term: "9 months",
        startDate: "Aug 06, 2025",
        endDate: "May 05, 2026",
        rate: "LKR 980/mo",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Active",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
];

const CarBookingTable = ({ data = [], loading = false }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    
    // Use real data if available, otherwise fall back to tableData
    const displayData = data.length > 0 ? data.map(booking => {
        // Safe date parsing function
        const parseDate = (dateValue) => {
            if (!dateValue) return new Date();
            try {
                return new Date(dateValue);
            } catch {
                return new Date();
            }
        };

        return {
            id: booking.id || booking.booking_reference || 'N/A',
            createdAt: parseDate(booking.bookingDate || booking.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: '2-digit' 
            }),
            vendor: booking.contactPerson || booking.contact_person || booking.clientName || 'Unknown',
            company: booking.company_name || booking.companyName || 'N/A',
            unit: booking.warehouseUnit || booking.warehouse_unit || 'N/A',
            term: `${booking.durationMonths || booking.duration_months || booking.durationValue || 1} ${((booking.durationMonths || booking.duration_months || booking.durationValue || 1) === 1) ? 'month' : 'months'}`,
            startDate: parseDate(booking.startDate || booking.start_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
            }),
            endDate: parseDate(booking.endDate || booking.end_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
            }),
            rate: `LKR ${(booking.monthlyRate || booking.monthly_rate || 0).toLocaleString()}/mo`,
            paymentStatus: booking.paymentStatus || (booking.payment_status === 'paid' ? 'Paid' : 'Pending'),
            paymentColor: (booking.payment_status === 'paid' || booking.paymentStatus === 'Paid') ? '#3B8F314D' : '#FF6060',
            paymentBg: (booking.payment_status === 'paid' || booking.paymentStatus === 'Paid') ? '#ACE19957' : '#FF60608C',
            status: booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending',
            statusBg: getStatusBg(booking.status),
            statusBorder: getStatusBorder(booking.status),
            statusText: getStatusText(booking.status)
        };
    }) : tableData;
    
    function getStatusBg(status) {
        switch(status) {
            case 'confirmed': 
            case 'active': return '#FFCD29';
            case 'completed': return '#ACE19957';
            case 'cancelled': return 'transparent';
            default: return '#FFCD29';
        }
    }
    
    function getStatusBorder(status) {
        switch(status) {
            case 'confirmed':
            case 'active': return '#0000004D';
            case 'completed': return '#3B8F314D';
            case 'cancelled': return '#FF6060';
            default: return '#0000004D';
        }
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'confirmed':
            case 'active': return '#000000';
            case 'completed': return '#3B8F31';
            case 'cancelled': return '#FF6060';
            default: return '#000000';
        }
    }

    if (loading) {
        return (
            <div className="py-10 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading bookings...</span>
            </div>
        );
    }

    return (
        <div className="py-10 w-full">
            {/* DESKTOP/TABLET TABLE */}
            <div className="hidden md:block overflow-auto">
                {/* table headings */}
                <div className="grid grid-cols-8 bg-[#D8E4F2] min-h-[48px] items-center rounded-[8px] text-[14px] font-[600] px-12 py-3 gap-x-6 min-w-[1200px]">
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Booking ID</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ChevronUp className="w-[6px] h-[10px]" />
                            <ChevronDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Booking Date</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ChevronUp className="w-[6px] h-[10px]" />
                            <ChevronDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Client Name</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ChevronUp className="w-[6px] h-[10px]" />
                            <ChevronDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Company / Unit</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ChevronUp className="w-[6px] h-[10px]" />
                            <ChevronDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Term</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ChevronUp className="w-[6px] h-[10px]" />
                            <ChevronDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Dates</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ChevronUp className="w-[6px] h-[10px]" />
                            <ChevronDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center ml-10">
                        <h1>Payment</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ChevronUp className="w-[6px] h-[10px]" />
                            <ChevronDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Status</h1>
                        <div className="flex flex-col justify-center items-center">
                            <ChevronUp className="w-[6px] h-[10px]" />
                            <ChevronDown className="w-[6px] h-[10px]" />
                        </div>
                    </div>
                </div>

                <div>
                    {displayData.map((row, index) => (
                        <div
                            key={row.id || index}
                            className="grid grid-cols-8 border-b-[1.5px] border-[#00000033] min-h-[110px] items-center text-[15px] font-[500] px-12 py-4 gap-x-6 min-w-[1200px]"
                        >
                            <div>{row.id}</div>
                            <div>{row.createdAt}</div>
                            <div>{row.vendor}</div>
                            <div className="flex flex-col gap-2">
                                <h1>{row.company}</h1>
                                <div className="w-[120px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                                    {row.unit}
                                </div>
                            </div>
                            <div>{row.term}</div>
                            <div className="text-[14px] font-[500] text-[#939392] space-y-2">
                                <div className="flex flex-row gap-2 justify-start items-center">
                                    <h1>Start</h1>
                                    <div className="w-[90px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                        {row.startDate}
                                    </div>
                                </div>
                                <div className="flex flex-row gap-4 justify-start items-center">
                                    <h1>End</h1>
                                    <div className="w-[90px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                        {row.endDate}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center gap-2">
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
                    ))}
                </div>
            </div>

            {/* MOBILE VIEW: stacked cards */}
            <div className="md:hidden space-y-4">
                {displayData.map((row, index) => (
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
                            <span className="text-gray-600">{row.createdAt}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-[600]">Client</span>
                            <span className="text-gray-600">{row.vendor}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="font-[600]">Company / Unit</span>
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-600">{row.company}</span>
                                <div className="w-[120px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                                    {row.unit}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-[600]">Term</span>
                            <span className="text-gray-600">{row.term}</span>
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
                                <span className="text-gray-600">{row.rate}</span>
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

export default CarBookingTable;
