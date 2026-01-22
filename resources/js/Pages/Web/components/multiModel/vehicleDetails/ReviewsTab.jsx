import React from "react";
import ReviewSection from "./ReviewSection";
import starSec from "../../../assets/landVehicleDetails/starsSec.svg";

const ReviewsTab = ({ vehicle }) => {
    const reviews = vehicle?.reviews || [];
    
    return (
    <div className="poppins">
        <div className="flex flex-row gap-5 items-center">
            <h1 className="text-[20px] font-[700]">Review</h1>
            <div className="w-[44px] h-[28px] bg-[#0955AC] rounded-[4px] flex justify-center items-center text-[14px] font-[700] text-[#FFFFFF]">{vehicle?.totalReviews || 0}</div>
        </div>
        <div className="flex flex-col xl:flex-row gap-8 items-center mb-10">
            <div>
                <h1 className="text-[50px] font-[700]">{vehicle?.rating ? vehicle.rating.toFixed(1) : '0.0'}</h1>
                <img src={starSec} />
                <h1 className="text-[#90A3BF] mt-2">{vehicle?.totalReviews || 0}</h1>
            </div>
            <div className="flex flex-col gap-2 mt-5">
                <div className="flex flex-row justify-center items-center gap-3">
                    <h1 className="text-[8px] font-[600]">5</h1>
                    <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" />
                </div>
                <div className="flex flex-row justify-center items-center gap-3">
                    <h1 className="text-[8px] font-[600]">4</h1>
                    <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" />
                </div>
                <div className="flex flex-row justify-center items-center gap-3">
                    <h1 className="text-[8px] font-[600]">3</h1>
                    <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" />
                </div>
                <div className="flex flex-row justify-center items-center gap-3">
                    <h1 className="text-[8px] font-[600]">2</h1>
                    <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" />
                </div>
                <div className="flex flex-row justify-center items-center gap-3">
                    <h1 className="text-[8px] font-[600]">1</h1>
                    <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" />
                </div>
            </div>
        </div>
        <ReviewSection reviews={reviews} />
    </div>
    );
};

export default ReviewsTab; 