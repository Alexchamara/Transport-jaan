import React, { useState } from "react";

import wishlist from "../../../assets/landVehicleDetails/whishlist.svg";
import share from "../../../assets/landVehicleDetails/share.svg";
import star from "../../../assets/driverBooking/star.svg";

import CarDetailsTab from "./CarDetailsTab";
import PoliciesTab from "./PoliciesTab";
import ReviewsTab from "./ReviewsTab";
import GalleryTab from "./GalleryTab";

import heartB2 from "../../../assets/landVehicleDetails/heartB2.svg"

const VehicleInfo = ({ vehicle }) => {
    const [selectedTab, setSelectedTab] = useState("car-details");
    return (
        <div className="poppins w-full h-auto p-10 xl:p-0">
            <h1 className="text-[12px] font-[600] text-[#00000080]">
                {vehicle?.manufacturer || 'Vehicle'}
            </h1>
            <div className="flex flex-col md:flex-row justify-between">
                <div className="flex flex-col md:flex-row gap-5">
                    <h1 className="bebas-neue text-[30px]">
                        {vehicle?.manufacturer || 'Vehicle'} <span className="text-[#0955AC]">{vehicle?.name || 'Model'}</span>{" "}
                        ({vehicle?.year || '2020'})
                    </h1>

                    <div className="flex flex-row items-center gap-2">
                        <div className="w-[10px] h-[10px] rounded-full bg-[#3C9A34]" />
                        <h1 className="text-[#3C9A34] text-[10px]">
                            Available
                        </h1>
                    </div>
                </div>
                <div className="flex flex-row items-center py-10 lg:py-0 gap-5">
                    <div className="min-w-[81px] min-h-[30px] px-4 py-2 rounded-[4px] border-[1px] border-[#00000030] bg-[#EAE9E8] flex flex-row justify-center items-center gap-3 cursor-pointer">
                        <img src={share} />
                        <h1>Share</h1>
                    </div>
                    <div className="min-w-[81px] min-h-[30px] px-4 py-2 rounded-[4px] border-[1px] border-[#0955AC] bg-[#0955AC] text-[#FFFFFF] flex flex-row justify-center items-center gap-3 cursor-pointer">
                        <img src={heartB2} />
                        <h1>Wishlist</h1>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-5 text-[12px] font-[600]">
                <img src={star} />
                <h1>{vehicle?.rating ? vehicle.rating.toFixed(1) : '0.0'}</h1>
                <h1 className="underline">{vehicle?.totalReviews || 0} Reviews</h1>
            </div>

            <div className="py-10">
                <div className="flex flex-row xl:gap-20 gap-5 xl:px-20 text-[10px] font-[600] text-[#00000080] border-b-[2px] border-[#0000001F]">
                    <h1
                        className={`border-b-[2px] pb-5 xl:w-[92px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "car-details"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : "border-transparent"
                        }`}
                        onClick={() => setSelectedTab("car-details")}
                    >
                        Car Details
                    </h1>
                    <h1
                        className={`border-b-[2px] pb-5 xl:w-[92px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "policies"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : "border-transparent"
                        }`}
                        onClick={() => setSelectedTab("policies")}
                    >
                        Policies
                    </h1>
                    <h1
                        className={`border-b-[2px] pb-5 xl:w-[92px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "reviews"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : "border-transparent"
                        }`}
                        onClick={() => setSelectedTab("reviews")}
                    >
                        Reviews
                    </h1>
                    <h1
                        className={`border-b-[2px] pb-5 xl:w-[92px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "gallery"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : "border-transparent"
                        }`}
                        onClick={() => setSelectedTab("gallery")}
                    >
                        Image Gallery
                    </h1>
                </div>
            </div>

            {/* Tab Content */}
            {selectedTab === "car-details" && <CarDetailsTab vehicle={vehicle} />}
            {selectedTab === "policies" && <PoliciesTab vehicle={vehicle} />}
            {selectedTab === "reviews" && <ReviewsTab vehicle={vehicle} />}
            {selectedTab === "gallery" && <GalleryTab vehicle={vehicle} />}
        </div>
    );
};

export default VehicleInfo;