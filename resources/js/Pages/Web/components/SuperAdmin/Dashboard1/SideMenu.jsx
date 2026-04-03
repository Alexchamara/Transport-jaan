import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import CompanyLogo from "../../CompanyLogo";
import ActionModalTemplate from "../Common/ActionModalTemplate";
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

import { Link, router, usePage } from "@inertiajs/react";

const SideMenu = () => {
    const { url } = usePage();
    const [activeSubsection, setActiveSubsection] = useState(""); // Default active
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [isServiceReportsOpen, setIsServiceReportsOpen] = useState(false);
    const [isUserReportsOpen, setIsUserReportsOpen] = useState(false);
    const [isModelsOpen, setIsModelsOpen] = useState(false);
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [hoveredSection, setHoveredSection] = useState(null); // Track hovered section
    const [actionModalState, setActionModalState] = useState({ isOpen: false, action: null });

    const updateSidebarState = (pathname) => {
        if (!pathname) pathname = window.location.pathname;
        
        if (pathname === "/SuperAdmin/Analytics") {
            setActiveSubsection("Analytics");
            setIsDashboardOpen(true);
        } else if (pathname === "/SuperAdmin/Users") {
            setActiveSubsection("Users");
            setIsUsersOpen(true);
        } else if (pathname === "/superadmin/users/clients") {
            setActiveSubsection("Clients");
            setIsUsersOpen(true);
        } else if (pathname === "/superadmin/users/service-providers") {
            setActiveSubsection("ServiceProviders");
            setIsUsersOpen(true);
        } else if (pathname === "/superadmin/users/drivers" || pathname.startsWith("/superadmin/users/drivers/")) {
            setActiveSubsection("Drivers");
            setIsUsersOpen(true);
        } else if (pathname === "/SuperAdmin/reports/vehicles") {
            setActiveSubsection("VehicleReports");
            setIsReportsOpen(true);
            setIsServiceReportsOpen(true);
        } else if (pathname === "/SuperAdmin/reports/tickets") {
            setActiveSubsection("TicketReports");
            setIsReportsOpen(true);
            setIsServiceReportsOpen(true);
        } else if (pathname === "/SuperAdmin/reports/warehouse") {
            setActiveSubsection("WarehouseReports");
            setIsReportsOpen(true);
            setIsServiceReportsOpen(true);
        } else if (pathname === "/SuperAdmin/reports/multimodal") {
            setActiveSubsection("MultimodalReports");
            setIsReportsOpen(true);
            setIsServiceReportsOpen(true);
        } else if (pathname === "/SuperAdmin/reports/courier") {
            setActiveSubsection("CourierReports");
            setIsReportsOpen(true);
            setIsServiceReportsOpen(true);
        } else if (pathname === "/SuperAdmin/reports/freight") {
            setActiveSubsection("FreightReports");
            setIsReportsOpen(true);
            setIsServiceReportsOpen(true);
        } else if (pathname === "/SuperAdmin/reports/users/clients") {
            setActiveSubsection("ClientReports");
            setIsReportsOpen(true);
            setIsUserReportsOpen(true);
        } else if (pathname === "/SuperAdmin/reports/users/service-providers") {
            setActiveSubsection("ServiceProviderReports");
            setIsReportsOpen(true);
            setIsUserReportsOpen(true);
        } else if (pathname === "/SuperAdmin/reports/users/drivers") {
            setActiveSubsection("DriversReports");
            setIsReportsOpen(true);
            setIsUserReportsOpen(true);
        } else if (pathname === "/SuperAdmin/Models") {
            setActiveSubsection("Models");
            setIsModelsOpen(true);
        } else if (pathname === "/superadmin/Vehicles") {
            setActiveSubsection("Vehicles");
            setIsModelsOpen(true);
        } else if (pathname === "/SuperAdmin/Warehouse") {
            setActiveSubsection("Warehouse");
            setIsModelsOpen(true);
        } else if (pathname === "/SuperAdmin/Models/Courier") {
            setActiveSubsection("Courier");
            setIsModelsOpen(true);
        } else if (pathname === "/SuperAdmin/Models/Freight") {
            setActiveSubsection("Freight");
            setIsModelsOpen(true);
        } else if (pathname === "/SuperAdmin/Models/TicketBooking") {
            setActiveSubsection("TicketBooking");
            setIsModelsOpen(true);
        } else if (pathname === "/SuperAdmin/Models/Multimodel") {
            setActiveSubsection("Multimodel");
            setIsModelsOpen(true);
        } else if (pathname === "/superadmin/Vender" || pathname === "/SuperAdmin/Vender") {
            setActiveSubsection("Vender");
        } else if (pathname === "/SuperAdmin/AccountSettings") {
            setActiveSubsection("AccountSettings");
            setIsAccountOpen(true);
        } else if (pathname === "/superadmin/profile") {
            setActiveSubsection("Profile");
            setIsAccountOpen(true);
        } else if (pathname === "/superadmin/settings/cancellation" || pathname === "/SuperAdmin/settings/cancellation") {
            setActiveSubsection("CancellationSettings");
            setIsSettingsOpen(true);
        } else if (pathname === "/superadmin/settings/commission" || pathname === "/SuperAdmin/settings/commission") {
            setActiveSubsection("CommissionSettings");
            setIsSettingsOpen(true);
        } else if (pathname === "/superadmin/settings/website" || pathname === "/SuperAdmin/settings/website") {
            setActiveSubsection("WebsiteSettings");
            setIsSettingsOpen(true);
        } else if (pathname === "/superadmin/settings/cod-settlement" || pathname === "/SuperAdmin/settings/cod-settlement") {
            setActiveSubsection("CodSettlementSettings");
            setIsSettingsOpen(true);
        }
    };


    // Update sidebar state on mount and when URL changes
    useEffect(() => {
        updateSidebarState(url);
    }, [url]);

    const handleMenuClick = (menu) => {
        setActiveSubsection(menu);

        if (menu === "Dashboard") {
            setIsDashboardOpen((prev) => !prev); // toggle open/close
            setIsReportsOpen(false);
            setIsModelsOpen(false);
            setIsSettingsOpen(false);
            setIsAccountOpen(false);
        } else if (menu === "Reports") {
            setIsReportsOpen((prev) => !prev); // toggle open/close
            setIsServiceReportsOpen(false);
            setIsUserReportsOpen(false);
            setIsDashboardOpen(false);
            setIsModelsOpen(false);
            setIsSettingsOpen(false);
            setIsAccountOpen(false);
        } else if (menu === "Models") {
            setIsModelsOpen((prev) => !prev); // toggle open/close
            setIsDashboardOpen(false);
            setIsReportsOpen(false);
            setIsUsersOpen(false);
            setIsSettingsOpen(false);
            setIsAccountOpen(false);
        } else if (menu === "Users") {
            setIsUsersOpen((prev) => !prev); // toggle open/close
            setIsDashboardOpen(false);
            setIsReportsOpen(false);
            setIsModelsOpen(false);
            setIsSettingsOpen(false);
            setIsAccountOpen(false);
        } else if (menu === "Settings") {
            setIsSettingsOpen((prev) => !prev); // toggle open/close
            setIsDashboardOpen(false);
            setIsReportsOpen(false);
            setIsModelsOpen(false);
            setIsUsersOpen(false);
            setIsAccountOpen(false);
        } else if (menu === "AccountSettings") {
            setIsAccountOpen((prev) => !prev); // toggle open/close
            setIsDashboardOpen(false);
            setIsReportsOpen(false);
            setIsModelsOpen(false);
            setIsUsersOpen(false);
            setIsSettingsOpen(false);
        } else {
            setIsDashboardOpen(false);
            setIsReportsOpen(false);
            setIsModelsOpen(false);
            setIsUsersOpen(false);
            setIsSettingsOpen(false);
            setIsAccountOpen(false);
        }
    };

    const actionModalConfig = {
        logout: {
            title: 'Confirm Logout',
            description: 'Are you sure you want to logout? You will need to sign in again to access your dashboard.',
            confirmText: 'Logout',
            confirmClassName: 'bg-red-600 hover:bg-red-700',
        },
    };

    const handleLogout = () => {
        setActionModalState({ isOpen: true, action: 'logout' });
    };

    const handleActionConfirm = () => {
        if (actionModalState.action === 'logout') {
            localStorage.removeItem('adminDashboardLoaded');
            router.post(route('logout'));
        }
        setActionModalState({ isOpen: false, action: null });
    };

    const handleActionCancel = () => {
        setActionModalState({ isOpen: false, action: null });
    };

    return (
        <div className="w-[300px] min-h-screen sm:w-[250px] md:w-[300px] lg:w-[300px]">
            <div className="flex flex-col gap-0 px-[28px] py-[32px] shadow-lg shadow-[#0105114D] sm:px-4 md:px-[28px] lg:px-[28px]">
                <Link
                    href="/"
                    className="cursor-pointer"
                    onClick={() => handleMenuClick("Dashboard")}
                >
                    <CompanyLogo enableLink={false} className='h-[200px] object-contain' fallbackClassName='text-white text-[25px] font-bold poppins sm:text-[20px] md:text-[25px] lg:text-[25px]' />
                </Link>

                {/* Main Menu */}
                <div className="w-[244px] flex flex-col gap-2 mt-2 sm:w-[200px] md:w-[244px] lg:w-[244px]">
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

                    {/* Reports */}
                    <div
                        className={`w-[244px] h-[42px] flex flex-row justify-between items-center gap-5 cursor-pointer rounded-md px-4 sm:w-[200px] md:w-[244px] lg:w-[244px] ${
                            activeSubsection === "Reports" || isReportsOpen
                                ? "bg-[#181A2A]"
                                : "hover:bg-[#181A2A]"
                        }`}
                        onClick={() => handleMenuClick("Reports")}
                        onMouseEnter={() => setHoveredSection("Reports")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <img
                                src={
                                    hoveredSection === "Reports" ||
                                    activeSubsection === "Reports" || isReportsOpen
                                        ? featuresW
                                        : features
                                }
                                className="size-[14px]"
                            />
                            <h1
                                className={`font-[500] text-[18px] ${
                                    activeSubsection === "Reports" ||
                                    hoveredSection === "Reports" || isReportsOpen
                                        ? "text-white"
                                        : "text-[#AEB9E1]"
                                }`}
                            >
                                Reports
                            </h1>
                        </div>
                        <img
                            src={isReportsOpen ? drop : dropl}
                            className="size-[12px] transition-transform duration-300"
                            alt={isReportsOpen ? "Collapse" : "Expand"}
                        />
                    </div>

                    {/* Reports Dropdown */}
                    <div
                        className={`flex flex-col gap-2 px-[8px] transition-all duration-300 ease-in-out overflow-hidden ${
                            isReportsOpen
                                ? "max-h-[900px] opacity-100 py-4"
                                : "max-h-0 opacity-0 py-0"
                        }`}
                    >
                        <div
                            className="flex items-center justify-between cursor-pointer rounded-md px-4 py-2 hover:bg-[#181A2A]"
                            onClick={() => setIsServiceReportsOpen((prev) => !prev)}
                        >
                            <div className="text-[12px] font-[600] uppercase tracking-[0.08em] text-[#6E7A9A]">
                                Service Reports
                            </div>
                            <img
                                src={isServiceReportsOpen ? drop : dropl}
                                className="size-[12px] transition-transform duration-300"
                                alt={isServiceReportsOpen ? "Collapse" : "Expand"}
                            />
                        </div>
                        <div
                            className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
                                isServiceReportsOpen ? "max-h-[520px] opacity-100 pb-2" : "max-h-0 opacity-0"
                            }`}
                        >
                        <Link
                            href="/SuperAdmin/reports/vehicles"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "VehicleReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "VehicleReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("VehicleReports")}
                            onMouseEnter={() => setHoveredSection("VehicleReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Vehicle Rental Report
                        </Link>
                        <Link
                            href="/SuperAdmin/reports/tickets"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "TicketReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "TicketReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("TicketReports")}
                            onMouseEnter={() => setHoveredSection("TicketReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Ticket Booking Report
                        </Link>
                        <Link
                            href="/SuperAdmin/reports/warehouse"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "WarehouseReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "WarehouseReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("WarehouseReports")}
                            onMouseEnter={() => setHoveredSection("WarehouseReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Warehousing Report
                        </Link>
                        <Link
                            href="/SuperAdmin/reports/multimodal"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "MultimodalReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "MultimodalReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("MultimodalReports")}
                            onMouseEnter={() => setHoveredSection("MultimodalReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Multimodal Report
                        </Link>
                        <Link
                            href="/SuperAdmin/reports/courier"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "CourierReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "CourierReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("CourierReports")}
                            onMouseEnter={() => setHoveredSection("CourierReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Courier Report
                        </Link>
                        <Link
                            href="/SuperAdmin/reports/freight"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "FreightReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "FreightReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("FreightReports")}
                            onMouseEnter={() => setHoveredSection("FreightReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Freight Report
                        </Link>
                        </div>

                        <div
                            className="mt-2 flex items-center justify-between cursor-pointer rounded-md px-4 py-2 hover:bg-[#181A2A]"
                            onClick={() => setIsUserReportsOpen((prev) => !prev)}
                        >
                            <div className="text-[12px] font-[600] uppercase tracking-[0.08em] text-[#6E7A9A]">
                                User Reports
                            </div>
                            <img
                                src={isUserReportsOpen ? drop : dropl}
                                className="size-[12px] transition-transform duration-300"
                                alt={isUserReportsOpen ? "Collapse" : "Expand"}
                            />
                        </div>
                        <div
                            className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
                                isUserReportsOpen ? "max-h-[180px] opacity-100 pb-2" : "max-h-0 opacity-0"
                            }`}
                        >
                        <Link
                            href="/SuperAdmin/reports/users/clients"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "ClientReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "ClientReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("ClientReports")}
                            onMouseEnter={() => setHoveredSection("ClientReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Client Report
                        </Link>
                        <Link
                            href="/SuperAdmin/reports/users/service-providers"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "ServiceProviderReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "ServiceProviderReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("ServiceProviderReports")}
                            onMouseEnter={() => setHoveredSection("ServiceProviderReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Service Provider Report
                        </Link>
                        <Link
                            href="/SuperAdmin/reports/users/drivers"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "DriversReports"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "DriversReports"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("DriversReports")}
                            onMouseEnter={() => setHoveredSection("DriversReports")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Drivers Report
                        </Link>
                        </div>
                    </div>

                    {/* Models */}
                    <div
                        className={`w-[244px] h-[42px] flex flex-row justify-between items-center gap-5 cursor-pointer rounded-md px-4 ${
                            isModelsOpen || activeSubsection === "Vehicles" || activeSubsection === "Warehouse" || activeSubsection === "Courier" || activeSubsection === "Freight" || activeSubsection === "TicketBooking" || activeSubsection === "Multimodel"
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
                                    isModelsOpen ||
                                    activeSubsection === "Vehicles" ||
                                    activeSubsection === "Warehouse" ||
                                    activeSubsection === "Courier" ||
                                    activeSubsection === "Freight" ||
                                    activeSubsection === "TicketBooking" ||
                                    activeSubsection === "Multimodel"
                                        ? featuresW
                                        : features
                                }
                                className="size-[14px]"
                            />
                            <h1
                                className={`font-[500] text-[18px] ${
                                    isModelsOpen ||
                                    hoveredSection === "Models" ||
                                    activeSubsection === "Vehicles" ||
                                    activeSubsection === "Warehouse" ||
                                    activeSubsection === "Courier" ||
                                    activeSubsection === "Freight" ||
                                    activeSubsection === "TicketBooking" ||
                                    activeSubsection === "Multimodel"
                                        ? "text-white"
                                        : "text-[#AEB9E1]"
                                }`}
                            >
                                Services 
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
                            href="/superadmin/Vehicles"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "Vehicles"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "Vehicles"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("Vehicles")}
                            onMouseEnter={() => setHoveredSection("Vehicles")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Vehicles
                        </Link>
                        <Link
                            href="/SuperAdmin/Warehouse"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "Warehouse"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "Warehouse"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("Warehouse")}
                            onMouseEnter={() => setHoveredSection("Warehouse")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Warehouse
                        </Link>
                        {/* ❌ COURIER - Hidden by user request
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
                        */}
                        {/* ❌ FREIGHT - Hidden by user request
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
                        */}
                        {/* ❌ TICKET BOOKING - Hidden by user request
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
                        */}
                        {/* ❌ MULTIMODEL - Hidden by user request
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
                        */}
                    </div>

                    {/* Users */}
                    <div
                        className={`w-[244px] h-[42px] flex flex-row justify-between items-center gap-5 cursor-pointer rounded-md px-4 sm:w-[200px] md:w-[244px] lg:w-[244px] ${
                            activeSubsection === "Users" || isUsersOpen
                                ? "bg-[#181A2A]"
                                : "hover:bg-[#181A2A]"
                        }`}
                        onClick={() => handleMenuClick("Users")}
                        onMouseEnter={() => setHoveredSection("Users")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <img
                                src={
                                    hoveredSection === "Users" ||
                                    activeSubsection === "Users" || isUsersOpen
                                        ? usersW
                                        : users
                                }
                                className="size-[14px]"
                            />
                            <h1
                                className={`font-[500] text-[18px] ${
                                    activeSubsection === "Users" ||
                                    hoveredSection === "Users" || isUsersOpen
                                        ? "text-white"
                                        : "text-[#AEB9E1]"
                                }`}
                            >
                                Users
                            </h1>
                        </div>
                        <img
                            src={isUsersOpen ? drop : dropl}
                            className="size-[12px] transition-transform duration-300"
                            alt={isUsersOpen ? "Collapse" : "Expand"}
                        />
                    </div>

                    {/* Users Dropdown */}
                    <div
                        className={`flex flex-col gap-2 px-[8px] transition-all duration-300 ease-in-out overflow-hidden ${
                            isUsersOpen
                                ? "max-h-[200px] opacity-100 py-4"
                                : "max-h-0 opacity-0 py-0"
                        }`}
                    >
                        <Link
                            href="/superadmin/users/clients"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "Clients"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "Clients"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("Clients")}
                            onMouseEnter={() => setHoveredSection("Clients")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Clients
                        </Link>
                        <Link
                            href="/superadmin/users/service-providers"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "ServiceProviders"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "ServiceProviders"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("ServiceProviders")}
                            onMouseEnter={() => setHoveredSection("ServiceProviders")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Service Providers
                        </Link>
                        <Link
                            href="/superadmin/users/drivers"
                            className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer ${
                                activeSubsection === "Drivers"
                                    ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                    : hoveredSection === "Drivers"
                                    ? "text-white bg-[#181A2A] border-l-transparent"
                                    : "text-[#AEB9E1] border-l-transparent"
                            }`}
                            onClick={() => setActiveSubsection("Drivers")}
                            onMouseEnter={() => setHoveredSection("Drivers")}
                            onMouseLeave={() => setHoveredSection(null)}
                            preserveState
                            preserveScroll
                        >
                            Drivers
                        </Link>
                    </div>

                    {/* Vender */}
                    {/* <Link
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
                        </div> */}
                        {/* <img src={dropl} className="size-[12px]" /> */}
                    {/* </Link> */}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="h-[1px] w-full bg-white/20"></div>
            <div className="px-[28px] sm:px-4 md:px-[28px] lg:px-[28px]">
                {/* Settings */}
                <div
                    className={`w-full h-[42px] flex flex-row justify-between items-center px-4 my-[15px] cursor-pointer rounded-md ${
                        activeSubsection === "Settings"
                        || activeSubsection === "CancellationSettings"
                        || activeSubsection === "CodSettlementSettings"
                        || activeSubsection === "CommissionSettings"
                        || activeSubsection === "WebsiteSettings"
                            ? "bg-[#181A2A]"
                            : "hover:bg-[#181A2A]"
                    }`}
                    onClick={() => handleMenuClick("Settings")}
                    onMouseEnter={() => setHoveredSection("Settings")}
                    onMouseLeave={() => setHoveredSection(null)}
                >
                    <div className="flex flex-row items-center gap-2">
                        <img
                            src={settings}
                            className={`size-[14px] ${
                                hoveredSection === "Settings"
                                || activeSubsection === "Settings"
                                || activeSubsection === "CancellationSettings"
                                || activeSubsection === "CodSettlementSettings"
                                || activeSubsection === "CommissionSettings"
                                || activeSubsection === "WebsiteSettings"
                                    ? "filter brightness-0 invert"
                                    : ""
                            }`}
                        />
                        <h1
                            className={`font-[500] text-[18px] ${
                                activeSubsection === "Settings"
                                || hoveredSection === "Settings"
                                || activeSubsection === "CancellationSettings"
                                || activeSubsection === "CodSettlementSettings"
                                || activeSubsection === "CommissionSettings"
                                || activeSubsection === "WebsiteSettings"
                                    ? "text-white"
                                    : "text-[#AEB9E1]"
                            }`}
                        >
                            Settings
                        </h1>
                    </div>
                    <img
                        src={isSettingsOpen ? drop : dropl}
                        className="size-[12px] transition-transform duration-300"
                        alt={isSettingsOpen ? "Collapse" : "Expand"}
                    />
                </div>

                {/* Settings Dropdown */}
                <div
                    className={`flex flex-col gap-2 px-[8px] transition-all duration-300 ease-in-out overflow-hidden ${
                        isSettingsOpen ? "max-h-[320px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
                    }`}
                >
                    <Link
                        href="/SuperAdmin/settings/cancellation"
                        className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer rounded-md ${
                            activeSubsection === "CancellationSettings"
                                ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                : hoveredSection === "CancellationSettings"
                                ? "text-white bg-[#181A2A] border-l-transparent"
                                : "text-[#AEB9E1] border-l-transparent"
                        }`}
                        onClick={() => setActiveSubsection("CancellationSettings")}
                        onMouseEnter={() => setHoveredSection("CancellationSettings")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        Cancellation Settings
                    </Link>

                    <Link
                        href="/superadmin/settings/cod-settlement"
                        className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer rounded-md ${
                            activeSubsection === "CodSettlementSettings"
                                ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                : hoveredSection === "CodSettlementSettings"
                                ? "text-white bg-[#181A2A] border-l-transparent"
                                : "text-[#AEB9E1] border-l-transparent"
                        }`}
                        onClick={() => setActiveSubsection("CodSettlementSettings")}
                        onMouseEnter={() => setHoveredSection("CodSettlementSettings")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        COD Settlement
                    </Link>

                    <Link
                        href="/SuperAdmin/payments"
                        className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer rounded-md ${
                            activeSubsection === "Payments"
                                ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                : hoveredSection === "Payments"
                                ? "text-white bg-[#181A2A] border-l-transparent"
                                : "text-[#AEB9E1] border-l-transparent"
                        }`}
                        onClick={() => setActiveSubsection("Payments")}
                        onMouseEnter={() => setHoveredSection("Payments")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        Payments
                    </Link>

                    <Link
                        href="/superadmin/settings/commission"
                        className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer rounded-md ${
                            activeSubsection === "CommissionSettings"
                                ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                : hoveredSection === "CommissionSettings"
                                ? "text-white bg-[#181A2A] border-l-transparent"
                                : "text-[#AEB9E1] border-l-transparent"
                        }`}
                        onClick={() => setActiveSubsection("CommissionSettings")}
                        onMouseEnter={() => setHoveredSection("CommissionSettings")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        Commission Settings
                    </Link>

                    <Link
                        href="/superadmin/settings/website"
                        className={`text-[14px] font-[500] px-4 py-2 border-l-[3px] cursor-pointer rounded-md ${
                            activeSubsection === "WebsiteSettings"
                                ? "text-white border-l-[#0955AC] bg-[#181A2A] border border-[#0A1330]"
                                : hoveredSection === "WebsiteSettings"
                                ? "text-white bg-[#181A2A] border-l-transparent"
                                : "text-[#AEB9E1] border-l-transparent"
                        }`}
                        onClick={() => setActiveSubsection("WebsiteSettings")}
                        onMouseEnter={() => setHoveredSection("WebsiteSettings")}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
                        Website Settings
                    </Link>
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
                        isAccountOpen ? "max-h-[200px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
                    }`}
                >
                    {/* Profile Link */}
                    <Link
                        href="/superadmin/profile"
                        className={`text-[14px] font-[500] px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 ${
                            activeSubsection === "Profile"
                                ? "text-white bg-[#181A2A]"
                                : hoveredSection === "Profile"
                                ? "text-white bg-[#181A2A]"
                                : "text-[#AEB9E1]"
                        }`}
                        onMouseEnter={() => setHoveredSection("Profile")}
                        onMouseLeave={() => setHoveredSection(null)}
                        preserveState
                        preserveScroll
                    >
                        <img
                            src={person}
                            className="size-[12px]"
                            alt="Profile Icon"
                        />
                        <span>Profile</span>
                    </Link>

                    {/* Logout Link */}
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

            {/* Action Modal Template */}
            <AnimatePresence>
                {actionModalState.isOpen && (
                    <ActionModalTemplate
                        title={actionModalConfig[actionModalState.action]?.title}
                        description={actionModalConfig[actionModalState.action]?.description}
                        confirmText={actionModalConfig[actionModalState.action]?.confirmText}
                        confirmClassName={actionModalConfig[actionModalState.action]?.confirmClassName}
                        onConfirm={handleActionConfirm}
                        onClose={handleActionCancel}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SideMenu;
