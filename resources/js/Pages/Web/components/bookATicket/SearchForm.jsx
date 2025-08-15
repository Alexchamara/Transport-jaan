import React, { useState } from "react";
import calendarBlue from "../../assets/vehicleList/calendarBlue.png"
import locationBlue from "../../assets/vehicleList/locationBlue.png"
import TrainResults from "./TrainResults";

const SearchForm = ({ formData, onFormChange }) => {
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    onFormChange({
      ...formData,
      [id]: value
    });
  };

  const handleSearch = () => {
    setShowResults(true);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full">
      {/* Search Form */}
      <div className="figtree bg-white p-4 sm:p-6 rounded-[15px] shadow-[2px_2px_8px_8px_#00000012] w-full max-w-[1110px] min-h-[132px] text-[#286BB6] text-[13px] font-[400]">
        {/* Combined Inputs and Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
          {/* Input Fields Container */}
          <div className="flex flex-col sm:flex-row flex-grow gap-4 w-full justify-end">
            {/* Pick-up Location */}
            <div className="w-full sm:flex-1">
              <label htmlFor="pickupLocation" className="block mb-1">
                Pick-up Location
              </label>
              <div className="relative flex items-center">
                {/* Location Icon Placeholder */}
                <img src={locationBlue} className="absolute inset-y-5 left-0 flex items-center pl-3 pointer-events-none" alt="location" />
                <input
                  type="text"
                  id="pickupLocation"
                  placeholder="Search a location"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                />
              </div>
            </div>

            {/* Pick-up Date */}
            <div className="w-full sm:flex-1">
              <label htmlFor="pickupDate" className="block mb-1">
                Pick-up Date
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  id="pickupDate"
                  placeholder="12/12/2023"
                  value={formData.pickupDate}
                  onChange={handleInputChange}
                  className="shadow-sm w-full border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pr-12 [&::-webkit-calendar-picker-indicator]:hidden"
                />
                {/* Calendar Icon Placeholder */}
                <img 
                  src={calendarBlue} 
                  className="absolute inset-y-5 right-0 flex items-center pr-3 cursor-pointer" 
                  alt="calendar" 
                  onClick={() => document.getElementById('pickupDate').showPicker()}
                />
              </div>
            </div>

            {/* Drop-off Location */}
            <div className="w-full sm:flex-1">
              <label htmlFor="dropoffLocation" className="block mb-1">
                Drop-off Location
              </label>
              <div className="relative flex items-center">
                {/* Location Icon Placeholder */}
                <img src={locationBlue} className="absolute inset-y-5 left-0 flex items-center pl-3 pointer-events-none" alt="location" />
                <input
                  type="text"
                  id="dropoffLocation"
                  placeholder="Search a location"
                  value={formData.dropoffLocation}
                  onChange={handleInputChange}
                  className="shadow-sm w-full border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                />
              </div>
            </div>

            {/* Drop-off Date */}
            <div className="w-full sm:flex-1">
              <label htmlFor="dropoffDate" className="block mb-1">
                Drop-off Date
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  id="dropoffDate"
                  placeholder="12/12/2023"
                  value={formData.dropoffDate}
                  onChange={handleInputChange}
                  className="shadow-sm border-[#0000001A] rounded-[8px] p-[16px] w-full leading-tight focus:outline-none focus:shadow-outline pr-12 [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <img 
                  src={calendarBlue} 
                  className="absolute inset-y-5 right-0 flex items-center pr-3 cursor-pointer" 
                  alt="calendar" 
                  onClick={() => document.getElementById('dropoffDate').showPicker()}
                />
              </div>
            </div>
          </div>

          {/* Find a Vehicle Button */}
          <button 
            onClick={handleSearch}
            className="bg-[#0955AC] text-white font-bold h-[56px] w-full sm:w-[56px] flex items-center justify-center rounded-[8px] focus:outline-none focus:shadow-outline cursor-pointer mt-4 sm:mt-0 hover:bg-[#07448A] transition-colors duration-200"
          >
            →
          </button>
        </div>
      </div>

      {/* Show Train Results */}
      {showResults && <TrainResults searchParams={formData} />}
    </div>
  );
};

export default SearchForm;
