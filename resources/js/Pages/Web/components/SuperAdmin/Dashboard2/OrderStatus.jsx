import React from "react";
import Calendar from "../../../assets/superAdmin/Calendar Icon.png";
import dropD from "../../../assets/superAdmin/Chevron Down.png";
import country from "../../../assets/superAdmin/Map Pin Icon.svg";
import user from "../../../assets/superAdmin/Users Icon.png";
import edit from "../../../assets/superAdmin/Pencil Icon.svg";
import bin from "../../../assets/superAdmin/Bin Icon.svg";

const OrderStatus = () => {
    const mockData = [
        {
            orderId: "#1532",
            clientName: "Jhone Carter",
            email: "hello@johncarter.com",
            date: "Jan 30, 2024",
            status: "Delivered",
            statusColor: "#14CA74",
            statusBg: "#05C16833",
            country: "United States",
            total: "$1099.24",
        },
        {
            orderId: "#1533",
            clientName: "Sophire Moore",
            email: "contact@sophiemoore.com",
            date: "Jan 27, 2024",
            status: "Canceled",
            statusColor: "#FF5A65",
            statusBg: "#FF5A6533",
            country: "United Kingdom",
            total: "$5084.00",
        },
        {
            orderId: "#1534",
            clientName: "Matt Cannon",
            email: "info@mattcannon.com",
            date: "Jan 27, 2024",
            status: "Pending",
            statusColor: "#FDB52A",
            statusBg: "#FFB01633",
            country: "Australia",
            total: "$2000.00",
        },
        {
            orderId: "#1535",
            clientName: "Jhone Singh",
            email: "jsingh@example.com",
            date: "Feb 2, 2024",
            status: "Pending",
            statusColor: "#FF5A65",
            statusBg: "#FF5A6533",
            country: "India",
            total: "$750.50",
        },
        {
            orderId: "#1535",
            clientName: "Ronnie Leach",
            email: "rleach@example.com",
            date: "Jan 25, 2024",
            status: "Delivered",
            statusColor: "#14CA74",
            statusBg: "#05C16833",
            country: "Australia",
            total: "$980.50",
        },
        {
            orderId: "#1535",
            clientName: "Emma Wilson",
            email: "emma@example.com",
            date: "Jan 25, 2024",
            status: "Pending",
            statusColor: "#FFA500",
            statusBg: "#FFA50033",
            country: "Canada",
            total: "$750.50",
        },
    ];

    return (
        <div className="flex flex-col poppins rounded-[10px] border border-[#0B1739] bg-[#0B1739] w-[1040px] mx-10 pb-6">
            <div className="flex flex-row justify-between items-center pt-[30px] px-[25px]">
                <h1 className="text-white poppins font-[500]">Order Status</h1>
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
                        <img src={user} />
                        <h1 className="text-white text-[10px] font-[600]">
                            Client
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-2 w-[65px]">
                        <img src={Calendar} />
                        <h1 className="text-white text-[10px] font-[600]">
                            Date
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-2 w-[50px]">
                        <input
                            type="checkbox"
                            className="size-[12px] cursor-pointer focus:outline-none focus:ring-0 focus:ring-transparent"
                        />
                        <h1 className="text-white text-[10px] font-[600]">
                            Status
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-2 w-[100px]">
                        <img src={country} />
                        <h1 className="text-white text-[10px] font-[600]">
                            Country
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-2 w-[60px]">
                        <h1 className="text-white text-[10px] font-[600]">
                            Total
                        </h1>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-2 w-[60px]">
                    </div>
                </div>
                {/* Rows */}
                {mockData.map((item, index) => (
                    <div key={index} className="flex flex-row justify-between bg-[#0A1330]">
                        <div className="flex flex-row justify-start items-center gap-2 w-[50px] px-[10px]">
                            <input
                                type="checkbox"
                                className="size-[12px] cursor-pointer focus:outline-none focus:ring-0 focus:ring-transparent"
                            />
                            <h1 className="text-white text-[10px] font-[600]">
                                {item.orderId}
                            </h1>
                        </div>
                        <div className="flex flex-row justify-start items-center gap-2 w-[100px] font-500">
                            <h1 className="text-white text-[10px] font-[600] flex flex-col">
                                {item.clientName}{" "}
                                <span className="text-[#AEB9E1] text-[10px]">
                                    {item.email}
                                </span>
                            </h1>
                        </div>
                        <div className="flex flex-row justify-start items-center gap-2 w-[65px]">
                            <h1 className="text-white text-[10px] font-[600]">
                                {item.date}
                            </h1>
                        </div>
                        <div
                            className="flex flex-row justify-center items-center w-[80px] border border-[${item.statusBg}] bg-[${item.statusBg}] rounded-[5px] gap-1 px-1"
                            style={{ borderColor: item.statusBg, backgroundColor: item.statusBg }}
                        >
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: item.statusColor }} />
                            <h1 className="text-[${item.statusColor}] text-[10px] font-[600] rounded-[5px]" style={{ color: item.statusColor }}>
                                {item.status}
                            </h1>
                        </div>
                        <div className="flex flex-row justify-start items-center gap-2 w-[100px]">
                            <h1 className="text-white text-[10px] font-[600]">
                                {item.country}
                            </h1>
                        </div>
                        <div className="flex flex-row justify-start items-center gap-2 w-[60px]">
                            <h1 className="text-white text-[10px] font-[600]">
                                {item.total}
                            </h1>
                        </div>
                        <div className="flex flex-row justify-start items-center gap-2 w-[60px]">
                            <img src={edit} className="size-[12px]" />
                            <img src={bin} className="size-[12px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderStatus;