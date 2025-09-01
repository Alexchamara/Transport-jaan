import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Calendar,
  Users,
  Wallet,
  MapPin,
  MessageSquare,
  LogOut,
} from "lucide-react";

const SideMenu = () => {
    const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <div className="poppins min-w-[289px] h-[1070px] bg-[#FFFFFF] flex flex-col items-center py-10 px-10 rounded-tr-[10px] rounded-br-[10px]">
            <h1 className="text-[25px] font-[700] text-center uppercase">
                Company <br /> <span className="text-[#0955AC]">Logo</span>{" "}
            </h1>

            <div className="relative figtree flex flex-col items-start gap-10 text-[24px] font-[500] text-[#00000066] h-full py-10">
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/courierService/dashboard"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/courierService/dashboard")}
                >
                    <LayoutDashboard size={25} />
                    <h1>Dashboard</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/courierService/bookings"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/courierService/bookings")}
                >
                    <Package size={25} />
                    <h1>Bookings</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/courierService/units"
                            ? "bg-[#0955AC29] text-[#000000]  font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/courierService/units")}
                >
                    <Boxes size={25} />
                    <h1>Units</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/courierService/calendar"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/courierService/calendar")}
                >
                    <Calendar size={25} />
                    <h1>Calendar</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/courierService/clients"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/courierService/clients")}
                >
                    <Users size={25} />
                    <h1>Clients</h1>
                </div>
                {/* <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/drivers"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/vendors/drivers")}
                >
                    <img src={driversLogo} className="w-[25px]" />
                    <h1>Drivers</h1>
                </div> */}
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        ["/vendors/courierService/payment", "/courierService/expenses"].includes(currentPath)
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                >
                    <Wallet size={25} />
                    <h1
                        onClick={() =>
                            setShowFinancialDropdown((prev) => !prev)
                        }
                    >
                        Financial
                    </h1>
                </div>
                {showFinancialDropdown && (
                    <div className="ml-10 mb-2 w-40 bg-white flex flex-col text-[24px] font-[500]">
                        <div
                            className={`px-4 py-2 cursor-pointer rounded-lg ${
                                currentPath === "/vendors/courierService/payment"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() => (window.location.href = "/courierService/payment")}
                        >
                            Payment
                        </div>
                        <div
                            className={`px-4 py-2 cursor-pointer rounded-lg ${
                                currentPath === "/vendors/courierService/expenses"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() => (window.location.href = "/courierService/expenses")}
                        >
                            Expenses
                        </div>
                    </div>
                )}
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/courierService/tracking"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/courierService/tracking")}
                >
                    <MapPin size={25} />
                    <h1>Tracking</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/courierService/message"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/courierService/message")}
                >
                    <MessageSquare size={25} />
                    <h1>Message</h1>
                </div>
                <div className="absolute bottom-10 flex flex-row justify-start items-center gap-5 cursor-pointer">
                    <LogOut size={25} />
                    <h1>Logout</h1>
                </div>
            </div>
        </div>
    );
};

export default SideMenu;
