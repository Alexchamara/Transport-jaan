import React from "react";
import { router } from "@inertiajs/react";
import { Waves, Plane } from "lucide-react";

// Land vehicle brand images (using your existing body type assets as brand placeholders)
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

const RentByBrands = ({ selectedType = "other" }) => {
  // Brand sets per category
  const BRAND_MAP = {
    // Land vehicles (showing images instead of initials)
    other: [
      { name: "Toyota", value: "toyota", img: suvIcon },
      { name: "Honda", value: "honda", img: crossoverIcon },
      { name: "Nissan", value: "nissan", img: wagonIcon },
      { name: "BMW", value: "bmw", img: familyMbpIcon },
      { name: "Mercedes-Benz", value: "mercedes-benz", img: sportCoupe },
      { name: "Audi", value: "audi", img: compact },
      { name: "Ford", value: "ford", img: coupeIcon },
      { name: "Chevrolet", value: "chevrolet", img: truckIcon },
      { name: "Tesla", value: "tesla", img: sedanIcon },
      { name: "Jeep", value: "jeep", img: limousineIcon },
      { name: "Land Rover", value: "land-rover", img: convertibleIcon },
    ],
    // Watercraft
    water: [
      { name: "Yamaha Marine", value: "yamaha" },
      { name: "Sea-Doo", value: "sea-doo" },
      { name: "Bayliner", value: "bayliner" },
      { name: "Quicksilver", value: "quicksilver" },
      { name: "Beneteau", value: "beneteau" },
      { name: "Princess", value: "princess" },
    ],
    // Aircraft
    air: [
      { name: "Airbus", value: "airbus" },
      { name: "Boeing", value: "boeing" },
      { name: "Cessna", value: "cessna" },
      { name: "Bell", value: "bell" },
      { name: "Gulfstream", value: "gulfstream" },
      { name: "Embraer", value: "embraer" },
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

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-10 cursor-pointer">
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
              ) : selectedType === "water" ? (
                <Waves className="w-[42px] h-[42px] mb-5 text-[#0F0F0F]" />
              ) : selectedType === "air" ? (
                <Plane className="w-[42px] h-[42px] mb-5 text-[#0F0F0F]" />
              ) : null}

              <p className="figtree text-[#0955AC] text-[12px] md:text-[16px] text-center">
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