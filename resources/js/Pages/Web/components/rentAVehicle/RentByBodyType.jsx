import React from 'react';
import { router } from '@inertiajs/react';
// Import body type icons
import suvIcon from '../../assets/rentAVehicle/bodyType/suv.png';
import crossoverIcon from '../../assets/rentAVehicle/bodyType/crossover.png';
import wagonIcon from '../../assets/rentAVehicle/bodyType/wagon.png';
import familyMbpIcon from '../../assets/rentAVehicle/bodyType/family.png';
import sportCoupe from '../../assets/rentAVehicle/bodyType/sportCoupe.png';
import compact from '../../assets/rentAVehicle/bodyType/compact.png';
import coupeIcon from '../../assets/rentAVehicle/bodyType/coupe.png';
import truckIcon from '../../assets/rentAVehicle/bodyType/truck.png';
import sedanIcon from '../../assets/rentAVehicle/bodyType/sedan.png';
import limousineIcon from '../../assets/rentAVehicle/bodyType/limousine.png';
import convertibleIcon from '../../assets/rentAVehicle/bodyType/convertible.png';

const RentByBodyType = () => {
  const bodyTypes = [
    { name: "SUV", icon: suvIcon },
    { name: "Crossover", icon: crossoverIcon },
    { name: "Wagon", icon: wagonIcon },
    { name: "Family MBP", icon: familyMbpIcon },
    { name: "sportCoupe", icon: sportCoupe },
    { name: "compact", icon: compact },
    { name: "Coupe", icon: coupeIcon },
    { name: "Truck", icon: truckIcon },
    { name: "Sedan", icon: sedanIcon },
    { name: "Limousine", icon: limousineIcon },
    { name: "Convertible", icon: convertibleIcon },
    { name: "SportCoup", icon: sportCoupe },
  ];

  const handleBodyTypeClick = (bodyType) => {
    router.visit('/vehicleList', {
      data: {
        searchParams: {
          bodyType: bodyType.name
        }
      }
    });
  };

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <h2 className="bebas-neue text-[40px] font-[400] text-center mb-8">
          RENT BY <span className="text-[#0955AC]">BODY TYPE</span>
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-10 cursor-pointer">
          {bodyTypes.map((bodyType, index) => (
            <div 
              key={index} 
              className="bg-[#EAEAE9] border-[1px] border-[#0955AC] p-4 rounded-[8px] shadow flex flex-col items-center justify-center h-[137px] hover:bg-[#f5f5f5] transition-colors duration-200"
              onClick={() => handleBodyTypeClick(bodyType)}
            >
              <img src={bodyType.icon} alt={`${bodyType.name} Icon`} className="h-[40px] object-contain mb-5" />
              <p className="figtree text-[#0955AC] text-[12px] md:text-[16px] text-center">{bodyType.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentByBodyType; 