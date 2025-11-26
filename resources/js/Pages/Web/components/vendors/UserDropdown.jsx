// components/UserDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import proPic from "../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../assets/vendors/dashboard/logOutLogo.svg";
import { ChevronDown, Settings, User} from "lucide-react";

const UserDropdown = ({ settingsRoute }) => {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on outside click / Escape
    useEffect(() => {
        const clickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const escKey = (e) => e.key === "Escape" && setIsOpen(false);

        document.addEventListener("mousedown", clickOutside);
        document.addEventListener("keydown", escKey);
        return () => {
            document.removeEventListener("mousedown", clickOutside);
            document.removeEventListener("keydown", escKey);
        };
    }, []);

    // LOGOUT → LandingPage
    const handleLogout = (e) => {
        e.preventDefault();
        setIsOpen(false);
        router.post(
            route("logout"),
            {},
            {
                onSuccess: () => router.visit("/"), // <-- LandingPage
                preserveScroll: true,
            }
        );
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger */}
            <div
                className="flex flex-row gap-2 sm:gap-3 md:gap-5 items-center px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all duration-200 group cursor-pointer max-w-full"
                onClick={() => setIsOpen((p) => !p)}
            >
                <div className="size-[40px] sm:size-[50px] md:size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center shrink-0">
                    <img
                        src={proPic}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-[10px]"
                    />
                </div>

                <div className="figtree flex flex-col justify-center items-start min-w-0 flex-1">
                    <h1 className="text-[14px] sm:text-[16px] md:text-[20px] font-[700] truncate w-full">
                        {user?.name || "User"}
                    </h1>
                    <h1 className="text-[12px] sm:text-[14px] md:text-[16px] font-[600] text-[#7B7B7A] truncate w-full">
                        {user?.role || "User"}
                    </h1>
                </div>

                <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-[#7B7B7A] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute top-[80px] right-0 w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {/* Profile – always the same */}
                    {/* <Link
                        href="/profile"
                        className="flex w-full items-center gap-3 px-4 py-3 text-[16px] font-[500] text-[#000000CC] hover:bg-[#F3F4F6] transition-colors"
                    >
                        <img
                            src={proPic}
                            className="w-[20px] h-[20px] rounded-full"
                            alt="Profile"
                        />
                        <span>Profile</span>
                    </Link> */}

                    {/* SETTINGS – dynamic route */}
                    <Link
                        href={settingsRoute}
                        className="flex w-full items-center gap-3 px-4 py-3 text-[16px] font-[500] text-[#000000CC] hover:bg-[#F3F4F6] transition-colors"
                    >
                        <User className="w-[20px] h-[20px]" />
                        <span>Profile</span>
                    </Link>

                    <div className="w-full h-[1px] bg-[#E5E7EB] my-1" />

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-[16px] font-[500] text-[#DC2626] hover:bg-[#FEF2F2] transition-colors text-left"
                    >
                        <img src={logOutLogo} className="w-[20px] h-[20px]" alt="Logout" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;