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
  // Sample data array for warehouse items
  const units = [
    {
      id: 1,
      sku: "RM-001",
      name: "Green Tea Leaves",
      category: "Raw Material",
      uom: "kg",
      qty: 240,
      minStock: 100,
      location: "Aisle A3 / Bin B12",
      status: "In Stock",
      cost: 6.5,
      price: 9.0,
      batch: "B-25-001",
      expiry: "2026-03-10",
    },
    {
      id: 2,
      sku: "PK-010",
      name: "500ml Bottles",
      category: "Packaging",
      uom: "pcs",
      qty: 1200,
      minStock: 500,
      location: "Aisle P1 / Bin P05",
      status: "In Stock",
      cost: 0.12,
      price: 0.25,
      batch: "PK-25-010",
      expiry: "",
    },
    {
      id: 3,
      sku: "FG-200",
      name: "Premium Tea - 200g",
      category: "Finished Goods",
      uom: "pcs",
      qty: 18,
      minStock: 50,
      location: "Aisle F2 / Bin F09",
      status: "Low Stock",
      cost: 2.9,
      price: 4.5,
      batch: "FG-25-200",
      expiry: "2025-12-01",
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
      case 'In Stock':
        return 'text-[#3C9A34]';
      case 'Low Stock':
        return 'text-[#D97706]';
      case 'Out of Stock':
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
              <input type="text" className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]" placeholder="Search SKU, item, category..." />
            </div>
            <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">Category</h1>
              <img src={miniDownArrow} alt="Dropdown" />
            </div>
            <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">Status</h1>
              <img src={miniDownArrow} alt="Dropdown" />
            </div>
          </div>
          <button className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]" onClick={handleAddUnitClick}>
            Add Unit
          </button>
        </div>
      </div>

      {/* Conditionally render AddUnit or Units list */}
      {showAddUnit ? (
        <AddUnit />
      ) : (
        <>
          {/* Units cards */}
          {currentUnits.map((unit) => (
            <div key={unit.id} className="relative w-auto h-auto min-h-[157px] bg-[#FFFFFF] rounded-[10px] flex flex-col lg:flex-row items-center my-6" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              {/* text section */}
              <div className="px-5 py-5 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="bebas-neue text-[28px] font-[400]">
                      <h1>
                        {unit.name} <span className="text-[#0955AC]">[{unit.sku}]</span>
                      </h1>
                    </div>
                    <div className="poppins text-[14px] font-[600] flex gap-4">
                      <span className={`{statusColor(unit.status)}`}>{unit.status}</span>
                      <span className="text-[#7B7B7A]">Category: {unit.category}</span>
                      <span className="text-[#7B7B7A]">UOM: {unit.uom}</span>
                    </div>
                  </div>
                  <div className="figtree text-right">
                    <div className="text-[20px] font-[700]">Qty: {unit.qty} {unit.uom}</div>
                    <div className="text-[14px] text-[#7B7B7A]">Reorder at: {unit.minStock} {unit.uom}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 text-[14px] poppins">
                  <div>
                    <div className="text-[#7B7B7A]">Location</div>
                    <div className="font-[600]">{unit.location}</div>
                  </div>
                  <div>
                    <div className="text-[#7B7B7A]">Cost</div>
                    <div className="font-[600]">${unit.cost}</div>
                  </div>
                  <div>
                    <div className="text-[#7B7B7A]">Price</div>
                    <div className="font-[600]">${unit.price}</div>
                  </div>
                  <div>
                    <div className="text-[#7B7B7A]">Batch</div>
                    <div className="font-[600]">{unit.batch}</div>
                  </div>
                  <div>
                    <div className="text-[#7B7B7A]">Expiry</div>
                    <div className="font-[600]">{unit.expiry || '-'}</div>
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