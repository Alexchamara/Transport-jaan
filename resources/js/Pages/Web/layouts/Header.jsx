import React, { useState, useEffect } from "react";
import CompanyLogo from "../components/CompanyLogo";
import { router, usePage, Link } from "@inertiajs/react";
import downArrow from "../assets/rentAVehicle/header/downArrow.png";
import proPic from "../assets/header/profilePic.svg";
import bell from "../assets/header/bell.svg";
import search from "../assets/header/search.svg";
import useCSRFRefresh from "../../../hooks/useCSRFRefresh.js";
import NotificationDropdown from "../components/vendors/warehouse/NotificationDropdown";
import { API_BASE_URL } from "../../../config/api";

const Header = () => {
    const { auth } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // ---------- Dropdown state ----------
    const [openDropdown, setOpenDropdown] = useState({
        vehicle: false,
        ticket: false,
        courier: false,
    });

    const toggleDropdown = (key) => {
        setOpenDropdown((prev) => ({
            vehicle: key === "vehicle" ? !prev.vehicle : false,
            ticket: key === "ticket" ? !prev.ticket : false,
            courier: key === "courier" ? !prev.courier : false,
        }));
    };

    // ---------- Fetch notifications ----------
    useEffect(() => {
        if (auth?.user) {
            fetchNotifications();
            // Refresh notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [auth?.user]);

    const fetchNotifications = async () => {
        try {
            console.log('Fetching warehouse notifications...');
            const response = await fetch(`${API_BASE_URL}vendors/warehouse/notifications/data`);
            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Notifications data:', data);
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            } else {
                console.error('Failed to fetch notifications:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // ---------- CSRF & Logout ----------
    useCSRFRefresh();

    const refreshCSRFToken = async () => {
        try {
            const response = await fetch("/csrf-token");
            const data = await response.json();
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) metaTag.setAttribute("content", data.token);
            return data.token;
        } catch (error) {
            console.error("Failed to refresh CSRF token:", error);
            return null;
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();

        const attemptLogout = () => {
            router.post(
                route("logout"),
                {},
                {
                    onError: async (errors) => {
                        console.warn(
                            "POST logout failed, trying to refresh CSRF token...",
                            errors
                        );
                        if (
                            errors &&
                            (errors.message?.includes("CSRF") ||
                                errors.message?.includes("expired"))
                        ) {
                            const newToken = await refreshCSRFToken();
                            if (newToken) {
                                router.post(
                                    route("logout"),
                                    {},
                                    {
                                        onError: () =>
                                            (window.location.href =
                                                route("logout.alt")),
                                        onSuccess: () =>
                                            (window.location.href = "/"),
                                    }
                                );
                            } else {
                                window.location.href = route("logout.alt");
                            }
                        } else {
                            window.location.href = route("logout.alt");
                        }
                    },
                    onSuccess: () => (window.location.href = "/"),
                }
            );
        };
        attemptLogout();
    };

    // ---------- Menu toggle ----------
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // ---------- Smooth scroll ----------
    const handleScrollTo = (id) => {
        if (
            window.location.pathname === "/" ||
            window.location.pathname === "/home"
        ) {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                setIsMenuOpen(false);
            }
        } else {
            router.visit(`/#${id}`);
        }
    };

    // Auto-scroll when page loads with a hash
    useEffect(() => {
        const hash = window.location.hash.substring(1);
        if (
            hash &&
            ["home", "about", "services", "blog", "contact"].includes(hash)
        ) {
            setTimeout(() => {
                const el = document.getElementById(hash);
                if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 300);
        }
    }, []);

    return (
        <header className="relative z-50 w-full h-auto py-[5px]">
            {/* ---------- Top bar (logo + hamburger + icons) ---------- */}
            <div className="poppins font-[500] px-3 sm:px-4 md:px-6 lg:px-10 py-2 sm:py-4 flex items-center justify-between relative">
                {/* Hamburger */}
                {!isMenuOpen && (
                    <div className="size-[55px] rounded-full bg-[#E8EBEF] flex justify-center items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-[#000000] hover:text-[#0955AC] focus:outline-none z-30"
                        >
                            <svg
                                className="w-7 h-7 sm:w-8 sm:h-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Logo */}
                <div
                    onClick={() => router.visit("/")}
                    className="absolute left-1/2 transform -translate-x-1/2 text-center cursor-pointer transition-colors"
                    style={{ minWidth: "120px" }}
                >
                    <CompanyLogo className="h-[100px] object-contain" fallbackClassName="text-[16px] sm:text-[20px] md:text-[25px] lg:text-[30px] font-[700] text-black" />
                </div>

                {/* Desktop icons */}
                <div className="md:flex hidden flex-row gap-5 justify-center items-center">
                    <NotificationDropdown
                        notifications={notifications}
                        unreadCount={unreadCount}
                    />
                     <div className="size-[27px] md:size-[55px] rounded-full overflow-hidden bg-[#E8EBEF] flex justify-center items-center" onClick={() => router.visit("/settingsPage")}>
                        {auth?.user?.image ? (
                            <img
                                src={auth.user.image}
                                className="size-[18px] md:size-[55px] object-cover"
                                alt="Profile"
                            />
                        ) : (
                            <img
                                src={proPic}
                                className="size-[18px] md:size-[55px]"
                                alt="Profile"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Mobile overlay menu ---------- */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-20 flex justify-end">
                    <div className="w-[300px] max-w-full h-full rounded-r-[20px] bg-white shadow-lg py-10 px-8 flex flex-col space-y-4 animate-slide-in relative">
                        {/* Close button */}
                        <button
                            onClick={toggleMenu}
                            className="absolute top-7 right-4 p-2 text-gray-600 hover:text-[#EF3826] focus:outline-none z-50"
                        >
                            <svg
                                className="w-[22px] h-[18px]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* ---------- Navigation ---------- */}
                        <nav className="flex flex-col space-y-8 text-[#000000cc] text-[15px] font-[700]">
                            {/* Vehicle Rental */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => toggleDropdown("vehicle")}
                                    className="hover:text-[#0955AC] flex items-center gap-5 cursor-pointer w-full text-left focus:outline-none"
                                    aria-expanded={openDropdown.vehicle}
                                    aria-controls="vehicle-dropdown"
                                >
                                    Vehicle Rental
                                    <img
                                        src={downArrow}
                                        alt="dropdown"
                                        className={`w-[8px] h-[5px] transition-transform duration-200 ${
                                            openDropdown.vehicle
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {openDropdown.vehicle && (
                                    <div
                                        id="vehicle-dropdown"
                                        className="ml-4 mt-1 flex flex-col space-y-1"
                                    >
                                        <Link
                                            href="/multiModel/plan-journey"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Land
                                        </Link>
                                        <Link
                                            href="/multiModel/plan-journey"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Air
                                        </Link>
                                        <Link
                                            href="/multiModel/plan-journey"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Sea
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Ticket Booking */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => toggleDropdown("ticket")}
                                    className="hover:text-[#0955AC] flex items-center gap-5 cursor-pointer w-full text-left focus:outline-none"
                                    aria-expanded={openDropdown.ticket}
                                    aria-controls="ticket-dropdown"
                                >
                                    Ticket Booking
                                    <img
                                        src={downArrow}
                                        alt="dropdown"
                                        className={`w-[8px] h-[5px] transition-transform duration-200 ${
                                            openDropdown.ticket
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {openDropdown.ticket && (
                                    <div
                                        id="ticket-dropdown"
                                        className="ml-4 mt-1 flex flex-col space-y-1"
                                    >
                                        <Link
                                            href="/multiModel/plan-journey"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Flight
                                        </Link>
                                        <Link
                                            href="/multiModel/plan-journey"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Train
                                        </Link>
                                        <Link
                                            href="/multiModel/plan-journey"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Bus
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Courier Booking */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => toggleDropdown("courier")}
                                    className="hover:text-[#0955AC] flex items-center gap-5 cursor-pointer w-full text-left focus:outline-none"
                                    aria-expanded={openDropdown.courier}
                                    aria-controls="courier-dropdown"
                                >
                                    Courier Booking
                                    <img
                                        src={downArrow}
                                        alt="dropdown"
                                        className={`w-[8px] h-[5px] transition-transform duration-200 ${
                                            openDropdown.courier
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {openDropdown.courier && (
                                    <div
                                        id="courier-dropdown"
                                        className="ml-4 mt-1 flex flex-col space-y-1"
                                    >
                                        <Link
                                            href="/courierBookingDashboard"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Domestic
                                        </Link>
                                        <Link
                                            href="/courierBookingDashboard"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Logistic
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/warehouseList"
                                className="hover:text-[#0955AC]"
                            >
                                Warehouse Booking
                            </Link>
                            <Link
                                href="/freightBookingDashboard"
                                className="hover:text-[#0955AC]"
                            >
                                Freight Booking
                            </Link>
                            <Link
                                href="/clientDashboardSettings"
                                className="hover:text-[#0955AC]"
                            >
                                Settings
                            </Link>

                            {/* Keep the scroll-to-section links (Home, About Us, …) */}
                            <div className="border-t pt-4 space-y-3">
                                <div
                                    className="hover:text-[#0955AC] cursor-pointer"
                                    onClick={() => handleScrollTo("home")}
                                >
                                    Home
                                </div>
                                <div
                                    className="hover:text-[#0955AC] cursor-pointer"
                                    onClick={() => handleScrollTo("about")}
                                >
                                    About Us
                                </div>
                                <div
                                    className="hover:text-[#0955AC] cursor-pointer"
                                    onClick={() => handleScrollTo("services")}
                                >
                                    Our Services
                                </div>
                                <div
                                    className="hover:text-[#0955AC] cursor-pointer"
                                    onClick={() => handleScrollTo("blog")}
                                >
                                    Blog
                                </div>
                                <div
                                    className="hover:text-[#0955AC] cursor-pointer"
                                    onClick={() => handleScrollTo("contact")}
                                >
                                    Contact Us
                                </div>
                            </div>
                        </nav>

                        {/* ---------- Auth / Dashboard section ---------- */}
                        <div className="border-t pt-10 flex flex-col space-y-2">
                            {auth?.user ? (
                                <>
                                    {/* Role-based dashboard */}
                                    {auth.user.role_type === "driver" && (
                                        <Link
                                            href="/driver/dashboard"
                                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-white text-[12px] font-medium"
                                        >
                                            Driver Dashboard
                                        </Link>
                                    )}
                                    {auth.user.role_type === "user" && (
                                        <Link
                                            href="/clientAllBookings"
                                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-white text-[12px] font-medium"
                                        >
                                            User Dashboard
                                        </Link>
                                    )}
                                    {["admin", "superadmin"].includes(
                                        auth.user.role_type
                                    ) && (
                                        <Link
                                            href="/admin"
                                            className="rounded bg-[#0955AC] border-2 border-[#0955AC] px-3 py-2 text-white text-[12px] font-bold text-center"
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    {auth.user.role_type === "freight" && (
                                        <Link
                                            href="/freight/dashboard"
                                            className="rounded bg-[#0955AC] border-2 border-[#0955AC] px-3 py-2 text-white text-[12px] font-bold text-center"
                                        >
                                            Freight Dashboard
                                        </Link>
                                    )}

                                    {/* User avatar + logout */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-7 w-7 border border-black rounded-full flex justify-center items-center text-[14px]">
                                            {auth.user.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <img
                                            src={downArrow}
                                            alt="dropdown"
                                            className="w-[8px] h-[5px]"
                                        />
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-[#EF3826] w-full h-[40px] hover:bg-red-700 px-3 py-2 rounded text-white text-[12px] font-bold mt-2"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/signin"
                                        className="h-[40px] border-2 border-[#0955AC] rounded-[10px] px-3 py-2 text-[#0955AC] text-[12px] font-bold hover:bg-[#0955AC] hover:text-white flex justify-center items-center"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="bg-[#0955AC] h-[40px] rounded-[10px] border-2 border-[#0955AC] px-3 py-2 text-white font-bold text-[12px] flex justify-center items-center"
                                    >
                                        Register
                                    </Link>
                                    {/* <Link
                                        href="/freight/register"
                                        className="rounded bg-[#0955AC] border-2 border-[#0955AC] px-3 py-2 text-white text-[12px] font-bold text-center h-[50px] flex justify-center items-center"
                                    >
                                        Register as Freight
                                    </Link> */}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Click-outside overlay */}
                    <div className="flex-1" onClick={toggleMenu} />
                </div>
            )}
        </header>
    );
};

export default Header;
