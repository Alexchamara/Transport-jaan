import React, { useState } from "react";
import proPic from "../../assets/driverBooking/proPic.png";
import heartIcon from "../../assets/driverBooking/heart.svg";
import heartTwo from "../../assets/driverBooking/heart2.svg"
import { router } from '@inertiajs/react';

const DriversProfile = () => {
    const [likedDrivers, setLikedDrivers] = useState(new Set());

    const toggleLike = (driverIndex) => {
        setLikedDrivers(prev => {
            const newLiked = new Set(prev);
            if (newLiked.has(driverIndex)) {
                newLiked.delete(driverIndex);
            } else {
                newLiked.add(driverIndex);
            }
            return newLiked;
        });
    };

    return (
        <div className="bg-[#E7E7E7] flex flex-col justify-center items-center">
            <h1 className="bebas-neue text-[40px] font-[400]">
                Drivers <span className="text-[#0955AC]">Profile</span>
            </h1>
            <p className="poppins text-[15px] font-[400] text-center text-[#0F0F0F80]">
                Browsed experienced, vetted drivers with ratings, bios and
                reviews ensuring you choose the perfect <br /> driver for your
                needs
            </p>

            <div className="py-10 flex flex-col md:flex-row gap-10">
                <div className="xl:w-[286px] h-[349px] bg-[#FFFFFF] px-5 py-5 flex flex-col justify-center items-center">
                    <img src={proPic} />
                    <h1 className="bebas-neue text-[30px]">
                        Steve <span className="text-[#0955AC]">gibson</span>
                    </h1>
                    <h1 className="poppins text-[15px]/[24px] font-[700]">
                        248+ rides{" "}
                        <span className="text-[10px] font-[600] text-[#00000080]">
                            / professional driver
                        </span>
                    </h1>
                    <div className="flex flex-row gap-5 mt-3">
                        <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]">
                            More Details
                        </button>
                        <div 
                            className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                            onClick={() => toggleLike(0)}
                        >
                            <img
                                src={likedDrivers.has(0) ? heartTwo : heartIcon}
                                alt="Heart"
                                className="w-4 h-3.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:w-[286px] h-[349px] bg-[#FFFFFF] px-5 py-5 flex flex-col justify-center items-center">
                    <img src={proPic} />
                    <h1 className="bebas-neue text-[30px]">
                        Steve <span className="text-[#0955AC]">gibson</span>
                    </h1>
                    <h1 className="poppins text-[15px]/[24px] font-[700]">
                        248+ rides{" "}
                        <span className="text-[10px] font-[600] text-[#00000080]">
                            / professional driver
                        </span>
                    </h1>
                    <div className="flex flex-row gap-5 mt-3">
                        <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]">
                            More Details
                        </button>
                        <div 
                            className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                            onClick={() => toggleLike(1)}
                        >
                            <img
                                src={likedDrivers.has(1) ? heartTwo : heartIcon}
                                alt="Heart"
                                className="w-4 h-3.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:w-[286px] h-[349px] bg-[#FFFFFF] px-5 py-5 flex flex-col justify-center items-center">
                    <img src={proPic} />
                    <h1 className="bebas-neue text-[30px]">
                        Steve <span className="text-[#0955AC]">gibson</span>
                    </h1>
                    <h1 className="poppins text-[15px]/[24px] font-[700]">
                        248+ rides{" "}
                        <span className="text-[10px] font-[600] text-[#00000080]">
                            / professional driver
                        </span>
                    </h1>
                    <div className="flex flex-row gap-5 mt-3">
                        <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]">
                            More Details
                        </button>
                        <div 
                            className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                            onClick={() => toggleLike(2)}
                        >
                            <img
                                src={likedDrivers.has(2) ? heartTwo : heartIcon}
                                alt="Heart"
                                className="w-4 h-3.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:w-[286px] h-[349px] bg-[#FFFFFF] px-5 py-5 flex flex-col justify-center items-center">
                    <img src={proPic} />
                    <h1 className="bebas-neue text-[30px]">
                        Steve <span className="text-[#0955AC]">gibson</span>
                    </h1>
                    <h1 className="poppins text-[15px]/[24px] font-[700]">
                        248+ rides{" "}
                        <span className="text-[10px] font-[600] text-[#00000080]">
                            / professional driver
                        </span>
                    </h1>
                    <div className="flex flex-row gap-5 mt-3">
                        <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]">
                            More Details
                        </button>
                        <div 
                            className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                            onClick={() => toggleLike(3)}
                        >
                            <img
                                src={likedDrivers.has(3) ? heartTwo : heartIcon}
                                alt="Heart"
                                className="w-4 h-3.5"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
                <div className="xl:w-[286px] h-[349px] bg-[#FFFFFF] px-5 py-5 flex flex-col justify-center items-center">
                    <img src={proPic} />
                    <h1 className="bebas-neue text-[30px]">
                        Steve <span className="text-[#0955AC]">gibson</span>
                    </h1>
                    <h1 className="poppins text-[15px]/[24px] font-[700]">
                        248+ rides{" "}
                        <span className="text-[10px] font-[600] text-[#00000080]">
                            / professional driver
                        </span>
                    </h1>
                    <div className="flex flex-row gap-5 mt-3">
                        <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]">
                            More Details
                        </button>
                        <div 
                            className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                            onClick={() => toggleLike(4)}
                        >
                            <img
                                src={likedDrivers.has(4) ? heartTwo : heartIcon}
                                alt="Heart"
                                className="w-4 h-3.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:w-[286px] h-[349px] bg-[#FFFFFF] px-5 py-5 flex flex-col justify-center items-center">
                    <img src={proPic} />
                    <h1 className="bebas-neue text-[30px]">
                        Steve <span className="text-[#0955AC]">gibson</span>
                    </h1>
                    <h1 className="poppins text-[15px]/[24px] font-[700]">
                        248+ rides{" "}
                        <span className="text-[10px] font-[600] text-[#00000080]">
                            / professional driver
                        </span>
                    </h1>
                    <div className="flex flex-row gap-5 mt-3">
                        <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]">
                            More Details
                        </button>
                        <div 
                            className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                            onClick={() => toggleLike(5)}
                        >
                            <img
                                src={likedDrivers.has(5) ? heartTwo : heartIcon}
                                alt="Heart"
                                className="w-4 h-3.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:w-[286px] h-[349px] bg-[#FFFFFF] px-5 py-5 flex flex-col justify-center items-center">
                    <img src={proPic} />
                    <h1 className="bebas-neue text-[30px]">
                        Steve <span className="text-[#0955AC]">gibson</span>
                    </h1>
                    <h1 className="poppins text-[15px]/[24px] font-[700]">
                        248+ rides{" "}
                        <span className="text-[10px] font-[600] text-[#00000080]">
                            / professional driver
                        </span>
                    </h1>
                    <div className="flex flex-row gap-5 mt-3">
                        <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]">
                            More Details
                        </button>
                        <div 
                            className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                            onClick={() => toggleLike(6)}
                        >
                            <img
                                src={likedDrivers.has(6) ? heartTwo : heartIcon}
                                alt="Heart"
                                className="w-4 h-3.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:w-[286px] h-[349px] bg-[#FFFFFF] px-5 py-5 flex flex-col justify-center items-center">
                    <img src={proPic} />
                    <h1 className="bebas-neue text-[30px]">
                        Steve <span className="text-[#0955AC]">gibson</span>
                    </h1>
                    <h1 className="poppins text-[15px]/[24px] font-[700]">
                        248+ rides{" "}
                        <span className="text-[10px] font-[600] text-[#00000080]">
                            / professional driver
                        </span>
                    </h1>
                    <div className="flex flex-row gap-5 mt-3">
                        <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]">
                            More Details
                        </button>
                        <div 
                            className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                            onClick={() => toggleLike(7)}
                        >
                            <img
                                src={likedDrivers.has(7) ? heartTwo : heartIcon}
                                alt="Heart"
                                className="w-4 h-3.5"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button className="w-[150px] h-[45px] bg-[#0955AC] border-[2px] my-10 rounded-[9px] figtree text-[16px] font-[700] text-[#FFFFFF]" onClick={() => router.get('/driver-search-results')}>VIEW MORE</button>

            
        </div>
    );
};

export default DriversProfile;
