import React, { useState } from "react";

import star from "../../../../assets/driverBooking/star.svg";

import CarDetailsTab from "./CarDetailsTab";
import PoliciesTab from "./PoliciesTab";
import ReviewsTab from "./ReviewsTab";
import GalleryTab from "./GalleryTab";

const WarehouseInfo = ({ warehouseData = {} }) => {
    const [selectedTab, setSelectedTab] = useState("warehouse-details");
    
    // Default data if none provided
    const defaultData = {
        name: "Loading...",
        type: "N/A",
        address: "Loading...",
        total_area: 0,
        capacity: 0,
        pricing_model: "N/A",
        price: 0,
        amenities: [],
        availability_status: "Unknown",
        rating: 0,
        reviews: 0,
        terms_conditions: "",
        approval_status: "pending"
    };

    const data = { ...defaultData, ...warehouseData };
    
    // Calculate fake rating for now (you can implement real reviews later)
    const displayRating = data.rating || (4.0 + Math.random() * 1).toFixed(1);
    const displayReviews = data.reviews || Math.floor(Math.random() * 50) + 10;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available':
                return 'text-[#3C9A34]';
            case 'Occupied':
                return 'text-[#D97706]';
            case 'Unavailable':
            case 'Inactive':
                return 'text-[#DC2626]';
            default:
                return 'text-[#7B7B7A]';
        }
    };

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'Available':
                return 'bg-[#3C9A34]';
            case 'Occupied':
                return 'bg-[#D97706]';
            case 'Unavailable':
            case 'Inactive':
                return 'bg-[#DC2626]';
            default:
                return 'bg-[#7B7B7A]';
        }
    };

    const formatPricingModel = (model) => {
        return model ? model.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
    };

    return (
        <div className="poppins w-full h-auto">
            <h1 className="text-[12px] font-[600] text-[#00000080]">
                {data.type}
            </h1>
            <div className="flex flex-col md:flex-row justify-between">
                <div className="flex flex-col md:flex-row gap-5">
                    <h1 className="bebas-neue text-[30px]">
                        {data.name}
                    </h1>

                    <div className="flex flex-row items-center gap-2">
                        <div className={`w-[10px] h-[10px] rounded-full ${getStatusDotColor(data.availability_status)}`} />
                        <h1 className={`text-[10px] ${getStatusColor(data.availability_status)}`}>
                            {data.availability_status}
                        </h1>
                    </div>

                    {/* Approval Status Badge */}
                    {data.approval_status && data.approval_status !== 'approved' && (
                        <div className="flex items-center">
                            <span className={`px-2 py-1 rounded text-white text-xs ${
                                data.approval_status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                                {data.approval_status === 'pending' ? 'Pending Approval' : 'Rejected'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="figtree text-right">
                        <div className="text-[20px] font-[700]">${data.price}</div>
                        <div className="text-[12px] text-[#7B7B7A]">{formatPricingModel(data.pricing_model)}</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-5 text-[12px] font-[600] mt-2">
                <img src={star} alt="Rating" />
                <h1>{displayRating}</h1>
                <h1 className="underline">{displayReviews} Reviews</h1>
            </div>

            {/* Address */}
            <div className="mt-3 text-[12px] text-[#7B7B7A]">
                <span>{data.address}</span>
            </div>

            {/* Quick Info Section */}
            <div className="py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px] poppins">
                <div>
                    <div className="text-[#7B7B7A]">Total Area</div>
                    <div className="font-[600]">{data.total_area ? `${data.total_area} sqft` : 'N/A'}</div>
                </div>
                <div>
                    <div className="text-[#7B7B7A]">Capacity</div>
                    <div className="font-[600]">{data.capacity ? `${data.capacity} units` : 'N/A'}</div>
                </div>
                <div>
                    <div className="text-[#7B7B7A]">Type</div>
                    <div className="font-[600]">{data.type}</div>
                </div>
                <div>
                    <div className="text-[#7B7B7A]">Amenities</div>
                    <div className="font-[600]">
                        {data.amenities && data.amenities.length > 0 
                            ? data.amenities.slice(0, 2).join(', ') + (data.amenities.length > 2 ? '...' : '')
                            : 'None'
                        }
                    </div>
                </div>
            </div>

            {/* Coordinates if available */}
            {data.latitude && data.longitude && (
                <div className="pb-3 text-[12px] poppins">
                    <div className="text-[#7B7B7A]">Location Coordinates</div>
                    <div className="font-[600]">{data.latitude}, {data.longitude}</div>
                </div>
            )}

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
                        Gallery
                    </h1>
                </div>
            </div>

            {/* Tab Content */}
            {selectedTab === "warehouse-details" && <CarDetailsTab warehouseData={data} />}
            {selectedTab === "policies" && <PoliciesTab warehouseData={data} />}
            {selectedTab === "reviews" && <ReviewsTab warehouseData={data} />}
            {selectedTab === "gallery" && <GalleryTab warehouseData={data} />}
        </div>
    );
};

export default WarehouseInfo;