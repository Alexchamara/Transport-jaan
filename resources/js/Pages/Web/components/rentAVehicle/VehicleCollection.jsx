import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";

// icons
import meter from "../../assets/rentAVehicle/collection/meter.png";
import gearBox from "../../assets/rentAVehicle/collection/gearbox.png";
import user from "../../assets/rentAVehicle/collection/user.png";
import gas from "../../assets/rentAVehicle/collection/gas.png";
import heartFill from "../../assets/rentAVehicle/collection/heartFill.png";
import heart from "../../assets/rentAVehicle/collection/heart.png";

const VehicleCollection = () => {
    const { vehicles, likedVehicleIds, authUser } = usePage().props;

    const [likedVehicles, setLikedVehicles] = useState({});

    // Initialize likedVehicles from backend on page load
    useEffect(() => {
        if (likedVehicleIds) {
            const initialLikes = {};
            likedVehicleIds.forEach(id => {
                initialLikes[id] = true;
            });
            setLikedVehicles(initialLikes);
        }
    }, [likedVehicleIds]);

    const toggleLike = async (vehicleId) => {
        if (!authUser) {
            alert("You must be logged in to like a vehicle.");
            router.visit("/signin");
            return;
        }

        try {
            const response = await axios.post(route("vehicle.like.toggle"), { vehicle_id: vehicleId });
            const { likedVehicleIds: updatedLikes } = response.data;

            const newLiked = {};
            updatedLikes.forEach(id => {
                newLiked[id] = true;
            });
            setLikedVehicles(newLiked);
        } catch (error) {
            console.error(error);
            alert("Something went wrong while liking the vehicle.");
        }
    };

    const handleViewDetails = (vehicleId) => {
        if (!vehicleId) return;
        router.visit(`/vehicleDetails/${vehicleId}`);
    };

    const handleViewMore = () => {
        router.visit("/vehicleList");
    };

    return (
        <div className="w-full py-12">
            <div className="container mx-auto">
                <h2 className="bebas-neue text-[40px] font-[400] text-center mb-8">
                    OUR <span className="text-[#0955AC]">IMPRESSIVE COLLECTION</span> OF VEHICLES
                </h2>
                <p className="poppins text-[#0F0F0F80] text-[15px] text-center mb-10">
                    Ranging from elegant sedans to powerful vehicles, all carefully selected to provide
                    our customers <br /> with the ultimate driving experience.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-[50px] justify-items-center p-5">
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="bg-[#EAEAE9] shadow-md overflow-hidden h-auto w-full max-w-[286px] py-3 sm:py-4 md:py-5"
                        >
                            {/* Specs */}
                            <div className="flex items-center justify-center mt-3 sm:mt-4 md:mt-5">
                                <div className="flex flex-wrap justify-center gap-6 w-full px-5 text-[9px] text-[#00000040]">
                                    <div className="flex flex-col items-center gap-1">
                                        <img src={meter} alt="Speed" className="w-[17px] h-[17px]" />
                                        <span>{vehicle.landSpec?.speed || "-"}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <img src={gearBox} alt="Transmission" className="w-[17px] h-[17px]" />
                                        <span>{vehicle.landSpec?.transmission_type || "-"}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <img src={user} alt="Seats" className="w-[17px] h-[17px]" />
                                        <span>{vehicle.landSpec?.seats || vehicle.passenger_capacity || "-"}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <img src={gas} alt="Fuel" className="w-[17px] h-[17px]" />
                                        <span>{vehicle.landSpec?.fuel_type || "-"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Image */}
                            <div className="flex items-center justify-center p-2 sm:p-3 md:p-4">
                                <img
                                    src={vehicle.primaryImage?.path || vehicle.images?.[0]?.path || "/placeholder.png"}
                                    alt={vehicle.model}
                                    className="w-full h-auto object-contain"
                                />
                            </div>

                            {/* Vehicle Info */}
                            <div className="p-2 sm:p-3 flex flex-col items-center justify-center">
                                <h3 className="bebas-neue text-[24px] sm:text-[26px] md:text-[30px] font-[400] text-center">
                                    {vehicle.model?.split(" ").map((word, i) => (
                                        <span key={i} className={i === 1 ? "text-[#0955AC]" : ""}>
                                            {word}{" "}
                                        </span>
                                    ))}
                                </h3>
                                <p className="poppins font-[700] text-[20px] sm:text-[22px] md:text-[25px]">
                                    {vehicle.rental_price_per_day}.00
                                    <span className="text-[#00000080] text-[8px] sm:text-[9px] md:text-[10px] font-[600]"> /day</span>
                                </p>

                                {/* Buttons */}
                                <div className="flex gap-2 mt-3 sm:mt-4 w-full justify-center">
                                    <button
                                        onClick={() => handleViewDetails(vehicle.id)}
                                        className="bebas-neue bg-[#0955AC] hover:bg-white hover:text-black text-white text-[8px] sm:text-[9px] font-[400] py-1.5 sm:py-2 px-3 sm:px-4 rounded w-[160px] sm:w-[180px] md:w-[194px] h-[28px] sm:h-[30px] cursor-pointer"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => toggleLike(vehicle.id)}
                                        className="bebas-neue border-[1.5px] border-[#0955AC] text-[8px] sm:text-[9px] font-[400] p-1 rounded-[4px] h-[28px] sm:h-[30px] w-[28px] sm:w-[30px] cursor-pointer flex items-center justify-center bg-white text-[#0955AC]"
                                    >
                                        <img
                                            src={likedVehicles[vehicle.id] ? heartFill : heart}
                                            alt="heart"
                                            className="w-[14px] sm:w-[16px] h-[11px] sm:h-[13px] object-contain"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View More */}
                <div className="text-center mt-8">
                    <button
                        onClick={handleViewMore}
                        className="bg-[#0955AC] border-[2px] border-[#0955AC] text-white text-[16px] font-[700] py-2 px-6 rounded-[9px] cursor-pointer"
                    >
                        VIEW MORE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehicleCollection;
