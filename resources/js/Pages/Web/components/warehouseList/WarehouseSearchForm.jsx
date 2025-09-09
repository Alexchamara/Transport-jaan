import React from "react";
import { router } from "@inertiajs/react";
import calendarBlue from "../../assets/vehicleList/calendarBlue.png"
import locationBlue from "../../assets/vehicleList/locationBlue.png"

const WarehouseSearchForm = ({ formData, onFormChange }) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    onFormChange({
      ...formData,
      [id]: value
    });
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
    router.get('/warehouseList', searchParams, {
      preserveState: true,
      preserveScroll: true
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="figtree bg-white p-4 sm:p-6 rounded-[15px] shadow-2xl shadow-[#00000040] w-full max-w-[1110px] min-h-[132px] text-[#286BB6] text-[13px] font-[400]">
        {/* Combined Inputs and Button */}
        <div className="flex flex-col sm:flex-row items-end gap-4">
          {/* Input Fields Container */}
          <div className="flex flex-col sm:flex-row flex-grow gap-4 w-full">
            {/* Warehouse Location */}
            <div className="w-full sm:flex-1">
              <label htmlFor="warehouseLocation" className="block mb-1">
                Warehouse Location
              </label>
              <div className="relative flex items-center">
                {/* Location Icon Placeholder */}
                <img src={locationBlue} className="absolute inset-y-5 left-0 flex items-center pl-3 pointer-events-none" alt="location" />
                <input
                  type="text"
                  id="warehouseLocation"
                  placeholder="Search a location"
                  value={formData.warehouseLocation}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                />
              </div>
            </div>

            {/* Required Space (sq ft) */}
            <div className="w-full sm:flex-1">
              <label htmlFor="requiredSpace" className="block mb-1">
                Required Space (sq ft)
              </label>
              <input
                type="number"
                id="requiredSpace"
                placeholder="e.g., 10000"
                value={formData.requiredSpace}
                onChange={handleInputChange}
                className="shadow-sm w-full border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
              />
            </div>

            {/* Move-in Date */}
            <div className="w-full sm:flex-1">
              <label htmlFor="moveinDate" className="block mb-1">
                Move-in Date
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  id="moveinDate"
                  placeholder="12/12/2023"
                  value={formData.moveinDate}
                  onChange={handleInputChange}
                  className="shadow-sm w-full border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pr-12 [&::-webkit-calendar-picker-indicator]:hidden"
                />
                {/* Calendar Icon Placeholder */}
                <img 
                  src={calendarBlue} 
                  className="absolute inset-y-5 right-0 flex items-center pr-3 cursor-pointer" 
                  alt="calendar" 
                  onClick={() => document.getElementById('moveinDate').showPicker()}
                />
              </div>
            </div>

            {/* Lease Duration */}
            <div className="w-full sm:flex-1">
              <label htmlFor="leaseDuration" className="block mb-1">
                Lease Duration
              </label>
              <select
                id="leaseDuration"
                value={formData.leaseDuration}
                onChange={handleInputChange}
                className="shadow-sm w-full border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline text-[#286BB6]"
              >
                <option value="">Select duration</option>
                <option value="1-3">1-3 months</option>
                <option value="3-6">3-6 months</option>
                <option value="6-12">6-12 months</option>
                <option value="12+">12+ months</option>
                <option value="long-term">Long-term (2+ years)</option>
              </select>
            </div>
          </div>

          {/* Find a Warehouse Button */}
          <button 
            type="submit"
            className="bg-[#0955AC] text-white font-bold h-[56px] w-full sm:w-[56px] flex items-center justify-center rounded-[8px] focus:outline-none focus:shadow-outline cursor-pointer mt-4 sm:mt-0 hover:bg-[#0744A0] transition-colors"
          >
            →
          </button>
        </div>
      </form>
    </div>
  );
};

export default WarehouseSearchForm;