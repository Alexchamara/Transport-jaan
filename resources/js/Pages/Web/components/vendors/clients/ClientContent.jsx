// resources/js/Pages/Web/components/vendors/clients/ClientContent.jsx
import React, { useState, useEffect, useRef } from "react";
import { usePage, Link } from "@inertiajs/react";

import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../assets/vendors/dashboard/logOutLogo.svg"; // ← NEW

import NotificationDropdown from "../NotificationDropdown";
import ClientTable from "./ClientTable";

import UserDropdown from "../../../components/vendors/UserDropdown.jsx";

const ClientContent = () => {
    const { auth, unreadNotifications = 0 } = usePage().props;
    const user = auth?.user;

    return (
        <div className="w-full h-auto px-5 lg:px-0 lg:pr-5 py-10">
            {/* ==================== HEADER WITH NOTIFICATION + DROPDOWN ==================== */}
            <div className="flex flex-col sm:flex-row gap-5 justify-between lg:items-start items-center">
                <h1 className="figtree text-[25px] sm:text-[35px] font-[700]">Vehicle Rental Clients</h1>

                <div className="flex flex-row gap-5 relative items-center">
                    <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div>
                </div>
            </div>

            {/* ==================== CLIENT TABLE ==================== */}
            <div
                className="w-auto h-auto bg-[#FFFFFF] rounded-[10px] mt-10 px-10 py-10"
                style={{
                    boxShadow: "4px 4px 4px #0000001A",
                }}
            >
                <ClientTable />
            </div>
        </div>
    );
};

export default ClientContent;
