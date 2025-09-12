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
    import React from "react";
import miniWarehouse from "../../assets/landVehicleDetails/miniCar.svg"; // Using same icon temporarily
import size from "../../assets/rentAVehicle/collection/meter.png";
import location from "../../assets/rentAVehicle/collection/user.png";
import warehouseType from "../../assets/rentAVehicle/collection/gearbox.png";
import features from "../../assets/rentAVehicle/collection/gas.png";
import heartB from "../../assets/landVehicleDetails/sug/heartB.svg";

const Suggestions = () => {
    const suggestedWarehouses = [
        {
            id: 1,
            name: "Premium Storage Central",
            location: "Colombo 03",
            type: "Climate Controlled",
            totalArea: "15,000",
            amenities: "8 amenities",
            monthlyRate: "2,250.00",
            rating: "4.8",
            reviews: "23"
        },
        {
            id: 2,
            name: "Industrial Hub West",
            location: "Colombo 07", 
            type: "Standard",
            totalArea: "25,000",
            amenities: "12 amenities",
            monthlyRate: "3,850.00",
            rating: "4.6",
            reviews: "41"
        },
        {
            id: 3,
            name: "Secure Depot South",
            location: "Colombo 02",
            type: "High Security",
            totalArea: "8,500",
            amenities: "6 amenities",
            monthlyRate: "1,675.00",
            rating: "4.9",
            reviews: "17"
        }
    ];

    return (
        <div className="w-auto h-auto md:w-[440px] min-h-[643px] bg-[#F4F3F3] rounded-[19px] px-10 xl:px-20 py-10">
            <h1 className="bebas-neue text-[30px]">
                you <span className="text-[#0955AC]">also</span> might{" "}
                <span className="text-[#0955AC]">like</span> this
            </h1>

            <div className="py-10 poppins">
                {suggestedWarehouses.map((warehouse, index) => (
                    <div key={warehouse.id} className={`flex flex-col md:flex-row gap-5 ${index < suggestedWarehouses.length - 1 ? 'border-b-[1px] border-[#00000033] pb-[30px]' : ''} ${index > 0 ? 'pt-[30px]' : ''}`}>
                        <img src={miniWarehouse} alt="warehouse" />
                        <div>
                            <h1 className="bebas-neue text-[15px]">
                                {warehouse.name.split(' ')[0]}{" "}
                                <span className="text-[#0955AC]">{warehouse.name.split(' ').slice(1).join(' ')}</span>
                            </h1>
                            <div className="flex flex-col">
                                <div className="flex flex-row justify-center items-center gap-6 py-4 text-[9px] text-[#00000040]">
                                    <div className="flex flex-col justify-center items-center gap-2">
                                        <img src={size} alt="size" className="w-4 h-4" />
                                        <h1>{warehouse.totalArea} sq ft</h1>
                                    </div>

                                    <div className="flex flex-col justify-center items-center gap-2">
                                        <img src={warehouseType} alt="type" className="w-4 h-4" />
                                        <h1>{warehouse.type}</h1>
                                    </div>
                                    
                                    <div className="flex flex-col justify-center items-center gap-2">
                                        <img src={location} alt="location" className="w-4 h-4" />
                                        <h1>{warehouse.location}</h1>
                                    </div>
                                    
                                    <div className="flex flex-col justify-center items-center gap-2">
                                        <img src={features} alt="amenities" className="w-4 h-4" />
                                        <h1>{warehouse.amenities}</h1>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-5">
                                    <div className="text-[15px] font-[700]">
                                        <h1>
                                            {warehouse.monthlyRate}{" "}
                                            <span className="text-[9px] font-[600] text-[#00000080]">
                                                / month
                                            </span>
                                        </h1>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <div className="size-[23px] rounded-[4px] border-[1.5px] border-[#0955AC] flex justify-center items-center">
                                            <img src={heartB} alt="wishlist" />
                                        </div>
                                        <button className="w-[65px] h-[23px] rounded-[4px] bg-[#0955AC] bebas-neue text-[9px] text-[#FFFFFF] font-[400]">
                                            more details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Suggestions;
  );
};

export default Suggestions;