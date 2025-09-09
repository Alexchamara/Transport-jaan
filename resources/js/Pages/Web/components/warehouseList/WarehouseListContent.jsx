import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import info from "../../assets/rentAVehicle/collection/info.png";
import heartFill from '../../assets/rentAVehicle/collection/heartFill.png';
import heart from '../../assets/rentAVehicle/collection/heart.png';

const WarehouseListContent = ({ warehouses: initialWarehouses }) => {
  const [likedWarehouses, setLikedWarehouses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredWarehouses, setFilteredWarehouses] = useState(initialWarehouses || []);
  const itemsPerPage = 6;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let filtered = [...initialWarehouses];

    if (searchParams.get('location')) {
      filtered = filtered.filter(warehouse => 
        warehouse.address?.toLowerCase().includes(searchParams.get('location').toLowerCase())
      );
    }

    if (searchParams.get('warehouseType')) {
      filtered = filtered.filter(warehouse => 
        warehouse.type?.toLowerCase() === searchParams.get('warehouseType').toLowerCase()
      );
    }

    setFilteredWarehouses(filtered);
    setCurrentPage(1);
  }, [initialWarehouses]);

  const toggleLike = (warehouseId) => {
    setLikedWarehouses(prev => 
      prev.includes(warehouseId)
        ? prev.filter(id => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  const handleViewDetails = (warehouse) => {
    router.visit('/warehouseDetails', {
      method: 'get',
      data: { 
        warehouse: {
          ...warehouse,
          image: warehouse.images?.[0] ? `/storage/${warehouse.images[0]}` : null
        }
      },
      preserveState: true
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWarehouses = filteredWarehouses.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="w-full py-6 md:py-12 px-4 md:px-40">
      <div className="container mx-auto">
        <p className="bebas-neue text-[28px] md:text-[40px] font-[400] mb-6 md:mb-10">
          we found <span className="text-[#0955AC]">{filteredWarehouses.length} warehouses </span>for you
        </p>

        {currentWarehouses.length === 0 ? (
          <div className="text-center py-12">
            <p className="poppins text-[16px] text-[#666] mb-4">No warehouses found matching your criteria.</p>
            <p className="poppins text-[14px] text-[#666]">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-15 justify-items-center">
            {currentWarehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="bg-white shadow-md rounded-lg overflow-hidden h-auto w-full max-w-[286px] py-5"
              >
                <div className="flex items-center justify-center mt-5">
                  <img
                    src={info}
                    alt="info"
                    className="h-[30px] md:h-[36px] w-[180px] md:w-[207px]"
                  />
                </div>

                <div className="flex items-center justify-center">
                  <img 
                    src={warehouse.images?.[0] ? `/storage/${warehouse.images[0]}` : 'https://via.placeholder.com/286x150?text=Warehouse+Image'} 
                    alt={warehouse.name || 'Warehouse'} 
                    className="w-full h-[120px] md:h-[150px] object-cover"
                  />
                </div>
                
                <div className="p-4 flex flex-col items-center justify-center">
                  <h3 className="bebas-neue text-[20px] md:text-[24px] font-[400] text-center mb-2">
                    {warehouse.name}
                  </h3>
                  
                  <div className="text-center mb-2">
                    <p className="poppins text-[12px] text-[#666] mb-1">
                      📍 {warehouse.address}
                    </p>
                    <p className="poppins text-[12px] text-[#666] mb-1">
                      📦 {warehouse.total_area?.toLocaleString()} sq ft
                    </p>
                    {warehouse.type && (
                      <p className="poppins text-[12px] text-[#666] mb-1">
                        🏭 {warehouse.type.charAt(0).toUpperCase() + warehouse.type.slice(1)}
                      </p>
                    )}
                  </div>

                  {warehouse.amenities && warehouse.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3 justify-center">
                      {warehouse.amenities.slice(0, 2).map((amenity, index) => (
                        <span 
                          key={index} 
                          className="bg-[#F0F7FF] text-[#0955AC] px-2 py-1 rounded text-[8px] font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                      {warehouse.amenities.length > 2 && (
                        <span className="bg-[#F0F7FF] text-[#0955AC] px-2 py-1 rounded text-[8px] font-medium">
                          +{warehouse.amenities.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="poppins font-[700] text-[20px] md:text-[25px] mb-4">
                    US$ {warehouse.price?.toLocaleString() || '0'}
                    <span className="text-[#00000080] text-[8px] md:text-[10px] font-[600]"> /{warehouse.pricing_model || 'month'}</span>
                  </p>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleViewDetails(warehouse)}
                      className="bg-[#0955AC] text-white px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => toggleLike(warehouse.id)}
                      className="border border-[#0955AC] text-[#0955AC] px-3 md:px-4 py-1.5 md:py-2 rounded"
                    >
                      {likedWarehouses.includes(warehouse.id) ? (
                        <img src={heartFill} alt="Liked" className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <img src={heart} alt="Not Liked" className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 md:mt-8 gap-1 md:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base ${
                  currentPage === page
                    ? "bg-[#0955AC] text-white"
                    : "bg-white text-[#0955AC] border border-[#0955AC]"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseListContent;