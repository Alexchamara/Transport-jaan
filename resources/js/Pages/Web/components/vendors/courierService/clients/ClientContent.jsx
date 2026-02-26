import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../../assets/vendors/dashboard/logOutLogo.svg"; // Added

import { ChevronDown } from "lucide-react";

import ClientTable from "./ClientTable";
import ServiceNavBar from "../../../../../../Components/vendors/ServiceNavBar";

import UserDropdown from "../../UserDropdown";

const ClientContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.status === 'verified' || user?.status === 'Verified';
    const activeService = 'Courier Service';
    const services = [
        { name: 'All Bookings', route: route('vendorAllBookings') },
        { name: 'Vehicle Rental', route: route('vendors.dashboard') },
        { name: 'Ticket Booking', route: route('ticketBooking.dashboard') },
        { name: 'Courier Service', route: route('courierService.dashboard') },
        { name: 'Warehousing', route: route('vendors.warehouse.dashboard') },
        { name: 'Freight', route: route('freight.dashboard') },
        { name: 'Multimodal', route: route('multiModelHomepage.home') }
    ];

    // Dropdown state
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const wrapperRef = useRef(null);

    // Close dropdown on outside click or Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowUserDropdown(false);
            }
        };

        const handleKey = (e) => {
            if (e.key === "Escape") setShowUserDropdown(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKey);
        };
    }, []);

    return (
        <>
        <div className="sticky top-0 z-30">
            <ServiceNavBar services={services} isVerified={isVerified} activeService={activeService} settingsRoute={route("courierService.settingsPage")} />
        </div>
        <div className="w-full h-auto pr-5 py-10 pt-6 pb-12">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">
                    Courier Service Clients
                </h1>
                <div className="flex flex-row gap-5 relative items-center">
                    {/* <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={search} alt="Search" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={settings} alt="Settings" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={bell} alt="Notifications" />
          </div> */}

                    {/* <div className="flex flex-row gap-5 relative items-center">
                        <UserDropdown />
                    </div> */}
                </div>
            </div>
            {/* end of header section */}

            <div
                className="w-auto h-auto bg-[#FFFFFF] rounded-[10px] mt-10 px-10 py-10"
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <ClientTable />
            </div>
        </div>
        </>
    );
};

export default ClientContent;
