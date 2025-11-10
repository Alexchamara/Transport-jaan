import React, { useState } from "react";
import dashLogo from "../../assets/vendors/dashboard/dashLogo.svg";
import bookLogo from "../../assets/vendors/dashboard/bookLogo.svg";
import uniLogo from "../../assets/vendors/dashboard/uniLogo.svg";
import calendarLogo from "../../assets/vendors/dashboard/calendarLogo.svg";
import clientsLogo from "../../assets/vendors/dashboard/clientsLogo.svg";
import driversLogo from "../../assets/vendors/dashboard/driversLogo.svg";
import finLogo from "../../assets/vendors/dashboard/finLogo.svg";
import trackLogo from "../../assets/vendors/dashboard/trackLogo.svg";
import messgLogo from "../../assets/vendors/dashboard/messgLogo.svg";
import logOutLogo from "../../assets/vendors/dashboard/logOutLogo.svg";
import proPic from "../../assets/vendors/dashboard/proPic.svg";


import { Settings, Bell } from "lucide-react";
import { Link } from "@inertiajs/react";

const SideMenu = () => {
    const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <>
            <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        /* Firefox scrollbar styling */
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
      `}</style>
            <div className="poppins min-w-[279px] h-screen bg-[#FFFFFF] flex flex-col py-4 px-6 rounded-tr-[10px] rounded-br-[10px] sticky top-0 left-0 shadow-lg overflow-hidden">
                {/* Logo - Fixed at top */}
                <div className="flex-shrink-0 mb-4">
                    <h1 className="text-[20px] font-[700] text-center uppercase leading-tight">
                        Company <br />{" "}
                        <span className="text-[#0955AC]">Logo</span>{" "}
                    </h1>
                </div>

                {/* Scrollable menu container */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pr-2 sidebar-scroll pb-4">
                    <div className="figtree flex flex-col items-start gap-4 text-[18px] font-[500] text-[#00000066]">
                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w/full rounded-lg px-3 py-1.5 ${
                                currentPath === "/vendors/dashboard"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendors/dashboard")
                            }
                        >
                            <img src={dashLogo} className="w-[22px]" />
                            <h1>Dashboard</h1>
                        </div>

                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                                currentPath === "/vendors/bookings"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendors/bookings")
                            }
                        >
                            <img src={bookLogo} className="w-[22px]" />
                            <h1>Bookings</h1>
                        </div>

                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                                currentPath === "/vendors/units"
                                    ? "bg-[#0955AC29] text-[#000000]  font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendors/units")
                            }
                        >
                            <img src={uniLogo} className="w-[22px]" />
                            <h1>Units</h1>
                        </div>

                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                                currentPath === "/vendors/calendar"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendors/calendar")
                            }
                        >
                            <img src={calendarLogo} className="w-[22px]" />
                            <h1>Calendar</h1>
                        </div>

                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                                currentPath === "/vendors/clients"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendors/clients")
                            }
                        >
                            <img src={clientsLogo} className="w-[22px]" />
                            <h1>Clients</h1>
                        </div>

                        {/* ✅ Drivers */}
                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                                currentPath === "/vendors/drivers"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendors/drivers")
                            }
                        >
                            <img src={driversLogo} className="w-[22px]" />
                            <h1>Drivers</h1>
                        </div>

                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                                [
                                    "/vendors/payment",
                                    "/vendors/expenses",
                                ].includes(currentPath)
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                        >
                            <img src={finLogo} className="w/[25px]" />
                            <h1
                                onClick={() =>
                                    setShowFinancialDropdown((prev) => !prev)
                                }
                            >
                                Financial
                            </h1>
                        </div>

                        {showFinancialDropdown && (
                            <div className="ml-8 mb-2 w-40 bg-white flex flex-col text-[18px] font-[500]">
                                <div
                                    className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                                        currentPath === "/vendors/payment"
                                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                            : "text-[#00000066]"
                                    }`}
                                    onClick={() =>
                                        (window.location.href =
                                            "/vendors/payment")
                                    }
                                >
                                    Payment
                                </div>
                                <div
                                    className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                                        currentPath === "/vendors/expenses"
                                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                            : "text-[#00000066]"
                                    }`}
                                    onClick={() =>
                                        (window.location.href =
                                            "/vendors/expenses")
                                    }
                                >
                                    Expenses
                                </div>
                            </div>
                        )}

                        {/* ✅ Settings with Notifications */}
                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                                [
                                    "/vendors/settings",
                                    "/vendors/notifications",
                                ].includes(currentPath)
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                        >
                            <Settings className="w-[22px] h-[22px]" />
                            <h1
                                onClick={() =>
                                    setShowSettingsDropdown((prev) => !prev)
                                }
                            >
                                Settings
                            </h1>
                        </div>

                        {showSettingsDropdown && (
                            <div className="ml-8 mb-2 w-48 bg-white flex flex-col text-[18px] font-[500]">
                                <div
                                    className={`px-3 py-1.5 cursor-pointer rounded-lg flex items-center gap-2 ${
                                        currentPath === "/vendors/notifications"
                                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                            : "text-[#00000066]"
                                    }`}
                                    onClick={() =>
                                        (window.location.href =
                                            "/vendors/notifications")
                                    }
                                >
                                    <Bell className="w-[16px] h-[16px]" />
                                    <span>Notifications</span>
                                </div>
                            </div>
                        )}

                        <div
                            className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                                currentPath === "/vendors/tracking"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendors/tracking")
                            }
                        >
                            <img src={trackLogo} className="w-[22px]" />
                            <h1>Tracking</h1>
                        </div>
                    </div>
                </div>

                {/* Logout - Fixed at bottom */}
                {/* <div className="flex-shrink-0 mt-2 pt-4 border-t border-gray-200 w-full">
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="figtree flex flex-row justify-start items-center gap-5 cursor-pointer text-[18px] font-[500] text-[#00000066] px-3 py-2.5 hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-lg w-full transition-all duration-200 group"
                    >
                        <img src={logOutLogo} className="w-[22px] h-[22px] group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:saturate-[5000%] group-hover:hue-rotate-[340deg] transition-all duration-200" />
                        <h1>Logout</h1>
                    </Link>
                </div> */}
            </div>
        </>
    );
};

export default SideMenu;
