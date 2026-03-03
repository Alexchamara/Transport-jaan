import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Menu } from "lucide-react";
import SideMenu from "./allBookings/SideMenu";
import ServiceNavBar from "../../../../Components/vendors/ServiceNavBar";

/**
 * Shared layout for all Vehicle Rental vendor pages.
 * Renders: SideMenu (left) + sticky ServiceNavBar at the top of the content column + children.
 *
 * Usage:
 *   <VendorLayout activeService="Vehicle Rental">
 *     <YourContent />
 *   </VendorLayout>
 */
const VendorLayout = ({ children, activeService = "Vehicle Rental" }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified =
        user?.status === "verified" || user?.status === "Verified";

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <div className="flex flex-row h-auto">
                {/* Mobile Toggle Button */}
                <button
                    className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu size={22} />
                </button>

                {/* Side Menu */}
                <div
                    className={`fixed lg:static top-0 left-0 min-h-screen z-40 transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 bg-white shadow lg:shadow-none flex-shrink-0`}
                >
                    <SideMenu />
                </div>

                {/* Main content column */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* ServiceNavBar - sticky at the top of the content area */}
                    <div className="sticky top-0 z-30">
                       <ServiceNavBar 
                            isVerified={isVerified}
                            settingsRoute={route("settingsPage")}
                        />
                    </div>

                    {/* Page content */}
                    <div className="flex-1 bg-[#E5E5E5]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLayout;
