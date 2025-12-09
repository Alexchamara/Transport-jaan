import React from "react";
import { usePage } from "@inertiajs/react";
import miniUp from "../../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../../assets/vendors/dashboard/icons/miniDown.svg";

const tableData = [
    {
        id: "C-JV1001",
        date: "May 4, 2025",
        customer: "Steve Gibson",
        car: "Honda Civic",
        plate: "CBK - 1475",
        duration: "7 days",
        startDate: "May 10, 2025",
        endDate: "May 17, 2025",
        price: "$450",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Ongoing",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "C-JV1001",
        date: "May 4, 2025",
        customer: "Steve Gibson",
        car: "Honda Civic",
        plate: "CBK - 1475",
        duration: "7 days",
        startDate: "May 10, 2025",
        endDate: "May 17, 2025",
        price: "$50",
        paymentStatus: "Pending",
        paymentColor: "#FF6060",
        paymentBg: "#FF60608C",
        status: "Ongoing",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "C-JV1001",
        date: "May 4, 2025",
        customer: "Steve Gibson",
        car: "Honda Civic",
        plate: "CBK - 1475",
        duration: "7 days",
        startDate: "May 10, 2025",
        endDate: "May 17, 2025",
        price: "$450",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Returned",
        statusBg: "transparent",
        statusBorder: "#FFCD29",
        statusText: "#FFCD29",
    },
    {
        id: "C-JV1001",
        date: "May 4, 2025",
        customer: "Steve Gibson",
        car: "Honda Civic",
        plate: "CBK - 1475",
        duration: "7 days",
        startDate: "May 10, 2025",
        endDate: "May 17, 2025",
        price: "$450",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Ongoing",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
    {
        id: "C-JV1001",
        date: "May 4, 2025",
        customer: "Steve Gibson",
        car: "Honda Civic",
        plate: "CBK - 1475",
        duration: "7 days",
        startDate: "May 10, 2025",
        endDate: "May 17, 2025",
        price: "$450",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Ongoing",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
    },
];

const CarBookingTable = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

    return (
        <div className="py-10">
            {/* table headings - hidden on mobile */}
            <div className="hidden md:grid grid-cols-8 bg-[#D8E4F2] h-[42px] justify-center items-center rounded-[8px] text-[14px] font-[600] px-10">
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

            <div>
                {tableData.map((row, index) => (
                    <div
                        key={index}
                        className={`md:grid md:grid-cols-8 flex flex-col gap-2 p-4 border-b-[1.5px] border-[#00000033] md:h-[100px] md:justify-center md:items-center text-[15px] font-[500] md:px-10 bg-white md:bg-transparent rounded-md md:rounded-none mb-4 md:mb-0`}
                    >
                        <div className="md:col-span-1"><span className="md:hidden font-bold">Book id:</span> {row.id}</div>
                        <div className="md:col-span-1"><span className="md:hidden font-bold">Booking Date:</span> {row.date}</div>
                        <div className="md:col-span-1"><span className="md:hidden font-bold">Client Name:</span> {row.customer}</div>
                        <div className="md:col-span-1">
                            <span className="md:hidden font-bold">Car Model:</span>
                            <h1>{row.car}</h1>
                            <div className="w-[77px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                                {row.plate}
                            </div>
                        </div>
                        <div className="md:col-span-1"><span className="md:hidden font-bold">Plan:</span> {row.duration}</div>
                        <div className="md:col-span-1 text-[14px] font-[500] text-[#939392]">
                            <span className="md:hidden font-bold">Date:</span>
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
                        <div className="md:col-span-1 flex flex-col justify-center items-center">
                            <span className="md:hidden font-bold">Payment:</span>
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
                        <div className="md:col-span-1 flex justify-center items-center">
                            <span className="md:hidden font-bold">Status:</span>
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarBookingTable;
