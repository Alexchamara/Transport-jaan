import React from 'react';
import { router } from '@inertiajs/react';
// Import brand logos
import toyotaLogo from '../../assets/rentAVehicle/brands/toyota.png';
import fordLogo from '../../assets/rentAVehicle/brands/ford.png';
import teslaLogo from '../../assets/rentAVehicle/brands/tesla.png';
import volkswagenLogo from '../../assets/rentAVehicle/brands/Volkswagen.png';
// import chevroletLogo from '../../assets/rentAVehicle/brands/';
import bmwLogo from '../../assets/rentAVehicle/brands/bmw.png';
import mercedesLogo from '../../assets/rentAVehicle/brands/benz.png';
import hyundaiLogo from '../../assets/rentAVehicle/brands/Hyundai.png';
import audiLogo from '../../assets/rentAVehicle/brands/Audi.png';
import kiaLogo from '../../assets/rentAVehicle/brands/Kia.png';

const RentByBrands = () => {
  const brands = [
    { name: "Toyota", logo: toyotaLogo },
    { name: "Ford", logo: fordLogo },
    { name: "Tesla", logo: teslaLogo },
    { name: "Volkswagen", logo: volkswagenLogo },
    { name: "Chevrolet", logo: volkswagenLogo },
    { name: "BMW", logo: bmwLogo },
    { name: "Mercedes-Benz", logo: mercedesLogo },
    { name: "Hyundai", logo: hyundaiLogo },
    { name: "Audi", logo: audiLogo },
    { name: "KIA", logo: kiaLogo },
    { name: "Tesla", logo: teslaLogo },
    { name: "Mercedes-Benz", logo: mercedesLogo },
  ];

  const handleBrandClick = (brandName) => {
    router.visit('/vehicleList', {
      data: {
        searchParams: {
          brand: brandName
        }
      }
    });
  };

  return (
    <div className="w-full py-12 mt-10">
      <div className="container mx-auto px-4">
        <h2 className="bebas-neue text-[40px] font-[400] text-center mb-8">
          RENT BY <span className="text-[#0955AC]">BRANDS</span>
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-10">
          {brands.map((brand, index) => (
            <div 
              key={index} 
              onClick={() => handleBrandClick(brand.name)}
              className="bg-[#EAEAE9] border-[1px] border-[#0955AC] p-4 rounded-[8px] shadow flex flex-col items-center justify-center h-[137px] cursor-pointer hover:bg-[#f5f5f5] transition-colors duration-300"
            >
              <img src={brand.logo} alt={`${brand.name} Logo`} className="object-contain mb-5 w-[42px] h-[42px]" />
              <p className="figtree text-[#0F0F0F] text-[12px] md:text-[16px] font-[500] group-hover:text-white text-center">{brand.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentByBrands; 