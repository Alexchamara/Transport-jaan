import React, { useState, useEffect } from "react";
import carImage from "../../assets/rentAVehicle/car.jpg";
import flightImage from "../../assets/rentAVehicle/flight.jpg";
import shipsImage from "../../assets/rentAVehicle/ships.jpg";

import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

const HeroSection = ({ formData, onFormChange, onVehicleTypeChange }) => {
    const [imageOrder, setImageOrder] = useState(["land", "sea", "air"]);

    // useEffect(() => {
    //     if (onVehicleTypeChange) {
    //         onVehicleTypeChange(imageOrder[0]);
    //     }
    // }, []);

    const imageData = {
        land: {
            src: carImage,
            alt: "Land Vehicle",
            label: "LAND VEHICLE",
        },
        sea: {
            src: shipsImage,
            alt: "Water Vehicle",
            label: "WATER VEHICLE",
        },
        air: {
            src: flightImage,
            alt: "Air Vehicle",
            label: "AIR VEHICLE",
        },
    };

    // const handleImageClick = (imageType) => {
    //     setImageOrder((prevOrder) => {
    //         const newOrder = prevOrder.filter((type) => type !== imageType);
    //         newOrder.unshift(imageType);
    //         // Notify parent about the newly selected primary type
    //         if (onVehicleTypeChange) {
    //             onVehicleTypeChange(imageType);
    //         }
    //         return newOrder;
    //     });
    // };

    const handleImageClick = (imageType) => {
    setImageOrder((prevOrder) => {
        // Move clicked image to the first position
        const newOrder = prevOrder.filter((type) => type !== imageType);
        newOrder.unshift(imageType);

        // 🔹 Notify parent (HomePage) about new vehicle type
        if (onVehicleTypeChange) {
            // Pass 'land', 'water', or 'air' to the parent
            const typeMap = {
                land: "land",
                sea: "sea",
                air: "air",
            };
            onVehicleTypeChange(typeMap[imageType]);
        }

        return newOrder;
    });
};


    const handleFindVehicleClick = (e) => {
        e.preventDefault();

        if (
            !formData.pickupLocation ||
            !formData.pickupDate ||
            !formData.dropoffLocation ||
            !formData.dropoffDate
        ) {
            alert("Please fill in all fields before proceeding.");
            return;
        }

        // Redirect to /vehicleList with query params
        router.get(route("vehicle.list"), {
            pickupLocation: formData.pickupLocation,
            pickupDate: formData.pickupDate,
            dropoffLocation: formData.dropoffLocation,
            dropoffDate: formData.dropoffDate,
        });
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        onFormChange({
            ...formData,
            [id]: value,
        });
    };

    return (
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between min-h-screen px-4 md:px-16 gap-8 overflow-hidden pb-10">
            <div className="text-black md:order-1 order-2 text-left p-8 md:p-0 w-full md:max-w-4xl md:w-1/3 flex-shrink-0 mt-8">
                <div className="w-[50px] h-[5px] bg-[#000000] mb-6 rounded-sm"></div>
                <h1 className="bebas-neue text-[32px] sm:text-[38px] md:text-[45px]/[58px] font-[400] mb-4">
                    FROM <span className="text-[#0955AC]">ROADS </span>TO{" "}
                    <span className="text-[#0955AC]">SKIES</span> TO{" "}
                    <span className="text-[#0955AC]">SEAS</span> -{" "}
                    <br className="hidden sm:block" />
                    RENT WITH EASE.
                </h1>
                <p className="poppins text-[10px]/[20px] md:text-[15px] font-[400] text-[#00000099] text-justify mb-10 md:mb-20">
                    We bring together the world's most diverse vehicle rentals{" "}
                    <br className="hidden sm:block" /> on one platform from
                    daily car hires and charter flights{" "}
                    <br className="hidden sm:block" /> to private boat journeys.
                </p>

                {/* Search Form */}
                <form
                    onSubmit={handleFindVehicleClick}
                    className="figtree bg-white p-4 sm:p-6 rounded-[15px] w-full 2xl:w-[505px] h-auto text-[#286BB6] text-[13px] font-[400]"
                    style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Pick-up Location */}
                        <div>
                            <label
                                htmlFor="pickupLocation"
                                className="block mb-1"
                            >
                                Pick-up Location
                            </label>
                            <input
                                type="text"
                                id="pickupLocation"
                                value={formData.pickupLocation}
                                onChange={handleInputChange}
                                placeholder="Search a location"
                                className="appearance-none w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                            />
                        </div>
                        {/* Pick-up Date */}
                        <div>
                            <label htmlFor="pickupDate" className="block mb-1">
                                Pick-up Date
                            </label>
                            <input
                                type="date"
                                id="pickupDate"
                                value={formData.pickupDate}
                                onChange={handleInputChange}
                                className="w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline text-[#286BB6]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Drop-off Location */}
                        <div>
                            <label
                                htmlFor="dropoffLocation"
                                className="block mb-1"
                            >
                                Drop-off Location
                            </label>
                            <input
                                type="text"
                                id="dropoffLocation"
                                value={formData.dropoffLocation}
                                onChange={handleInputChange}
                                placeholder="Search a location"
                                className="w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                            />
                        </div>
                        {/* Drop-off Date */}
                        <div>
                            <label htmlFor="dropoffDate" className="block mb-1">
                                Drop-off Date
                            </label>
                            <input
                                type="date"
                                id="dropoffDate"
                                value={formData.dropoffDate}
                                onChange={handleInputChange}
                                className="border-[1px] border-[#0000001A] rounded-[8px] p-[16px] w-full leading-tight focus:outline-none focus:shadow-outline text-[#286BB6]"
                            />
                        </div>
                    </div>

                    {/* Find a Vehicle Button */}
                    <button
                        type="submit"
                        className="bg-[#0955AC] text-white font-bold h-[56px] w-full max-w-[459px] rounded-[8px] focus:outline-none focus:shadow-outline cursor-pointer hover:bg-[#07448a] transition-colors"
                    >
                        Find a Vehicle
                    </button>
                </form>
            </div>

            {/* Images Section */}
            <div className="bebas-neue hidden order-2 md:flex flex-row items-stretch md:h-[500px] lg:h-[680px] gap-4 w-full md:w-2/3 flex-shrink-0">
                {imageOrder.map((type, idx) => (
                    <div
                        key={type}
                        className={`relative h-full overflow-hidden rounded-[25px] shadow-lg transition-all duration-300 ease-in-out cursor-pointer flex-shrink-0 ${
                            idx === 0 ? "xl:w-[559px] sm:w-[350px] w-[300px]" : "w-[150px] sm:w-[220px]"
                        }`}
                        onClick={() => handleImageClick(type)}
                    >
                        <img
                            src={imageData[type].src}
                            alt={imageData[type].alt}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#00000066]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                className={`text-white text-[24px] lg:text-[32px] font-[400] rotate-[270deg] ${
                                    idx === 0 ? "hidden" : ""
                                }`}
                            >
                                {imageData[type].label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Images Section 2 */}
            <div className="bebas-neue flex lg:hidden order-1 mt-20 flex-row items-stretch md:h-[680px] h-[200px] gap-4 w-full flex-shrink-0">
                {imageOrder.map((type, idx) => (
                    <div
                        key={type}
                        className={`relative h-full overflow-hidden rounded-[10px] shadow-lg transition-all duration-300 ease-in-out cursor-pointer flex-shrink-0 ${
                            idx === 0 ? "sm:w-[350px] w-[180px]" : "sm:w-[80px] w-[60px]"
                        }`}
                        onClick={() => handleImageClick(type)}
                    >
                        <img
                            src={imageData[type].src}
                            alt={imageData[type].alt}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#00000066]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                className={`text-white text-[18px] lg:text-[32px] font-[400] rotate-[270deg] ${
                                    idx === 0 ? "hidden" : ""
                                }`}
                            >
                                {imageData[type].label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroSection;
