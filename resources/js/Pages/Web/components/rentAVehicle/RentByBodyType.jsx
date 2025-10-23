import React from "react";
import { router } from "@inertiajs/react";
import { Waves, Plane } from "lucide-react";

// Import body type icons (land)
import suvIcon from "../../assets/rentAVehicle/bodyType/suv.png";
import crossoverIcon from "../../assets/rentAVehicle/bodyType/crossover.png";
import wagonIcon from "../../assets/rentAVehicle/bodyType/wagon.png";
import familyMbpIcon from "../../assets/rentAVehicle/bodyType/family.png";
import sportCoupe from "../../assets/rentAVehicle/bodyType/sportCoupe.png";
import compact from "../../assets/rentAVehicle/bodyType/compact.png";
import coupeIcon from "../../assets/rentAVehicle/bodyType/coupe.png";
import truckIcon from "../../assets/rentAVehicle/bodyType/truck.png";
import sedanIcon from "../../assets/rentAVehicle/bodyType/sedan.png";
import limousineIcon from "../../assets/rentAVehicle/bodyType/limousine.png";
import convertibleIcon from "../../assets/rentAVehicle/bodyType/convertible.png";

const RentByBodyType = ({ selectedType = "other" }) => {
    // Dynamic sets per vehicle category (mirrors RentByBrands behavior)
    const bodyTypeMap = {
        // Land vehicles
        land: [
            { name: "SUV", img: suvIcon, value: "suv" },
            { name: "Crossover", img: crossoverIcon, value: "suv" }, // treat as SUV
            { name: "Wagon", img: wagonIcon, value: "other" },
            { name: "Family MPV", img: familyMbpIcon, value: "van" }, // MPV/van
            { name: "Sport Coupe", img: sportCoupe, value: "other" },
            { name: "Compact", img: compact, value: "hatchback" }, // or "other"
            { name: "Coupe", img: coupeIcon, value: "other" },
            { name: "Truck", img: truckIcon, value: "pickup" },
            { name: "Sedan", img: sedanIcon, value: "sedan" },
            { name: "Limousine", img: limousineIcon, value: "other" },
            { name: "Convertible", img: convertibleIcon, value: "other" },
        ],
        // Watercraft placeholders (use icon components until assets exist)
        sea: [
            { name: "Jet Ski", Icon: Waves, value: "jetski" },
            { name: "Speedboat", Icon: Waves, value: "speedboat" },
            { name: "Yacht", Icon: Waves, value: "yacht" },
            { name: "Catamaran", Icon: Waves, value: "catamaran" },
            { name: "Sailboat", Icon: Waves, value: "sailboat" },
            { name: "Fishing Boat", Icon: Waves, value: "fishingboat" },
            { name: "Cruise Ship", Icon: Waves, value: "cruiseship" },
            { name: "Houseboat", Icon: Waves, value: "houseboat" },
        ],
        // Aircraft placeholders
        air: [
            { name: "Helicopter", Icon: Plane, value: "helicopter" },
            { name: "Private Jet", Icon: Plane, value: "jet" },
            { name: "Propeller Plane", Icon: Plane, value: "prop" },
            { name: "Glider", Icon: Plane, value: "glider" },
            { name: "Cargo Plane", Icon: Plane, value: "cargo" },
            { name: "Commercial Airliner", Icon: Plane, value: "airliner" },
            { name: "Seaplane", Icon: Plane, value: "seaplane" },
            { name: "Hot Air Balloon", Icon: Plane, value: "balloon" },
        ],
    };

    const bodyTypes = bodyTypeMap[selectedType] || [];

    const handleBodyTypeClick = (bodyType) => {
        router.visit("/vehicleList", {
            method: "get",
            data: { bodyType: bodyType.value, type: selectedType },
        });
    };

    return (
        <div className="w-full py-12">
            <div className="container mx-auto px-20">
                <h2 className="bebas-neue text-[40px] font-[400] text-center mb-8">
                    RENT BY <span className="text-[#0955AC]">BODY TYPE</span>
                </h2>

                {bodyTypes.length === 0 && (
                    <div className="mt-6 text-center figtree text-[14px] text-[#0F0F0F99]">
                        Body types for this category are coming soon.
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-10 cursor-pointer">
                    {bodyTypes.map((bodyType) => (
                        <div
                            key={bodyType.name}
                            className="bg-[#EAEAE9] border-[1px] border-[#0955AC] p-4 rounded-[8px] shadow flex flex-col items-center justify-center h-[137px] hover:bg-[#f5f5f5] transition-colors duration-200"
                            onClick={() => handleBodyTypeClick(bodyType)}
                        >
                            {bodyType.img ? (
                                <img
                                    src={bodyType.img}
                                    alt={`${bodyType.name} Icon`}
                                    className="h-[40px] object-contain mb-5"
                                />
                            ) : bodyType.Icon ? (
                                <bodyType.Icon className="w-[42px] h-[42px] mb-5 text-[#0F0F0F]" />
                            ) : null}
                            <p className="figtree text-[#0955AC] text-[12px] md:text-[16px] text-center">
                                {bodyType.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RentByBodyType;
