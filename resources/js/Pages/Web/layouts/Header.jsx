import React, { useState, useEffect } from "react";
import { router, usePage, Link } from "@inertiajs/react";
import downArrow from "../assets/rentAVehicle/header/downArrow.png";
import proPic from "../assets/header/profilePic.svg";
import bell from "../assets/header/bell.svg";
import search from "../assets/header/search.svg";
import useCSRFRefresh from "../../../hooks/useCSRFRefresh.js";

const Header = () => {
    const { auth } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Enable automatic CSRF token refresh for authenticated users
    useCSRFRefresh();

    // Function to refresh CSRF token
    const refreshCSRFToken = async () => {
        try {
            const response = await fetch('/csrf-token');
            const data = await response.json();
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', data.token);
            }
            return data.token;
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
            return null;
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();

        // First attempt: regular POST logout
        const attemptLogout = () => {
            router.post(route('logout'), {}, {
                onError: async (errors) => {
                    console.warn('POST logout failed, trying to refresh CSRF token...', errors);

                    // Check if it's a CSRF error
                    if (errors && (errors.message?.includes('CSRF') || errors.message?.includes('expired'))) {
                        // Try to refresh CSRF token and retry once
                        const newToken = await refreshCSRFToken();
                        if (newToken) {
                            // Retry with fresh token
                            router.post(route('logout'), {}, {
                                onError: () => {
                                    // If still fails, use alternative method
                                    console.warn('Retried logout failed, using alternative method...');
                                    window.location.href = route('logout.alt');
                                },
                                onSuccess: () => {
                                    window.location.href = '/';
                                }
                            });
                        } else {
                            // Fallback to GET logout
                            window.location.href = route('logout.alt');
                        }
                    } else {
                        // Other errors, try alternative method
                        window.location.href = route('logout.alt');
                    }
                },
                onSuccess: () => {
                    window.location.href = '/';
                }
            });
        };

        attemptLogout();
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="relative z-50 w-full h-auto py-[5px]">
            <div className="poppins font-[500] px-3 sm:px-4 md:px-6 lg:px-10 py-2 sm:py-4 flex items-center justify-between relative">
                {/* Hamburger always visible, but hide when menu is open */}
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

                {/* Centered Company Name/Logo */}
                <div
                    onClick={() => router.visit("/")}
                    className="absolute left-1/2 transform -translate-x-1/2 text-[16px] sm:text-[20px] md:text-[25px] lg:text-[30px] font-[700] text-black text-center cursor-pointer hover:text-[#0955AC] transition-colors"
                    style={{ minWidth: "120px" }}
                >
                    COMPANY LOGO
                </div>

                {/* right side buttons */}
                <div className="md:flex hidden flex-row gap-5 justify-center items-center">
                    {/* <div className="size-[27px] md:size-[55px] rounded-full bg-[#E8EBEF] flex justify-center items-center">
                        <img
                            src={search}
                            className="size-[18px] md:w-[24px] md:h-[23px]"
                        />
                    </div> */}
                    <div className="size-[27px] md:size-[55px] rounded-full bg-[#E8EBEF] flex justify-center items-center">
                        <img
                            src={bell}
                            className="size-[18px] md:w-[24px] md:h-[23px]"
                        />
                    </div>
                    <div
                        className="size-[27px] md:size-[55px] flex justify-center items-center cursor-pointer"
                        onClick={() => {
                            router.visit("/client/dashboard");
                        }}
                    >
                        <img
                            src={proPic}
                            className="size-[18px] md:size-[55px]"
                        />
                    </div>
                </div>
            </div>

            {/* Overlay Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-20 flex justify-end">
                    <div className="w-[300px] max-w-full h-full bg-white shadow-lg p-6 flex flex-col space-y-4 animate-slide-in relative">
                        {/* Close X button inside overlay */}
                        <button
                            onClick={toggleMenu}
                            className="absolute top-4 right-4 p-2 text-gray-600 hover:text-[#EF3826] focus:outline-none z-50"
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
                        {/* Navigation */}
                        <nav className="flex flex-col space-y-3 text-[#000000cc] text-[15px] font-medium">
                            <Link href="/" className="hover:text-[#0955AC]">
                                Home
                            </Link>
                            <a href="#" className="hover:text-[#0955AC]">
                                About Us
                            </a>
                            <div className="relative group">
                                <Link
                                    href="/clientRent"
                                    className="hover:text-[#0955AC] flex items-center gap-1"
                                >
                                    Rent a Vehicle{" "}
                                    <img
                                        src={downArrow}
                                        alt="dropdown"
                                        className="w-[8px] h-[5px]"
                                    />
                                </Link>
                                <div className="ml-4 mt-1 flex flex-col space-y-1">
                                    <Link
                                        href="/clientRent?type=land"
                                        className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                    >
                                        Land
                                    </Link>
                                    <Link
                                        href="/clientRent?type=air"
                                        className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                    >
                                        Air
                                    </Link>
                                    <Link
                                        href="/clientRent?type=sea"
                                        className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                    >
                                        Water
                                    </Link>
                                </div>
                            </div>
                            <div className="relative group">
                                <Link
                                    href="/book-a-ticket"
                                    className="hover:text-[#0955AC] flex items-center gap-1"
                                >
                                    Book a Ticket{" "}
                                    <img
                                        src={downArrow}
                                        alt="dropdown"
                                        className="w-[8px] h-[5px]"
                                    />
                                </Link>
                                <div className="ml-4 mt-1 flex flex-col space-y-1">
                                    <Link
                                        href="/book-a-ticket"
                                        className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                    >
                                        Book a Ticket
                                    </Link>
                                    <Link
                                        href="/booking-home"
                                        className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                    >
                                        Booking Home
                                    </Link>
                                    <Link
                                        href="/freight-booking/create"
                                        className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                    >
                                        Freight Booking
                                    </Link>
                                </div>
                            </div>
                            <div className="relative group">
                                <Link
                                    href="/courier-service"
                                    className="hover:text-[#0955AC] flex items-center gap-1"
                                >
                                    Courier Service{" "}
                                    <img
                                        src={downArrow}
                                        alt="dropdown"
                                        className="w-[8px] h-[5px]"
                                    />
                                </Link>
                                <div className="ml-4 mt-1 flex flex-col space-y-1">
                                    <Link
                                        href="/track"
                                        className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                    >
                                        Track Courier
                                    </Link>
                                    <Link
                                        href="/couriers/create"
                                        className="block text-sm text-gray-700 hover:text-[#0955AC]"
                                    >
                                        Book Courier
                                    </Link>
                                </div>
                            </div>
                            <Link
                                href="/drivers-home"
                                className="hover:text-[#0955AC]"
                            >
                                Drivers
                            </Link>
                            <a href="#" className="hover:text-[#0955AC]">
                                Our Services
                            </a>
                            <a href="#" className="hover:text-[#0955AC]">
                                FAQ
                            </a>
                            <a href="#" className="hover:text-[#0955AC]">
                                Contact Us
                            </a>
                        </nav>
                        <div className="border-t pt-4 flex flex-col space-y-2">
                            {auth?.user ? (
                                <>
                                    {/* Dashboard Links Based on Role */}
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
                                            href="/client/dashboard"
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
                                        className="h-[40px] border-2 border-[#0955AC] rounded px-3 py-2 text-[#0955AC] text-[12px] font-bold hover:bg-[#0955AC] hover:text-white flex justify-center items-center"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="bg-[#0955AC] h-[40px] rounded border-2 border-[#0955AC] px-3 py-2 text-white font-bold text-[12px] flex justify-center items-center"
                                    >
                                        Register
                                    </Link>
                                    <Link
                                        href="/freight/register"
                                        className="rounded bg-[#0955AC] border-2 border-[#0955AC] px-3 py-2 text-white text-[12px] font-bold text-center h-[50px] flex justify-center items-center"
                                    >
                                        Register as Freight
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Click outside to close */}
                    <div className="flex-1" onClick={toggleMenu} />
                </div>
            )}
        </header>
    );
};

export default Header;
