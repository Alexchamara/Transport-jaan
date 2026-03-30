import React from "react";
import { usePage } from "@inertiajs/react";
import miniUp from "../../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../../assets/vendors/dashboard/icons/miniDown.svg";

const tableData = [
    {
        id: "D-OR1001",
        date: "Aug 28, 2025",
        recipient: "Alice Johnson",
        serviceType: "Express Delivery",
        route: "Colombo → Kandy",
        slotDate: "Aug 29, 2025",
        slotTime: "10:30 AM",
        price: "$12.50",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Ongoing",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
        packageBadge: "2 kg"
    },
    {
        id: "D-OR1002",
        date: "Aug 28, 2025",
        recipient: "Bob Smith",
        serviceType: "Standard Delivery",
        route: "Galle → Colombo",
        slotDate: "Aug 30, 2025",
        slotTime: "02:15 PM",
        price: "$7.90",
        paymentStatus: "Pending",
        paymentColor: "#FF6060",
        paymentBg: "#FF60608C",
        status: "Scheduled",
        statusBg: "#D9D9D957",
        statusBorder: "#0000004D",
        statusText: "#000000",
        packageBadge: "Fragile"
    },
    {
        id: "D-OR1003",
        date: "Aug 27, 2025",
        recipient: "Steve Gibson",
        serviceType: "Same Day",
        route: "Negombo → Colombo",
        slotDate: "Aug 27, 2025",
        slotTime: "04:45 PM",
        price: "$9.20",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Returned",
        statusBg: "transparent",
        statusBorder: "#FFCD29",
        statusText: "#FFCD29",
        packageBadge: "3 kg"
    },
    {
        id: "D-OR1004",
        date: "Aug 26, 2025",
        recipient: "Nimal Perera",
        serviceType: "Logistic",
        route: "Colombo → Chennai",
        slotDate: "Aug 31, 2025",
        slotTime: "09:00 AM",
        price: "$38.00",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Ongoing",
        statusBg: "#FFCD29",
        statusBorder: "#0000004D",
        statusText: "#000000",
        packageBadge: "Docs"
    },
    {
        id: "D-OR1005",
        date: "Aug 25, 2025",
        recipient: "Chamari Silva",
        serviceType: "Economy",
        route: "Matara → Galle",
        slotDate: "Aug 29, 2025",
        slotTime: "11:15 AM",
        price: "$5.40",
        paymentStatus: "Paid",
        paymentColor: "#3B8F314D",
        paymentBg: "#ACE19957",
        status: "Delivered",
        statusBg: "#D8E4F2",
        statusBorder: "#0000004D",
        statusText: "#000000",
        packageBadge: "1.2 kg"
    }
];

const CarBookingTable = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

    return (
        <div className="py-10">
            {/* table headings */}
            <div className="grid grid-cols-8 bg-[#D8E4F2] h-[42px] justify-center items-center rounded-[8px] text-[14px] font-[600] px-10">
                <div className="flex flex-row gap-2 items-center">
                    <h1>Order ID</h1>
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
                    <h1>Recipient</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Service Type</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Route</h1>
                    <div className="flex flex-col justify-center items-center">
                        <img src={miniUp} className="w-[6px] h-[4px]" />
                        <img src={miniDown} className="w-[6px] h-[4px]" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1>Slot</h1>
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
        className={`grid grid-cols-8 border-b-[1.5px] border-[#00000033] h-[100px] justify-center items-center text-[15px] font-[500] px-10`}
    >
        <div>{row.id}</div>
        <div>{row.date}</div>
        <div>{row.recipient}</div>
        <div>
            <h1>{row.serviceType}</h1>
            <div className="w-[77px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                {row.packageBadge}
            </div>
        </div>
        <div>{row.route}</div>
        <div className="text-[14px] font-[500] text-[#939392]">
            <div className="flex flex-row gap-2 justify-start items-center">
                <h1>Date</h1>
                <div className="w-[90px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text:[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                    {row.slotDate}
                </div>
            </div>
            <div className="flex flex-row gap-4 justify-start items-center">
                <h1>Time</h1>
                <div className="w-[70px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                    {row.slotTime}
                </div>
            </div>
        </div>
        <div className="flex flex-col justify-center items-center">
            <h1>{row.price}</h1>
            <div
                className="w-[66px] h-[19px] rounded-[4px] text-[10px] text-[#00000099] font-[500] flex justify-center items-center"
                style={{ border: `0.5px solid ${row.paymentColor}`, backgroundColor: row.paymentBg }}
            >
                {row.paymentStatus}
            </div>
        </div>
        <div
            className="w-[52px] h-[19px] rounded-[4px] flex justify-center items-center text-[10px] font-[700]"
            style={{ backgroundColor: row.statusBg, border: `1px solid ${row.statusBorder}`, color: row.statusText }}
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
