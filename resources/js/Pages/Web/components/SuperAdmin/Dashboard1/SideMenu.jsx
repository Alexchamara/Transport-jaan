import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import homepng from "../../../assets/superAdmin/HomeB.svg";
import homepngW from "../../../assets/superAdmin/HomeW.svg";
import drop from "../../../assets/superAdmin/Chevron Down.png";
import dropl from "../../../assets/superAdmin/Chevron Right.png";
import features from "../../../assets/superAdmin/Features Icon.png";
import featuresW from "../../../assets/superAdmin/Features IconW.svg";
import users from "../../../assets/superAdmin/Users Icon.png";
import usersW from "../../../assets/superAdmin/Users IconW.svg";
import pricing from "../../../assets/superAdmin/Pricing Icon.png";
import integrations from "../../../assets/superAdmin/Integrations Icon.png";
import settings from "../../../assets/superAdmin/Settings Icon.png";
import webi from "../../../assets/superAdmin/Webflow Icon.png";
import person from "../../../assets/superAdmin/person.png";
import LogoutB from '../../../assets/superAdmin/logoutB.png';
import LogoutR from '../../../assets/superAdmin/logoutR.png';
import arrow_r from "../../../assets/superAdmin/Arrow Right.png";

import { Link, router } from "@inertiajs/react";

