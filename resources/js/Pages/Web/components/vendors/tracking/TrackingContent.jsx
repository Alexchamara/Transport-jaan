import React from "react";
import { usePage } from "@inertiajs/react";
// ... (omitted imports for brevity, assume they are correct)
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";
import map from "../../../assets/vendors/tracking/map.svg";
import miniSearchIcon from "../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import settingsTwo from "../../../assets/vendors/tracking/settings.svg";
import car1 from "../../../assets/vendors/dashboard/icons/car1.svg";
import car3 from "../../../assets/vendors/dashboard/icons/car3.svg";
import miniCarIcon from "../../../assets/vendors/tracking/minicarIcon.svg";
import proPicTwo from "../../../assets/vendors/tracking/proPic.svg";
import cal from "../../../assets/vendors/tracking/cal.svg";
import cal2 from "../../../assets/vendors/tracking/cal2.svg";
import time from "../../../assets/vendors/tracking/time.svg";
import distance from "../../../assets/vendors/tracking/distance.svg";
import UserDropdown from "../../../components/vendors/UserDropdown";


const TrackingContent = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

  // Helper to render repeated cards cleanly
  const renderCarCard = (index) => (
    <div key={index} className="w-full min-h-[104px] border-[1px] border-[#0000004D] rounded-[9px] mt-4">
      <div className="grid grid-cols-3 justify-center items-center p-2">
        <img src={car1} alt="Car" className="h-[75px] object-contain mx-auto" />
        <div className="flex flex-col justify-start items-start col-span-1">
          <h1 className="text-[18px] sm:text-[18px] font-[700] truncate w-full">Fiona Brown</h1>
          <div className="flex flex-row justify-start items-center text-[14px] font-[500] text-[#00000080] gap-2">
            <img src={miniCarIcon} alt="Icon" />
            <h1>BMW LX3</h1>
          </div>
        </div>
        <div className="flex justify-end items-center pr-2">
          <div className="w-[70px] sm:w-[90px] h-[28px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[12px] font-[700] text-[#50AE31] flex justify-center items-center">
            On Trip
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-auto px-4 sm:px-5 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-5 justify-between items-center mt-5">
        <h1 className="figtree text-[28px] md:text-[35px] font-[700]">Vehicle Rental Tracking</h1>
        <div className="flex flex-row gap-5 relative items-center">
          <div className="flex flex-row gap-5 relative items-center">
            <UserDropdown settingsRoute={route("settingsPage")} />
          </div>
        </div>
      </div>

      {/* Main Content: New Width Ratio Applied (Left: 5/12, Right: 7/12) */}
      <div className="flex flex-col lg:flex-row gap-6 w-full py-10">
        
        {/* Left Panel: Car Types - REDUCED WIDTH & PADDING */}
        <div
          className="w-full lg:w-5/12 max-h-[90vh] bg-[#FFFFFF] rounded-[10px] px-4 sm:px-6 pt-6 pb-2 flex flex-col"
          style={{ boxShadow: "4px 4px 4px #0000001A" }}
        >
          <h1 className="text-[20px] sm:text-[24px] font-[700] mb-2">Car Types</h1>
          
          {/* Search Bar Row - REDUCED MARGINS */}
          <div className="flex flex-row justify-between items-center gap-4 flex-shrink-0">
            <div className="w-full h-[40px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-start items-center py-2 px-4 my-4 gap-3">
              <img src={miniSearchIcon} alt="Search" />
              <input
                type="text"
                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC] text-sm"
                placeholder="Search client name, car, etc."
              />
            </div>
            <div className="min-w-[30px] h-[30px] bg-[#F3F3F3] rounded-[6px] flex justify-center items-center cursor-pointer">
              <img src={settingsTwo} alt="Settings" className="w-4 h-4" />
            </div>
          </div>

          <div className="flex flex-col overflow-y-auto max-h-[60vh] -mx-1 px-1 custom-scrollbar">
            {/* Render Cards (Height reduced slightly via card content reduction) */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => renderCarCard(item))}

            {/* Button - REDUCED MARGIN */}
            <button className="w-full h-[45px] bg-[#0955AC] rounded-[6px] text-[16px] font-[700] text-[#FFFFFF] mt-4 mb-0 hover:bg-[#07448a] transition-colors flex-shrink-0">
              Check Availability
            </button>
          </div>
        </div>

        {/* Right Panel: Info & Map - RESTRUCTURED */}
        <div className="w-full lg:w-7/12 h-auto flex flex-col gap-6">
          
          {/* Combined Info Cards Container (Single Row on Desktop) */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            
            {/* 1. User Details Card (Position 1) */}
            <div
              className="w-full md:w-1/3 bg-[#FFFFFF] rounded-[10px] px-5 py-5"
              style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
              <div className="flex flex-row gap-4 items-center">
                <img src={proPicTwo} alt="Profile" className="w-[50px] h-[50px]" />
                <div className="flex flex-col justify-center items-end w-full gap-1 overflow-hidden">
                  <h1 className="text-[14px] font-[600] truncate">Steve Gibson</h1>
                  <h1 className="text-[12px] font-[500] text-[#616161] truncate">steve@example.com</h1>
                  <h1 className="text-[11px] font-[500] text-[#00000080]">+94 77 301 1345</h1>
                  <div className=" w-[65px] h-[20px] rounded-[5px] border-[1.5px] bg-[#50AE3140] border-[#50AE31] text-[10px] font-[700] text-[#50AE31] flex justify-center items-center mt-1">
                    On Trip
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vehicle Info Card (MOVED TO Position 2) */}
            <div
              className="w-full md:w-1/3 bg-[#FFFFFF] rounded-[10px] px-5 py-5"
              style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
              <div className="flex flex-row gap-3 items-center w-full"> {/* Added w-full here */}
                <img src={car3} className="h-[60px] w-[80px] object-contain flex-shrink-0" alt="Car" /> {/* Added flex-shrink-0 */}
                {/* MODIFIED: Changed items-start to items-end and text-right */}
                <div className="text-[13px] font-[500] flex flex-col gap-1 items-end w-full text-right"> 
                  <h1 className="text-[16px] font-[600]">BMW LX3</h1>
                  <div className="flex flex-row gap-2 justify-end"> {/* Added justify-end */}
                    <h1 className="text-[#00000080]">Car Type:</h1>
                    <h1>SUV</h1>
                  </div>
                  <div className="flex flex-row gap-2 justify-end"> {/* Added justify-end */}
                    <h1 className="text-[#00000080]">Plate:</h1>
                    <h1>CBK 2324</h1>
                  </div>
                   <div className="flex flex-row gap-2 justify-end"> {/* Added justify-end */}
                    <h1 className="text-[#00000080]">Distance:</h1>
                    <h1>210 miles</h1>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 3. Rent Info Card (MOVED TO Position 3) */}
            <div
              className="w-full md:w-1/3 bg-[#FFFFFF] rounded-[10px] px-5 py-5"
              style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
              <h1 className="text-[18px] font-[700]">Rent Info</h1>
              <div className="flex flex-col gap-2 pt-3 text-sm">
                  <div className="flex flex-row justify-between items-center font-[500]">
                    <div className="flex flex-row gap-1 items-center"><img src={cal} alt="icon" className="w-4 h-4" /><h1 className="text-[#00000080]">Start Date</h1></div>
                    <h1>25th June 2025</h1>
                  </div>
                  <div className="flex flex-row justify-between items-center font-[500]">
                    <div className="flex flex-row gap-1 items-center"><img src={cal2} alt="icon" className="w-4 h-4" /><h1 className="text-[#00000080]">End Date</h1></div>
                    <h1>27th June 2025</h1>
                  </div>
                  <div className="flex flex-row justify-between items-center font-[500]">
                    <div className="flex flex-row gap-1 items-center"><img src={time} alt="icon" className="w-4 h-4" /><h1 className="text-[#00000080]">Trip Time</h1></div>
                    <h1>22 hr 34 mins</h1>
                  </div>
              </div>
            </div>

          </div>

          {/* Map Image: Remains w-full but gets more desktop width */}
          <div className="w-full rounded-[10px] overflow-hidden max-h-[400px]" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
             <img
                src={map}
                className="w-full h-full object-cover block"
                alt="Map Location"
            />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TrackingContent;