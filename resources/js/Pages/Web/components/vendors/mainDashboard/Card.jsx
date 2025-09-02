import { router } from "@inertiajs/react";

const Card = ({ title, description, index, subOptions }) => {
    const handleNavigate = (option = null) => {
        if (title === "Vehicle Rental") {
            if (option) {
                router.visit(`/dashboard/${option.toLowerCase()}`); // Navigate per sub-option
            } else {
                router.visit("/dashboard");
            }
        } else if (title === "Ticket Booking") {
            router.visit("/ticketBooking/dashboard");
        } else if (title === "Courier Service") {
            router.visit("/courierService/dashboard");
        } else if (title === "Warehouse Rental") {
            router.visit("/warehouse/dashboard");
        } else if (title === "Freight") {
            router.visit("/freight/dashboard");
        } else if (title === "Multimodal") {
            router.visit("/multimodal");
        } else {
            alert(`Navigating to ${title}...`);
        }
    };

    return (
        <div
            className="bg-[#FFFFFF] rounded-[10px] p-6 text-center transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-[#0955AC] text-gray-800 hover:text-[#FFFFFF] cursor-pointer"
            style={{ boxShadow: "4px 4px 4px #0000001A" }}
            onClick={() => handleNavigate()}
        >
            <h2 className="text-[34px] font-[600] bebas-neue">{title}</h2>
            <p className="mt-2 poppins font-[500]">{description}</p>

            {/* ✅ Show sub-options only for Vehicle Rental */}
            {subOptions && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                    {subOptions.map((opt, idx) => (
                        <div
                            key={idx}
                            className="bg-[#F5F5F5] text-[#0955AC] rounded-lg py-2 px-4 text-sm font-semibold hover:bg-[#0955AC] hover:text-white transition cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation(); // prevent parent click
                                handleNavigate(opt);
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Card;
