import React from "react";
import { usePage, router } from "@inertiajs/react";

const Suggestions = () => {
  const { props } = usePage();
  const { relatedWarehouses } = props;

  const handleViewDetails = (warehouse) => {
    router.visit('/warehouseDetails', {
      method: 'get',
      data: { 
        warehouse: {
          ...warehouse,
          image: warehouse.images?.[0] ? `/storage/${warehouse.images[0]}` : null
        }
      },
      preserveState: false
    });
  };

  if (!relatedWarehouses || relatedWarehouses.length === 0) {
    return (
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-6">
        <h3 className="bebas-neue text-[20px] text-[#0955AC] mb-4 text-center">
          SIMILAR WAREHOUSES
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500 poppins">No similar warehouses found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-6">
      <h3 className="bebas-neue text-[20px] text-[#0955AC] mb-6 text-center">
        SIMILAR WAREHOUSES
      </h3>
      
      <div className="space-y-4">
        {relatedWarehouses.map((warehouse) => (
          <div
            key={warehouse.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewDetails(warehouse)}
          >
            <div className="flex gap-3">
              {/* Warehouse Image */}
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={warehouse.images?.[0] ? `/storage/${warehouse.images[0]}` : 'https://via.placeholder.com/64x64?text=Warehouse'}
                  alt={warehouse.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              {/* Warehouse Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 truncate poppins text-sm">
                  {warehouse.name}
                </h4>
                <p className="text-xs text-gray-500 mb-1 poppins truncate">
                  📍 {warehouse.address}
                </p>
                <p className="text-xs text-gray-500 mb-2 poppins">
                  📦 {warehouse.total_area?.toLocaleString()} sq ft
                </p>
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-[#0955AC] font-bold text-sm poppins">
                    US$ {(warehouse.monthly_rate || warehouse.price)?.toLocaleString() || '0'}
                    <span className="text-xs font-normal text-gray-500">/{warehouse.pricing_model || 'month'}</span>
                  </span>
                  
                  {/* Type Badge */}
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize poppins">
                    {warehouse.type}
                  </span>
                </div>
                
                {/* Amenities Preview */}
                {warehouse.amenities && warehouse.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {warehouse.amenities.slice(0, 2).map((amenity, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded poppins"
                      >
                        {amenity}
                      </span>
                    ))}
                    {warehouse.amenities.length > 2 && (
                      <span className="text-xs text-gray-400 poppins">
                        +{warehouse.amenities.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* View Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(warehouse);
              }}
              className="w-full mt-3 bg-[#0955AC] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#0744A0] transition-colors poppins"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
      
      {/* View All Link */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.visit('/warehouseList')}
          className="text-[#0955AC] font-medium hover:underline poppins text-sm"
        >
          View All Warehouses →
        </button>
      </div>
    </div>
  );
};

export default Suggestions;