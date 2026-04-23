import React, { useState, useEffect } from "react";
import CompanyLogo from "../../components/CompanyLogo";
import { router, usePage, Link } from "@inertiajs/react";
import downArrow from "../../assets/rentAVehicle/header/downArrow.png";
import proPic from "../../assets/header/profilePic.svg";
import bell from "../../assets/header/bell.svg";
import search from "../../assets/header/search.svg";
import { ArrowLeft } from "lucide-react";

const HeaderTwo = () => {
    const { auth } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [openDropdown, setOpenDropdown] = useState({
        vehicle: false,
        ticket: false,
        courier: false,
        profile: false,
    });

    const toggleDropdown = (key) => {
        setOpenDropdown((prev) => ({
            vehicle: key === "vehicle" ? !prev.vehicle : false,
            ticket: key === "ticket" ? !prev.ticket : false,
            courier: key === "courier" ? !prev.courier : false,
            profile: key === "profile" ? !prev.profile : false,
        }));
    };

    // ---------- CSRF & Logout ----------
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
                    <img
                        src={bell}
                        className="size-[18px] md:w-[24px] md:h-[23px]"
                        alt="Notifications"
                    />
                </div>
                <div className="relative">
                    <button
                        type="button"
                        className="size-[27px] md:size-[55px] rounded-full overflow-hidden bg-[#E8EBEF] flex justify-center items-center cursor-pointer"
                        onClick={() => toggleDropdown("profile")}
                        aria-label="Open profile menu"
                    >
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
                    </button>
                    {openDropdown.profile && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenDropdown(prev => ({ ...prev, profile: false }))}
                            />
                            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 min-w-[250px] overflow-hidden">
                                {auth?.user && (
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{auth.user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{auth.user.email}</p>
                                    </div>
                                )}
                                {auth?.user ? (
                                    <>
                                        <Link
                                            href="/clientDashboardSettings"
                                            onClick={() => setOpenDropdown(prev => ({ ...prev, profile: false }))}
                                            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            My Profile
                                        </Link>

                                        <button
                                            onClick={(e) => {
                                                setOpenDropdown(prev => ({ ...prev, profile: false }));
                                                handleLogout(e);
                                            }}
                                            className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/signin"
                                            onClick={() => setOpenDropdown(prev => ({ ...prev, profile: false }))}
                                            className="flex items-center gap-2 px-4 py-3 text-sm text-[#0955AC] hover:bg-blue-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5m0 0l-5-5m5 5H3" />
                                            </svg>
                                            Login
                                        </Link>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile overlay menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-20 flex justify-end">
                    <div className="w-[300px] max-w-full h-full rounded-r-[20px] bg-white shadow-lg py-10 px-8 flex flex-col relative animate-slide-in">
                        <div className="flex justify-between items-center mb-8">
                            {/* Back to Dashboard Button */}
                            <Link
                                href={route("clientAllBookings")}
                                onClick={toggleMenu}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </Link>

                            <button
                                onClick={toggleMenu}
                                className="p-2 text-gray-600 hover:text-[#EF3826] focus:outline-none z-50"
                            >
                                <svg
                                    className="w-7 h-7"
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
                        </div>

                        {/* Navigation */}
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
                                        className={`w-[8px] h-[5px] transition-transform duration-200 ${openDropdown.vehicle
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
                                            href="/multiModel/plan-journey?tab=rental&subTab=land"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Land
                                        </Link>
                                        <Link
                                            href="/multiModel/plan-journey?tab=rental&subTab=air"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Air
                                        </Link>
                                        <Link
                                            href="/multiModel/plan-journey?tab=rental&subTab=sea"
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
                                        className={`w-[8px] h-[5px] transition-transform duration-200 ${openDropdown.ticket
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
                                            href="/multiModel/plan-journey?tab=ticket&subTab=flight"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Flight
                                        </Link>
                                        <Link
                                            href="/multiModel/plan-journey?tab=ticket&subTab=train"
                                            className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                        >
                                            Train
                                        </Link>
                                        <Link
                                            href="/multiModel/plan-journey?tab=ticket&subTab=bus"
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
                                        className={`w-[8px] h-[5px] transition-transform duration-200 ${openDropdown.courier
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
                                            International
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/warehouseList"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setOpenDropdown((prev) => ({ ...prev, profile: false }));
                                }}
                                className="hover:text-[#0955AC]"
                            >
                                Warehouse Booking
                            </Link>
                            <Link
                                href="/freightBookingDashboard"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setOpenDropdown((prev) => ({ ...prev, profile: false }));
                                }}
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

                            {/* ---------- Scroll-to-section links (Home, About Us, …) ---------- */}
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

                        {/* Auth / Dashboard section */}
                        <div className="border-t pt-10 flex flex-col space-y-2 mt-auto">
                            {auth?.user ? (
                                <>
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
                                            href="/user/view"
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

                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-7 w-7 border border-black rounded-full overflow-hidden flex justify-center items-center text-[14px]">
                                            {auth.user.image ? (
                                                <img
                                                    src={auth.user.image}
                                                    className="h-full w-full object-cover"
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <span>
                                                    {auth.user.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}
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
                                </>
                            )}
                        </div>
                    </div>

                    {/* Click outside to close */}
                    <div className="flex-1" onClick={toggleMenu} />
                </div>
            )}
        </header >
    );
};

export default HeaderTwo;
