import React from "react";
import place1 from "../../assets/multiModel/destination/place1.png";
import place2 from "../../assets/multiModel/destination/place2.png";
import place3 from "../../assets/multiModel/destination/place3.png";
import place4 from "../../assets/multiModel/destination/place4.png";
import place5 from "../../assets/multiModel/destination/place5.png";
import place6 from "../../assets/multiModel/destination/place6.png";
import place7 from "../../assets/multiModel/destination/place7.png";
import place8 from "../../assets/multiModel/destination/place8.png";

import location from "../../assets/multiModel/destination/location.svg";

const Destinations = () => {
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="max-w-[1400px] w-full text-center py-10 px-10">
                <h1 className="bebas-neue text-[59px]/[58px] font-[400]">
                    Popular Destinations
                </h1>
                <h1 className="text-[20px]/[33px] font-[500] poppins mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare.{" "}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 poppins text-[#FFFFFF] uppercase mt-14">
                    {/* 1st card */}
                    <div className="relative flex flex-col">
                        <div className="bg-[#00000036] w-full h-full absolute left-0 rounded-[15px]" />
                        <img src={place1} className="w-full h-full" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full p-8">
                            <div className="flex flex-col items-start">
                                <h1 className="text-[24px]/[33px] text-start font-[700]">
                                    Temple of the tooth
                                </h1>
                                <div className="flex flex-row gap-5">
                                    <img src={location} />
                                    <h1 className="text-[20px]/[33px] font-[500] capitalize">
                                        Kandy
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2nd card */}
                    <div className="relative flex flex-col">
                        <div className="bg-[#00000036] w-full h-full absolute left-0 rounded-[15px]" />
                        <img src={place2} className="w-full h-full" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full p-8">
                            <div className="flex flex-col items-start">
                                <h1 className="text-[24px]/[33px] text-start font-[700]">
                                    watadageya
                                </h1>
                                <div className="flex flex-row gap-5">
                                    <img src={location} />
                                    <h1 className="text-[20px]/[33px] font-[500] capitalize">
                                        Anuradhapura
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3rd card */}
                    <div className="relative flex flex-col">
                        <div className="bg-[#00000036] w-full h-full absolute left-0 rounded-[15px]" />
                        <img src={place3} className="w-full h-full" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full p-8">
                            <div className="flex flex-col items-start">
                                <h1 className="text-[24px]/[33px] text-start font-[700]">
                                    Nine arch brigde
                                </h1>
                                <div className="flex flex-row gap-5">
                                    <img src={location} />
                                    <h1 className="text-[20px]/[33px] font-[500] capitalize">
                                        Ella
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4th card */}
                    <div className="relative flex flex-col">
                        <div className="bg-[#00000036] w-full h-full absolute left-0 rounded-[15px]" />
                        <img src={place4} className="w-full h-full" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full p-8">
                            <div className="flex flex-col items-start">
                                <h1 className="text-[24px]/[33px] text-start font-[700]">
                                    Stilt Fishing
                                </h1>
                                <div className="flex flex-row gap-5">
                                    <img src={location} />
                                    <h1 className="text-[20px]/[33px] font-[500] capitalize">
                                        Mirissa
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5th card */}
                    <div className="relative flex flex-col">
                        <div className="bg-[#00000036] w-full h-full absolute left-0 rounded-[15px]" />
                        <img src={place5} className="w-full h-full" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full p-8">
                            <div className="flex flex-col items-start">
                                <h1 className="text-[24px]/[33px] text-start font-[700]">
                                    Nallur Kovil
                                </h1>
                                <div className="flex flex-row gap-5">
                                    <img src={location} />
                                    <h1 className="text-[20px]/[33px] font-[500] capitalize">
                                        Jaffna
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 6th card */}
                    <div className="relative flex flex-col">
                        <div className="bg-[#00000036] w-full h-full absolute left-0 rounded-[15px]" />
                        <img src={place6} className="w-full h-full" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full p-8">
                            <div className="flex flex-col items-start">
                                <h1 className="text-[24px]/[33px] text-start font-[700]">
                                    Gangarama Temple
                                </h1>
                                <div className="flex flex-row gap-5">
                                    <img src={location} />
                                    <h1 className="text-[20px]/[33px] font-[500] capitalize">
                                        Colombo
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 7th card */}
                    <div className="relative flex flex-col">
                        <div className="bg-[#00000036] w-full h-full absolute left-0 rounded-[15px]" />
                        <img src={place7} className="w-full h-full" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full p-8">
                            <div className="flex flex-col items-start">
                                <h1 className="text-[24px]/[33px] text-start font-[700]">
                                    wildLife Safari
                                </h1>
                                <div className="flex flex-row gap-5">
                                    <img src={location} />
                                    <h1 className="text-[20px]/[33px] font-[500] capitalize">
                                        Yala
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 8th card */}
                    <div className="relative flex flex-col">
                        <div className="bg-[#00000036] w-full h-full absolute left-0 rounded-[15px]" />
                        <img src={place8} className="w-full h-full" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full p-8">
                            <div className="flex flex-col items-start">
                                <h1 className="text-[24px]/[33px] text-start font-[700]">
                                    Tea plucking
                                </h1>
                                <div className="flex flex-row gap-5">
                                    <img src={location} />
                                    <h1 className="text-[20px]/[33px] font-[500] capitalize">
                                        Nuwara Eliya
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Destinations;
