import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import heartFilled from '../../assets/vehicleDetails/bigHeart.png';
import gearIcon from '../../assets/vehicleDetails/gearIcon.png';
import petrolIcon from '../../assets/vehicleDetails/petrolIcon.png';
import doorIcon from '../../assets/vehicleDetails/doorIcon.png';
import airIcon from '../../assets/vehicleDetails//filterIcon.png';
import distanceIcon from '../../assets/vehicleDetails/distanceIcon.png';
import seatIcon from '../../assets/vehicleDetails/seat.png';

const VehicleInformation = ({ vehicle }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const { vehicleName, brand } = useMemo(() => {
    const [name, ...brandParts] = vehicle.name.split(' ');
    return {
      vehicleName: name,
      brand: brandParts.join(' ')
    };
  }, [vehicle.name]);

  const specifications = useMemo(() => [
    { icon: gearIcon, title: 'Gear Box', value: 'Automat' },
    { icon: petrolIcon, title: 'Fuel', value: 'Petrol' },
    { icon: doorIcon, title: 'Doors', value: '4' },
    { icon: airIcon, title: 'Air Conditioner', value: 'Yes' },
    { icon: distanceIcon, title: 'Distance', value: '500' },
    { icon: seatIcon, title: 'Seats', value: '5' }
  ], []);

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
  };

  return (
    <div className="poppins vehicle-details-section mt-6 flex-1 ml-4 bg-[#F4F3F3] h-[489px] rounded-[12px] p-10">
      <div className="flex justify-between items-center">
        <h1 className="bebas-neue vehicle-name text-[50px] font-[400]">
          {vehicleName} <span className='text-[#0955AC]'>{brand}</span>
        </h1>
        {/* Heart Icon */}
        <img 
          src={heartFilled} 
          alt="Favorite" 
          className={`h-[19px] w-[23px] cursor-pointer ${isFavorite ? 'opacity-100' : 'opacity-50'}`}
          onClick={toggleFavorite}
        />
      </div>
      <div className="rating-views flex items-center text-[24px] text-[#FFCD29] mt-1">
        {/* Rating Stars */}
        ★★★★☆
        <span className="ml-2 text-[12px] font-[400] text-[#00000059]">100+ views</span>
      </div>
      <p className="vehicle-description text-gray-700 mt-2">
        The {vehicle.name} is a premium vehicle offering comfort, style, and performance. Experience luxury and reliability with this exceptional automobile.
      </p>
      
      {/* Specifications Grid */}
      <div className="work-sans text-[16px] font-[600] specifications-grid grid md:grid-cols-3 gap-10 mt-10">
        {specifications.map((spec, index) => (
          <div key={index} className="specification-item flex items-center gap-3 xl:min-w-[180px]">
            <img src={spec.icon} alt={spec.title} className="w-[20px] h-[20px] mt-1" />
            <div>
              <div>{spec.title}</div>
              <div className="text-[#00000099] font-[400]">{spec.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Price and Book Button */}
      <div className="price-booking-section flex flex-col md:flex-row justify-between items-center mt-12">
        <div className="price text-[22px] font-[500]">
          $<span className='text-[32px] font-[700]'>{vehicle.price}</span>.00 
          <span className="text-[15px] font-[600] text-[#00000080]">/day</span>
        </div>
        <button className="book-button bg-[#0955AC] text-white px-6 py-3 rounded-[9px] w-[161px] h-[45px] text-[15px] font-[700]">
          BOOK A RIDE
        </button>
      </div>
    </div>
  );
};

VehicleInformation.propTypes = {
  vehicle: PropTypes.shape({
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default VehicleInformation; 