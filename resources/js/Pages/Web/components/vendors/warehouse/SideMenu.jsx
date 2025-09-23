import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    LayoutDashboard,
    Building2,
    Boxes,
    Calendar,
    Users,
    Wallet,
    Route,
    Settings,
    LogOut,
} from "lucide-react";

const SideMenu = () => {
    const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <div className="poppins min-w-[289px] h-[1070px] bg-[#FFFFFF] flex flex-col items-center py-10 px-10 rounded-tr-[10px] rounded-br-[10px]">
            <h1
                className="text-[25px] font-[700] text-center uppercase cursor-pointer"
                onClick={() => (window.location.href = "/mainDashboard")}
            >
                Company <br /> <span className="text-[#0955AC]">Logo</span>{" "}
            </h1>

            <div className="relative figtree flex flex-col items-start gap-10 text-[24px] font-[500] text-[#00000066] h-full py-10">
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/warehouse/dashboard"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() =>
                        (window.location.href = "/warehouse/dashboard")
                    }
                >
                    <LayoutDashboard className="w-[25px] h-[25px]" />
                    <h1>Dashboard</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/warehouse/vendors"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() =>
                        (window.location.href = "/warehouse/bookings")
                    }
                >
                    <Building2 className="w-[25px] h-[25px]" />
                    <h1>Bookings</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/units"
                            ? "bg-[#0955AC29] text-[#000000]  font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/warehouse/units")}
                >
                    <Boxes className="w-[25px] h-[25px]" />
                    <h1>Units</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/calendar"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() =>
                        (window.location.href = "/warehouse/calendar")
                    }
                >
                    <Calendar className="w-[25px] h-[25px]" />
                    <h1>Calendar</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/clients"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() =>
                        (window.location.href = "/warehouse/clients")
                    }
                >
                    <Users className="w-[25px] h-[25px]" />
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
                        [
                            "/vendors/warehouse/payment",
                            "/warehouse/expenses",
                        ].includes(currentPath)
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                >
                    <Wallet className="w-[25px] h-[25px]" />
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
                                currentPath === "/vendors/warehouse/payment"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/warehouse/payment")
                            }
                        >
                            Payment
                        </div>
                        <div
                            className={`px-4 py-2 cursor-pointer rounded-lg ${
                                currentPath === "/vendors/warehouse/expenses"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/warehouse/expenses")
                            }
                        >
                            Expenses
                        </div>
                    </div>
                )}
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/tracking"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() =>
                        (window.location.href = "/warehouse/tracking")
                    }
                >
                    <Route className="w-[25px] h-[25px]" />
                    <h1>Tracking</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/warehouse/settingsPage"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() =>
                        (window.location.href = "/warehouse/settingsPage")
                    }
                >
                    <Settings className="w-[25px] h-[25px]" />
                    <h1>Settings</h1>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="absolute bottom-10 flex flex-row justify-start items-center gap-5 cursor-pointer"
                >
                    <LogOut className="w-[25px] h-[25px]" />
                    <h1>Logout</h1>
                </Link>
            </div>
        </div>
    );
};

export default SideMenu;
