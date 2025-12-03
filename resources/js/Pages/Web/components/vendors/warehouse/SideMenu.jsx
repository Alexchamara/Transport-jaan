import React, { useState } from "react";
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
    Bell,
    ArrowLeft,
} from "lucide-react";

const SideMenu = ({ isOpen = false }) => {
    const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <>
            {/* Custom Scrollbar – same as first sidebar */}
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

            <div className="poppins min-w-[279px] h-screen bg-[#FFFFFF] flex flex-col py-4 px-6 rounded-tr-[10px] rounded-br-[10px] sticky top-0 left-0 shadow-lg overflow-hidden">
                {/* Logo - Fixed at top with Back Button */}
                <div className="flex-shrink-0 mb-4 flex items-center justify-center relative">
                    <button
                        onClick={() =>
                            (window.location.href = "/mainDashboard")
                        }
                        className={`absolute left-0 p-2 hover:bg-gray-100 rounded-lg transition-colors ${isOpen ? 'lg:block hidden' : 'block'}`}
                        title="Go to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1
                        className="text-[20px] font-[700] text-center uppercase leading-tight cursor-pointer"
                        onClick={() =>
                            (window.location.href = "/mainDashboard")
                        }
                    >
                        Company <br />
                        <span className="text-[#0955AC]">Logo</span>
                    </h1>
                </div>

                {/* Scrollable Menu */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pr-2 sidebar-scroll pb-4">
                    <div className="figtree flex flex-col items-start gap-4 text-[18px] font-[500] text-[#00000066]">
                        {/* Dashboard */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${currentPath ===
                                    "/vendors/warehouse/dashboard" ||
                                    currentPath === "/warehouse/dashboard"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                                }`}
                            onClick={() =>
                                (window.location.href = "/warehouse/dashboard")
                            }
                        >
                            <LayoutDashboard className="w-[22px] h-[22px]" />
                            <span>Dashboard</span>
                        </div>

                        {/* Bookings */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${currentPath === "/vendors/warehouse/bookings" ||
                                    currentPath === "/warehouse/bookings"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                                }`}
                            onClick={() =>
                                (window.location.href = "/warehouse/bookings")
                            }
                        >
                            <Building2 className="w-[22px] h-[22px]" />
                            <span>Bookings</span>
                        </div>

                        {/* Units */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${currentPath === "/vendors/warehouse/units" ||
                                    currentPath === "/warehouse/units"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                                }`}
                            onClick={() =>
                                (window.location.href = "/warehouse/units")
                            }
                        >
                            <Boxes className="w-[22px] h-[22px]" />
                            <span>Units</span>
                        </div>

                        {/* Calendar */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${currentPath === "/vendors/warehouse/calendar" ||
                                    currentPath === "/warehouse/calendar"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                                }`}
                            onClick={() =>
                                (window.location.href = "/warehouse/calendar")
                            }
                        >
                            <Calendar className="w-[22px] h-[22px]" />
                            <span>Calendar</span>
                        </div>

                        {/* Clients */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${currentPath === "/vendors/warehouse/clients" ||
                                    currentPath === "/warehouse/clients"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                                }`}
                            onClick={() =>
                                (window.location.href = "/warehouse/clients")
                            }
                        >
                            <Users className="w-[22px] h-[22px]" />
                            <span>Clients</span>
                        </div>

                        {/* Financial Dropdown */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${[
                                    "/vendors/warehouse/payment",
                                    "/warehouse/payment",
                                    "/vendors/warehouse/expenses",
                                    "/warehouse/expenses",
                                ].includes(currentPath)
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                                }`}
                            onClick={() =>
                                setShowFinancialDropdown((prev) => !prev)
                            }
                        >
                            <Wallet className="w-[22px] h-[22px]" />
                            <span>Financial</span>
                        </div>

                        {showFinancialDropdown && (
                            <div className="ml-8 mb-2 w-40 bg-white flex flex-col text-[18px] font-[500]">
                                <div
                                    className={`px-3 py-1.5 cursor-pointer rounded-lg ${currentPath ===
                                            "/vendors/warehouse/payment" ||
                                            currentPath === "/warehouse/payment"
                                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                            : "text-[#00000066]"
                                        }`}
                                    onClick={() =>
                                    (window.location.href =
                                        "/warehouse/payment")
                                    }
                                >
                                    Payment
                                </div>
                                <div
                                    className={`px-3 py-1.5 cursor-pointer rounded-lg ${currentPath ===
                                            "/vendors/warehouse/expenses" ||
                                            currentPath === "/warehouse/expenses"
                                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                            : "text-[#00000066]"
                                        }`}
                                    onClick={() =>
                                    (window.location.href =
                                        "/warehouse/expenses")
                                    }
                                >
                                    Expenses
                                </div>
                            </div>
                        )}

                        {/* Tracking */}
                        <div
                            className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${currentPath === "/vendors/warehouse/tracking" ||
                                    currentPath === "/warehouse/tracking"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                                }`}
                            onClick={() =>
                                (window.location.href = "/warehouse/tracking")
                            }
                        >
                            <Route className="w-[22px] h-[22px]" />
                            <span>Tracking</span>
                        </div>

                        {/* Settings
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/warehouse/settingsPage" ||
                currentPath === "/warehouse/settingsPage"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/warehouse/settingsPage")}
            >
              <Settings className="w-[22px] h-[22px]" />
              <span>Settings</span>
            </div> */}
                    </div>
                </div>

                {/* Logout – fixed bottom
        <div className="flex-shrink-0 mt-2 pt-4 border-t border-gray-200 w-full">
          <div
            className="figtree flex items-center gap-5 text-[18px] font-[500] text-[#00000066] px-3 py-2.5 hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-lg w-full transition-all duration-200 group cursor-pointer"
            onClick={() => (window.location.href = "/logout")}
          >
            <LogOut
              className="w-[22px] h-[22px] group-hover:fill-[#DC2626] transition-all"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(5000%) hue-rotate(340deg)",
              }}
            />
            <span>Logout</span>
          </div>
        </div> */}
            </div>
        </>
    );
};

export default SideMenu;
