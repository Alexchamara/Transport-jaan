import React from "react";
import { router } from "@inertiajs/react";
import { Waves, Plane } from "lucide-react";

import toyota from "../../assets/rentAVehicle/brands/toyota.png";
import audi from "../../assets/rentAVehicle/brands/Audi.png";
import Hyundai from "../../assets/rentAVehicle/brands/Hyundai.png";
import kia from "../../assets/rentAVehicle/brands/Kia.png";
import Volkswagen from "../../assets/rentAVehicle/brands/Volkswagen.png";
import benz from "../../assets/rentAVehicle/brands/benz.png";
import bmw from "../../assets/rentAVehicle/brands/bmw.png";
import ford from "../../assets/rentAVehicle/brands/ford.png";
import honda from "../../assets/rentAVehicle/brands/honda.png";
import nissan from "../../assets/rentAVehicle/brands/nissan.png";
import tesla from "../../assets/rentAVehicle/brands/tesla.png";

const RentByBrands = ({ selectedType = "other" }) => {
    // Brand sets per category
    const BRAND_MAP = {
        // Land vehicles (showing images instead of initials)
        land: [
            { name: "Toyota", value: "toyota", img: toyota },
            { name: "Honda", value: "honda", img: honda },
            { name: "Nissan", value: "nissan", img: nissan },
            { name: "BMW", value: "bmw", img: bmw },
            { name: "Mercedes-Benz", value: "mercedes-benz", img: benz },
            { name: "Audi", value: "audi", img: audi },
            { name: "Ford", value: "ford", img: ford },
            { name: "Volkswagen", value: "volkswagen", img: Volkswagen },
            { name: "Tesla", value: "tesla", img: tesla },
            { name: "Hyundai", value: "jeep", img: Hyundai },
            { name: "Kia", value: "land-rover", img: kia },
        ],
        // Watercraft
        sea: [
            { name: "Yamaha Marine", value: "yamaha" },
            { name: "Sea-Doo", value: "sea-doo" },
            { name: "Bayliner", value: "bayliner" },
            { name: "Quicksilver", value: "quicksilver" },
            { name: "Beneteau", value: "beneteau" },
            { name: "Princess", value: "princess" },
            { name: "Sunseeker", value: "sunseeker" },
            { name: "Azimut Yachts", value: "azimut" },
            { name: "Ferretti", value: "ferretti" },
            { name: "MasterCraft", value: "mastercraft" },
        ],
        // Aircraft
        air: [
            { name: "Airbus", value: "airbus" },
            { name: "Boeing", value: "boeing" },
            { name: "Cessna", value: "cessna" },
            { name: "Bell", value: "bell" },
            { name: "Gulfstream", value: "gulfstream" },
            { name: "Embraer", value: "embraer" },
            { name: "Dassault Falcon", value: "dassault" },
            { name: "Bombardier", value: "bombardier" },
            { name: "ATR", value: "atr" },
            { name: "Pilatus", value: "pilatus" },
        ],
    };

    const brands = BRAND_MAP[selectedType] || [];

    const handleBrandClick = (brand) => {
        router.visit("/vehicleList", {
            method: "get",
            data: { brand: brand.value, type: selectedType },
        });
    };

    return (
        <div className="w-full py-12">
            <div className="container mx-auto px-20">
                <h2 className="bebas-neue text-[40px] font-[400] text-center mb-8">
                    RENT BY <span className="text-[#0955AC]">BRAND</span>
                </h2>

                {brands.length === 0 && (
                    <div className="mt-6 text-center figtree text-[14px] text-[#0F0F0F99]">
                        Brands for this category are coming soon.
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-10 cursor-pointer">
                    {brands.map((brand) => (
                        <div
                            key={brand.value}
                            className="bg-[#EAEAE9] border-[1px] border-[#0955AC] p-4 rounded-[8px] shadow flex flex-col items-center justify-center h-[137px] hover:bg-[#f5f5f5] transition-colors duration-200"
                            onClick={() => handleBrandClick(brand)}
                        >
                            {brand.img ? (
                                <img
                                    src={brand.img}
                                    alt={`${brand.name} Logo`}
                                    className="h-[40px] object-contain mb-5"
                                />
                            ) : selectedType === "sea" ? (
                                <Waves className="w-[42px] h-[42px] mb-5 text-[#0F0F0F]" />
                            ) : selectedType === "air" ? (
                                <Plane className="w-[42px] h-[42px] mb-5 text-[#0F0F0F]" />
                            ) : null}

                            <p className="figtree text-[#000000] text-[12px] md:text-[16px] text-center">
                                {brand.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RentByBrands;
