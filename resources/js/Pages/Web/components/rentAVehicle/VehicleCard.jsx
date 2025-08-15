import React from "react";
import { FaGasPump, FaCar, FaUsers, FaBolt } from 'react-icons/fa'; // Assuming these icons or similar are available

const VehicleCard = () => {
  return (
    <div className="vehicle-card border border-gray-200 rounded-lg p-4 text-center shadow-md bg-white">
      <img src="placeholder_car_image.jpg" alt="Vehicle" className="vehicle-image w-full h-40 object-cover rounded-md mb-4" />
      <div className="vehicle-details flex justify-around mb-4 text-sm text-gray-600">
        <div className="detail-item flex items-center">
          {/* Mileage icon and value */}
          <span className="mr-1.5">4,000</span>
        </div>
        <div className="detail-item flex items-center">
          <FaCar className="mr-1.5" />
          <span>Auto</span>
        </div>
        <div className="detail-item flex items-center">
          <FaUsers className="mr-1.5" />
          <span>4 Person</span>
        </div>
        <div className="detail-item flex items-center">
          <FaBolt className="mr-1.5" /> {/* Or FaGasPump */}
          <span>Electric</span>
        </div>
      </div>
      <h4 className="text-lg font-semibold mb-1.5">HYUNDAI TUCSON</h4>
      <p className="price text-xl font-bold mb-4">89.00<span className="text-sm font-normal"> / day</span></p>
      <div className="card-actions flex justify-center gap-2.5">
        <button className="details-button bg-blue-500 text-white border-none py-2.5 px-4 rounded cursor-pointer text-sm">MORE DETAILS</button>
        <button className="like-button bg-transparent text-blue-500 border border-blue-500 py-2.5 px-4 rounded cursor-pointer text-sm">♡</button>
      </div>
    </div>
  );
};

export default VehicleCard; 