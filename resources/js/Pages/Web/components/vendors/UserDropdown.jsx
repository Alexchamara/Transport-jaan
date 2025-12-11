import React, { useState, useRef, useEffect } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import proPic from "../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../assets/vendors/dashboard/logOutLogo.svg";
import { ChevronDown, User } from "lucide-react";

const UserDropdown = ({ settingsRoute }) => {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => e.key === "Escape" && setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    setIsOpen(false);
    router.post(
      route("logout"),
      {},
      {
        onSuccess: () => router.visit("/"),
        preserveScroll: true,
      }
    );
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 max-w-full"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px] rounded-full lg:rounded-[10px] bg-[#E8E8EF] flex justify-center items-center overflow-hidden text-xl font-bold text-[#7B7B7A]">
          {user?.image ? (
            <img
              src={user.image}
              alt="Profile"
              className="w-full h-full object-cover rounded-full lg:rounded-[10px]"
              onError={(e) => (e.target.src = proPic)}
            />
          ) : (
            <img
              src={proPic}
              alt="Default Profile"
              className="w-full h-full object-cover rounded-full lg:rounded-[10px]"
            />
          )}
        </div>

        <div className="hidden lg:flex flex-col justify-center min-w-0 flex-1">
          <h1 className="text-[14px] sm:text-[16px] md:text-[20px] font-[700] truncate">
            {user?.name || "User"}
          </h1>
          <h1 className="text-[12px] sm:text-[14px] md:text-[16px] font-[600] text-[#7B7B7A] truncate">
            {user?.role || "User"}
          </h1>
        </div>

        <ChevronDown
          className={`hidden lg:block w-4 h-4 sm:w-5 sm:h-5 text-[#7B7B7A] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </div>

      {isOpen && (
        <div
          className="absolute top-[70px] right-0 w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
        >
          <Link
            href={settingsRoute}
            className="flex w-full items-center gap-3 px-4 py-3 text-[16px] font-[500] text-[#000000CC] hover:bg-[#F3F4F6] transition-colors"
          >
            <User className="w-[20px] h-[20px]" />
            <span>Profile</span>
          </Link>

          <div className="w-full h-[1px] bg-[#E5E7EB] my-1" />

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
