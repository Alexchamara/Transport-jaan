import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import UserDropdown from "../../Pages/Web/components/vendors/UserDropdown";
import NotificationDropdown from "../../Pages/Web/components/vendors/NotificationDropdown";
import bellIcon from "../../Pages/Web/assets/vendors/dashboard/bell.svg";


const ServiceNavBar = ({ 
    isVerified = true, 
    activeService = null,
    onUnverifiedClick = null,
    settingsRoute = null,
}) => {
    const { url, props } = usePage();
    const approvedSlugs = props?.auth?.user?.approved_service_slugs || [];
    const [showUnverifiedAlert, setShowUnverifiedAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("Please verify your account to access all features");

    // All available services (centralized definition)
    const allServices = [
        { name: 'All Bookings', route: route('vendorAllBookings') },
        { name: 'Vehicle Rental', route: route('vendors.dashboard') },
        { name: 'Ticket Booking', route: route('ticketBooking.dashboard') },
        { name: 'Courier Service', route: route('courierService.dashboard') },
        { name: 'Warehousing', route: route('vendors.warehouse.dashboard') },
        { name: 'Freight', route: route('freight.dashboard') },
    ];

    // Determine active service from current URL
    const getActiveService = () => {
        if (activeService) return activeService;

        const routeMap = {
            '/vendorAllBookings': 'All Bookings',
            '/vendors/dashboard': 'Vehicle Rental',
            '/ticketBooking': 'Ticket Booking',
            '/courierService': 'Courier Service',
            '/vendors/warehouse': 'Warehousing',
            '/freight': 'Freight',
        };

        // Check URL to determine active service
        for (const [path, service] of Object.entries(routeMap)) {
            if (url.includes(path)) return service;
        }

        return 'All Bookings'; // Default
    };

    const currentActiveService = getActiveService();

    const canAccessService = (serviceName) => {
        switch (serviceName) {
            case 'All Bookings':
                return true;
            case 'Vehicle Rental':
                return approvedSlugs.includes('vehicle-rental');
            case 'Ticket Booking':
                return approvedSlugs.includes('aviation-service') || approvedSlugs.includes('railway-service');
            case 'Courier Service':
                return approvedSlugs.includes('courier-services');
            case 'Warehousing':
                return approvedSlugs.includes('warehousing');
            case 'Freight':
                return approvedSlugs.includes('waterborne-transport');
            default:
                return false;
        }
    };

    const handleNavbarClick = (e, message) => {
        e.preventDefault();
        setAlertMessage(message);
        setShowUnverifiedAlert(true);
        setTimeout(() => setShowUnverifiedAlert(false), 3000);

        if (onUnverifiedClick) {
            onUnverifiedClick();
        }
    };

    return (
        <>
            {/* Service Navigation Bar - with highlight style */}
            <div 
                className="bg-[#FFFFFF] overflow-x-auto z-50 px-2 sm:px-3 gap-2 flex items-center justify-between" 
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex flex-row gap-0 min-w-max lg:min-w-0 flex-1 overflow-x-auto">
                    {allServices.map((service, idx) => {
                        const isServiceAllowed = isVerified && canAccessService(service.name);
                        const blockedMessage = !isVerified
                            ? "Please verify your account to access all features"
                            : "To access this service, please register and wait for admin verification.";

                        return isServiceAllowed ? (
                            <Link
                                key={idx}
                                href={service.route}
                                className={`flex-1 lg:flex-none px-6 py-4 lg:px-8 lg:py-4 text-center font-[500] text-[14px] whitespace-nowrap border-b-4 transition-all rounded-t-lg ${
                                    currentActiveService === service.name 
                                        ? 'border-b-4 border-[#0955AC] bg-[#0955AC29] text-[#0955AC] font-[600]'
                                        : 'border-b-4 border-transparent text-[#666666] hover:bg-[#F3F3F3] hover:border-b-4 hover:border-[#0955AC]'
                                }`}
                            >
                                {service.name}
                            </Link>
                        ) : (
                            <button
                                key={idx}
                                onClick={(e) => handleNavbarClick(e, blockedMessage)}
                                className={`flex-1 lg:flex-none px-6 py-4 lg:px-8 lg:py-4 text-center font-[500] text-[14px] whitespace-nowrap border-b-4 transition-all rounded-t-lg cursor-not-allowed opacity-60 ${
                                    currentActiveService === service.name 
                                        ? 'border-b-4 border-[#0955AC] bg-[#0955AC29] text-[#0955AC] font-[600]'
                                        : 'border-b-4 border-transparent text-[#666666]'
                                }`}
                            >
                                {service.name}
                            </button>
                        );
                    })}
                </div>

                {/* Notifications + User Dropdown on the right */}
                <div className="flex-shrink-0 flex items-center gap-2 ml-3 border-l border-gray-200 pl-3">
                    <NotificationDropdown bellIcon={bellIcon} />
                    {settingsRoute && (
                        <UserDropdown settingsRoute={settingsRoute} />
                    )}
                </div>
            </div>

            {/* Access Alert Toast */}
            {showUnverifiedAlert && (
                <div className="fixed top-6 right-6 z-50 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-md">
                    {alertMessage}
                </div>
            )}
        </>
    );
};

export default ServiceNavBar;
