import React from "react";
import ReviewSection from "../../../vehicleDetails/ReviewSection";
import starSec from "../../../../assets/landVehicleDetails/starsSec.svg";

const ReviewsTab = ({ warehouseData = {} }) => {
    // Calculate fake reviews for now (you can implement real reviews later)
    const reviewCount = Math.floor(Math.random() * 50) + 10;
    const averageRating = (4.0 + Math.random() * 1).toFixed(1);
    
    return (
        <div className="poppins">
            <div className="flex flex-row gap-5 items-center">
                <h1 className="text-[20px] font-[700]">Warehouse Reviews</h1>
                <div className="w-[44px] h-[28px] bg-[#0955AC] rounded-[4px] flex justify-center items-center text-[14px] font-[700] text-[#FFFFFF]">
                    {reviewCount}
                </div>
            </div>
            <div className="flex flex-row gap-8 items-center mb-10">
                <div>
                    <h1 className="text-[50px] font-[700]">{averageRating}</h1>
                    <img src={starSec} alt="Rating stars" />
                    <h1 className="text-[#90A3BF] mt-2">{reviewCount} reviews</h1>
                </div>
                <div className="flex flex-col gap-2 mt-5">
                    <div className="flex flex-row justify-center items-center gap-3">
                        <h1 className="text-[8px] font-[600]">5</h1>
                        <div className="w-[274px] h-[9px] bg-[#0955AC] rounded-[10px]" style={{width: '70%'}} />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-3">
                        <h1 className="text-[8px] font-[600]">4</h1>
                        <div className="w-[274px] h-[9px] bg-[#0955AC] rounded-[10px]" style={{width: '20%'}} />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-3">
                        <h1 className="text-[8px] font-[600]">3</h1>
                        <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" style={{width: '5%'}} />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-3">
                        <h1 className="text-[8px] font-[600]">2</h1>
                        <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" style={{width: '3%'}} />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-3">
                        <h1 className="text-[8px] font-[600]">1</h1>
                        <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" style={{width: '2%'}} />
                    </div>
                </div>
            </div>
            
            {/* Placeholder review content */}
            <div className="mt-8 space-y-6">
                <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                            JD
                        </div>
                        <div>
                            <h3 className="font-semibold">John Doe</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500">★★★★★</span>
                                <span className="text-sm text-gray-500">2 months ago</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-700">
                        Excellent warehouse facility! The temperature control is perfect for our pharmaceutical storage needs. 
                        Staff is professional and the security measures are top-notch. Highly recommended.
                    </p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                            SM
                        </div>
                        <div>
                            <h3 className="font-semibold">Sarah Miller</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500">★★★★☆</span>
                                <span className="text-sm text-gray-500">1 month ago</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-700">
                        Good storage solution for our inventory. The location is convenient and access hours work well for our business. 
                        Only minor issue was with the initial setup process.
                    </p>
                </div>
                
                <div className="text-center">
                    <button className="px-6 py-2 border border-[#0955AC] text-[#0955AC] rounded-md hover:bg-[#0955AC] hover:text-white transition-colors">
                        Load More Reviews
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewsTab; 