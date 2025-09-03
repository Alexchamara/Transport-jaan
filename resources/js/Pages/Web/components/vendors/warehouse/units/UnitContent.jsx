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
  // State for warehouse units data
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUnits, setTotalUnits] = useState(0);
  const [showAddUnit, setShowAddUnit] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const perPageOptions = [5, 10, 20, 50];

  // Fetch warehouse units from API
  const fetchUnits = async (page = 1, perPage = 10, search = "", type = "", status = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (status) params.append('status', status);

      const response = await fetch(`/vendors/warehouse/api/units?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setUnits(data.data || []);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.last_page || 1);
      setTotalUnits(data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching warehouse units:', err);
      setError('Failed to load warehouse units. Please try again.');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUnits(currentPage, itemsPerPage, searchTerm, typeFilter, statusFilter);
  }, [currentPage, itemsPerPage]);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filtering
      fetchUnits(1, itemsPerPage, searchTerm, typeFilter, statusFilter);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, typeFilter, statusFilter, itemsPerPage]);

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
      case 'Pending Approval':
        return 'text-[#F59E0B]';
      case 'Rejected':
        return 'text-[#DC2626]';
      case 'Inactive':
        return 'text-[#7B7B7A]';
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
              <input 
                type="text" 
                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]" 
                placeholder="Search warehouse name, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <select 
                className="text-[14px] font-[500] text-[#7B7B7ACC] bg-transparent outline-none border-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Cold Storage">Cold Storage</option>
                <option value="Dry Storage">Dry Storage</option>
                <option value="Climate Controlled">Climate Controlled</option>
                <option value="General Storage">General Storage</option>
              </select>
              <img src={miniDownArrow} alt="Dropdown" />
            </div>
            <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <select 
                className="text-[14px] font-[500] text-[#7B7B7ACC] bg-transparent outline-none border-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
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
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0955AC]"></div>
              <span className="ml-3 text-[#7B7B7A]">Loading warehouse units...</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
                <div className="text-[#7B7B7A] mb-4">{error}</div>
                <button 
                  onClick={() => fetchUnits(currentPage, itemsPerPage, searchTerm, typeFilter, statusFilter)}
                  className="px-4 py-2 bg-[#0955AC] text-white rounded-md hover:bg-[#074A94] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && units.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="text-[#7B7B7A] text-lg font-semibold mb-2">No warehouse units found</div>
                <div className="text-[#7B7B7A] mb-4">
                  {searchTerm || typeFilter || statusFilter 
                    ? "Try adjusting your search or filters" 
                    : "Start by adding your first warehouse unit"}
                </div>
                <button 
                  onClick={handleAddUnitClick}
                  className="px-4 py-2 bg-[#0955AC] text-white rounded-md hover:bg-[#074A94] transition-colors"
                >
                  Add Warehouse Unit
                </button>
              </div>
            </div>
          )}

          {/* Warehouse units cards */}
          {!loading && !error && units.length > 0 && (
            <>
              {units.map((unit) => (
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
                          <span className="text-[#7B7B7A]">Model: {unit.pricing_model?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="poppins text-[12px] text-[#7B7B7A] mt-1">
                          <span>{unit.address}</span>
                        </div>
                        {unit.approval_status && unit.approval_status !== 'approved' && (
                          <div className="poppins text-[12px] mt-1">
                            <span className={`px-2 py-1 rounded text-white text-xs ${
                              unit.approval_status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                              {unit.approval_status === 'pending' ? 'Pending Approval' : 'Rejected'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="figtree text-right">
                        <div className="text-[20px] font-[700]">Area: {unit.total_area || 'N/A'} sqft</div>
                        <div className="text-[14px] text-[#7B7B7A]">Capacity: {unit.capacity || 'N/A'} units</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 text-[14px] poppins">
                      <div>
                        <div className="text-[#7B7B7A]">Coordinates</div>
                        <div className="font-[600]">
                          {unit.latitude && unit.longitude ? `${unit.latitude}, ${unit.longitude}` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#7B7B7A]">Price</div>
                        <div className="font-[600]">${unit.price || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[#7B7B7A]">Pricing Model</div>
                        <div className="font-[600]">{unit.pricing_model?.replace(/_/g, ' ') || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[#7B7B7A]">Amenities</div>
                        <div className="font-[600]">
                          {unit.amenities && unit.amenities.length > 0 
                            ? `${unit.amenities.slice(0, 2).join(', ')}${unit.amenities.length > 2 ? '...' : ''}`
                            : 'None'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-[#7B7B7A]">Active</div>
                        <div className="font-[600]">{unit.is_active ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="flex items-center lg:justify-end">
                        <button 
                          className="figtree min-w-[140px] h-[44px] bg-[#0955AC] rounded-[5px] text-[20px] text-[#FFFFFF] font-[700] hover:bg-[#074A94] transition-colors" 
                          onClick={() => (window.location.href = `/vendors/warehouse/unitDetails?id=${unit.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Results info */}
              <div className="text-[#7B7B7A] text-sm mb-4">
                Showing {units.length} of {totalUnits} warehouse units
              </div>
            </>
          )}

          {/* Pagination Controls and Results per page */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-between items-center gap-2 mt-20">
              {/* Left: Results per page */}
              <div className="flex items-center">
                <span className="mr-3 text-[#00000080] text-[15px]">Results per page</span>
                <select 
                  className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none" 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  {perPageOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              {/* Right: Pagination */}
              <div className="flex items-center gap-2">
                <button 
                  className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50 hover:bg-[#E5E5E5] transition-colors" 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  <span className="text-lg">&#60;</span>
                </button>
                {getPageNumbers().map((num, idx) =>
                  num === "..." ? (
                    <span key={idx} className="px-2">...</span>
                  ) : (
                    <button 
                      key={num} 
                      className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] hover:bg-[#E5E5E5] transition-colors ${
                        currentPage === num 
                          ? "text-[#0955AC] font-[600] border-[2px] border-[#0955AC] bg-[#F4F3F3]" 
                          : "bg-[#F4F3F3]"
                      }`} 
                      onClick={() => goToPage(num)}
                    >
                      {num}
                    </button>
                  )
                )}
                <button 
                  className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50 hover:bg-[#E5E5E5] transition-colors" 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
                  <span className="text-lg">&#62;</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UnitContent;