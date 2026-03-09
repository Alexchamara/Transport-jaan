import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
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
    const [showModal, setShowModal] = useState(false);
    const [blockedService, setBlockedService] = useState('');
    const [isUnverified, setIsUnverified] = useState(false);

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

    const handleNavbarClick = (e, serviceName, isAccountUnverified) => {
        e.preventDefault();
        setBlockedService(serviceName);
        setIsUnverified(isAccountUnverified);
        setShowModal(true);

        if (onUnverifiedClick) {
            onUnverifiedClick();
        }
    };

    const getServiceSlug = (serviceName) => {
        const serviceMap = {
            'Vehicle Rental': 'vehicle-rental',
            'Ticket Booking': 'aviation-service',
            'Courier Service': 'courier-services',
            'Warehousing': 'warehousing',
            'Freight': 'waterborne-transport',
        };
        return serviceMap[serviceName] || '';
    };

    const handleRegister = () => {
        const serviceSlug = getServiceSlug(blockedService);
        setShowModal(false);
        router.visit(`/vendor/profile?step=2&service=${serviceSlug}`);
    };

    const handleCancel = () => {
        setShowModal(false);
        setBlockedService('');
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
                                onClick={(e) => handleNavbarClick(e, service.name, !isVerified)}
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

            {/* Access Denied Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {isUnverified ? 'Account Not Verified' : 'Service Not Registered'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {isUnverified 
                                ? 'Please verify your account to access all dashboard features.'
                                : `To access ${blockedService}, please register this service and wait for admin verification.`
                            }
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                            >
                                Cancel
                            </button>
                            {!isUnverified && (
                                <button
                                    onClick={handleRegister}
                                    className="px-4 py-2 bg-[#0955AC] text-white rounded-lg hover:bg-[#074291] font-medium transition"
                                >
                                    Register Service
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceNavBar;
