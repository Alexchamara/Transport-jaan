// components/UserDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import proPic from "../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../assets/vendors/dashboard/logOutLogo.svg";
import { ChevronDown, Settings } from "lucide-react";

const UserDropdown = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside or Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger */}
            <div
                className="flex flex-row gap-5 items-center cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 group"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
                    <img
                        src={proPic}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-[10px]"
                    />
                </div>

                <div className="figtree flex flex-col justify-center items-start">
                    <h1 className="text-[20px] font-[700]">
                        {user?.name || "Vendor"}
                    </h1>
                    <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                        Vendor
                    </h1>
                </div>

                <ChevronDown
                    className={`w-5 h-5 text-[#7B7B7A] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute top-[80px] right-0 w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {/* Profile */}
                    <Link
                        href="/profile"
                        className="w-full figtree flex flex-row justify-start items-center gap-3 px-4 py-3 text-[16px] font-[500] text-[#000000CC] hover:bg-[#F3F4F6] transition-colors"
                    >
                        <img
                            src={proPic}
                            className="w-[20px] h-[20px] rounded-full"
                            alt="Profile"
                        />
                        <span>Profile</span>
                    </Link>

                    {/* Settings */}
                    <Link
                        href="/settings"
                        className="w-full figtree flex flex-row justify-start items-center gap-3 px-4 py-3 text-[16px] font-[500] text-[#000000CC] hover:bg-[#F3F4F6] transition-colors"
                    >
                        <Settings className="w-[20px] h-[20px]" />
                        <span>Settings</span>
                    </Link>

                    <div className="w-full h-[1px] bg-[#E5E7EB] my-1" />

                    {/* Logout */}
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="w-full figtree flex flex-row justify-start items-center gap-3 px-4 py-3 text-[16px] font-[500] text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                    >
                        <img
                            src={logOutLogo}
                            className="w-[20px] h-[20px]"
                            alt="Logout"
                        />
                        <span>Logout</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
