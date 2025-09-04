import React from "react";
import Calendar from "../../../assets/superAdmin/Calendar Icon.png";
import dropD from "../../../assets/superAdmin/Chevron Down.png";

const RecentOrders = () => {
    const mockData = [
        {
            orderId: "#1532",
            date: "Dec 30, 10.06 AM",
            status: "Paid",
            statusColor: "#4CAF50",
            statusBg: "#05C16833",
            total: "$340.40",
        },
        {
            orderId: "#1531",
            date: "Dec 29, 2.59 AM",
            status: "Pending",
            statusColor: "#FDB52A",
            statusBg: "#FFB01633",
            total: "$117.24",
        },
        {
            orderId: "#1530",
            date: "Dec 28, 9.15 PM",
            status: "Paid",
            statusColor: "#4CAF50",
            statusBg: "#05C16833",
            total: "$250.00",
        },
        {
            orderId: "#1529",
            date: "Dec 27, 1.30 PM",
            status: "Pending",
            statusColor: "#FDB52A",
            statusBg: "#FFB01633",
            total: "$89.99",
        },
    ];

    return (
        <div className="flex flex-col poppins rounded-[10px] border border-[#0B1739] bg-[#0B1739] w-[513.409912109375px]">
            <div className="flex flex-row justify-between items-center pt-[30px] px-[25px]">
                <h1 className="text-white poppins font-[500]">Recent Orders</h1>
                <div className="flex flex-row justify-center items-center gap-2 w-[110px] h-[30px] border border-[#0A1330] bg-[#0A1330]">
                    <img src={Calendar} />
                    <h1 className="text-[#AEB9E1] text-[10px] font-medium">
                        Select date
                    </h1>
                    <img src={dropD} alt="dropdown" />
                </div>
            </div>
            <div className="flex flex-col gap-5 mt-[20px] px-[15px]">
                {/* Topic */}
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row justify-start items-center gap-2 w-[50px] px-[10px]">
                        <input
                            type="checkbox"
                            className="size-[12px] cursor-pointer focus:outline-none focus:ring-0 focus:ring-transparent"
                        />
                        <h1 className="text-white text-[10px] font-[600]">
                            Order
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-2 w-[100px]">
                        <img src={Calendar} />
                        <h1 className="text-white text-[10px] font-[600]">
                            Date
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-2 w-[65px]">
                        <input
                            type="checkbox"
                            className="size-[12px] cursor-pointer focus:outline-none focus:ring-0 focus:ring-transparent"
                        />
                        <h1 className="text-white text-[10px] font-[600]">
                            Status
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-2 w-[60px]">
                        <h1 className="text-white text-[10px] font-[600]">
                            Total
                        </h1>
                    </div>
                </div>
                {/* Rows */}
                {mockData.map((item, index) => (
                    <div
                        key={index}
                        className={`flex flex-row justify-between ${
                            index % 2 === 0 ? "bg-[#0A1330] h-[46.400390625px]" : ""
                        }`}
                    >
                        <div className="flex flex-row justify-start items-center gap-2 w-[50px] px-[10px]">
                            <input
                                type="checkbox"
                                className="size-[12px] cursor-pointer focus:outline-none focus:ring-0 focus:ring-transparent"
                            />
                            <h1 className="text-white text-[10px] font-[600]">
                                {item.orderId}
                            </h1>
                        </div>
                        <div className="flex flex-row justify-start items-center gap-2 w-[100px]">
                            <h1
                                className={`text-[10px] font-[600] ${
                                    index % 2 === 0 ? "text-white" : "text-[#AEB9E1]"
                                }`}
                            >
                                {item.date}
                            </h1>
                        </div>
                        <div className="flex flex-row justify-center items-center">
                            <div
                                className="flex flex-row justify-center items-center gap-1 h-[20px] rounded-[5px] w-[65px] px-[6px]"
                                style={{ borderColor: item.statusBg, backgroundColor: item.statusBg }}
                            >
                                <div
                                    className="size-[5px] rounded-full"
                                    style={{ backgroundColor: item.statusColor }}
                                />
                                <h1
                                    className="text-[10px] font-[600]"
                                    style={{ color: item.statusColor }}
                                >
                                    {item.status}
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-row justify-start items-center gap-2 w-[60px]">
                            <h1 className="text-white text-[10px] font-[600]">
                                {item.total}
                            </h1>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentOrders;
