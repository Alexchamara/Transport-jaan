// resources/js/Pages/Web/components/vendors/tracking/Tracking.jsx
import React, { useState, useEffect, useRef } from "react";
import { usePage, Link } from "@inertiajs/react";
import SideMenu from "../../components/vendors/SideMenu";
import TrackingContent from "../../components/vendors/tracking/TrackingContent";
import bell from "../../assets/vendors/dashboard/bell.svg";
import proPic from "../../assets/vendors/dashboard/proPic.svg";

import UserDropdown from "../../components/vendors/Userdropdown.jsx";

const Tracking = () => {
    const { auth, unreadNotifications = 0 } = usePage().props;
    const user = auth?.user;

    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <div className="flex flex-row gap-10">
                <SideMenu />

                <div className="flex-1 pr-5 py-10">
                    {/* ==================== HEADER WITH DROPDOWN ==================== */}
                    <div className="flex flex-row gap-5 justify-between items-center mb-10">
                        <h1 className="figtree text-[35px] font-[700]">
                            Tracking
                        </h1>

                        <div className="flex flex-row gap-5 relative items-center">
                            <UserDropdown />
                        </div>
                    </div>

                    {/* ==================== TRACKING CONTENT ==================== */}
                    <TrackingContent />
                </div>
            </div>
        </div>
    );
};

export default Tracking;
