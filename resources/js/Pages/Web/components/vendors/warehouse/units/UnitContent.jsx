import React, { useState, useEffect } from "react";
import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

import AddUnit from "../../../../home/vendors/warehouse/AddUnit";

const UnitContent = () => {
  // Sample data array for warehouse units based on Warehouse model
  const units = [
    {
      id: 1,
      name: "Central Cold Storage A",
      address: "123 Industrial Ave, Warehouse District",
      latitude: 6.9271,
      longitude: 79.8612,
      total_area: 2500.00,
      capacity: 5000.00,
      type: "Cold Storage",
      amenities: ["Temperature Control", "Loading Dock", "Security", "CCTV"],
      pricing_model: "per_sqft_monthly",
      price: 15.50,
      status: "Available",
      is_active: true,
      availability_status: "Available",
    },
    {
      id: 2,
      name: "Dry Storage Warehouse B",
      address: "456 Commerce Blvd, Industrial Zone",
      latitude: 6.9344,
      longitude: 79.8428,
      total_area: 3200.00,
      capacity: 8000.00,
      type: "Dry Storage",
      amenities: ["Forklift Access", "Loading Bay", "Security", "Fire Safety"],
      pricing_model: "per_pallet_monthly",
      price: 120.00,
      status: "Occupied",
      is_active: true,
      availability_status: "Occupied",
    },
    {
      id: 3,
      name: "Climate Controlled Unit C",
      address: "789 Storage St, Commercial District",
      latitude: 6.9157,
      longitude: 79.8739,
      total_area: 1800.00,
      capacity: 3500.00,
      type: "Climate Controlled",
      amenities: ["Climate Control", "Humidity Control", "Security", "24/7 Access"],
      pricing_model: "per_sqft_monthly",
      price: 22.75,
      status: "Available",
      is_active: true,
      availability_status: "Available",
    },
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const perPageOptions = [5, 10, 20, 50];
  const totalPages = Math.ceil(units.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentUnits = units.slice(startIdx, endIdx);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Helper for pagination numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  // Reset to first page when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Handle Add Unit button click
  const handleAddUnitClick = () => {
    setShowAddUnit(true);
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'text-[#3C9A34]';
      case 'Occupied':
        return 'text-[#D97706]';
      case 'Maintenance':
        return 'text-[#DC2626]';
      default:
        return 'text-[#7B7B7A]';
    }
  };

  return (
    <div className="w-full h-auto pr-5 py-10">
      {/* Header section */}
      <div className="flex flex-row gap-5 justify-between items-center">
        <h1 className="figtree text-[35px] font-[700]">Warehouse Units</h1>
        <div className="flex flex-row gap-5">
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={search} alt="Search" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={settings} alt="Settings" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={bell} alt="Notifications" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={proPic} alt="Profile" />
          </div>
          <div className="figtree flex flex-col justify-center items-start">
            <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
            <h1 className="text-[16px] font-[600] text-[#7B7B7A]">Vendor</h1>
          </div>
        </div>
      </div>

      {/* Search, Filter section */}
      <div className="flex flex-row justify-between mt-10 mb-5">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row gap-5 justify-center items-center">
            <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
              <img src={miniSearchIcon} alt="Search" />
              <input type="text" className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]" placeholder="Search warehouse name, address..." />
            </div>
            <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">Type</h1>
              <img src={miniDownArrow} alt="Dropdown" />
            </div>
            <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">Status</h1>
              <img src={miniDownArrow} alt="Dropdown" />
            </div>
          </div>
          <button className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]" onClick={handleAddUnitClick}>
            Add Warehouse
          </button>
        </div>
      </div>

      {/* Conditionally render AddUnit or Units list */}
      {showAddUnit ? (
        <AddUnit />
      ) : (
        <>
          {/* Warehouse units cards */}
          {currentUnits.map((unit) => (
            <div key={unit.id} className="relative w-auto h-auto min-h-[157px] bg-[#FFFFFF] rounded-[10px] flex flex-col lg:flex-row items-center my-6" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              {/* text section */}
              <div className="px-5 py-5 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="bebas-neue text-[28px] font-[400]">
                      <h1>
                        {unit.name} <span className="text-[#0955AC]">[{unit.type}]</span>
                      </h1>
                    </div>
                    <div className="poppins text-[14px] font-[600] flex gap-4">
                      <span className={`${statusColor(unit.status)}`}>{unit.availability_status}</span>
                      <span className="text-[#7B7B7A]">Type: {unit.type}</span>
                      <span className="text-[#7B7B7A]">Model: {unit.pricing_model}</span>
                    </div>
                    <div className="poppins text-[12px] text-[#7B7B7A] mt-1">
                      <span>{unit.address}</span>
                    </div>
                  </div>
                  <div className="figtree text-right">
                    <div className="text-[20px] font-[700]">Area: {unit.total_area} sqft</div>
                    <div className="text-[14px] text-[#7B7B7A]">Capacity: {unit.capacity} units</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 text-[14px] poppins">
                  <div>
                    <div className="text-[#7B7B7A]">Coordinates</div>
                    <div className="font-[600]">{unit.latitude}, {unit.longitude}</div>
                  </div>
                  <div>
                    <div className="text-[#7B7B7A]">Price</div>
                    <div className="font-[600]">${unit.price}</div>
                  </div>
                  <div>
                    <div className="text-[#7B7B7A]">Pricing Model</div>
                    <div className="font-[600]">{unit.pricing_model.replace(/_/g, ' ')}</div>
                  </div>
                  <div>
                    <div className="text-[#7B7B7A]">Amenities</div>
                    <div className="font-[600]">{unit.amenities.slice(0, 2).join(', ')}{unit.amenities.length > 2 ? '...' : ''}</div>
                  </div>
                  <div>
                    <div className="text-[#7B7B7A]">Active</div>
                    <div className="font-[600]">{unit.is_active ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="flex items-center lg:justify-end">
                    <button className="figtree min-w-[140px] h-[44px] bg-[#0955AC] rounded-[5px] text-[20px] text-[#FFFFFF] font-[700]" onClick={() => (window.location.href = "/warehouse/unitDetails")}>
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls and Results per page */}
          <div className="flex justify-between items-center gap-2 mt-20">
            {/* Left: Results per page */}
            <div className="flex items-center">
              <span className="mr-3 text-[#00000080] text-[15px]">Results per page</span>
              <select className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                {perPageOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {/* Right: Pagination */}
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                <span className="text-lg">&#60;</span>
              </button>
              {getPageNumbers().map((num, idx) =>
                num === "..." ? (
                  <span key={idx} className="px-2">...</span>
                ) : (
                  <button key={num} className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${currentPage === num ? "text-[#0955AC] font-[600] border-[2px] border-[#0955AC]" : "bg-[#F4F3F3]"}`} onClick={() => goToPage(num)}>
                    {num}
                  </button>
                )
              )}
              <button className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                <span className="text-lg">&#62;</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UnitContent;