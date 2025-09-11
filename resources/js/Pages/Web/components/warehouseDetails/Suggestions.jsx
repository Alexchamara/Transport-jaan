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
      <div className="w-auto h-auto md:w-[440px] min-h-[200px] bg-[#F4F3F3] rounded-[19px] px-8 xl:px-8 py-8">
        <h3 className="bebas-neue text-[28px] text-center">
          you <span className="text-[#0955AC]">also</span> might <span className="text-[#0955AC]">like</span> this
        </h3>
        <div className="text-center py-8">
          <p className="text-[#00000080] poppins">No similar warehouses found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-auto h-auto md:w-[440px] min-h-[643px] bg-[#F4F3F3] rounded-[19px] px-8 xl:px-8 py-8">
      <h3 className="bebas-neue text-[28px] text-center">
        you <span className="text-[#0955AC]">also</span> might <span className="text-[#0955AC]">like</span> this
      </h3>

      <div className="py-6 space-y-4">
        {relatedWarehouses.map((warehouse) => (
          <div
            key={warehouse.id}
            className="poppins border-b-[1px] border-[#00000033] pb-[16px] cursor-pointer"
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
                <h4 className="bebas-neue text-[16px] truncate">
                  {warehouse.name}
                </h4>
                <p className="text-[10px] text-[#00000080] mb-1 poppins truncate">📍 {warehouse.address}</p>
                <p className="text-[10px] text-[#00000080] mb-2 poppins">📦 {warehouse.total_area?.toLocaleString()} sq ft</p>
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-[#0955AC] font-bold text-sm poppins">
                    US$ {(warehouse.monthly_rate || warehouse.price)?.toLocaleString() || '0'}
                    <span className="text-xs font-normal text-[#00000080]">/{warehouse.pricing_model || 'month'}</span>
                  </span>
                  <span className="bg-[#E8EBEF] text-[#0955AC] text-[10px] px-2 py-1 rounded capitalize poppins">
                    {warehouse.type}
                  </span>
                </div>
                
                {/* Amenities Preview */}
                {warehouse.amenities && warehouse.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {warehouse.amenities.slice(0, 2).map((amenity, index) => (
                      <span 
                        key={index}
                        className="bg-[#E8EBEF] text-[#00000080] text-[10px] px-2 py-1 rounded poppins"
                      >
                        {amenity}
                      </span>
                    ))}
                    {warehouse.amenities.length > 2 && (
                      <span className="text-[10px] text-[#00000061] poppins">
                        +{warehouse.amenities.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* View Details Button */}
            <div className="flex justify-end mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(warehouse);
                }}
                className="w-[120px] h-[29px] bg-[#0955AC] rounded-[5px] text-white text-[12px] font-[700] poppins"
              >
                more details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* View All Link */}
      <div className="mt-4 text-center">
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