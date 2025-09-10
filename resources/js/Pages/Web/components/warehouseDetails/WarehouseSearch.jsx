import React, { useState } from "react";
import { router } from "@inertiajs/react";
import calendarBlue from "../../assets/vehicleList/calendarBlue.png";
import locationBlue from "../../assets/vehicleList/locationBlue.png";

const WarehouseSearch = () => {
  const [formData, setFormData] = useState({
    warehouseLocation: '',
    requiredSpace: '',
    moveinDate: '',
    leaseDuration: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search parameters
    const searchParams = {
      warehouseLocation: formData.warehouseLocation,
      requiredSpace: formData.requiredSpace,
      moveinDate: formData.moveinDate,
      leaseDuration: formData.leaseDuration
    };

    // Remove empty parameters
    Object.keys(searchParams).forEach(key => {
      if (!searchParams[key]) {
        delete searchParams[key];
      }
    });

    // Navigate to warehouse list with search parameters
    router.visit('/warehouseList', {
      method: 'get',
      data: searchParams
    });
  };

  return (
    <div className="w-full max-w-[400px] bg-white rounded-[15px] shadow-lg p-6">
      <h3 className="bebas-neue text-[24px] text-[#0955AC] mb-6 text-center">
        FIND ANOTHER WAREHOUSE
      </h3>
      
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Location */}
        <div>
          <label htmlFor="warehouseLocation" className="block text-[13px] font-[400] text-[#286BB6] mb-1 figtree">
            Location
          </label>
          <div className="relative">
            <img 
              src={locationBlue} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" 
              alt="location" 
            />
            <input
              type="text"
              id="warehouseLocation"
              placeholder="Search a location"
              value={formData.warehouseLocation}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-[#0000001A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent placeholder:text-[#286BB6] figtree"
            />
          </div>
        </div>

        {/* Required Space */}
        <div>
          <label htmlFor="requiredSpace" className="block text-[13px] font-[400] text-[#286BB6] mb-1 figtree">
            Required Space (sq ft)
          </label>
          <input
            type="number"
            id="requiredSpace"
            placeholder="e.g., 10000"
            value={formData.requiredSpace}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-[#0000001A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent placeholder:text-[#286BB6] figtree"
          />
        </div>

        {/* Move-in Date */}
        <div>
          <label htmlFor="moveinDate" className="block text-[13px] font-[400] text-[#286BB6] mb-1 figtree">
            Move-in Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="moveinDate"
              value={formData.moveinDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 pr-12 border border-[#0000001A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent [&::-webkit-calendar-picker-indicator]:hidden figtree"
            />
            <img 
              src={calendarBlue} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" 
              alt="calendar" 
              onClick={() => document.getElementById('moveinDate').showPicker()}
            />
          </div>
        </div>

        {/* Lease Duration */}
        <div>
          <label htmlFor="leaseDuration" className="block text-[13px] font-[400] text-[#286BB6] mb-1 figtree">
            Lease Duration
          </label>
          <select
            id="leaseDuration"
            value={formData.leaseDuration}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-[#0000001A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent text-[#286BB6] figtree"
          >
            <option value="">Select duration</option>
            <option value="1-3">1-3 months</option>
            <option value="3-6">3-6 months</option>
            <option value="6-12">6-12 months</option>
            <option value="12+">12+ months</option>
            <option value="long-term">Long-term (2+ years)</option>
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-[#0955AC] text-white py-3 rounded-lg font-semibold hover:bg-[#0744A0] transition-colors figtree"
        >
          Search Warehouses
        </button>
      </form>
    </div>
  );
};

export default WarehouseSearch;