const SideMenu = () => {
    const [activeSubsection, setActiveSubsection] = useState("Reports"); // Default active
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isModelsOpen, setIsModelsOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [hoveredSection, setHoveredSection] = useState(null); // Track hovered section
    const [showLogoutModal, setShowLogoutModal] = useState(false); // State for logout modal

    useEffect(() => {
        if (window.location.pathname === "/SuperAdmin/Analytics") {
            setActiveSubsection("Analytics");
            setIsDashboardOpen(true);
        } else if (window.location.pathname === "/SuperAdmin/Users") {
            setActiveSubsection("Users");
        } else if (window.location.pathname === "/SuperAdmin/Dashboard") {
            setActiveSubsection("Reports");
            setIsDashboardOpen(true);
        } else if (window.location.pathname === "/SuperAdmin/Models") {
            setActiveSubsection("Models");
            setIsModelsOpen(true);
        } else if (window.location.pathname === "/SuperAdmin/Vehicles") {
            setActiveSubsection("Vehicles");
            setIsModelsOpen(true);
        } else if (window.location.pathname === "/SuperAdmin/Warehouse") {
            setActiveSubsection("Warehouse");
            setIsModelsOpen(true);
        } else if (window.location.pathname === "/SuperAdmin/Models/Courier") {
            setActiveSubsection("Courier");
            setIsModelsOpen(true);
        } else if (window.location.pathname === "/SuperAdmin/Models/Freight") {
            setActiveSubsection("Freight");
            setIsModelsOpen(true);
        } else if (window.location.pathname === "/SuperAdmin/Models/TicketBooking") {
            setActiveSubsection("TicketBooking");
            setIsModelsOpen(true);
        } else if (window.location.pathname === "/SuperAdmin/Models/Multimodel") {
            setActiveSubsection("Multimodel");
            setIsModelsOpen(true);
        } else if (window.location.pathname === "/superadmin/Vender") {
            setActiveSubsection("Vender");
        } else if (window.location.pathname === "/SuperAdmin/AccountSettings") {
            setActiveSubsection("AccountSettings");
            setIsAccountOpen(true);
        }
    }, [window.location.pathname]);

    const handleMenuClick = (menu) => {
        setActiveSubsection(menu);

        if (menu === "Dashboard") {
            setIsDashboardOpen((prev) => !prev); // toggle open/close
            setIsModelsOpen(false);
            setIsAccountOpen(false);
        } else if (menu === "Models") {
            setIsModelsOpen((prev) => !prev); // toggle open/close
            setIsDashboardOpen(false);
            setIsAccountOpen(false);
        } else if (menu === "AccountSettings") {
            setIsAccountOpen((prev) => !prev); // toggle open/close
            setIsDashboardOpen(false);
            setIsModelsOpen(false);
        } else {
            setIsDashboardOpen(false);
            setIsModelsOpen(false);
            setIsAccountOpen(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        router.post('/logout');
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <div className="w-[300px] h-[1000px] sm:w-[250px] md:w-[300px] lg:w-[300px]">
            <div className="flex flex-col gap-5 px-[28px] py-[32px] shadow-lg shadow-[#0105114D] sm:px-4 md:px-[28px] lg:px-[28px]">
                <Link
                    href="/SuperAdmin/Dashboard"
                    className="text-white text-[25px] font-bold poppins mb-8 sm:text-[20px] md:text-[25px] lg:text-[25px] cursor-pointer"
                    onClick={() => handleMenuClick("Dashboard")}
                >
                    COMPANY LOGO
                </Link>

                {/* Main Menu */}
                <div className="w-[244px] flex flex-col gap-2 py-[10px] sm:w-[200px] md:w-[244px] lg:w-[244px]">
                    {/* Dashboard */}
                    <div
                        className={`w-[244px] h-[42px] flex flex-row justify-between items-center gap-5 cursor-pointer rounded-md px-4 sm:w-[200px] md:w-[244px] lg:w-[244px] ${
                            activeSubsection === "Dashboard"
                                ? "bg-[#181A2A]"
                                : "hover:bg-[#181A2A]"
                        }`}
                        onClick={() => handleMenuClick("Dashboard")}
                        onMouseEnter={() => setHoveredSection("Dashboard")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <img
                                src={
                                    hoveredSection === "Dashboard" ||
                                    activeSubsection === "Dashboard"
                                        ? homepngW
                                        : homepng
                                }
                                className="size-[14px]"
                            />
                            <h1
                                className={`font-[500] text-[18px] ${
                                    activeSubsection === "Dashboard" ||
                                    hoveredSection === "Dashboard"
                                        ? "text-white"
                                        : "text-[#AEB9E1]"
                                }`}
                            >
                                Dashboard
                            </h1>
                        </div>
                        <img
                            src={isDashboardOpen ? drop : dropl}
                            className="size-[12px] transition-transform duration-300"
                            alt={isDashboardOpen ? "Collapse" : "Expand"}
                        />
                    </div>

                    {/* Dashboard Dropdown */}
                    <div
                        className={`flex flex-col gap-2 px-[8px] transition-all duration-300 ease-in-out overflow-hidden ${
                            isDashboardOpen
                                ? "max-h-[300px] opacity-100 py-4"
                                : "max-h-0 opacity-0 py-0"
                        }`}
                    >
                        <Link
                            href="/SuperAdmin/Dashboard"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "Reports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "Reports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("Reports")}
                            onMouseEnter={() => setHoveredSection("Reports")}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Reports
                        </Link>
                        <Link
                            href="/SuperAdmin/Analytics"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "Analytics"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "Analytics"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("Analytics")}
                            onMouseEnter={() => setHoveredSection("Analytics")}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Analytics
                        </Link>
                    </div>

                    {/* Models */}
                    <div
                        className={`w-[244px] h-[42px] flex flex-row justify-between items-center gap-5 cursor-pointer rounded-md px-4 ${
                            activeSubsection === "Models"
                                ? "bg-[#181A2A]"
                                : "hover:bg-[#181A2A]"
                        }`}
                        onClick={() => handleMenuClick("Models")}
                        onMouseEnter={() => setHoveredSection("Models")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <img
                                src={
                                    hoveredSection === "Models" ||
                                    activeSubsection === "Models"
                                        ? featuresW
                                        : features
                                }
                                className="size-[14px]"
                            />
                            <h1
                                className={`font-[500] text-[18px] ${
                                    activeSubsection === "Models" ||
                                    hoveredSection === "Models"
                                        ? "text-white"
                                        : "text-[#AEB9E1]"
                                }`}
                            >
                                Models
                            </h1>
                        </div>
                        <img
                            src={isModelsOpen ? drop : dropl}
                            className="size-[12px] transition-transform duration-300"
                            alt={isModelsOpen ? "Collapse" : "Expand"}
                        />
                    </div>

                    {/* Models Dropdown */}
                    <div
                        className={`flex flex-col gap-2 px-[8px] transition-all duration-300 ease-in-out overflow-hidden ${
                            isModelsOpen
                                ? "max-h-[300px] opacity-100 py-4"
                                : "max-h-0 opacity-0 py-0"
                        }`}
                    >
                        <Link
                            href="/SuperAdmin/Vehicles"
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "Vehicles"
                                    ? "text-white bg-[#181A2A]"
                                    : hoveredSection === "Vehicles"
                                    ? "text-white bg-[#181A2A]"
                                    : "text-[#AEB9E1]"
                            }`}
                            onClick={() => setActiveSubsection("Vehicles")}
                            onMouseEnter={() => setHoveredSection("Vehicles")}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Vehicles
                        </Link>
                        <Link
                            href="/SuperAdmin/Warehouse"
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "Warehouse"
                                    ? "text-white bg-[#181A2A]"
                                    : hoveredSection === "Warehouse"
                                    ? "text-white bg-[#181A2A]"
                                    : "text-[#AEB9E1]"
                            }`}
                            onClick={() => setActiveSubsection("Warehouse")}
                            onMouseEnter={() => setHoveredSection("Warehouse")}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Warehouse
                        </Link>
                        <Link
                            href="/SuperAdmin/Models/Courier"
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "Courier"
                                    ? "text-white bg-[#181A2A]"
                                    : hoveredSection === "Courier"
                                    ? "text-white bg-[#181A2A]"
                                    : "text-[#AEB9E1]"
                            }`}
                            onClick={() => setActiveSubsection("Courier")}
                            onMouseEnter={() => setHoveredSection("Courier")}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Courier
                        </Link>
                        <Link
                            href="/SuperAdmin/Models/Freight"
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "Freight"
                                    ? "text-white bg-[#181A2A]"
                                    : hoveredSection === "Freight"
                                    ? "text-white bg-[#181A2A]"
                                    : "text-[#AEB9E1]"
                            }`}
                            onClick={() => setActiveSubsection("Freight")}
                            onMouseEnter={() => setHoveredSection("Freight")}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Freight
                        </Link>
                        <Link
                            href="/SuperAdmin/Models/TicketBooking"
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "TicketBooking"
                                    ? "text-white bg-[#181A2A]"
                                    : hoveredSection === "TicketBooking"
                                    ? "text-white bg-[#181A2A]"
                                    : "text-[#AEB9E1]"
                            }`}
                            onClick={() => setActiveSubsection("TicketBooking")}
                            onMouseEnter={() => setHoveredSection("TicketBooking")}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Ticket booking
                        </Link>
                        <Link
                            href="/SuperAdmin/Models/Multimodel"
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "Multimodel"
                                    ? "text-white bg-[#181A2A]"
                                    : hoveredSection === "Multimodel"
                                    ? "text-white bg-[#181A2A]"
                                    : "text-[#AEB9E1]"
                            }`}
                            onClick={() => setActiveSubsection("Multimodel")}
                            onMouseEnter={() => setHoveredSection("Multimodel")}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Multimodel
                        </Link>
                    </div>

                    {/* Users */}
                    <Link
                        href="/SuperAdmin/Users"
                        className={`w-[244px] h-[42px] flex flex-row justify-between items-center cursor-pointer px-4 ${
                            activeSubsection === "Users"
                                ? "bg-[#181A2A] rounded-[10px]"
                                : "hover:bg-[#181A2A] hover:rounded-[10px]"
                        }`}
                        onClick={() => handleMenuClick("Users")}
                        onMouseEnter={() => setHoveredSection("Users")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <img
                                src={
                                    hoveredSection === "Users" ||
                                    activeSubsection === "Users"
                                        ? usersW
                                        : users
                                }
                                className="size-[14px]"
                            />
                            <h1
                                className={`font-[500] text-[18px] ${
                                    activeSubsection === "Users" ||
                                    hoveredSection === "Users"
                                        ? "text-white"
                                        : "text-[#AEB9E1]"
                                }`}
                            >
                                Users
                            </h1>
                        </div>
                        {/* <img src={dropl} className="size-[12px]" /> */}
                    </Link>

                    {/* Vender */}
                    <Link
                        href="/superadmin/Vender"
                        className={`w-[244px] h-[42px] flex flex-row justify-between items-center cursor-pointer px-4 ${
                            activeSubsection === "Vender"
                                ? "bg-[#181A2A] rounded-[10px]"
                                : "hover:bg-[#181A2A] hover:rounded-[10px]"
                        }`}
                        onClick={() => handleMenuClick("Vender")}
                        onMouseEnter={() => setHoveredSection("Vender")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <img
                                src={
                                    hoveredSection === "Vender" ||
                                    activeSubsection === "Vender"
                                        ? usersW
                                        : users
                                }
                                className="size-[14px]"
                            />
                            <h1
                                className={`font-[500] text-[18px] ${
                                    activeSubsection === "Vender" ||
                                    hoveredSection === "Vender"
                                        ? "text-white"
                                        : "text-[#AEB9E1]"
                                }`}
                            >
                                Vender
                            </h1>
                        </div>
                        {/* <img src={dropl} className="size-[12px]" /> */}
                    </Link>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="h-[1px] w-full bg-white/20"></div>
            <div className="px-[28px] sm:px-4 md:px-[28px] lg:px-[28px]">
                {/* Settings */}
                <div
                    className={`w-full h-[42px] flex flex-row justify-between items-center px-4 my-[15px] cursor-pointer rounded-md ${
                        hoveredSection === "Settings" ? "bg-[#181A2A]" : "hover:bg-[#181A2A]"
                    }`}
                    onClick={() => handleMenuClick("Settings")}
                    onMouseEnter={() => setHoveredSection("Settings")}
                    onMouseLeave={() => setHoveredSection(null)}
                >
                    <div className="flex flex-row items-center gap-2">
                        <img
                            src={settings}
                            className={`size-[14px] ${
                                hoveredSection === "Settings" || activeSubsection === "Settings"
                                    ? "filter brightness-0 invert"
                                    : ""
                            }`}
                        />
                        <h1
                            className={`font-[500] text-[18px] ${
                                activeSubsection === "Settings" || hoveredSection === "Settings"
                                    ? "text-white"
                                    : "text-[#AEB9E1]"
                            }`}
                        >
                            Settings
                        </h1>
                    </div>
                    <img src={dropl} className="size-[12px]" alt="Expand" />
                </div>

                {/* Account Settings */}
                <div
                    className={`w-full h-[42px] flex flex-row justify-between items-center px-4 my-[15px] cursor-pointer rounded-md ${
                        activeSubsection === "AccountSettings" ? "bg-[#181A2A]" : "hover:bg-[#181A2A]"
                    }`}
                    onClick={() => handleMenuClick("AccountSettings")}
                    onMouseEnter={() => setHoveredSection("AccountSettings")}
                    onMouseLeave={() => setHoveredSection(null)}
                >
                    <div className="flex flex-row items-center gap-2">
                        <img src={person} className="size-[30px]" alt="User Avatar" />
                        <h1
                            className={`flex flex-col text-[18px] font-[500] ${
                                activeSubsection === "AccountSettings" || hoveredSection === "AccountSettings"
                                    ? "text-white"
                                    : "text-[#AEB9E1]"
                            }`}
                        >
                            Jhone Carter
                            {/* <span
                                className={`text-[10px] ${
                                    activeSubsection === "AccountSettings" || hoveredSection === "AccountSettings"
                                        ? "text-white"
                                        : "text-[#AEB9E1]"
                                }`}
                            >
                                Account Settings
                            </span> */}
                        </h1>
                    </div>
                    <img
                        src={isAccountOpen ? drop : dropl}
                        className="size-[12px] transition-transform duration-300"
                        alt={isAccountOpen ? "Collapse" : "Expand"}
                    />
                </div>

                {/* Account Settings Dropdown */}
                <div
                    className={`flex flex-col gap-2 px-[8px] transition-all duration-300 ease-in-out overflow-hidden ${
                        isAccountOpen ? "max-h-[100px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
                    }`}
                >
                    <div
                        className={`text-[14px] font-[500] px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 ${
                            hoveredSection === "Logout"
                                ? "text-red-600 bg-[#181A2A]"
                                : "text-[#AEB9E1]"
                        }`}
                        onClick={handleLogout}
                        onMouseEnter={() => setHoveredSection("Logout")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <img
                            src={hoveredSection === "Logout" ? LogoutR : LogoutB}
                            className="size-[12px]"
                            alt="Logout Icon"
                        />
                        <span>Logout</span>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Confirm Logout
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to logout? You will need to sign in again to access your dashboard.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={cancelLogout}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SideMenu;
