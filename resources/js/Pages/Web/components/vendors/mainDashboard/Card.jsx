import { Inertia } from "@inertiajs/inertia";

const Card = ({ title, description, index }) => {
    const handleNavigate = () => {
        if (title === "Vehicle Rental") {
            // Navigate to Laravel Inertia route for Vehicle Rental
            Inertia.visit(route("vendors.dashboard"));
        } else {
            // Placeholder for other cards
            alert(`Navigating to ${title}...`);
        }
    };

    return (
        <div
            className="bg-[#FFFFFF] rounded-[10px] p-6 text-center transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-[#0955AC] text-gray-800 hover:text-[#FFFFFF] cursor-pointer"
            style={{ boxShadow: "4px 4px 4px #0000001A" }}
            onClick={handleNavigate}
        >
            <h2 className="text-[34px] font-[600] bebas-neue">{title}</h2>
            <p className="mt-2 poppins font-[500]">{description}</p>
        </div>
    );
};

export default Card;