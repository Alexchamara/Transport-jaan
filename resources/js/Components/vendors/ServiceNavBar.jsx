import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import UserDropdown from "../../Pages/Web/components/vendors/UserDropdown";
import NotificationDropdown from "../../Pages/Web/components/vendors/NotificationDropdown";
import bellIcon from "../../Pages/Web/assets/vendors/dashboard/bell.svg";


const ServiceNavBar = ({ 
    services = [], 
    isVerified = true, 
    activeService = 'All Bookings   ',
    onUnverifiedClick = null,
    topPosition = '160px',
    settingsRoute = null,
}) => {
    const [showUnverifiedAlert, setShowUnverifiedAlert] = useState(false);

    const handleNavbarClick = (e) => {
        if (!isVerified) {
            e.preventDefault();
            setShowUnverifiedAlert(true);
            setTimeout(() => setShowUnverifiedAlert(false), 3000);
            
            // Call optional callback if provided
            if (onUnverifiedClick) {
                onUnverifiedClick();
            }
        }
    };

    return (
        <>
            {/* Service Navigation Bar - with highlight style */}
            <div 
                className="bg-[#FFFFFF] overflow-x-auto z-50 px-2 sm:px-3 gap-2  flex items-center justify-between" 
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex flex-row gap-0 min-w-max lg:min-w-0 flex-1 overflow-x-auto">
                    {services.map((service, idx) => 
                        isVerified ? (
                            <Link
                                key={idx}
                                href={service.route}
                                className={`flex-1 lg:flex-none px-6 py-4 lg:px-8 lg:py-4 text-center font-[500] text-[14px] whitespace-nowrap border-b-4 transition-all rounded-t-lg ${
                                    activeService === service.name 
                                        ? 'border-b-4 border-[#0955AC] bg-[#0955AC29] text-[#0955AC] font-[600]'
                                        : 'border-b-4 border-transparent text-[#666666] hover:bg-[#F3F3F3] hover:border-b-4 hover:border-[#0955AC]'
                                }`}
                            >
                                {service.name}
                            </Link>
                        ) : (
                            <button
                                key={idx}
                                onClick={handleNavbarClick}
                                className={`flex-1 lg:flex-none px-6 py-4 lg:px-8 lg:py-4 text-center font-[500] text-[14px] whitespace-nowrap border-b-4 transition-all rounded-t-lg cursor-not-allowed opacity-60 ${
                                    activeService === service.name 
                                        ? 'border-b-4 border-[#0955AC] bg-[#0955AC29] text-[#0955AC] font-[600]'
                                        : 'border-b-4 border-transparent text-[#666666]'
                                }`}
                            >
                                {service.name}
                            </button>
                        )
                    )}
                </div>

                {/* Notifications + User Dropdown on the right */}
                <div className="flex-shrink-0 flex items-center gap-2 ml-3 border-l border-gray-200 pl-3">
                    <NotificationDropdown bellIcon={bellIcon} />
                    {settingsRoute && (
                        <UserDropdown settingsRoute={settingsRoute} />
                    )}
                </div>
            </div>

            {/* Unverified Alert */}
            {showUnverifiedAlert && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
                    <div className="bg-[#F87171] text-white px-6 py-3 rounded-lg shadow-lg font-[500] flex items-center gap-3 animate-slide-down">
                        <span>⚠️</span>
                        <span>Please verify your account to access all features</span>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default ServiceNavBar;
