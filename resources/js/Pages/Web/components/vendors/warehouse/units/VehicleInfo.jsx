import React, { useState } from "react";

import star from "../../../../assets/driverBooking/star.svg";

import CarDetailsTab from "./CarDetailsTab";
import PoliciesTab from "./PoliciesTab";
import ReviewsTab from "./ReviewsTab";
import GalleryTab from "./GalleryTab";

const VehicleInfo = () => {
    const [selectedTab, setSelectedTab] = useState("warehouse-details");
    
    // Sample warehouse data based on Warehouse model
    const warehouseData = {
        name: "Central Cold Storage A",
        type: "Cold Storage",
        address: "123 Industrial Ave, Warehouse District",
        total_area: 2500.00,
        capacity: 5000.00,
        pricing_model: "per_sqft_monthly",
        price: 15.50,
        amenities: ["Temperature Control", "Loading Dock", "Security", "CCTV"],
        availability_status: "Available",
        rating: 4.8,
        reviews: 44
    };

    return (
        <div className="poppins w-full h-auto">
            <h1 className="text-[12px] font-[600] text-[#00000080]">
                {warehouseData.type}
            </h1>
            <div className="flex flex-col md:flex-row justify-between">
                <div className="flex flex-col md:flex-row gap-5">
                    <h1 className="bebas-neue text-[30px]">
                        {warehouseData.name}
                    </h1>

                    <div className="flex flex-row items-center gap-2">
                        <div className={`w-[10px] h-[10px] rounded-full ${
                            warehouseData.availability_status === 'Available' ? 'bg-[#3C9A34]' : 'bg-[#D97706]'
                        }`} />
                        <h1 className={`text-[10px] ${
                            warehouseData.availability_status === 'Available' ? 'text-[#3C9A34]' : 'text-[#D97706]'
                        }`}>
                            {warehouseData.availability_status}
                        </h1>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="figtree text-right">
                        <div className="text-[20px] font-[700]">${warehouseData.price}</div>
                        <div className="text-[12px] text-[#7B7B7A]">{warehouseData.pricing_model.replace(/_/g, ' ')}</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-5 text-[12px] font-[600]">
                <img src={star} />
                <h1>{warehouseData.rating}</h1>
                <h1 className="underline">{warehouseData.reviews} Reviews</h1>
            </div>

            {/* Quick Info Section */}
            <div className="py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px] poppins">
                <div>
                    <div className="text-[#7B7B7A]">Total Area</div>
                    <div className="font-[600]">{warehouseData.total_area} sqft</div>
                </div>
                <div>
                    <div className="text-[#7B7B7A]">Capacity</div>
                    <div className="font-[600]">{warehouseData.capacity} units</div>
                </div>
                <div>
                    <div className="text-[#7B7B7A]">Type</div>
                    <div className="font-[600]">{warehouseData.type}</div>
                </div>
                <div>
                    <div className="text-[#7B7B7A]">Key Amenities</div>
                    <div className="font-[600]">{warehouseData.amenities.slice(0, 2).join(', ')}</div>
                </div>
            </div>

            <div className="py-10">
                <div className="flex flex-col md:flex-row md:gap-20 px-20 text-[12px] font-[600] text-[#00000080] border-b-[2px] border-[#0000001F]">
                    <h1
                        className={`border-b-[2px] pb-5 w-[120px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "warehouse-details"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : ""
                        }`}
                        onClick={() => setSelectedTab("warehouse-details")}
                    >
                        Warehouse Details
                    </h1>
                    <h1
                        className={`border-b-[2px] pb-5 w-[92px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "policies"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : ""
                        }`}
                        onClick={() => setSelectedTab("policies")}
                    >
                        Policies
                    </h1>
                    <h1
                        className={`border-b-[2px] pb-5 w-[92px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "reviews"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : ""
                        }`}
                        onClick={() => setSelectedTab("reviews")}
                    >
                        Reviews
                    </h1>
                    <h1
                        className={`border-b-[2px] pb-5 w-[92px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "gallery"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : ""
                        }`}
                        onClick={() => setSelectedTab("gallery")}
                    >
                        Image Gallery
                    </h1>
                </div>
            </div>

            {/* Tab Content */}
            {selectedTab === "warehouse-details" && <CarDetailsTab />}
            {selectedTab === "policies" && <PoliciesTab />}
            {selectedTab === "reviews" && <ReviewsTab />}
            {selectedTab === "gallery" && <GalleryTab />}
        </div>
    );
};

export default VehicleInfo;
