import React, { useState } from "react";
import dashLogo from "../../../assets/vendors/dashboard/dashLogo.svg";
import bookLogo from "../../../assets/vendors/dashboard/bookLogo.svg";
import uniLogo from "../../../assets/vendors/dashboard/uniLogo.svg";
import calendarLogo from "../../../assets/vendors/dashboard/calendarLogo.svg";
import clientsLogo from "../../../assets/vendors/dashboard/clientsLogo.svg";
import driversLogo from "../../../assets/vendors/dashboard/driversLogo.svg";
import finLogo from "../../../assets/vendors/dashboard/finLogo.svg";
import trackLogo from "../../../assets/vendors/dashboard/trackLogo.svg";
import messgLogo from "../../../assets/vendors/dashboard/messgLogo.svg";
import logOutLogo from "../../../assets/vendors/dashboard/logOutLogo.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";
import CompanyLogo from "../../../components/CompanyLogo";

import { Settings, Bell, Menu, ChevronDown, ChevronRight, ArrowLeft, User } from "lucide-react";
import { Link } from "@inertiajs/react";

const SideMenu = () => {
    const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <>
            {/* Custom Scrollbar – same as first */}
            <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
      `}</style>

            <div className="poppins min-w-[250px] h-screen bg-[#FFFFFF] flex flex-col py-4 px-6 rounded-tr-[10px] rounded-br-[10px] sticky top-0 left-0 shadow-lg overflow-hidden">
                {/* Logo - Fixed at top with Back Button */}
                <div className="flex-shrink-0 mb-4 flex items-center justify-center relative">
                    <button
                        onClick={() =>
                            (window.location.href = "/")
                        }
                        className="absolute left-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Go to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <CompanyLogo className="h-[40px] object-contain" fallbackClassName="text-[20px] font-[700] poppins uppercase" />
                </div>

                {/* Scrollable Menu */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pr-2 sidebar-scroll pb-4">
                    <div className="figtree flex flex-col items-start gap-4 text-[18px] font-[500] text-[#00000066]">
                        {/* Dashboard */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                                currentPath === "/vendorAllBookings" 
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendorAllBookings")
                            }
                        >
                            <img
                                src={dashLogo}
                                className="w-[22px]"
                                alt="Dashboard"
                            />
                            <span>Dashboard</span>
                        </div>

                        {/* Bookings */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                                currentPath === "/vendorAllBookings/bookings"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendorAllBookings/bookings")
                            }
                        >
                            <img
                                src={bookLogo}
                                className="w-[22px]"
                                alt="Bookings"
                            />
                            <span>Bookings</span>
                        </div>

                        {/* Units */}
                        {/* <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                                currentPath === "/vendors/freight/units" ||
                                currentPath === "/freight/units"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/freight/units")
                            }
                        >
                            <img
                                src={uniLogo}
                                className="w-[22px]"
                                alt="Units"
                            />
                            <span>Units</span>
                        </div> */}

                        {/* Calendar */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                                currentPath === "/vendorAllBookings/calendar" 
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendorAllBookings/calendar")
                            }
                        >
                            <img
                                src={calendarLogo}
                                className="w-[22px]"
                                alt="Calendar"
                            />
                            <span>Calendar</span>
                        </div>

                        {/* Clients */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                                currentPath === "/vendorAllBookings/clients"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendorAllBookings/clients")
                            }
                        >
                            <img
                                src={clientsLogo}
                                className="w-[22px]"
                                alt="Clients"
                            />
                            <span>Clients</span>
                        </div>

                        {/* Financial Dropdown */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                                [
                                    "/vendors/freight/payment",
                                    "/freight/payment",
                                    "/vendors/freight/expenses",
                                    "/freight/expenses",
                                ].includes(currentPath)
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                setShowFinancialDropdown((prev) => !prev)
                            }
                        >
                            <img
                                src={finLogo}
                                className="w-[22px]"
                                alt="Financial"
                            />
                            <span>Financial</span>
                        </div>

                        {showFinancialDropdown && (
                            <div className="ml-8 mb-2 w-40 bg-white flex flex-col text-[18px] font-[500]">
                                <div
                                    className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                                        currentPath ===
                                            "/vendors/freight/payment" ||
                                        currentPath === "/freight/payment"
                                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                            : "text-[#00000066]"
                                    }`}
                                    // onClick={() =>
                                    //     (window.location.href =
                                    //         "/freight/payment")
                                    // }
                                >
                                    Payment
                                </div>
                                <div
                                    className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                                        currentPath ===
                                            "/vendors/freight/expenses" ||
                                        currentPath === "/freight/expenses"
                                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                            : "text-[#00000066]"
                                    }`}
                                    // onClick={() =>
                                    //     (window.location.href =
                                    //         "/freight/expenses")
                                    // }
                                >
                                    Expenses
                                </div>
                            </div>
                        )}

                        {/* Tracking */}
                        {/* <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                                currentPath === "/vendors/freight/tracking" ||
                                currentPath === "/freight/tracking"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/freight/tracking")
                            }
                        >
                            <img
                                src={trackLogo}
                                className="w-[22px]"
                                alt="Tracking"
                            />
                            <span>Tracking</span>
                        </div> */}

                        {/* Message
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/freight/message" ||
                currentPath === "/freight/message"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/freight/message")}
            >
              <img src={messgLogo} className="w-[22px]" alt="Message" />
              <span>Message</span>
            </div> */}

        {/* Settings */}
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/freight/settingsPage" ||
                currentPath === "/freight/settingsPage"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => setShowSettingsDropdown((prev) => !prev)}
            >
              <Settings className="w-[22px] h-[22px]" />
              <span>Settings</span>
            </div>

                        {showSettingsDropdown && (
                            <div className="ml-8 mb-2 w-48 bg-white flex flex-col text-[18px] font-[500]">
                                <div
                                    className={`px-3 py-1.5 cursor-pointer rounded-lg flex items-center gap-2 ${
                                        currentPath ===
                                            "/vendors/freight/notifications" ||
                                        currentPath === "/freight/notifications"
                                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                            : "text-[#00000066]"
                                    }`}
                                    // onClick={() =>
                                    //     (window.location.href =
                                    //         "/freight/notifications")
                                    // }
                                >
                                    <Bell className="w-[16px] h-[16px]" />
                                    <span>Notifications</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                                currentPath === "/vendor/profile" 
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() =>
                                (window.location.href = "/vendor/profile")
                            }
                        >
                            <User className="w-[22px] h-[22px]" />
                            <span>Profile</span>
                    </div>
                </div>

                

                {/* Logout – fixed bottom
        <div className="flex-shrink-0 mt-2 pt-4 border-t border-gray-200 w-full">
          <div
            className="figtree flex items-center gap-5 text-[18px] font-[500] text-[#00000066] px-3 py-2.5 hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-lg w-full transition-all duration-200 group cursor-pointer"
            onClick={() => (window.location.href = "/logout")}
          >
            <img
              src={logOutLogo}
              className="w-[22px] h-[22px] group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:saturate-[5000%] group-hover:hue-rotate-[340deg] transition-all duration-200"
              alt="Logout"
            />
            <span>Logout</span>
          </div>
        </div> */}
            </div>
        </>
    );
};

export default SideMenu;



