import { router } from "@inertiajs/react";

const ClientCard = ({ title, description, icon, route, subOptions }) => {
    const handleNavigate = (targetRoute = null) => {
        const navigateToRoute = targetRoute || route;
        if (navigateToRoute) {
            router.visit(navigateToRoute);
        } else {
            console.log(`No route defined for ${title}`);
        }
    };

    return (
        <div
            className="bg-[#FFFFFF] rounded-[10px] p-6 text-center transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-[#0955AC] text-gray-800 hover:text-[#FFFFFF] cursor-pointer group"
            style={{ boxShadow: "4px 4px 4px #0000001A" }}
            onClick={() => handleNavigate()}
        >
            <div className="text-[48px] mb-4">{icon}</div>
            <h2 className="text-[28px] font-[600] bebas-neue mb-2">{title}</h2>
            <p className="mt-2 poppins font-[400] text-[14px] leading-relaxed">{description}</p>

            {/* Show sub-options if available */}
            {subOptions && (
                <div className="mt-4 space-y-2">
                    {subOptions.map((option, idx) => (
                        <div
                            key={idx}
                            className={`rounded-lg py-2 px-3 text-sm font-semibold transition ${
                                option.disabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                    : 'bg-[#F5F5F5] text-[#0955AC] hover:bg-[#0955AC] hover:text-white cursor-pointer group-hover:bg-white/20 group-hover:text-white'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation(); // prevent parent click
                                if (!option.disabled) {
                                    handleNavigate(option.route);
                                }
                            }}
                        >
                            {option.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientCard;
