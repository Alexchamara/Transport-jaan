import React, { useState } from "react";

import wishlist from "../../assets/landVehicleDetails/whishlist.svg";
import share from "../../assets/landVehicleDetails/share.svg";
import star from "../../assets/driverBooking/star.svg";

import CarDetailsTab from "./CarDetailsTab";
import PoliciesTab from "./PoliciesTab";
import ReviewsTab from "./ReviewsTab";
import GalleryTab from "./GalleryTab";

import heartB2 from "../../assets/landVehicleDetails/heartB2.svg"

const VehicleInfo = () => {
    const [selectedTab, setSelectedTab] = useState("car-details");
    return (
        <div className="poppins w-full h-auto">
            <h1 className="text-[12px] font-[600] text-[#00000080]">
                Lamborghini
            </h1>
            <div className="flex flex-col md:flex-row justify-between">
                <div className="flex flex-col md:flex-row gap-5">
                    <h1 className="bebas-neue text-[30px]">
                        Lamborghini <span className="text-[#0955AC]">urus</span>{" "}
                        (2020)
                    </h1>

                    <div className="flex flex-row items-center gap-2">
                        <div className="w-[10px] h-[10px] rounded-full bg-[#3C9A34]" />
                        <h1 className="text-[#3C9A34] text-[10px]">
                            Available
                        </h1>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className=" w-[81px] h-[30px] rounded-[4px] border-[1px] border-[#00000030] bg-[#EAE9E8] flex flex-row justify-center items-center gap-3">
                        <img src={share} />
                        <h1>Share</h1>
                    </div>
                    <div className=" w-[81px] h-[30px] rounded-[4px] border-[1px] border-[#0955AC] bg-[#0955AC] text-[#FFFFFF] flex flex-row justify-center items-center gap-3">
                        <img src={heartB2} />
                        <h1>Wishlist</h1>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-5 text-[12px] font-[600]">
                <img src={star} />
                <h1>4.8</h1>
                <h1 className="underline">44 Reviews</h1>
            </div>

            <div className="py-10">
                <div className="flex flex-col md:flex-row md:gap-20 px-20 text-[12px] font-[600] text-[#00000080] border-b-[2px] border-[#0000001F]">
                    <h1
                        className={`border-b-[2px] pb-5 w-[92px] flex justify-center items-center cursor-pointer ${
                            selectedTab === "car-details"
                                ? "border-[#0955AC] text-[#0955AC]"
                                : ""
                        }`}
                        onClick={() => setSelectedTab("car-details")}
                    >
                        Car Details
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
            {selectedTab === "car-details" && <CarDetailsTab />}
            {selectedTab === "policies" && <PoliciesTab />}
            {selectedTab === "reviews" && <ReviewsTab />}
            {selectedTab === "gallery" && <GalleryTab />}
        </div>
    );
};

export default VehicleInfo;
