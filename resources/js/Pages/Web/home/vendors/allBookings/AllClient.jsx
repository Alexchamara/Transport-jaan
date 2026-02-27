import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import search from "../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../assets/vendors/dashboard/logOutLogo.svg"; // Added

import ClientTable from "../../../components/vendors/clients/ClientTable";

import UserDropdown from "../../../components/vendors/UserDropdown";
import UnverifiedBanner from "./UnverifiedBanner";
import ServiceNavBar from "../../../../../Components/vendors/ServiceNavBar";
import SideMenu from "./SideMenu";

const AllClient = () => {
    const { auth } = usePage().props;
    const currentComponent = usePage().component;
    const user = auth?.user;
    const isVerified = user?.status === 'verified' || user?.status === 'Verified';

    // Determine active service based on current component
    const getActiveService = () => {
        const componentMap = {
            'VendorAllBookings': 'All Bookings',
            'TicketBooking': 'Ticket Booking',
            'CourierService': 'Courier Service',
            'WarehouseRental': 'Warehousing',
            'FreightDashboard': 'Freight',
            'Multimodal': 'Multimodal'
        };
        return componentMap[currentComponent] || 'All Bookings';
    };

    return (
        <div className="flex flex-row gap-0 w-full h-full min-h-screen bg-[#F5F5F5]">
            <SideMenu />
            <div className="flex-1 flex flex-col min-w-0">
                {/* ServiceNavBar - sticky at top, flush with sidebar */}
                <div className="sticky top-0 z-30">
                    <ServiceNavBar 
                        isVerified={isVerified}
                        settingsRoute={route("settingsPage")}
                    />
                </div>
                <div className="w-full h-auto px-5 py-6">
                    {/* Header section */}
                    <div className="flex flex-col lg:flex-row gap-5 justify-between items-center">
                        <h1 className="figtree text-[35px] font-[700]">
                            All Clients
                        </h1>
                    </div>

                    {/* Unverified Warning */}
                    <div className="mt-6">
                        <UnverifiedBanner />
                    </div>
                    {/* end of header section */}

                    <div
                        className="w-auto h-auto bg-[#FFFFFF] rounded-[10px] mt-10 px-5 lg:px-10 py-10"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <ClientTable />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllClient;
