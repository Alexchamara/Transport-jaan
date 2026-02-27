import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";



const FlightBookingTable = ({ bookings }) => {
    const tableData = bookings || [];
    
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
                <div className="grid grid-cols-8 bg-[#D8E4F2] min-h-[48px] items-center rounded-[8px] text-[12px] font-[600] px-12 py-3 gap-x-6">
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
                            className="hidden md:grid grid-cols-8 border-b-[1.5px] border-[#00000033] min-h-[110px] items-center text-[13px] font-[500] px-12 py-4 gap-x-6"
                        >
                            <div>{row.id}</div>
                            <div>{row.date}</div>
                            <div>{row.customer}</div>
                            <div className="flex flex-col gap-2">
                                <h1>{row.transport}</h1>
                                <div className="p-2 rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[11px]">
                                    {row.details}
                                </div>
                            </div>
                            <div>{row.duration}</div>
                            <div className="text-[14px] font-[500] text-[#939392] space-y-2">
                                <div className="flex flex-row gap-2 justify-start items-center">
                                    <h1>Start</h1>
                                    <div className="p-1 border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[8px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                                        {row.startDate}
                                    </div>
                                </div>
                                <div className="flex flex-row gap-4 justify-start items-center">
                                    <h1>End</h1>
                                    <div className="p-1 border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[8px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
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

export default FlightBookingTable;
