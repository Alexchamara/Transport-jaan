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

import { Settings, Bell, Menu, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";

const SideMenu = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
    const currentPath = window.location.pathname;

    // Nav items
    const navItems = [
        { icon: dashLogo,     label: "Dashboard", href: "/vendorAllBookings",          path: "/vendorAllBookings"          },
        { icon: bookLogo,     label: "Bookings",  href: "/vendorAllBookings/bookings", path: "/vendorAllBookings/bookings" },
        { icon: calendarLogo, label: "Calendar",  href: "/vendors/calendar",           path: "/vendors/calendar"           },
        { icon: clientsLogo,  label: "Clients",   href: "/vendorAllBookings/clients",  path: "/vendorAllBookings/clients"  },
        { icon: uniLogo,      label: "Profile",   href: "", path: ""},
    ];

    const isActive = (path) => currentPath === path;
    const isFinancialActive = ["/vendors/payment", "/vendors/expenses"].includes(currentPath);

    return (
        <>
            <style>{`
                .sidebar-scroll::-webkit-scrollbar { width: 4px; }
                .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                .sidebar-scroll { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
                .sidebar-tooltip {
                    position: absolute;
                    left: calc(100% + 12px);
                    top: 50%;
                    transform: translateY(-50%);
                    background: #1f2937;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 500;
                    padding: 5px 10px;
                    border-radius: 6px;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.15s;
                    z-index: 100;
                }
                .sidebar-tooltip::before {
                    content: '';
                    position: absolute;
                    right: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 5px solid transparent;
                    border-right-color: #1f2937;
                }
                .nav-item-wrap:hover .sidebar-tooltip { opacity: 1; }
            `}</style>

            <div
                className={`poppins h-screen bg-[#FFFFFF] flex flex-col py-4 rounded-tr-[10px] rounded-br-[10px] sticky top-0 left-0 shadow-lg overflow-hidden transition-all duration-300 flex-shrink-0
                ${collapsed ? "w-[72px] px-3" : "w-[250px] px-6"}`}
            >
                {/* ── Top: Toggle + Logo ── */}
                <div className={`flex-shrink-0 mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
                    {!collapsed && (
                        <h1
                            className="text-[18px] font-[700] uppercase leading-tight cursor-pointer select-none"
                            onClick={() => (window.location.href = "/")}
                        >
                            Company <br />
                            <span className="text-[#0955AC]">Logo</span>
                        </h1>
                    )}
                    <button
                        onClick={() => {
                            setCollapsed((c) => !c);
                            if (!collapsed) setShowFinancialDropdown(false);
                        }}
                        className="p-2 rounded-[8px] hover:bg-[#F3F3F3] transition-colors flex-shrink-0"
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* ── Scrollable nav ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll pb-4">
                    <div className="flex flex-col gap-1">

                        {/* Regular nav items */}
                        {navItems.map(({ icon, label, href, path }) => (
                            <div key={label} className="nav-item-wrap relative">
                                <div
                                    className={`flex flex-row items-center gap-4 cursor-pointer rounded-[8px] px-3 py-2.5 transition-all duration-150
                                    ${isActive(path)
                                        ? "bg-[#0955AC] text-white"
                                        : "text-[#00000066] hover:bg-[#F3F3F3] hover:text-[#000000]"
                                    }
                                    ${collapsed ? "justify-center" : ""}`}
                                    onClick={() => (window.location.href = href)}
                                >
                                    <img
                                        src={icon}
                                        className={`flex-shrink-0 w-[22px] h-[22px] ${isActive(path) ? "brightness-0 invert" : ""}`}
                                        alt={label}
                                    />
                                    {!collapsed && (
                                        <span className="figtree text-[15px] font-[500] whitespace-nowrap">{label}</span>
                                    )}
                                </div>
                                {/* Tooltip shown only when collapsed */}
                                {collapsed && <span className="sidebar-tooltip">{label}</span>}
                            </div>
                        ))}

                        {/* Financial (dropdown) item */}
                        <div className="nav-item-wrap relative">
                            <div
                                className={`flex flex-row items-center gap-4 cursor-pointer rounded-[8px] px-3 py-2.5 transition-all duration-150
                                ${isFinancialActive
                                    ? "bg-[#0955AC] text-white"
                                    : "text-[#00000066] hover:bg-[#F3F3F3] hover:text-[#000000]"
                                }
                                ${collapsed ? "justify-center" : ""}`}
                                onClick={() => !collapsed && setShowFinancialDropdown((p) => !p)}
                            >
                                <img
                                    src={finLogo}
                                    className={`flex-shrink-0 w-[22px] h-[22px] ${isFinancialActive ? "brightness-0 invert" : ""}`}
                                    alt="Financial"
                                />
                                {!collapsed && (
                                    <>
                                        <span className="figtree text-[15px] font-[500] flex-1 whitespace-nowrap">Financial</span>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform duration-200 ${showFinancialDropdown ? "rotate-180" : ""}`}
                                        />
                                    </>
                                )}
                            </div>
                            {collapsed && <span className="sidebar-tooltip">Financial</span>}

                            {/* Dropdown — only visible when expanded */}
                            {!collapsed && showFinancialDropdown && (
                                <div className="ml-9 mt-1 flex flex-col gap-1">
                                    {[
                                        { label: "Payment",  href: "/vendors/payment"  },
                                        { label: "Expenses", href: "/vendors/expenses" },
                                    ].map(({ label, href }) => (
                                        <div
                                            key={label}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-[8px] cursor-pointer text-[14px] font-[500] transition-all
                                            ${currentPath === href
                                                ? "bg-[#0955AC29] text-[#0955AC] font-[700]"
                                                : "text-[#00000066] hover:bg-[#F3F3F3] hover:text-[#000000]"
                                            }`}
                                            onClick={() => (window.location.href = href)}
                                        >
                                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* ── Logout (bottom) ── */}
                <div className={`flex-shrink-0 pt-4 border-t border-gray-100 nav-item-wrap relative`}>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className={`figtree flex flex-row items-center gap-4 cursor-pointer text-[15px] font-[500] text-[#00000066] px-3 py-2.5 hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-[8px] w-full transition-all duration-150 group
                        ${collapsed ? "justify-center" : ""}`}
                    >
                        <img
                            src={logOutLogo}
                            className="w-[22px] h-[22px] flex-shrink-0 group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:saturate-[5000%] group-hover:hue-rotate-[340deg] transition-all duration-200"
                            alt="Logout"
                        />
                        {!collapsed && <span className="whitespace-nowrap">Logout</span>}
                    </Link>
                    {collapsed && <span className="sidebar-tooltip">Logout</span>}
                </div>
            </div>
        </>
    );
};

export default SideMenu;



